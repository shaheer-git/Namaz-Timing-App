import React, { useEffect, useRef } from "react";
import { TextStyle } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
} from "react-native-reanimated";

interface AnimatedDigitProps {
  value: string;
  style?: TextStyle;
  animateOnChange?: boolean;
}

export function AnimatedDigit({
  value,
  style,
  animateOnChange = false,
}: AnimatedDigitProps) {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  const prevValue = useRef(value);

  useEffect(() => {
    if (animateOnChange && prevValue.current !== value) {
      scale.value = withSequence(
        withTiming(1.12, { duration: 120 }),
        withTiming(1, { duration: 140 })
      );
      opacity.value = withSequence(
        withTiming(0.5, { duration: 80 }),
        withTiming(1, { duration: 120 })
      );
      prevValue.current = value;
    }
  }, [value, animateOnChange, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.Text style={[style, animatedStyle]}>{value}</Animated.Text>
  );
}
