import React, { useEffect } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { useColors } from "@/hooks/useColors";

interface PrayerRowProps {
  arabicName: string;
  englishName: string;
  adhan: string;
  iqama: string;
  isCurrent: boolean;
  isNext: boolean;
}

export function PrayerRow({
  arabicName,
  englishName,
  adhan,
  iqama,
  isCurrent,
  isNext,
}: PrayerRowProps) {
  const colors = useColors();
  const bgOpacity = useSharedValue(isCurrent ? 1 : 0);

  useEffect(() => {
    bgOpacity.value = withTiming(isCurrent ? 1 : 0, { duration: 600 });
  }, [isCurrent, bgOpacity]);

  const bgAnim = useAnimatedStyle(() => ({
    opacity: bgOpacity.value,
  }));

  return (
    <View
      style={[
        styles.container,
        isCurrent && { backgroundColor: "rgba(212, 170, 80, 0.07)" },
      ]}
    >
      {isCurrent && (
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            styles.highlightBorder,
            { borderColor: colors.primary + "80" },
            bgAnim,
          ]}
        />
      )}

      <View style={styles.namesBlock}>
        <Text
          style={[
            styles.arabicName,
            { color: isCurrent ? colors.primary : colors.foreground },
          ]}
        >
          {arabicName}
        </Text>
        <Text
          style={[
            styles.englishName,
            {
              color: isCurrent
                ? colors.primary + "CC"
                : colors.mutedForeground,
            },
          ]}
        >
          {englishName}
        </Text>
      </View>

      <View style={styles.timeBlock}>
        <Text
          style={[
            styles.timeText,
            { color: isCurrent ? colors.primary : colors.foreground },
          ]}
        >
          {adhan}
        </Text>
      </View>

      <View style={styles.timeBlock}>
        <Text
          style={[
            styles.timeText,
            {
              color: isNext
                ? colors.accent
                : isCurrent
                ? colors.primary
                : colors.foreground,
              fontWeight: "700",
            },
          ]}
        >
          {iqama}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
  },
  highlightBorder: {
    borderRadius: 8,
    borderWidth: 1,
  },
  namesBlock: {
    flex: 2,
    alignItems: "flex-end",
    paddingRight: 8,
  },
  arabicName: {
    fontSize: 21,
    textAlign: "right",
  },
  englishName: {
    fontSize: 11,
    textAlign: "right",
    marginTop: 1,
    letterSpacing: 0.5,
  },
  timeBlock: {
    flex: 1.5,
    alignItems: "center",
  },
  timeText: {
    fontSize: 19,
    fontWeight: "600",
    letterSpacing: 1,
  },
});
