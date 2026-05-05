import { useEffect } from "react"
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated"
import type { DimensionValue } from "react-native"

const DEFAULT_COLORS = ["#E0E0E0", "#F0F0F0"] as [string, string]

interface SkeletonProps {
  width: DimensionValue
  height: DimensionValue
  radius?: number
  colors?: [string, string]
}

export const Skeleton = ({
  width,
  height,
  radius = 16,
  colors = DEFAULT_COLORS,
}: SkeletonProps) => {
  const animatedValue = useSharedValue(0)

  useEffect(() => {
    animatedValue.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true,
    )
  }, [])

  const animatedStyle = useAnimatedStyle(() => ({
    backgroundColor: interpolateColor(animatedValue.value, [0, 1], colors),
  }))

  return (
    <Animated.View
      style={[
        { width, height, borderRadius: radius, backgroundColor: "gray" },
        animatedStyle,
      ]}
    />
  )
}
