import "../../../global.css"
import { Text, View, Pressable, FlatList, Image } from "react-native";
import { useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { getNoticesByNationality } from "@/lib/api";

export default function Home() {
  const router = useRouter();

  const { data: notices = [], isLoading } = useQuery({
    queryKey: ["notices", "ES"],
    staleTime: 1000 * 60 * 5,
    queryFn: () => getNoticesByNationality("ES"),
  });

  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px] mx-auto">
        <Text className="text-6xl font-bold">Hello World</Text>
        <Text className="text-4xl text-[#38434D]">This is the first page of your app.</Text>
        <Pressable className="mt-5 bg-[#007AFF] py-3 px-6 rounded-lg" onPress={() => router.push("/(tabs)/(home)/details")}>
          <Text className="text-white text-lg font-bold text-center">Go to Details</Text>
        </Pressable>
        <FlatList
          data={notices}
          keyExtractor={(item) => item.entity_id}
          renderItem={({ item }) => (
            <View className="mb-5">
              <Text className="text-lg font-bold">
                {item.forename} {item.name}
              </Text>
              <Text>Date of Birth: {item.date_of_birth}</Text>
              <Text>Nationalities: {item.nationalities.join(", ")}</Text>

              {item._links.thumbnail?.href && (
                <Image
                  source={{ uri: item._links.thumbnail.href }}
                  className="w-[100px] h-[100px]"
                />
              )}
            </View>
          )}
        />
      </View>
    </View>
  );
}
