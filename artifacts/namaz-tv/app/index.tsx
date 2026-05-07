import React, { useEffect, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  ImageBackground,
} from "react-native";
import { router } from "expo-router";
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
        const pt = settings.prayerTimes[key];
        if (
          timeToMinutes(pt.awalWaqth, key) === currentMins ||
          timeToMinutes(pt.adhan, key) === currentMins ||
          timeToMinutes(pt.aaqriWaqth, key) === currentMins ||
          timeToMinutes(pt.iqama, key) === currentMins
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
    subText: "#FDE047", // Azaan Yellow
    accent: "#D4AA50", // Royal Gold
    mosqueColor: "#FFFFFF",
    bg: "rgba(10, 5, 0, 0.45)", // Warmer, deep background
    cardBg: "rgba(212, 170, 80, 0.08)", // Gold-tinted glass
    border: "rgba(212, 170, 80, 0.5)",
    highlight: "rgba(212, 170, 80, 0.25)",
    awal: "#52FF88", // More Vibrant Green
    jamath: "#F0EAD6", // Sophisticated Cream/Gold (Removed blue)
    aaqri: "#FF8C00", // More Vibrant Orange
  };

  const shadow = {
    textShadowColor: "rgba(212, 170, 80, 0.3)", // Vibrant Gold tint instead of black
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  };

  const glowShadow = {
    textShadowColor: "rgba(212, 170, 80, 0.8)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 12,
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
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(0, 5, 15, 0.15)" }]} />
        <View style={[StyleSheet.absoluteFill, { backgroundColor: "rgba(212, 170, 80, 0.08)" }]} />

        <View
          style={[
            styles.inner,
            {
              paddingTop: Math.max(10, topPad - 80 * SCALE),
              paddingBottom: botPad + 5 * SCALE,
              paddingHorizontal: edgePad * 0.5,
            },
          ]}
        >
          <View style={[styles.topBar, { marginBottom: 15 * SCALE }]}>
            <View style={styles.topBarTitlesStack}>
              <Text style={[styles.mosqueName, { color: dynamicColors.mosqueColor, fontSize: 28 * SCALE }, shadow]}>
                {settings.mosqueName}
              </Text>
              <Text style={[styles.mosqueNameArabic, { color: dynamicColors.accent, fontSize: 22 * SCALE }, shadow]}>
                {settings.mosqueNameArabic}
              </Text>
            </View>
            <TouchableOpacity
              style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: 80 * SCALE,
                height: 80 * SCALE,
                zIndex: 9999,
                // Background transparent but clickable
                backgroundColor: 'transparent',
              }}
              onPress={() => router.push("/settings")}
              hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
            />
          </View>

          <View style={[styles.mainRow, { gap: mainGap }]}>
            {/* Left Side: Clock and Dates */}
            <View style={[styles.leftCol, { gap: 20 * SCALE }]}>
              <View style={{ alignItems: "center" }}>
                <View>
                  <View style={styles.clockRow}>
                    <AnimatedDigit
                      value={time.displayHours}
                      style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 145 * SCALE }, glowShadow]}
                      animateOnChange={true}
                    />
                    <Animated.Text
                      style={[styles.clockColon, { color: dynamicColors.accent, fontSize: 110 * SCALE }, colonStyle, glowShadow]}
                    >
                      :
                    </Animated.Text>
                    <AnimatedDigit
                      value={time.displayMinutes}
                      style={[styles.clockDigit, { color: dynamicColors.text, fontSize: 145 * SCALE }, glowShadow]}
                      animateOnChange={true}
                    />
                  </View>
                  <View style={[styles.clockMetaRow, { marginTop: -15 * SCALE, alignSelf: "flex-end", marginRight: 5 * SCALE }]}>
                    <Text style={[styles.clockSeconds, { color: dynamicColors.accent, fontSize: 42 * SCALE }, shadow]}>
                      {time.displaySeconds}
                    </Text>
                    <View style={[styles.periodBadge, { backgroundColor: "rgba(230, 194, 122, 0.2)", borderColor: dynamicColors.accent, paddingHorizontal: 10 * SCALE, paddingVertical: 2 * SCALE, marginLeft: 15 * SCALE }]}>
                      <Text style={[styles.periodText, { color: dynamicColors.accent, fontSize: 24 * SCALE }, shadow]}>
                        {time.period}
                      </Text>
                    </View>
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
                    <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 46 * SCALE }]}>{settings.sunriseTime}</Text>
                  </View>
                )}
                <View style={[styles.extraBox, { backgroundColor: dynamicColors.cardBg, borderColor: "rgba(212, 170, 80, 0.3)" }]}>
                  <View style={styles.extraBoxHeader}>
                    <Feather name="users" size={24 * SCALE} color={dynamicColors.subText} />
                    <Text style={[styles.extraLabel, { color: dynamicColors.subText, fontSize: 14 * SCALE }]}>JUMU'AH</Text>
                  </View>
                  <Text style={[styles.extraValue, { color: dynamicColors.text, fontSize: 46 * SCALE }]}>{settings.jumuahTime}</Text>
                </View>
              </View>

              <View style={[styles.nextCard, { backgroundColor: "rgba(212, 170, 80, 0.15)", borderColor: "rgba(212, 170, 80, 0.4)", padding: 12 * SCALE }]}>
                <Text style={[styles.nextLabel, { color: dynamicColors.accent, fontSize: 22 * SCALE }]}>NEXT PRAYER</Text>
                <Animated.Text style={[styles.nextName, { color: dynamicColors.text, fontSize: 62 * SCALE }, shadow]}>
                  {nextPrayer.name}
                </Animated.Text>
                <Animated.Text style={[styles.nextTime, { color: dynamicColors.accent, fontSize: 32 * SCALE }, blinkStyle]}>
                  {nextPrayer.hoursUntil > 0 ? `${nextPrayer.hoursUntil}h ` : ""}{nextPrayer.minutesUntil} min
                </Animated.Text>
              </View>
            </View>

            {/* Right Side: Prayer Table */}
            <View style={styles.rightCol}>
              <View style={[styles.tableContainer, { borderColor: "rgba(212, 170, 80, 0.3)" }]}>
                {/* Header Row */}
                <View style={[styles.tableHeader, { borderBottomWidth: 1.5 * SCALE, borderBottomColor: "rgba(212, 170, 80, 0.4)" }]}>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: dynamicColors.border }]}>
                    <Text style={[styles.hLabel, { fontSize: 22 * SCALE, color: dynamicColors.aaqri }]}>AAQIR WAQTH</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 32 * SCALE, color: dynamicColors.aaqri }]}>أقري وقت</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: dynamicColors.border }]}>
                    <Text style={[styles.hLabel, { fontSize: 22 * SCALE, color: dynamicColors.awal }]}>AWAL WAQTH</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 32 * SCALE, color: dynamicColors.awal }]}>أول وقت</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: dynamicColors.border }]}>
                    <Text style={[styles.hLabel, { fontSize: 22 * SCALE, color: dynamicColors.jamath }]}>JAMATH</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 32 * SCALE, color: dynamicColors.jamath }]}>الجماعة</Text>
                  </View>
                  <View style={[styles.headerCell, { borderRightWidth: 1 * SCALE, borderRightColor: dynamicColors.border }]}>
                    <Text style={[styles.hLabel, { fontSize: 22 * SCALE, color: dynamicColors.subText }]}>AZAAN</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 32 * SCALE, color: dynamicColors.subText }]}>الأذان</Text>
                  </View>
                  <View style={[styles.headerCell, styles.headerNameCell]}>
                    <Text style={[styles.hLabel, { fontSize: 22 * SCALE }]}>PRAYER</Text>
                    <Text style={[styles.hLabelArabic, { fontSize: 32 * SCALE }]}>الصلاة</Text>
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
                      tvLikeLayout={tvLikeLayout}
                    />
                  );
                })}
              </View>
            </View>
          </View>

          <Text style={[styles.watermark, { color: "rgba(255, 255, 255, 0.8)", fontSize: 22 * SCALE }]}>
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
    justifyContent: "center",
  },
  clockDigit: {
    fontWeight: "900",
    letterSpacing: -2,
  },
  clockColon: {
    fontWeight: "700",
    marginHorizontal: 4,
  },
  clockMetaRow: {
    flexDirection: "row",
    alignItems: "center",
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
    marginTop: 0,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 15,
    gap: 4,
    marginBottom: 5,
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
    flex: 3.5,
    justifyContent: "center",
    paddingLeft: 10,
  },
  tableContainer: {
    borderRadius: 16,
    borderWidth: 1.5,
    overflow: "hidden",
    backgroundColor: "rgba(20, 10, 5, 0.5)",
  },
  tableHeader: {
    flexDirection: "row",
    backgroundColor: "rgba(212, 170, 80, 0.1)",
  },
  headerCell: {
    flex: 1,
    paddingVertical: 18,
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
  settingsBtnMobile: {
    position: "absolute",
    top: 10,
    right: 20,
    bottom: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1.5,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  watermark: {
    position: "absolute",
    bottom: 15,
    right: 25,
    fontWeight: "800",
    fontStyle: "italic",
    opacity: 0.9,
  },
});



