import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getNoticeDetail, IMAGE_HEADERS } from "@/lib/api";

export default function Details() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNoticeDetail(id),
    enabled: !!id,
  });

  if (isLoading || !notice) {
    return (
      <View className="flex-1 items-center justify-center bg-white">
        <ActivityIndicator color="#1B2A4E" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="w-full h-72 bg-slate-300">
        {notice._links.thumbnail?.href && (
          <Image
            source={{
              uri: notice._links.thumbnail.href,
              headers: IMAGE_HEADERS,
            }}
            style={{ width: "100%", height: "100%" }}
            contentFit="cover"
          />
        )}
      </View>

      <View className="p-4">
        <Text className="text-2xl font-bold text-[#1B2A4E]">
          {notice.name}, {notice.forename}
        </Text>
        <Text className="text-sm text-slate-500 mt-1">
          {notice.nationalities.join(", ")} · né {notice.date_of_birth}
        </Text>

        {notice.place_of_birth && (
          <Row label="Lieu de naissance" value={notice.place_of_birth} />
        )}
        {notice.sex_id && <Row label="Sexe" value={notice.sex_id} />}
        {notice.height > 0 && (
          <Row label="Taille" value={`${notice.height} m`} />
        )}
        {notice.weight > 0 && (
          <Row label="Poids" value={`${notice.weight} kg`} />
        )}
        {notice.eyes_colors_id && (
          <Row label="Yeux" value={notice.eyes_colors_id} />
        )}
        {notice.hairs_id && <Row label="Cheveux" value={notice.hairs_id} />}
        {notice.distinguishing_marks && (
          <Row label="Signes particuliers" value={notice.distinguishing_marks} />
        )}

        {notice.arrest_warrants?.length > 0 && (
          <View className="mt-6">
            <Text className="text-base font-bold text-[#1B2A4E] mb-2">
              Mandats d'arrêt
            </Text>
            {notice.arrest_warrants.map((w, i) => (
              <View
                key={i}
                className="bg-slate-50 rounded-xl p-3 mb-2 border border-slate-200"
              >
                <Text className="text-xs font-bold text-slate-500">
                  {w.issuing_country_id}
                </Text>
                <Text className="text-sm text-[#1B2A4E] mt-1">{w.charge}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row justify-between py-2 border-b border-slate-100">
      <Text className="text-sm text-slate-500">{label}</Text>
      <Text className="text-sm font-semibold text-[#1B2A4E]">{value}</Text>
    </View>
  );
}
