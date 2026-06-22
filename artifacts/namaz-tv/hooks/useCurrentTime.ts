import { useEffect, useState } from "react";

export interface TimeInfo {
  hours: number;
  minutes: number;
  seconds: number;
  hours12: number;
  isAM: boolean;
  displayHours: string;
  displayMinutes: string;
  displaySeconds: string;
  period: string;
  dayName: string;
  dayNumber: number;
  monthName: string;
  year: number;
  hijriDay: number;
  hijriMonth: string;
  hijriYear: number;
}

const HIJRI_MONTHS = [
  "Muharram",
  "Safar",
  "Rabi al-Awwal",
  "Rabi al-Thani",
  "Jumada al-Awwal",
  "Jumada al-Thani",
  "Rajab",
  "Sha'ban",
  "Ramadan",
  "Shawwal",
  "Dhu al-Qi'dah",
  "Dhu al-Hijjah",
];

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

/**
 * Get Hijri date using the browser's built-in Intl.DateTimeFormat API
 * with the Umm al-Qura calendar (islamic-umalqura).
 *
 * This replaces the old custom tabular/Kuwaiti algorithm which drifted
 * by 1-3 days over time and required manual offset hacks (e.g. -1, -3 days).
 * The Intl API uses ICU's Umm al-Qura tables, which are accurate and
 * maintained by the browser vendor — no manual adjustments needed.
 */
function getHijriDate(date: Date): { day: number; month: number; year: number } {
  // Format day, month number, and year separately using islamic-umalqura calendar
  const dayFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    day: "numeric",
  });
  const monthFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    month: "numeric",
  });
  const yearFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura", {
    year: "numeric",
  });

  const day = parseInt(dayFormatter.format(date), 10);
  const month = parseInt(monthFormatter.format(date), 10);
  // Year string may contain " AH" suffix, extract just the number
  const year = parseInt(yearFormatter.format(date).replace(/[^\d]/g, ""), 10);

  return { day, month, year };
}

export function useCurrentTime(hijriAdjustment: number = 0): TimeInfo {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const seconds = now.getSeconds();
  const isAM = hours < 12;
  const hours12 = hours % 12 === 0 ? 12 : hours % 12;

  // Apply regional adjustment (e.g. -1 for South Asian moon sighting)
  const adjustedDate = new Date(now);
  if (hijriAdjustment !== 0) {
    adjustedDate.setDate(adjustedDate.getDate() + hijriAdjustment);
  }
  const hijri = getHijriDate(adjustedDate);

  return {
    hours,
    minutes,
    seconds,
    hours12,
    isAM,
    displayHours: String(hours12).padStart(2, "0"),
    displayMinutes: String(minutes).padStart(2, "0"),
    displaySeconds: String(seconds).padStart(2, "0"),
    period: isAM ? "AM" : "PM",
    dayName: DAY_NAMES[now.getDay()],
    dayNumber: now.getDate(),
    monthName: MONTH_NAMES[now.getMonth()],
    year: now.getFullYear(),
    hijriDay: hijri.day,
    hijriMonth: HIJRI_MONTHS[hijri.month - 1] ?? "",
    hijriYear: hijri.year,
  };
}
