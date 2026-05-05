import { Pressable, ScrollView, Text, View } from "react-native"
import { Image } from "expo-image"
import { SafeAreaView } from "react-native-safe-area-context"
import { useLocalSearchParams, useRouter } from "expo-router"
import { useQuery } from "@tanstack/react-query"
import FontAwesome from "@expo/vector-icons/FontAwesome"
import { getNoticeDetail, IMAGE_HEADERS } from "@/lib/api"
import { getCountryName, getLanguageName } from "@/lib/labels"
import { Skeleton } from "@/src/components/skeleton"

export default function Details() {
  const router = useRouter()
  const { id } = useLocalSearchParams<{ id: string }>()

  const { data: notice, isLoading } = useQuery({
    queryKey: ["notice", id],
    queryFn: () => getNoticeDetail(id),
    enabled: !!id,
  })

  return (
    <View className="flex-1 bg-white">
      <SafeAreaView edges={["top"]} className="bg-[#1B2A4E]">
        <View className="px-4 pb-4 pt-2 flex-row items-center">
          <Pressable
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center -ml-2"
          >
            <FontAwesome name="chevron-left" size={18} color="white" />
          </Pressable>

          <View className="flex-1 items-center">
            <Text className="text-white/60 text-[11px] font-bold tracking-widest">
              FICHE INTERPOL
            </Text>
            <Text
              className="text-white text-base font-bold"
              numberOfLines={1}
            >
              {notice ? notice.name : "Chargement..."}
            </Text>
          </View>

          <View className="w-10" />
        </View>
      </SafeAreaView>

      {isLoading || !notice ? (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16 }}
        >
          <View className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <Skeleton width="100%" height={288} radius={0} />
            <View className="p-5" style={{ gap: 12 }}>
              <Skeleton width="60%" height={28} />
              <Skeleton width="40%" height={16} />
              <View className="flex-row flex-wrap mt-3" style={{ gap: 12 }}>
                <Skeleton width="45%" height={40} />
                <Skeleton width="45%" height={40} />
                <Skeleton width="45%" height={40} />
                <Skeleton width="45%" height={40} />
              </View>
            </View>
          </View>
          <View className="mt-6" style={{ gap: 12 }}>
            <Skeleton width="40%" height={20} />
            <Skeleton width="100%" height={80} />
            <Skeleton width="100%" height={80} />
          </View>
        </ScrollView>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        >
          <View className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <View className="w-full h-72 bg-slate-200 items-center justify-center">
              {notice._links.thumbnail?.href ? (
                <Image
                  source={{
                    uri: notice._links.thumbnail.href,
                    headers: IMAGE_HEADERS,
                  }}
                  style={{ width: "100%", height: "100%" }}
                  contentFit="cover"
                />
              ) : (
                <FontAwesome name="user" size={64} color="#94A3B8" />
              )}
            </View>

            <View className="p-5">
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-2xl font-bold text-[#1B2A4E]">
                    {notice.name}
                  </Text>
                  {notice.forename && (
                    <Text className="text-base text-slate-500 mt-1">
                      {notice.forename}
                    </Text>
                  )}
                </View>
                <View className="bg-red-100 px-3 py-1 rounded-full">
                  <Text className="text-red-500 text-xs font-bold">
                    Red Notice
                  </Text>
                </View>
              </View>

              <View className="flex-row flex-wrap mt-5 -mx-2">
                <Field label="Date de naissance" value={notice.date_of_birth} />
                <Field label="Sexe" value={sexLabel(notice.sex_id)} />
                <Field
                  label="Lieu de naissance"
                  value={notice.place_of_birth}
                />
                <Field
                  label="Nationalité"
                  value={notice.nationalities
                    ?.map(getCountryName)
                    .filter(Boolean)
                    .join(", ")}
                />
                <Field label="Cheveux" value={notice.hairs_id} />
                <Field label="Yeux" value={notice.eyes_colors_id} />
                <Field
                  label="Taille"
                  value={notice.height > 0 ? `${notice.height} m` : null}
                />
                <Field
                  label="Poids"
                  value={notice.weight > 0 ? `${notice.weight} kg` : null}
                />
                <Field
                  label="Langues parlées"
                  value={notice.languages_spoken_ids
                    ?.map(getLanguageName)
                    .filter(Boolean)
                    .join(", ")}
                  full
                />
                <Field
                  label="Signes particuliers"
                  value={notice.distinguishing_marks}
                  full
                />
              </View>
            </View>
          </View>

          {notice.arrest_warrants?.length > 0 && (
            <View className="mt-6">
              <View className="flex-row items-center mb-3" style={{ gap: 10 }}>
                <View className="w-1 h-5 bg-[#E63946] rounded-full" />
                <Text className="text-[#1B2A4E] font-bold text-base">
                  Mandats d'arrêt
                </Text>
              </View>

              {notice.arrest_warrants.map((w, i) => (
                <View
                  key={i}
                  className="bg-white border border-slate-200 rounded-2xl p-4 mb-2"
                >
                  <Text className="text-[10px] font-bold tracking-widest text-slate-400">
                    DÉLIVRÉ PAR
                  </Text>
                  <Text className="text-sm font-bold text-[#1B2A4E] mt-1">
                    {getCountryName(w.issuing_country_id) ?? w.issuing_country_id}
                  </Text>
                  <Text className="text-sm text-slate-600 mt-3 leading-5">
                    {w.charge_translation || w.charge}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

function Field({
  label,
  value,
  full,
}: {
  label: string
  value: string | null | undefined
  full?: boolean
}) {
  if (!value) return null
  return (
    <View
      className={"px-2 mt-3 " + (full ? "w-full" : "w-1/2")}
    >
      <Text className="text-[10px] font-bold tracking-widest text-slate-400">
        {label.toUpperCase()}
      </Text>
      <Text className="text-sm font-semibold text-[#1B2A4E] mt-1">
        {value}
      </Text>
    </View>
  )
}

function sexLabel(sex: string | null): string | null {
  if (sex === "M") return "Masculin"
  if (sex === "F") return "Féminin"
  return null
}
