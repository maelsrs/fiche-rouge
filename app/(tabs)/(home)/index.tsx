import "../../../global.css";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Skeleton } from "@/src/components/skeleton";
import { Image } from "expo-image";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getLastNotices, IMAGE_HEADERS, Notice } from "@/lib/api";
import { getCountryName } from "@/lib/labels";

const useIsOnboarded = () => {
  const [value, setValue] = useState<boolean | null>(null);
  useEffect(() => {
    AsyncStorage.getItem("onboarded").then((v) => setValue(Boolean(v)));
  }, []);
  return value;
};

function ageFrom(dob: string) {
  const [y, m, d] = dob.split("/").map(Number);
  const birth = new Date(y, m - 1, d);
  const diff = Date.now() - birth.getTime();
  return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
}

function formatDate(dob: string) {
  const [y, m, d] = dob.split("/");
  return `${d}/${m}/${y}`;
}

export default function Home() {
  const router = useRouter();
  const isOnboarded = useIsOnboarded();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices", "last"],
    queryFn: () => getLastNotices(4),
  });

  if (isOnboarded === null) return null;
  if (!isOnboarded) return <Redirect href="/onboarding" />;

  const latest = notices[0];
  const recent = notices.slice(1, 4);

  const goToDetail = (n: Notice) =>
    router.push({
      pathname: "/details",
      params: { id: n.entity_id },
    });

  return (
    <View className="flex-1 bg-slate-100">
      <SafeAreaView edges={["top"]} className="bg-[#1B2A4E]">
        <View className="px-5 pt-3 pb-6">
          <View className="flex-row items-center justify-between">
            <View className="flex-row items-center">
              <View className="w-9 h-9 rounded-full border-2 border-white items-center justify-center mr-3">
                <FontAwesome name="globe" size={18} color="#fff" />
              </View>
              <Text className="text-white text-xl font-extrabold tracking-wider">
                INTERPOL
              </Text>
            </View>
            <View className="bg-red-600 px-3 py-1.5 rounded-md">
              <Text className="text-white text-xs font-extrabold">
                RED NOTICE
              </Text>
            </View>
          </View>

          <Text className="text-white/70 text-xs font-bold tracking-widest mt-5">
            DERNIÈRE PERSONNE RECHERCHÉE
          </Text>
          <Text className="text-white text-xl font-bold mt-1">
            Notice rouge internationale
          </Text>
        </View>
      </SafeAreaView>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
      >
        {isLoading || !latest ? (
          <View
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
            style={{ gap: 12 }}
          >
            <Skeleton width="100%" height={208} radius={0} />
            <View className="p-4" style={{ gap: 10 }}>
              <Skeleton width="70%" height={22} />
              <Skeleton width="50%" height={14} />
              <View className="flex-row mt-2" style={{ gap: 8 }}>
                <Skeleton width={70} height={22} radius={6} />
                <Skeleton width={60} height={22} radius={6} />
                <Skeleton width={60} height={22} radius={6} />
              </View>
            </View>
          </View>
        ) : (
          <Pressable
            onPress={() => goToDetail(latest)}
            className="bg-white rounded-2xl border border-slate-200 overflow-hidden"
          >
            <View className="w-full h-52 bg-slate-300">
              {latest._links.thumbnail?.href && (
                <Image
                  source={{
                    uri: latest._links.thumbnail.href,
                    headers: IMAGE_HEADERS,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              )}
            </View>

            <View className="bg-red-600 px-3 py-2">
              <Text className="text-white text-xs font-extrabold tracking-wider">
                ● WANTED — RED NOTICE INTERPOL
              </Text>
            </View>

            <View className="p-4">
              <Text className="text-lg font-extrabold text-[#1B2A4E]">
                {latest.name}, {latest.forename}
              </Text>
              <Text className="text-sm text-slate-500 mt-1">
                Recherché ·{" "}
                {latest.nationalities
                  ?.map(getCountryName)
                  .filter(Boolean)
                  .join(" · ") || "Inconnu"}
              </Text>

              <View className="flex-row flex-wrap mt-3">
                <Tag color="red">Red Notice</Tag>
                <Tag color="blue">{ageFrom(latest.date_of_birth)} ans</Tag>
                {latest.nationalities?.[0] && (
                  <Tag color="blue">
                    {getCountryName(latest.nationalities[0])}
                  </Tag>
                )}
              </View>

              <View className="flex-row mt-3">
                <Text className="text-xs text-slate-700">
                  <Text className="font-bold">Naissance :</Text>{" "}
                  {formatDate(latest.date_of_birth)}
                </Text>
              </View>
            </View>
          </Pressable>
        )}

        <Pressable
          onPress={() => router.push("/(tabs)/quiz")}
          className="bg-red-600 rounded-2xl py-4 mt-5 items-center"
        >
          <Text className="text-white text-base font-extrabold tracking-wider">
            ▶ JOUER AU QUIZ
          </Text>
        </Pressable>

        <Text className="text-slate-500 text-xs font-bold tracking-widest mt-6 mb-3">
          PERSONNES RÉCENTES
        </Text>

        <View className="flex-row justify-between">
          {recent.map((n) => (
            <Pressable
              key={n.entity_id}
              onPress={() => goToDetail(n)}
              className="flex-1 bg-white border border-slate-200 rounded-2xl items-center p-3 mx-1"
            >
              <View className="w-14 h-14 rounded-full bg-slate-300 overflow-hidden mb-2">
                {n._links.thumbnail?.href && (
                  <Image
                    source={{
                      uri: n._links.thumbnail.href,
                      headers: IMAGE_HEADERS,
                    }}
                    style={{ width: "100%", height: "100%" }}
                    contentFit="cover"
                  />
                )}
              </View>
              <Text
                numberOfLines={1}
                className="text-xs font-bold text-[#1B2A4E]"
              >
                {n.name.split(" ")[0]} {n.forename[0]}.
              </Text>
              <Text numberOfLines={1} className="text-[10px] text-slate-500">
                {getCountryName(n.nationalities?.[0]) ?? "—"}
              </Text>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

function Tag({
  color,
  children,
}: {
  color: "red" | "blue";
  children: React.ReactNode;
}) {
  const cls =
    color === "red" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700";
  return (
    <View className={`px-2 py-1 rounded-md mr-2 mb-1 ${cls.split(" ")[0]}`}>
      <Text className={`text-[11px] font-bold ${cls.split(" ")[1]}`}>
        {children}
      </Text>
    </View>
  );
}
