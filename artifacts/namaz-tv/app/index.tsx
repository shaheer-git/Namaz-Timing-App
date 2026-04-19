import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
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
  interpolateColor,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { usePrayer } from "@/context/PrayerContext";
import { useCurrentTime } from "@/hooks/useCurrentTime";
import { useNextPrayer, PRAYER_ORDER, PRAYER_ARABIC, PRAYER_DISPLAY } from "@/hooks/useNextPrayer";
import { PrayerRow } from "@/components/PrayerRow";
import { StarsBackground } from "@/components/StarsBackground";
import { IslamicMoon } from "@/components/IslamicMoon";
import { DayBackground } from "@/components/DayBackground";
import { AnimatedDigit } from "@/components/AnimatedDigit";
import { useBeep } from "@/hooks/useBeep";
import { useDisplayMetrics } from "@/hooks/useDisplayScale";

// Helper to convert "HH:mm" to minutes
function timeToMinutes(timeStr: string, prayerKey?: string): number {
  if (!timeStr) return 0;
  
  const isPMForm = timeStr.toLowerCase().includes("pm");
  const isAMForm = timeStr.toLowerCase().includes("am");
  
  const cleanStr = timeStr.replace(/[^0-9:]/g, "");
  let [hStr, mStr] = cleanStr.split(":");
  let h = parseInt(hStr, 10);
  let m = parseInt(mStr, 10);
  
  if (isNaN(h)) h = 0;
  if (isNaN(m)) m = 0;

  if (isPMForm && h < 12) h += 12;
  if (isAMForm && h === 12) h = 0;

  if (!isPMForm && !isAMForm && prayerKey && ["dhuhr", "asr", "maghrib", "isha"].includes(prayerKey)) {
    if (h < 12) {
      h += 12;
    }
  }
  
  return h * 60 + m;
}

