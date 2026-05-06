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
  awalWaqth: string;
  adhan: string;
  aaqriWaqth: string;
  iqama: string;
  isHighlighted: boolean;
  blinkAdhan: boolean;
  blinkIqama: boolean;
  scale?: number;
  isDay?: boolean;
  isRug?: boolean;
  tvLikeLayout: boolean;
}

export function PrayerRow({
  arabicName,
  englishName,
  awalWaqth,
  adhan,
  aaqriWaqth,
  iqama,
  isHighlighted,
  blinkAdhan,
  blinkIqama,
  scale = 1,
  isDay = false,
  isRug = false,
  tvLikeLayout,
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
    text: "#FFFFFF",
    subText: "#D4AA50",
    accent: "#E6C27A",
    highlight: "rgba(212, 170, 80, 0.1)",
    border: "rgba(212, 170, 80, 0.15)",
  };

  const shadow = {
    textShadowColor: "rgba(0, 0, 0, 0.6)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  };

  return (
    <View
      style={[
        styles.container,
        { 
          borderBottomWidth: 1 * scale,
          borderBottomColor: dynamic.border,
          minHeight: tvLikeLayout ? 155 : 55,
        },
        isHighlighted && { backgroundColor: dynamic.highlight },
      ]}
    >
      {isHighlighted && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { 
              borderColor: "#D4AA50", 
              borderWidth: 1.5 * scale,
              zIndex: 10
            },
            bgAnim,
          ]}
        />
      )}

      {/* Aaqri Waqth */}
      <View style={[styles.cell, { borderRightWidth: 1 * scale, borderRightColor: dynamic.border, paddingVertical: tvLikeLayout ? 18 : 6 }]}>
        <Text style={[styles.timeText, { color: "#FF8C00", fontSize: 48 * scale }, shadow]}>
          {aaqriWaqth}
        </Text>
      </View>

      {/* Awal Waqth */}
      <View style={[styles.cell, { borderRightWidth: 1 * scale, borderRightColor: dynamic.border, paddingVertical: tvLikeLayout ? 30 : 6 }]}>
        <Text style={[styles.timeText, { color: "#52FF88", fontSize: 48 * scale }, shadow]}>
          {awalWaqth}
        </Text>
      </View>

      {/* Jamath */}
      <View style={[styles.cell, { borderRightWidth: 1 * scale, borderRightColor: dynamic.border, paddingVertical: tvLikeLayout ? 30 : 6 }]}>
        <Animated.Text
          style={[
            styles.timeText,
            {
              fontSize: 48 * scale,
              color: "#F0EAD6",
              fontWeight: "900",
              letterSpacing: 1.5 * scale
            },
            shadow,
            blinkIqama ? blinkAnim : {},
          ]}
        >
          {iqama}
        </Animated.Text>
      </View>

      {/* Azaan */}
      <View style={[styles.cell, { borderRightWidth: 1 * scale, borderRightColor: dynamic.border, paddingVertical: tvLikeLayout ? 30 : 6 }]}>
        <Animated.Text
          style={[
            styles.timeText,
            { color: "#FDE047", fontSize: 48 * scale, letterSpacing: 1.5 * scale },
            shadow,
            blinkAdhan ? blinkAnim : {},
          ]}
        >
          {adhan}
        </Animated.Text>
      </View>

      {/* Prayer Name Column */}
      <View style={[styles.cell, styles.nameCell, { paddingVertical: tvLikeLayout ? 18 : 6 }]}>
        <Text style={[styles.arabicName, { color: "#FFFFFF", fontSize: 48 * scale }, shadow]}>
          {arabicName}
        </Text>
        <Text style={[styles.englishName, { fontSize: 26 * scale, color: "rgba(255, 255, 255, 0.7)" }, shadow]}>
          {englishName}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "stretch",
  },
  cell: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  nameCell: {
    flex: 1.2,
  },
  arabicName: {
    fontWeight: "800",
    textAlign: "center",
  },
  englishName: {
    fontWeight: "700",
    textAlign: "center",
    marginTop: 2,
    textTransform: "uppercase",
  },
  timeText: {
    fontWeight: "800",
    fontVariant: ["tabular-nums"],
  },
});



