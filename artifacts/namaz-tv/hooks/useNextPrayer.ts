import { useMemo } from "react";
import { PrayerTimes } from "@/context/PrayerContext";

export interface NextPrayerInfo {
  name: string;
  nameArabic: string;
  targetTime: string;
  minutesUntil: number;
  hoursUntil: number;
  currentPrayerKey: string | null;
  nextPrayerKey: string;
  nextEvent: "adhan" | "iqama";
}

const PRAYER_ORDER = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
const PRAYER_ARABIC = {
  fajr: "الفجر",
  dhuhr: "الظهر",
  asr: "العصر",
  maghrib: "المغرب",
  isha: "العشاء",
};
const PRAYER_DISPLAY = {
  fajr: "Fajr",
  dhuhr: "Dhuhr",
  asr: "Asr",
  maghrib: "Maghrib",
  isha: "Isha",
};

function timeToMinutes(timeStr: string, prayerKey?: string): number {
  if (!timeStr) return 0;
  let [h, m] = timeStr.split(":").map(Number);
  
  // Auto-correct 12-hour format strings to 24-hour format for PM prayers
  if (prayerKey && ["dhuhr", "asr", "maghrib", "isha"].includes(prayerKey)) {
    if (h !== undefined && h < 12) {
      h += 12;
    }
  }
  
  return (h ?? 0) * 60 + (m ?? 0);
}

export function useNextPrayer(
  prayerTimes: PrayerTimes,
  currentHour: number,
  currentMinute: number
): NextPrayerInfo {
  return useMemo(() => {
    const nowMinutes = currentHour * 60 + currentMinute;

    let currentPrayerKey: string | null = null;
    let nextPrayerKey = "fajr";
    let nextEvent: "adhan" | "iqama" = "adhan";
    let nextMinutes = 0;
    
    // Determine the most recently started prayer period
    for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
      const key = PRAYER_ORDER[i]!;
      const adhanMinutes = timeToMinutes(prayerTimes[key].adhan, key);
      if (nowMinutes >= adhanMinutes) {
        currentPrayerKey = key;
        break;
      }
    }

    let found = false;
    for (const key of PRAYER_ORDER) {
      const adhanMinutes = timeToMinutes(prayerTimes[key].adhan, key);
      const iqamaMinutes = timeToMinutes(prayerTimes[key].iqama, key);
      
      if (nowMinutes < adhanMinutes) {
        nextPrayerKey = key;
        nextEvent = "adhan";
        nextMinutes = adhanMinutes - nowMinutes;
        found = true;
        break;
      } else if (nowMinutes < iqamaMinutes) {
        nextPrayerKey = key;
        nextEvent = "iqama";
        nextMinutes = iqamaMinutes - nowMinutes;
        found = true;
        break;
      }
    }

    if (!found) {
      nextPrayerKey = "fajr";
      nextEvent = "adhan";
      const fajrMinutes = timeToMinutes(prayerTimes.fajr.adhan, "fajr");
      nextMinutes = 24 * 60 - nowMinutes + fajrMinutes;
    }

    const targetTime = nextEvent === "adhan" 
      ? prayerTimes[nextPrayerKey as keyof PrayerTimes].adhan 
      : prayerTimes[nextPrayerKey as keyof PrayerTimes].iqama;

    return {
      name: PRAYER_DISPLAY[nextPrayerKey as keyof typeof PRAYER_DISPLAY],
      nameArabic: PRAYER_ARABIC[nextPrayerKey as keyof typeof PRAYER_ARABIC],
      targetTime,
      minutesUntil: nextMinutes % 60,
      hoursUntil: Math.floor(nextMinutes / 60),
      currentPrayerKey,
      nextPrayerKey,
      nextEvent,
    };
  }, [prayerTimes, currentHour, currentMinute]);
}

export { PRAYER_ORDER, PRAYER_ARABIC, PRAYER_DISPLAY };
