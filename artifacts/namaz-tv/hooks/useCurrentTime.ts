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

function toHijri(date: Date): { day: number; month: number; year: number } {
  const jd =
    Math.floor((14 + date.getMonth() + 1) / 12);
  const y = date.getFullYear() + 4800 - jd;
  const m = date.getMonth() + 1 + 12 * jd - 3;
  let jdn =
    date.getDate() +
    Math.floor((153 * m + 2) / 5) +
    365 * y +
    Math.floor(y / 4) -
    Math.floor(y / 100) +
    Math.floor(y / 400) -
    32045;

  const l = jdn - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const ll = l - 10631 * n + 354;
  const j =
    Math.floor((10985 - ll) / 5316) * Math.floor((50 * ll) / 17719) +
    Math.floor(ll / 5670) * Math.floor((43 * ll) / 15238);
  const lll =
    ll -
    Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
    Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
    29;
  const month = Math.floor((24 * lll) / 709);
  const day = lll - Math.floor((709 * month) / 24);
  const year = 30 * n + j - 30;

  return { day, month, year };
}

export function useCurrentTime(): TimeInfo {
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

  const hijri = toHijri(now);

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
