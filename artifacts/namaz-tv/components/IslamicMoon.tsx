import React from "react";
import { StyleSheet, Dimensions } from "react-native";
import Svg, { Path, Defs, RadialGradient, Stop, G, Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

export function IslamicMoon({ scale = 1 }: { scale?: number }) {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(W * 0.05, { duration: 60000 }),
        withTiming(0, { duration: 60000 })
      ),
      -1,
      true
    );
    translateY.value = withRepeat(
      withSequence(
        withTiming(H * 0.03, { duration: 45000 }),
        withTiming(0, { duration: 45000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const size = 180 * scale; // Increased container size to fit glow

  return (
    <Animated.View style={[
      styles.container,
      { top: 20 * scale, right: 20 * scale }, // Moved slightly closer to core to compensate for larger box
      animatedStyle
    ]}>
      <Svg width={size} height={size} viewBox="0 0 150 150">
        <Defs>
          <RadialGradient id="glow" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
            <Stop offset="0%" stopColor="#FFF" stopOpacity="0.3" />
            <Stop offset="100%" stopColor="#FFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>
        <G transform="translate(75, 75)">
          {/* Outer Glow */}
          <Circle
            r="60"
            fill="url(#glow)"
          />
          {/* The Crescent Moon */}
          <Path
            d="M 0 -40 A 40 40 0 1 0 0 40 A 32 40 0 1 1 0 -40"
            fill="#FFFDE7"
          />
        </G>
      </Svg>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    opacity: 0.8,
  },
});


