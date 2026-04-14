import "../../../global.css"
import { Text, View } from "react-native";

export default function Home() {
  return (
    <View className="flex-1 items-center p-6">
      <View className="flex-1 justify-center max-w-[960px] mx-auto">
        <Text className="text-6xl font-bold">List</Text>
      </View>
    </View>
  );
}
