import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";

export interface PrayerTime {
  adhan: string;
  iqama: string;
}

export interface PrayerTimes {
  fajr: PrayerTime;
  dhuhr: PrayerTime;
  asr: PrayerTime;
  maghrib: PrayerTime;
  isha: PrayerTime;
}

export interface PrayerSettings {
  mosqueName: string;
  mosqueNameArabic: string;
  prayerTimes: PrayerTimes;
  showSunrise: boolean;
  sunriseTime: string;
  jumuahTime: string;
}

const defaultSettings: PrayerSettings = {
  mosqueName: "Jamiya Masjid",
  mosqueNameArabic: "جامع المسجد",
  prayerTimes: {
    fajr: { adhan: "05:15", iqama: "05:45" },
    dhuhr: { adhan: "01:00", iqama: "01:30" },
    asr: { adhan: "05:00", iqama: "05:15" },
    maghrib: { adhan: "06:40", iqama: "06:44" },
    isha: { adhan: "08:00", iqama: "08:15" },
  },
  showSunrise: true,
  sunriseTime: "06:18",
  jumuahTime: "01:45",
};

interface PrayerContextType {
  settings: PrayerSettings;
  updateSettings: (settings: PrayerSettings) => Promise<void>;
  updatePrayerTime: (
    prayer: keyof PrayerTimes,
    type: "adhan" | "iqama",
    time: string
  ) => Promise<void>;
  isLoading: boolean;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const STORAGE_KEY = "@namaz_prayer_settings";

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrayerSettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }
    } catch (e) {
    } finally {
      setIsLoading(false);
    }
  }

  async function updateSettings(newSettings: PrayerSettings) {
    setSettings(newSettings);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
    } catch (e) {}
  }

  async function updatePrayerTime(
    prayer: keyof PrayerTimes,
    type: "adhan" | "iqama",
    time: string
  ) {
    const newSettings = {
      ...settings,
      prayerTimes: {
        ...settings.prayerTimes,
        [prayer]: {
          ...settings.prayerTimes[prayer],
          [type]: time,
        },
      },
    };
    await updateSettings(newSettings);
  }

  return (
    <PrayerContext.Provider
      value={{ settings, updateSettings, updatePrayerTime, isLoading }}
    >
      {children}
    </PrayerContext.Provider>
  );
}

export function usePrayer() {
  const ctx = useContext(PrayerContext);
  if (!ctx) throw new Error("usePrayer must be used within PrayerProvider");
  return ctx;
}
