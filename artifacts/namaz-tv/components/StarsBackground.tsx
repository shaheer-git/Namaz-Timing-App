import React, { useMemo } from "react";
import { View, StyleSheet, Dimensions } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
} from "react-native-reanimated";

const { width: W, height: H } = Dimensions.get("window");

function Star({ x, y, size, delay }: { x: number; y: number; size: number; delay: number }) {
  const opacity = useSharedValue(0.1);

  React.useEffect(() => {
    opacity.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1500 + Math.random() * 1000 }),
          withTiming(0.1, { duration: 1500 + Math.random() * 1000 })
        ),
        -1,
        true
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: opacity.value + 0.5 }],
  }));

  return (
    <Animated.View
      style={[
        styles.star,
        {
          left: x,
          top: y,
          width: size,
          height: size,
          borderRadius: size / 2,
          backgroundColor: "#FFFFFF",
        },
        style,
      ]}
    />
  );
}

export function StarsBackground() {
  const stars = useMemo(() => {
    return Array.from({ length: 60 }).map((_, i) => ({
      id: i,
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 2 + 1,
      delay: Math.random() * 3000,
    }));
  }, []);

  return (
    <View style={StyleSheet.absoluteFill}>
      {stars.map((s) => (
        <Star key={s.id} x={s.x} y={s.y} size={s.size} delay={s.delay} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  star: {
    position: "absolute",
    shadowColor: "#FFF",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 2,
  },
});
