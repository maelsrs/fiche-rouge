import { useRouter } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import SlideItem from "@/src/components/slide-item";

export default function Onboarding() {
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const [activeIndex, setActiveIndex] = useState(0);
  const { top, bottom } = useSafeAreaInsets();

  const onPressExplore = async () => {
    setIsSaving(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await AsyncStorage.setItem("onboarded", "true");
      return router.replace("/");
    } finally {
      setIsSaving(false);
    }
  };

  const data = [
    {
      icon: "id-badge" as const,
      eyebrow: "Bienvenue",
      title: "Notices Interpol",
      body: "Les vraies notices rouges en circulation, tirées de la base publique d'Interpol.",
    },
    {
      icon: "search" as const,
      eyebrow: "Exploration",
      title: "Liste & recherche",
      body: "Parcours les fiches, filtre par nationalité, croise les indices.",
    },
    {
      icon: "question" as const,
      eyebrow: "À ton tour",
      title: "Devine le crime",
      body: "Quelques infos, une fiche, quatre réponses. À toi de flairer le bon délit.",
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

      {/* Header fixe : INTERPOL + indicateur d'étape */}
      <View
        className="absolute top-0 left-0 right-0 flex-row items-center justify-between"
        style={{ paddingTop: top + 12, paddingHorizontal: 32 }}
        pointerEvents="none"
      >
        <View className="flex-row items-center" style={{ gap: 10 }}>
          <View style={styles.brandBadge}>
            <FontAwesome name="globe" size={14} color="white" />
          </View>
          <Text style={styles.brand}>INTERPOL</Text>
        </View>
        <Text style={styles.step}>
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(data.length).padStart(2, "0")}
        </Text>
      </View>

      {!isLastIndex && (
        <View
          className="absolute flex-row bottom-0 left-0 w-full items-center justify-center"
          style={{ paddingBottom: bottom + 28, gap: 6 }}
        >
          {data.map((_, i) => {
            const active = activeIndex === i;
            return (
              <View
                key={i}
                style={{
                  height: 4,
                  width: active ? 24 : 8,
                  borderRadius: 999,
                  backgroundColor: active ? "#E63946" : "rgba(255,255,255,0.3)",
                }}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  brandBadge: {
    width: 32,
    height: 32,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.4)",
    alignItems: "center",
    justifyContent: "center",
  },
  brand: {
    color: "white",
    fontWeight: "800",
    letterSpacing: 2,
    fontSize: 13,
  },
  step: {
    color: "rgba(255,255,255,0.6)",
    fontWeight: "600",
    letterSpacing: 1,
    fontSize: 12,
  },
});
