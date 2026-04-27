import "../../../global.css";
import { useState } from "react";
import {
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "expo-router";
import { getLastNotices } from "@/lib/api";

const FILTERS = ["Tous", "Hommes", "Femmes"];

export default function List() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("Tous");

  const { data: notices = [] } = useQuery({
    queryKey: ["notices", "last"],
    queryFn: () => getLastNotices(30),
  });

  const filtered = notices.filter((n) => {
    const text = (
      n.name +
      " " +
      n.forename +
      " " +
      n.nationalities.join(" ")
    ).toLowerCase();
    return text.includes(search.toLowerCase());
  });

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
              placeholder="Rechercher un nom, nationalité..."
              placeholderTextColor="rgba(255,255,255,0.7)"
              className="flex-1 ml-3 text-white"
            />
          </View>

          <View className="flex-row mt-3">
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
          </View>
        </View>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.entity_id}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push("/(tabs)/(home)/details")}
            className="flex-row items-center px-4 py-4 border-b border-slate-100"
          >
            <View className="w-16 h-16 rounded-2xl bg-slate-300 overflow-hidden mr-4">
              {item._links.thumbnail?.href && (
                <Image
                  source={{ uri: item._links.thumbnail.href }}
                  className="w-full h-full"
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
              <Text numberOfLines={1} className="text-sm text-slate-500 mt-1">
                {item.nationalities.join(", ")} · né {item.date_of_birth}
              </Text>
            </View>

            <View className="items-end">
              <FontAwesome name="chevron-right" size={12} color="#94A3B8" />
            </View>
          </Pressable>
        )}
      />
    </View>
  );
}
