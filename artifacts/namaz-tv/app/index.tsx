import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
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

  const colonStyle = useAnimatedStyle(() => ({ opacity: colonOpacity.value }));
  const blinkStyle = useAnimatedStyle(() => ({ opacity: blinkOpacity.value }));

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const botPad = Platform.OS === "web" ? 34 : insets.bottom;

  const dynamicColors = {
    text: "#FFFFFF",
    subText: "#D4AA50",
    accent: "#E6C27A",
    cardBg: "rgba(10, 30, 60, 0.6)",
    mosqueColor: "#FFFFFF",
  };

  const shadow = {
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 4,
  };

  const edgePad = tvLikeLayout ? 45 : 18;
  const mainGap = tvLikeLayout ? 40 : 12;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("../assets/images/mosque-bg.jpeg")}
        style={StyleSheet.absoluteFill}
        resizeMode="cover"
      >
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 5, 15, 0.7)" }]} />

        <View
          style={[
            styles.inner,
            {
              paddingTop: Math.max(10, topPad - 60 * SCALE),
              paddingBottom: botPad + 10 * SCALE,
              paddingHorizontal: edgePad * 0.6,
            },
          ]}
        >
          <View style={[styles.topBar, { marginBottom: 25 * SCALE }]}>
            <View style={styles.topBarTitlesStack}>
              <Text style={[styles.mosqueName, { color: dynamicColors.mosqueColor, fontSize: 28 * SCALE }, shadow]}>
                {settings.mosqueName}
              </Text>
              <Text style={[styles.mosqueNameArabic, { color: dynamicColors.accent, fontSize: 22 * SCALE }, shadow]}>
                {settings.mosqueNameArabic}
              </Text>
            </View>
            <TouchableOpacity
              style={[styles.settingsBtn, { borderColor: dynamicColors.accent, padding: 10 * SCALE, marginRight: 10 * SCALE }]}
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            >
              <Feather name="settings" size={24 * SCALE} color={dynamicColors.accent} />
            </TouchableOpacity>
          </View>

          <View style={[styles.mainRow, { gap: mainGap }]}>
            {/* Left Side: Clock and Dates */}
            <View style={[styles.leftCol, { gap: 20 * SCALE }]}>
              <View style={styles.clockRow}>
                <AnimatedDigit
                  value={time.displayHours}
                  style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 120 * SCALE }, shadow]}
                  animateOnChange={true}
                />
                <Animated.Text
                  style={[styles.clockColon, { color: dynamicColors.accent, fontSize: 110 * SCALE }, colonStyle, shadow]}
                >
                  :
                </Animated.Text>
                <AnimatedDigit
                  value={time.displayMinutes}
                  style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 120 * SCALE }, shadow]}
                  animateOnChange={true}
                />
                <View style={[styles.clockMeta, { marginLeft: 8 * SCALE }]}>
                  <Text style={[styles.clockSeconds, { color: dynamicColors.accent, fontSize: 28 * SCALE }, shadow]}>
                    {time.displaySeconds}
                  </Text>
                  <View style={[styles.periodBadge, { backgroundColor: "rgba(230, 194, 122, 0.2)", borderColor: dynamicColors.accent, paddingHorizontal: 6 * SCALE, paddingVertical: 2 * SCALE }]}>
                    <Text style={[styles.periodText, { color: dynamicColors.accent, fontSize: 16 * SCALE }, shadow]}>
                      {time.period}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={[styles.dateBlock, { gap: 6 * SCALE }]}>
                <Text style={[styles.dayName, { color: dynamicColors.accent, fontSize: 38 * SCALE }, shadow]}>
                  {time.dayName}
                </Text>
                <Text style={[styles.hijriDate, { color: dynamicColors.subText, fontSize: 26 * SCALE }, shadow]}>
                  {time.hijriDay} {time.hijriMonth} {time.hijriYear}
                </Text>
                <Text style={[styles.gregorianDate, { color: dynamicColors.text, fontSize: 30 * SCALE }, shadow]}>
                  {time.dayNumber} {time.monthName} {time.year}
                </Text>
              </View>

              <View style={styles.extraContainer}>
                {settings.showSunrise && (
                  <View style={[styles.extraBox, { backgroundColor: dynamicColors.cardBg, borderColor: "rgba(212, 170, 80, 0.3)" }]}>
                    <View style={styles.extraBoxHeader}>
                      <Feather name="sunrise" size={24 * SCALE} color={dynamicColors.subText} />
                      <Text style={[styles.extraLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }]}>SUNRISE</Text>
                    </View>
                    <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 36 * SCALE }]}>{settings.sunriseTime}</Text>
                  </View>
                )}
                <View style={[styles.extraBox, { backgroundColor: dynamicColors.cardBg, borderColor: "rgba(212, 170, 80, 0.3)" }]}>
                  <View style={styles.extraBoxHeader}>
                    <Feather name="users" size={24 * SCALE} color={dynamicColors.subText} />
                    <Text style={[styles.extraLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }]}>JUMU'AH</Text>
                  </View>
                  <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 36 * SCALE }]}>{settings.jumuahTime}</Text>
                </View>
              </View>

              <View style={[styles.nextCard, { backgroundColor: "rgba(212, 170, 80, 0.15)", borderColor: "rgba(212, 170, 80, 0.4)" }]}>
                <Text style={[styles.nextLabel, { color: dynamicColors.accent, fontSize: 18 * SCALE }]}>NEXT PRAYER</Text>
                <Animated.Text style={[styles.nextName, { color: dynamicColors.text, fontSize: 48 * SCALE }, shadow]}>
                  {nextPrayer.name}
                </Animated.Text>
                <Animated.Text style={[styles.nextTime, { color: dynamicColors.accent, fontSize: 26 * SCALE }, blinkStyle]}>
                  {nextPrayer.hoursUntil > 0 ? `${nextPrayer.hoursUntil}h ` : ""}{nextPrayer.minutesUntil} min
                </Animated.Text>
              </View>
            </View>

            {/* Right Side: Prayer Table */}
            <View style={styles.rightCol}>
              <View style={[styles.tableContainer, { borderColor: "rgba(212, 170, 80, 0.3)" }]}>
                {/* Header Row */}
                <View style={[styles.tableHeader, { borderBottomWidth: 1.5 * SCALE, borderBottomColor: "rgba(212, 170, 80, 0.4)" }]}>
                  <View style={[styles.headerCell, styles.headerNameCell, { borderRightWidth: 1 * SCALE, borderRightColor: "rgba(212, 170, 80, 0.2)" }]}>
                    <Text style={[styles.hLabel, { fontSize: 16 * SCALE }]}>PRAYER</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 24 * SCALE }]}>الصلاة</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: "rgba(212, 170, 80, 0.2)" }]}>
                    <Text style={[styles.hLabel, { fontSize: 16 * SCALE, color: "#4ADE80" }]}>AWAL WAQTH</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 24 * SCALE, color: "#4ADE80" }]}>أول وقت</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: "rgba(212, 170, 80, 0.2)" }]}>
                    <Text style={[styles.hLabel, { fontSize: 16 * SCALE, color: dynamicColors.subText }]}>ADHAAN</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 24 * SCALE, color: dynamicColors.subText }]}>الأذان</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: "rgba(212, 170, 80, 0.2)" }]}>
                    <Text style={[styles.hLabel, { fontSize: 16 * SCALE, color: "#FB923C" }]}>AAQRI WAQTH</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 24 * SCALE, color: "#FB923C" }]}>أقري وقت</Text>
                  </View>
                  <View style={styles.headerCell}>
                    <Text style={[styles.hLabel, { fontSize: 16 * SCALE, color: "#60A5FA" }]}>IQAMA</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 24 * SCALE, color: "#60A5FA" }]}>الإقامة</Text>
                  </View>
                </View>

                {PRAYER_ORDER.map((key) => {
                  const pt = settings.prayerTimes[key];
                  const isNext = nextPrayer.nextPrayerKey === key;

                  return (
                    <PrayerRow
                      key={key}
                      arabicName={PRAYER_ARABIC[key]}
                      englishName={PRAYER_DISPLAY[key]}
                      awalWaqth={pt.awalWaqth}
                      adhan={pt.adhan}
                      aaqriWaqth={pt.aaqriWaqth}
                      iqama={pt.iqama}
                      isHighlighted={isNext}
                      blinkAdhan={isNext && nextPrayer.nextEvent === "adhan"}
                      blinkIqama={isNext && nextPrayer.nextEvent === "iqama"}
                      scale={SCALE}
                    />
                  );
                })}
              </View>
            </View>
          </View>

          <Text style={[styles.watermark, { color: "rgba(255, 255, 255, 0.4)", fontSize: 18 * SCALE }]}>
            by Shaheer
          </Text>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  inner: {
    flex: 1,
  },
  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  topBarTitlesStack: {
    gap: 4,
  },
  mosqueName: {
    fontWeight: "900",
    letterSpacing: 1.5,
  },
  mosqueNameArabic: {
    fontWeight: "800",
  },
  settingsBtn: {
    borderRadius: 12,
    borderWidth: 1,
  },
  mainRow: {
    flex: 1,
    flexDirection: "row",
  },
  leftCol: {
    flex: 1.1,
    justifyContent: "center",
  },
  clockRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockDigit: {
    fontWeight: "900",
    letterSpacing: -2,
  },
  clockColon: {
    fontWeight: "700",
    marginHorizontal: 4,
  },
  clockMeta: {
    gap: 4,
  },
  clockSeconds: {
    fontWeight: "800",
  },
  periodBadge: {
    borderRadius: 6,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  periodText: {
    fontWeight: "900",
  },
  dateBlock: {
    paddingVertical: 10,
    alignItems: "center",
  },
  dayName: {
    fontWeight: "900",
    letterSpacing: 2,
    textTransform: "uppercase",
    textAlign: "center",
  },
  hijriDate: {
    fontWeight: "700",
    letterSpacing: 1,
    textAlign: "center",
  },
  gregorianDate: {
    fontWeight: "800",
    textAlign: "center",
  },
  extraContainer: {
    flexDirection: "row",
    gap: 12,
    marginTop: 10,
  },
  extraBox: {
    flex: 1,
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    gap: 4,
  },
  extraBoxHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  extraLabel: {
    fontWeight: "800",
    letterSpacing: 1,
  },
  extraValue: {
    fontWeight: "900",
    textAlign: "center",
  },
  nextCard: {
    marginTop: 20,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 20,
    gap: 6,
    alignItems: "center",
  },
  nextLabel: {
    fontWeight: "800",
    letterSpacing: 2,
  },
  nextName: {
    fontWeight: "900",
  },
  nextTime: {
    fontWeight: "800",
  },
  rightCol: {
    flex: 2.9,
    justifyContent: "center",
    paddingLeft: 10,
  },
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: "rgba(10, 25, 50, 0.5)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(212, 170, 80, 0.1)",
  },
  headerCell: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerNameCell: {
    flex: 1.2,
  },
  hLabel: {
    fontWeight: "800",
    color: "#fff",
    opacity: 0.8,
  },
  hLabelArabic: {
    fontWeight: "800",
    marginTop: 2,
    color: "#fff",
  },
  watermark: {
    position: "absolute",
    bottom: 10,
    right: 20,
    fontWeight: "700",
    fontStyle: "italic",
    opacity: 0.5,
  },
});



