import "../../../global.css";
import { Text, View, Pressable } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const useIsOnboarded = () => {
  const [value, setValue] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem("onboarded").then((v) => setValue(Boolean(v)));
  }, []);

  return value;
};

export default function Home() {
  const router = useRouter();
  const isOnboarded = useIsOnboarded();

  if (isOnboarded === null) return null;
  if (!isOnboarded) return <Redirect href="/onboarding" />;

  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px] mx-auto">
        <Text className="text-6xl font-bold">Hello World</Text>
        <Text className="text-4xl text-[#38434D]">
          This is the first page of your app.
        </Text>
        <Pressable
          className="mt-5 bg-[#007AFF] py-3 px-6 rounded-lg"
          onPress={() => router.push("/(tabs)/(home)/details")}
        >
          <Text className="text-white text-lg font-bold text-center">
            Go to Details
          </Text>
        </Pressable>

        <Pressable
          className="mt-3 bg-red-600 py-3 px-6 rounded-lg"
          onPress={async () => {
            await AsyncStorage.removeItem("onboarded");
            router.replace("/onboarding");
          }}
        >
          <Text className="text-white text-lg font-bold text-center">
            Reset onboarding
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
