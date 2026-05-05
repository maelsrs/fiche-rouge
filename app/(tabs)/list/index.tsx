import "../../../global.css";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getNotices, IMAGE_HEADERS, type SearchParams } from "@/lib/api";
import { getCountryName } from "@/lib/labels";
import { CountryPicker } from "@/src/components/country-picker";
import { Skeleton } from "@/src/components/skeleton";
import { useDebouncedValue } from "@/src/hooks/use-debounced-value";

const FILTERS = ["Tous", "Hommes", "Femmes"] as const;
type Filter = (typeof FILTERS)[number];

// Le filtre choisi → param sexId envoyé à l'API (Tous = pas de param)
function sexIdFor(f: Filter): SearchParams["sexId"] {
  if (f === "Hommes") return "M";
  if (f === "Femmes") return "F";
  return undefined;
}

export default function List() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<Filter>("Tous");
  const [nationality, setNationality] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // On debounce la recherche pour pas spam l'API à chaque touche
  const debouncedSearch = useDebouncedValue(search, 400);

  const {
    data,
    isLoading,
    isRefetching,
    refetch,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ["notices", debouncedSearch, filter, nationality],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getNotices({
        page: pageParam,
        resultPerPage: 20,
        name: debouncedSearch || undefined,
        sexId: sexIdFor(filter),
        nationality: nationality || undefined,
      }),
    getNextPageParam: (last) => (last.hasMore ? last.page + 1 : undefined),
  });

  // Aplatit toutes les pages en une seule liste
  const items = data?.pages.flatMap((p) => p.notices) ?? [];

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={["top"]} className="bg-[#1B2A4E]">
        <View className="px-4 pb-4">
          <View className="flex-row items-center justify-between py-2">
            <Text className="text-white text-lg font-bold">
              Notices internationales
            </Text>
          </View>

          <View className="flex-row items-center bg-white/10 rounded-full px-4 py-2 mt-3">
            <FontAwesome
              name="search"
              size={14}
              color="rgba(255,255,255,0.7)"
            />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Rechercher un nom..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              className="flex-1 ml-3 text-white"
              autoCorrect={false}
              autoCapitalize="characters"
            />
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="mt-3"
            contentContainerStyle={{ paddingRight: 16 }}
          >
            {FILTERS.map((f) => {
              const active = filter === f;
              return (
                <Pressable
                  key={f}
                  onPress={() => setFilter(f)}
                  className={
                    "px-4 py-2 rounded-full mr-2 " +
                    (active ? "bg-white" : "border border-white/40")
                  }
                >
                  <Text
                    className={
                      "text-xs font-semibold " +
                      (active ? "text-[#1B2A4E]" : "text-white")
                    }
                  >
                    {f}
                  </Text>
                </Pressable>
              );
            })}

            {/* Chip Pays — ouvre la modal */}
            <Pressable
              onPress={() => setPickerOpen(true)}
              className={
                "px-4 py-2 rounded-full mr-2 flex-row items-center " +
                (nationality ? "bg-white" : "border border-white/40")
              }
              style={{ gap: 8 }}
            >
              <Text
                className={
                  "text-xs font-semibold " +
                  (nationality ? "text-[#1B2A4E]" : "text-white")
                }
              >
                {nationality ? getCountryName(nationality) : "Pays"}
              </Text>
              {nationality ? (
                <Pressable
                  onPress={(e) => {
                    e.stopPropagation();
                    setNationality(null);
                  }}
                  hitSlop={8}
                >
                  <FontAwesome name="times" size={12} color="#1B2A4E" />
                </Pressable>
              ) : (
                <FontAwesome
                  name="chevron-down"
                  size={10}
                  color="rgba(255,255,255,0.7)"
                />
              )}
            </Pressable>
          </ScrollView>
        </View>
      </SafeAreaView>

      {isLoading ? (
        <View>
          {Array.from({ length: 8 }).map((_, i) => (
            <Animated.View
              key={i}
              entering={FadeInDown.delay(i * 50)}
              className="flex-row items-center px-4 py-4 border-b border-slate-100"
            >
              <View className="mr-4">
                <Skeleton width={64} height={64} radius={16} />
              </View>
              <View className="flex-1" style={{ gap: 8 }}>
                <Skeleton width="65%" height={16} />
                <Skeleton width="45%" height={12} />
              </View>
            </Animated.View>
          ))}
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => item.entity_id}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching && !isFetchingNextPage}
              onRefresh={() => refetch()}
            />
          }
          onEndReached={() => {
            if (hasNextPage && !isFetchingNextPage) fetchNextPage();
          }}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View className="items-center py-16">
              <Text className="text-slate-400 text-sm">Aucun résultat</Text>
            </View>
          }
          ListFooterComponent={
            isFetchingNextPage ? (
              <View className="py-6 items-center">
                <ActivityIndicator color="#1B2A4E" />
              </View>
            ) : null
          }
          renderItem={({ item, index }) => (
            <Animated.View entering={FadeInDown.delay((index % 20) * 50)}>
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/details",
                    params: { id: item.entity_id },
                  })
                }
                className="flex-row items-center px-4 py-4 border-b border-slate-100"
              >
                <View className="w-16 h-16 rounded-2xl bg-slate-300 overflow-hidden mr-4">
                  {item._links.thumbnail?.href && (
                    <Image
                      source={{
                        uri: item._links.thumbnail.href,
                        headers: IMAGE_HEADERS,
                      }}
                      style={{ width: "100%", height: "100%" }}
                    />
                  )}
                </View>

                <View className="flex-1 pr-2">
                  <Text
                    numberOfLines={1}
                    className="text-base font-bold text-[#1B2A4E]"
                  >
                    {item.name}, {item.forename}
                  </Text>
                  <Text
                    numberOfLines={1}
                    className="text-sm text-slate-500 mt-1"
                  >
                    {item.nationalities
                      ?.map(getCountryName)
                      .filter(Boolean)
                      .join(", ") || "Nationalité inconnue"}
                    {item.date_of_birth ? ` · né ${item.date_of_birth}` : ""}
                  </Text>
                </View>

                <View className="items-end">
                  <FontAwesome name="chevron-right" size={12} color="#94A3B8" />
                </View>
              </Pressable>
            </Animated.View>
          )}
        />
      )}

      <CountryPicker
        visible={pickerOpen}
        selected={nationality}
        onSelect={setNationality}
        onClose={() => setPickerOpen(false)}
      />

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
      >
        <Image
          source={require("../../../assets/interpol-logo.png")}
          style={{
            position: "absolute",
            bottom: -400,
            left: -250,
            right: -250,
            height: 800,
            opacity: 0.07,
          }}
          contentFit="contain"
        />
      </View>
    </View>
  );
}
