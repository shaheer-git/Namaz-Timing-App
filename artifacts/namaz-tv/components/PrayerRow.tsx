import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface PrayerRowProps {
  arabicName: string;
  englishName: string;
  adhan: string;
  iqama: string;
  isHighlighted: boolean;
  blinkAdhan: boolean;
  blinkIqama: boolean;
  scale?: number;
  isDay?: boolean;
  isRug?: boolean;
}

export function PrayerRow({
  arabicName,
  englishName,
  adhan,
  iqama,
  isHighlighted,
  blinkAdhan,
  blinkIqama,
  scale = 1,
  isDay = false,
  isRug = false,
}: PrayerRowProps) {
  const colors = useColors();
  const bgOpacity = useSharedValue(isHighlighted ? 1 : 0);
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    bgOpacity.value = withTiming(isHighlighted ? 1 : 0, { duration: 600 });
  }, [isHighlighted, bgOpacity]);

  useEffect(() => {
    if (blinkAdhan || blinkIqama) {
      blinkOpacity.value = withRepeat(
        withSequence(withTiming(0.3, { duration: 800 }), withTiming(1, { duration: 800 })),
        -1,
        true
      );
    } else {
      blinkOpacity.value = 1;
    }
  }, [blinkAdhan, blinkIqama, blinkOpacity]);

  const bgAnim = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  const blinkAnim = useAnimatedStyle(() => ({
    opacity: blinkOpacity.value,
  }));

  const dynamic = {
    text: isRug ? "#FDFDFB" : (isDay ? "#0A1B3D" : colors.foreground),
    subText: isRug ? "#D4AA50" : (isDay ? "#2C3E50" : colors.mutedForeground),
    accent: isRug ? "#FDFDFB" : (isDay ? "#D4AA50" : colors.primary),
    highlight: isRug ? "rgba(212, 170, 80, 0.15)" : (isDay ? "rgba(10, 27, 61, 0.08)" : "rgba(212, 170, 80, 0.07)"),
  };

  const shadow = isRug ? {
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  } : {};

  return (
    <View
      style={[
        styles.container,
        { 
          paddingVertical: 10 * scale, 
          paddingHorizontal: 16 * scale,
          marginVertical: 2 * scale,
          borderRadius: 8 * scale
        },
        isHighlighted && { backgroundColor: dynamic.highlight },
      ]}
    >
      {isHighlighted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.highlightBorder,
            { backgroundColor: isRug ? "rgba(212, 170, 80, 0.05)" : "transparent", borderColor: "#D4AA50", borderRadius: 8 * scale, borderWidth: 1 * scale },
            bgAnim,
          ]}
        />
      )}

      <View style={[styles.namesBlock, { paddingRight: 8 * scale }]}>
        <Text
          style={[
            styles.arabicName,
            { color: isHighlighted ? "#D4AA50" : dynamic.text, fontSize: 24 * scale, fontWeight: isRug ? "900" : "400" },
            shadow
          ]}
        >
          {arabicName}
        </Text>
        <Text
          style={[
            styles.englishName,
            {
              fontSize: 13 * scale,
              marginTop: 1 * scale,
              letterSpacing: 0.5 * scale,
              fontWeight: isRug ? "800" : "400",
              color: isHighlighted
                ? "#D4AA50"
                : dynamic.subText,
            },
            shadow
          ]}
        >
          {englishName}
        </Text>
      </View>

      <View style={styles.timeBlock}>
        <Animated.Text
          style={[
            styles.timeText,
            { color: blinkAdhan ? "#D4AA50" : dynamic.text, fontSize: 22 * scale, fontWeight: isRug ? "800" : "600" },
            shadow,
            blinkAdhan ? blinkAnim : {},
          ]}
        >
          {adhan}
        </Animated.Text>
      </View>

      <View style={styles.timeBlock}>
        <Animated.Text
          style={[
            styles.timeText,
            {
              fontSize: 22 * scale,
              color: blinkIqama ? "#D4AA50" : dynamic.text,
              fontWeight: "900",
            },
            shadow,
            blinkIqama ? blinkAnim : {},
          ]}
        >
          {iqama}
        </Animated.Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
  },
  highlightBorder: {
  },
  namesBlock: {
    flex: 2,
    alignItems: "flex-end",
  },
  arabicName: {
    textAlign: "right",
  },
  englishName: {
    textAlign: "right",
  },
  timeBlock: {
    flex: 1.5,
    alignItems: "center",
  },
  timeText: {
    letterSpacing: 1,
  },
});



