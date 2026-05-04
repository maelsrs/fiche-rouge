import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useDerivedValue,
  withTiming,
} from "react-native-reanimated";
import FontAwesome from "@expo/vector-icons/FontAwesome";

const { width: SLIDE_ITEM_WIDTH, height: SCREEN_HEIGHT } =
  Dimensions.get("screen");

interface SlideItemProps {
  isActive: boolean;
  icon: React.ComponentProps<typeof FontAwesome>["name"];
  eyebrow: string;
  title: string;
  body: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  onSubmit?: () => Promise<void>;
}

export default function SlideItem({
  isActive,
  icon,
  eyebrow,
  title,
  body,
  submitLabel,
  isSubmitting,
  onSubmit,
}: SlideItemProps) {
  // Anim : fade + petit slide vers le haut quand la slide devient active
  const animatedValue = useDerivedValue(() => (isActive ? 1 : 0));
  const animatedHero = useAnimatedStyle(() => ({
    opacity: withTiming(animatedValue.value, { duration: 500 }),
    transform: [
      {
        translateY: withTiming((1 - animatedValue.value) * 16, {
          duration: 500,
        }),
      },
    ],
  }));

  return (
    <View
      className="flex-1 overflow-hidden bg-[#1B2A4E]"
      style={{ width: SLIDE_ITEM_WIDTH }}
    >
      <View pointerEvents="none" style={styles.watermark}>
        <FontAwesome name="globe" size={520} color="rgba(255,255,255,0.04)" />
      </View>

      <Animated.View
        className="flex-1 items-center justify-center px-8"
        style={animatedHero}
      >
        <View style={styles.iconCard}>
          <View style={styles.iconAccent} />
          <View style={styles.iconBadge}>
            <FontAwesome name={icon} size={56} color="white" />
          </View>
        </View>
      </Animated.View>

      <View style={{ paddingBottom: 56, paddingHorizontal: 32, gap: 28 }}>
        <View style={{ gap: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View style={styles.eyebrowDash} />
            <Text style={styles.eyebrow}>{eyebrow}</Text>
          </View>
          <Text style={styles.title} numberOfLines={1} adjustsFontSizeToFit>
            {title}
          </Text>
          <Text style={styles.body}>{body}</Text>
        </View>

        {onSubmit && submitLabel ? (
          <TouchableOpacity
            onPress={onSubmit}
            activeOpacity={0.85}
            style={styles.cta}
          >
            <Text style={styles.ctaLabel}>{submitLabel}</Text>
            {isSubmitting ? (
              <ActivityIndicator color="white" />
            ) : (
              <FontAwesome name="arrow-right" size={14} color="white" />
            )}
          </TouchableOpacity>
        ) : (
          <View style={{ height: 52 }} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  watermark: {
    position: "absolute",
    top: SCREEN_HEIGHT * 0.52,
    left: -120,
    right: -120,
    alignItems: "center",
    justifyContent: "center",
  },
  iconCard: {
    width: 200,
    height: 200,
    borderRadius: 36,
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  iconBadge: {
    width: 110,
    height: 110,
    borderRadius: 26,
    backgroundColor: "#E63946",
    alignItems: "center",
    justifyContent: "center",
  },
  iconAccent: {
    position: "absolute",
    bottom: -50,
    right: -50,
    width: 140,
    height: 140,
    borderRadius: 80,
    backgroundColor: "rgba(230,57,70,0.18)",
  },
  eyebrowDash: {
    width: 24,
    height: 2,
    backgroundColor: "#E63946",
  },
  eyebrow: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  title: {
    color: "white",
    fontSize: 36,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  body: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 15,
    lineHeight: 22,
  },
  cta: {
    backgroundColor: "#E63946",
    borderRadius: 14,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  ctaLabel: {
    color: "white",
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
