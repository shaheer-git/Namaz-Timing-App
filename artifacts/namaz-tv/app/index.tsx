import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePrayer } from "@/context/PrayerContext";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useNextPrayer, PRAYER_ORDER, PRAYER_ARABIC, PRAYER_DISPLAY } from "@/hooks/useNextPrayer";
import { PrayerRow } from "@/components/PrayerRow";
import { IslamicPattern } from "@/components/IslamicPattern";
import { AnimatedDigit } from "@/components/AnimatedDigit";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

export default function TVDisplay() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark" || true;
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = usePrayer();
  const time = useCurrentTime();
  const nextPrayer = useNextPrayer(
    settings.prayerTimes,
    time.hours,
    time.minutes
  );

  const colonOpacity = useSharedValue(1);
  const glowOpacity = useSharedValue(0.4);

  useEffect(() => {
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );

    glowOpacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2000 }),
        withTiming(0.3, { duration: 2000 })
      ),
      -1,
      true
    );
  }, [colonOpacity, glowOpacity]);

  const colonStyle = useAnimatedStyle(() => ({
    opacity: colonOpacity.value,
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#050A14" : "#F8F5EE" },
      ]}
    >
      <IslamicPattern width={SCREEN_W} height={SCREEN_H} color={colors.primary} />

      <Animated.View
        style={[
          styles.glow,
          glowStyle,
          { backgroundColor: colors.primary },
        ]}
      />

      <View
        style={[
          styles.inner,
          { paddingTop: topPad + 8, paddingBottom: botPad + 8 },
        ]}
      >
        <View style={styles.topBar}>
          <Text style={[styles.mosqueName, { color: colors.primary }]}>
            {settings.mosqueName}
          </Text>
          <Text style={[styles.mosqueNameArabic, { color: colors.primary }]}>
            {settings.mosqueNameArabic}
          </Text>
          <TouchableOpacity
            style={[styles.settingsBtn, { borderColor: colors.border }]}
            onPress={() => router.push("/settings")}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Feather name="settings" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        </View>

        <View style={styles.mainRow}>
          <View style={styles.leftCol}>
            <View style={styles.clockRow}>
              <AnimatedDigit
                value={time.displayHours}
                style={[styles.clockDigit, { color: colors.foreground }]}
                animateOnChange={true}
              />
              <Animated.Text
                style={[styles.clockColon, { color: colors.primary }, colonStyle]}
              >
                :
              </Animated.Text>
              <AnimatedDigit
                value={time.displayMinutes}
                style={[styles.clockDigit, { color: colors.foreground }]}
                animateOnChange={true}
              />
              <View style={styles.clockMeta}>
                <Text style={[styles.clockSeconds, { color: colors.primary }]}>
                  {time.displaySeconds}
                </Text>
                <View
                  style={[
                    styles.periodBadge,
                    { backgroundColor: colors.primary + "30", borderColor: colors.primary },
                  ]}
                >
                  <Text style={[styles.periodText, { color: colors.primary }]}>
                    {time.period}
                  </Text>
                </View>
              </View>
            </View>

            <View style={styles.dateBlock}>
              <Text style={[styles.dayName, { color: colors.primary }]}>
                {time.dayName}
              </Text>
              <Text style={[styles.hijriDate, { color: colors.mutedForeground }]}>
                {time.hijriDay} {time.hijriMonth} {time.hijriYear}
              </Text>
              <Text style={[styles.gregorianDate, { color: colors.foreground }]}>
                {time.dayNumber}{" "}
                <Text style={{ color: colors.primary, fontWeight: "700" }}>
                  {time.monthName}
                </Text>{" "}
                {time.year}
              </Text>
            </View>

            <View
              style={[
                styles.extraCard,
                { backgroundColor: colors.card + "CC", borderColor: colors.border },
              ]}
            >
              {settings.showSunrise && (
                <View style={styles.extraItem}>
                  <Text style={[styles.extraLabel, { color: colors.mutedForeground }]}>
                    Sunrise
                  </Text>
                  <Text style={[styles.extraValue, { color: colors.foreground }]}>
                    {settings.sunriseTime}
                  </Text>
                </View>
              )}
              <View style={styles.extraItem}>
                <Text style={[styles.extraLabel, { color: colors.mutedForeground }]}>
                  Jumu'ah
                </Text>
                <Text style={[styles.extraValue, { color: colors.foreground }]}>
                  {settings.jumuahTime}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.nextPrayerCard,
                { backgroundColor: colors.accent + "20", borderColor: colors.accent + "60" },
              ]}
            >
              <Text style={[styles.nextLabel, { color: colors.accent }]}>
                Next Prayer
              </Text>
              <Text style={[styles.nextName, { color: colors.foreground }]}>
                {nextPrayer.name}
              </Text>
              <Text style={[styles.nextCountdown, { color: colors.accent }]}>
                {nextPrayer.hoursUntil > 0
                  ? `${nextPrayer.hoursUntil}h ${nextPrayer.minutesUntil}m`
                  : `${nextPrayer.minutesUntil} min`}
              </Text>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.border }]}
          />

          <View style={styles.rightCol}>
            <View style={styles.prayerHeader}>
              <View style={styles.prayerNameHeader}>
                <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>
                  Prayer
                </Text>
              </View>
              <View style={styles.timeHeader}>
                <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>
                  Adhan
                </Text>
              </View>
              <View style={styles.timeHeader}>
                <Text style={[styles.headerLabel, { color: colors.mutedForeground }]}>
                  Iqama
                </Text>
              </View>
            </View>

            <View
              style={[styles.headerUnderline, { backgroundColor: colors.border }]}
            />

            {PRAYER_ORDER.map((key) => (
              <PrayerRow
                key={key}
                arabicName={PRAYER_ARABIC[key]}
                englishName={PRAYER_DISPLAY[key]}
                adhan={settings.prayerTimes[key].adhan}
                iqama={settings.prayerTimes[key].iqama}
                isCurrent={nextPrayer.currentPrayerKey === key}
                isNext={nextPrayer.name.toLowerCase() === PRAYER_DISPLAY[key].toLowerCase()}
              />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  glow: {
    position: "absolute",
    top: -100,
    left: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.05,
    transform: [{ scale: 2 }],
  },
  inner: {
    flex: 1,
    paddingHorizontal: 20,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  mosqueName: {
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    flex: 1,
  },
  mosqueNameArabic: {
    fontSize: 18,
    fontWeight: "600",
    marginRight: 12,
  },
  settingsBtn: {
    padding: 6,
    borderRadius: 8,
    borderWidth: 1,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
    gap: 20,
  },
  leftCol: {
    flex: 1.1,
    justifyContent: "center",
    gap: 14,
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockDigit: {
    fontSize: 72,
    fontWeight: "300",
    letterSpacing: -2,
    includeFontPadding: false,
  },
  clockColon: {
    fontSize: 60,
    fontWeight: "200",
    marginHorizontal: 4,
    marginTop: -8,
  },
  clockMeta: {
    marginLeft: 8,
    justifyContent: "center",
    gap: 6,
  },
  clockSeconds: {
    fontSize: 22,
    fontWeight: "500",
    letterSpacing: 1,
  },
  periodBadge: {
    borderWidth: 1,
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  periodText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  dateBlock: {
    gap: 3,
  },
  dayName: {
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  hijriDate: {
    fontSize: 13,
    letterSpacing: 0.5,
  },
  gregorianDate: {
    fontSize: 17,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
  extraCard: {
    flexDirection: "row",
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    gap: 24,
  },
  extraItem: {
    gap: 2,
  },
  extraLabel: {
    fontSize: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  extraValue: {
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 1,
  },
  nextPrayerCard: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  nextLabel: {
    fontSize: 10,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 2,
  },
  nextName: {
    fontSize: 20,
    fontWeight: "700",
  },
  nextCountdown: {
    fontSize: 14,
    fontWeight: "500",
    marginTop: 2,
  },
  divider: {
    width: 1,
    marginVertical: 4,
    opacity: 0.4,
  },
  rightCol: {
    flex: 1.9,
    justifyContent: "center",
  },
  prayerHeader: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 6,
  },
  prayerNameHeader: {
    flex: 2,
    alignItems: "flex-end",
  },
  timeHeader: {
    flex: 1.5,
    alignItems: "center",
  },
  headerLabel: {
    fontSize: 11,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "600",
  },
  headerUnderline: {
    height: 1,
    marginHorizontal: 16,
    marginBottom: 4,
    opacity: 0.3,
  },
});
