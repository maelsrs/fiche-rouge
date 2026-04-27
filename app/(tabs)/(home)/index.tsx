import "../../../global.css"
import { Text, View, Pressable } from "react-native";
import { useRouter } from "expo-router";

export default function Home() {
  const router = useRouter();

  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px] mx-auto">
        <Text className="text-6xl font-bold">Hello World</Text>
        <Text className="text-4xl text-[#38434D]">This is the first page of your app.</Text>
        <Pressable className="mt-5 bg-[#007AFF] py-3 px-6 rounded-lg" onPress={() => router.push("/(tabs)/(home)/details")}>
          <Text className="text-white text-lg font-bold text-center">Go to Details</Text>
        </Pressable>
      </View>
    </View>
  );
}