export default function TVDisplay() {
  const { scale: SCALE, tvLikeLayout } = useDisplayMetrics();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { settings } = usePrayer();
  const time = useCurrentTime();
  const nextPrayer = useNextPrayer(
    settings.prayerTimes,
    time.hours,
    time.minutes
  );
  
  const { playBeep } = useBeep();

  useEffect(() => {
    if (time.seconds === 0) {
      const currentMins = time.hours * 60 + time.minutes;
      for (const key of PRAYER_ORDER) {
        if (
          timeToMinutes(settings.prayerTimes[key].adhan, key) === currentMins ||
          timeToMinutes(settings.prayerTimes[key].iqama, key) === currentMins
        ) {
          playBeep();
          break;
        }
      }
    }
  }, [time.hours, time.minutes, time.seconds, settings.prayerTimes, playBeep]);

  // Day/Night Logic
  const currentMinutes = time.hours * 60 + time.minutes;
  const sunriseMinutes = timeToMinutes(settings.sunriseTime);
  const sunsetMinutes = timeToMinutes(settings.prayerTimes.maghrib.adhan, "maghrib");

  const isDay = currentMinutes >= sunriseMinutes && currentMinutes < sunsetMinutes;
  const dayOpacity = useSharedValue(isDay ? 1 : 0);
  const nightOpacity = useSharedValue(isDay ? 0 : 1);

  useEffect(() => {
    dayOpacity.value = withTiming(isDay ? 1 : 0, { duration: 3000 });
    nightOpacity.value = withTiming(isDay ? 0 : 1, { duration: 3000 });
  }, [isDay]);

  const colonOpacity = useSharedValue(1);
  const blinkOpacity = useSharedValue(1);

  useEffect(() => {
    colonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.2, { duration: 500 }),
        withTiming(1, { duration: 500 })
      ),
      -1,
      false
    );

    blinkOpacity.value = withRepeat(
      withSequence(
        withTiming(0.4, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const dayStyle = useAnimatedStyle(() => ({ opacity: dayOpacity.value }));
  const nightStyle = useAnimatedStyle(() => ({ opacity: nightOpacity.value }));
  const colonStyle = useAnimatedStyle(() => ({ opacity: colonOpacity.value }));
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blinkOpacity.value }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  // Dynamic colors based on day/night (Rug Theme)
  const dynamicColors = {
    text: isDay ? "#FDFDFB" : "#FFFFFF", // Cream for day, White for night
    subText: isDay ? "#D4AA50" : colors.mutedForeground, // Bold Gold
    accent: isDay ? "#F0EAD6" : colors.primary, 
    cardBg: isDay ? "rgba(255, 255, 255, 0.1)" : "rgba(10, 20, 40, 0.6)",
    mosqueColor: isDay ? "#D4AA50" : "#F0EAD6",
  };

  const shadow = {
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  };

  const edgePad = tvLikeLayout ? 30 : 14;
  const mainGap = tvLikeLayout ? 30 : 12;
  const tablePad = 16 * SCALE;

  return (
    <View style={styles.container}>
      {/* Night Sky */}
      <Animated.View style={[StyleSheet.absoluteFill, nightStyle, { backgroundColor: "#020408" }]}>
        <StarsBackground />
        <IslamicMoon scale={SCALE} />
      </Animated.View>

      {/* Day Sky (Now Rug) */}
      <Animated.View style={[StyleSheet.absoluteFill, dayStyle]}>
        <DayBackground scale={SCALE} />
      </Animated.View>

      <View
        style={[
          styles.inner,
          {
            paddingTop: topPad + 12 * SCALE,
            paddingBottom: botPad + 12 * SCALE,
            paddingHorizontal: edgePad,
          },
        ]}
      >
        <View
          style={[
            styles.topBar,
            { marginBottom: 12 * SCALE },
            !tvLikeLayout && styles.topBarCompact,
          ]}
        >
          <View
            style={
              tvLikeLayout
                ? styles.topBarTitlesRow
                : styles.topBarTitlesStack
            }
          >
            <Text
              numberOfLines={tvLikeLayout ? 1 : 2}
              ellipsizeMode="tail"
              style={[
                styles.mosqueName,
                tvLikeLayout && styles.mosqueNameTv,
                { color: dynamicColors.mosqueColor, fontSize: 24 * SCALE },
                shadow,
              ]}
            >
              {settings.mosqueName}
            </Text>
            <Text
              numberOfLines={tvLikeLayout ? 1 : 2}
              ellipsizeMode="tail"
              style={[
                styles.mosqueNameArabic,
                tvLikeLayout && styles.mosqueNameArabicTv,
                { color: dynamicColors.accent, fontSize: 22 * SCALE },
                shadow,
              ]}
            >
              {settings.mosqueNameArabic}
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.settingsBtn, { borderColor: dynamicColors.accent, padding: 8 * SCALE }]}
            onPress={() => router.push("/settings")}
          >
            <Feather name="settings" size={20 * SCALE} color={dynamicColors.accent} />
          </TouchableOpacity>
        </View>

        <View style={[styles.mainRow, { gap: mainGap }]}>
          <View style={[styles.leftCol, !tvLikeLayout && styles.leftColCompact]}>
            <View style={styles.clockRow}>
              <AnimatedDigit
                value={time.displayHours}
                style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 110 * SCALE }, shadow]}
                animateOnChange={true}
              />
              <Animated.Text
                style={[styles.clockColon, { color: dynamicColors.accent, fontSize: 100 * SCALE }, colonStyle, shadow]}
              >
                :
              </Animated.Text>
              <AnimatedDigit
                value={time.displayMinutes}
                style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 110 * SCALE }, shadow]}
                animateOnChange={true}
              />
              <View style={[styles.clockMeta, { marginLeft: 12 * SCALE }]}>
                <Text style={[styles.clockSeconds, { color: dynamicColors.accent, fontSize: 32 * SCALE }, shadow]}>
                  {time.displaySeconds}
                </Text>
                <View
                  style={[
                    styles.periodBadge,
                    { 
                      backgroundColor: dynamicColors.accent + "20", 
                      borderColor: dynamicColors.accent,
                      paddingHorizontal: 8 * SCALE,
                      paddingVertical: 4 * SCALE
                    },
                  ]}
                >
                  <Text style={[styles.periodText, { color: dynamicColors.accent, fontSize: 18 * SCALE }, shadow]}>
                    {time.period}
                  </Text>
                </View>
              </View>
            </View>

            <View style={[styles.dateBlock, { gap: 4 * SCALE }]}>
              <Text style={[styles.dayName, { color: dynamicColors.accent, fontSize: 24 * SCALE }, shadow]}>
                {time.dayName}
              </Text>
              <Text style={[styles.hijriDate, { color: dynamicColors.subText, fontSize: 18 * SCALE }, shadow]}>
                {time.hijriDay} {time.hijriMonth} {time.hijriYear}
              </Text>
              <Text style={[styles.gregorianDate, { color: dynamicColors.text, fontSize: 22 * SCALE }, shadow]}>
                {time.dayNumber}{" "}
                <Text style={{ color: dynamicColors.accent, fontWeight: "900" }}>
                  {time.monthName}
                </Text>{" "}
                {time.year}
              </Text>
            </View>

            <View
              style={[
                styles.extraCard,
                { 
                  backgroundColor: dynamicColors.cardBg, 
                  borderColor: dynamicColors.accent + "30",
                  paddingVertical: 14 * SCALE,
                  paddingHorizontal: 20 * SCALE,
                  gap: 32 * SCALE
                },
              ]}
            >
              {settings.showSunrise && (
                <View style={[styles.extraItem, { gap: 4 * SCALE }]}>
                  <Text style={[styles.extraLabel, { color: dynamicColors.subText, fontSize: 12 * SCALE }, shadow]}>
                    Sunrise
                  </Text>
                  <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 24 * SCALE }, shadow]}>
                    {settings.sunriseTime}
                  </Text>
                </View>
              )}
              <View style={[styles.extraItem, { gap: 4 * SCALE }]}>
                <Text style={[styles.extraLabel, { color: dynamicColors.subText, fontSize: 12 * SCALE }, shadow]}>
                  Jumu'ah
                </Text>
                <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 24 * SCALE }, shadow]}>
                  {settings.jumuahTime}
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.nextPrayerCard,
                { 
                  backgroundColor: colors.accent + "25", 
                  borderColor: colors.accent + "60",
                  paddingVertical: 14 * SCALE,
                  paddingHorizontal: 20 * SCALE,
                },
              ]}
            >
              <Text style={[styles.nextLabel, { color: colors.accent, fontSize: 14 * SCALE }, shadow]}>
                Next Prayer
              </Text>
              <Animated.Text style={[styles.nextName, { color: dynamicColors.text, fontSize: 32 * SCALE }, blinkStyle, shadow]}>
                {nextPrayer.name}
              </Animated.Text>
              <Animated.Text style={[styles.nextCountdown, { color: colors.accent, fontSize: 20 * SCALE }, blinkStyle, shadow]}>
                {nextPrayer.hoursUntil > 0
                  ? `${nextPrayer.hoursUntil}h ${nextPrayer.minutesUntil}m`
                  : `${nextPrayer.minutesUntil} min`}
              </Animated.Text>
            </View>
          </View>

          <View
            style={[styles.divider, { backgroundColor: dynamicColors.accent, opacity: 0.1 }]}
          />

          <View style={styles.rightCol}>
            <View
              style={[
                styles.prayerHeader,
                { paddingVertical: 10 * SCALE, paddingHorizontal: tablePad },
              ]}
            >
              <View style={styles.prayerNameHeader}>
                <Text style={[styles.headerLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }, shadow]}>
                  Prayer
                </Text>
              </View>
              <View style={styles.timeHeader}>
                <Text style={[styles.headerLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }, shadow]}>
                  Adhan
                </Text>
              </View>
              <View style={styles.timeHeader}>
                <Text style={[styles.headerLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }, shadow]}>
                  Iqama
                </Text>
              </View>
            </View>

            <View
              style={[
                styles.headerUnderline,
                {
                  backgroundColor: dynamicColors.accent,
                  opacity: 0.2,
                  marginBottom: 8 * SCALE,
                  marginHorizontal: tablePad,
                },
              ]}
            />

            {PRAYER_ORDER.map((key) => {
              const pAdhan = settings.prayerTimes[key].adhan;
              const pIqama = settings.prayerTimes[key].iqama;
              
              const isNextPrayer = nextPrayer.nextPrayerKey === key;
              const isNextAdhan = isNextPrayer && nextPrayer.nextEvent === "adhan";
              const isNextIqama = isNextPrayer && nextPrayer.nextEvent === "iqama";

              return (
                <PrayerRow
                  key={key}
                  arabicName={PRAYER_ARABIC[key]}
                  englishName={PRAYER_DISPLAY[key]}
                  adhan={pAdhan}
                  iqama={pIqama}
                  isHighlighted={isNextPrayer}
                  blinkAdhan={isNextAdhan}
                  blinkIqama={isNextIqama}
                  scale={SCALE}
                  isDay={isDay}
                  isRug={true}
                />
              );
            })}
          </View>
        </View>

        <Text
          style={[
            styles.watermark,
            { color: dynamicColors.subText, fontSize: 12 * SCALE, right: edgePad + 4 },
          ]}
        >
          by Shaheer
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
  },
  inner: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
  },
  topBarCompact: {
    alignItems: "flex-start",
  },
  topBarTitlesRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    minWidth: 0,
  },
  topBarTitlesStack: {
    flex: 1,
    minWidth: 0,
    marginRight: 10,
    paddingRight: 4,
  },
  mosqueName: {
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  mosqueNameTv: {
    flex: 1,
  },
  mosqueNameArabic: {
    fontWeight: "800",
    marginTop: 2,
  },
  mosqueNameArabicTv: {
    marginRight: 16,
    marginTop: 0,
  },
  settingsBtn: {
    borderRadius: 8,
    borderWidth: 1,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
  },
  leftCol: {
    flex: 1.1,
    justifyContent: "center",
    gap: 20,
    minWidth: 0,
  },
  leftColCompact: {
    flexShrink: 1,
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockDigit: {
    fontWeight: "900",
    letterSpacing: -2,
    includeFontPadding: false,
  },
  clockColon: {
    fontWeight: "700",
    marginHorizontal: 4,
    marginTop: -10,
  },
  clockMeta: {
    justifyContent: "center",
    gap: 8,
  },
  clockSeconds: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  periodBadge: {
    borderWidth: 1,
    borderRadius: 4,
  },
  periodText: {
    fontWeight: "900",
    letterSpacing: 1,
  },
  dateBlock: {
  },
  dayName: {
    fontWeight: "900",
    letterSpacing: 3,
    textTransform: "uppercase",
  },
  hijriDate: {
    letterSpacing: 1,
    fontWeight: "700",
  },
  gregorianDate: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  extraCard: {
    flexDirection: "row",
    borderRadius: 12,
    borderWidth: 1,
  },
  extraItem: {
  },
  extraLabel: {
    letterSpacing: 1.5,
    textTransform: "uppercase",
    fontWeight: "800",
  },
  extraValue: {
    fontWeight: "900",
    letterSpacing: 1,
  },
  nextPrayerCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  nextLabel: {
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: "800",
  },
  nextName: {
    fontWeight: "900",
  },
  nextCountdown: {
    fontWeight: "800",
    marginTop: 4,
  },
  divider: {
    width: 2,
    marginVertical: 10,
  },
  rightCol: {
    flex: 2.1,
    justifyContent: "center",
    minWidth: 0,
  },
  prayerHeader: {
    flexDirection: "row",
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
    letterSpacing: 2,
    textTransform: "uppercase",
    fontWeight: "900",
  },
  headerUnderline: {
    height: 1.5,
  },
  watermark: {
    position: "absolute",
    bottom: 12,
    right: 24,
    letterSpacing: 1,
    opacity: 0.45,
    fontStyle: "italic",
    fontWeight: "700",
  },
});


