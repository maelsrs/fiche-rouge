import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import SlideItem from "@/src/components/slide-item";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function Onboarding() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { top, bottom } = useSafeAreaInsets();

  const onPressExplore = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      await AsyncStorage.setItem("onboarded", "true");
      return router.replace("/");
    } finally {
      setIsSaving(false);
    }
  };

  const data = [
    {
      icon: "globe" as const,
      title: "Notices",
      body: "Internationales",
    },
    {
      icon: "search" as const,
      title: "Recherchez",
      body: "parmi les fugitifs",
    },
    {
      icon: "shield" as const,
      title: "Testez",
      body: "vos connaissances",
      onSubmit: onPressExplore,
      isSubmitting: isSaving,
      submitLabel: "Commencer",
    },
  ];

  const onScroll = (event: any) => {
    const totalWidth = event.nativeEvent.layoutMeasurement.width;
    const xPosition = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(xPosition / totalWidth);
    if (newIndex !== activeIndex) {
      setActiveIndex(newIndex);
    }
  };

  const isLastIndex = data.length - 1 === activeIndex;

  return (
    <View className="flex-1 bg-[#1B2A4E]">
      <FlatList
        data={data}
        pagingEnabled
        onScroll={onScroll}
        scrollEventThrottle={20}
        renderItem={({ item, index }) => (
          <SlideItem {...item} isActive={index === activeIndex} />
        )}
        showsHorizontalScrollIndicator={false}
        horizontal
      />

      <View
        className="absolute top-0 left-0 right-0"
        style={{
          paddingTop: top + 20,
          paddingBottom: bottom,
          paddingHorizontal: 32,
        }}
        pointerEvents="none"
      >
        <Text style={styles.title}>Fiche Rouge</Text>
      </View>

      {!isLastIndex && (
        <View className="absolute flex-row bottom-0 left-0 w-full items-center justify-center gap-2 pb-12">
          {data.map((_, index) => (
            <View
              key={index}
              className={`h-2 w-2 rounded-full ${
                activeIndex === index ? "bg-white" : "bg-white opacity-50"
              }`}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    color: "white",
    textAlign: "center",
    fontWeight: "800",
    letterSpacing: 1,
  },
});
