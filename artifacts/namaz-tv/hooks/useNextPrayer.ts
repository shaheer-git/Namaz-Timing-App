import { useMemo } from "react";
import { PrayerTimes } from "@/context/PrayerContext";

export interface NextPrayerInfo {
  name: string;
  nameArabic: string;
  adhanTime: string;
  minutesUntil: number;
  hoursUntil: number;
  currentPrayerKey: string | null;
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

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
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
    let nextMinutes = 0;

    for (let i = PRAYER_ORDER.length - 1; i >= 0; i--) {
      const key = PRAYER_ORDER[i]!;
      const prayerMinutes = timeToMinutes(prayerTimes[key].adhan);
      if (nowMinutes >= prayerMinutes) {
        currentPrayerKey = key;
        break;
      }
    }

    let found = false;
    for (const key of PRAYER_ORDER) {
      const prayerMinutes = timeToMinutes(prayerTimes[key].adhan);
      if (prayerMinutes > nowMinutes) {
        nextPrayerKey = key;
        nextMinutes = prayerMinutes - nowMinutes;
        found = true;
        break;
      }
    }

    if (!found) {
      nextPrayerKey = "fajr";
      const fajrMinutes = timeToMinutes(prayerTimes.fajr.adhan);
      nextMinutes = 24 * 60 - nowMinutes + fajrMinutes;
    }

    return {
      name: PRAYER_DISPLAY[nextPrayerKey as keyof typeof PRAYER_DISPLAY],
      nameArabic: PRAYER_ARABIC[nextPrayerKey as keyof typeof PRAYER_ARABIC],
      adhanTime: prayerTimes[nextPrayerKey as keyof PrayerTimes].adhan,
      minutesUntil: nextMinutes % 60,
      hoursUntil: Math.floor(nextMinutes / 60),
      currentPrayerKey,
    };
  }, [prayerTimes, currentHour, currentMinute]);
}

export { PRAYER_ORDER, PRAYER_ARABIC, PRAYER_DISPLAY };
