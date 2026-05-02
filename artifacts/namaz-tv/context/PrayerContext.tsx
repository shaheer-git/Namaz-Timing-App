import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

export interface PrayerTime {
  awalWaqth: string;
  adhan: string;
  aaqriWaqth: string;
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
  autoStart: boolean;
}

const defaultSettings: PrayerSettings = {
  mosqueName: "Jamiya Masjid Sakleshpur",
  mosqueNameArabic: "جامع مسجد ساكلشبور",
  prayerTimes: {
    fajr: { awalWaqth: "04:45", adhan: "05:05", aaqriWaqth: "05:35", iqama: "05:45" },
    dhuhr: { awalWaqth: "12:30", adhan: "13:00", aaqriWaqth: "13:30", iqama: "13:40" },
    asr: { awalWaqth: "16:10", adhan: "17:00", aaqriWaqth: "17:15", iqama: "17:25" },
    maghrib: { awalWaqth: "18:30", adhan: "18:43", aaqriWaqth: "18:47", iqama: "18:50" },
    isha: { awalWaqth: "19:00", adhan: "20:00", aaqriWaqth: "20:15", iqama: "20:30" },
  },
  showSunrise: true,
  sunriseTime: "06:18",
  jumuahTime: "13:45",
  autoStart: true,
};

interface PrayerContextType {
  settings: PrayerSettings;
  updateSettings: (settings: PrayerSettings) => Promise<void>;
  updatePrayerTime: (
    prayer: keyof PrayerTimes,
    type: keyof PrayerTime,
    time: string
  ) => Promise<void>;
  isLoading: boolean;
  isSynced: boolean;
}

const PrayerContext = createContext<PrayerContextType | undefined>(undefined);

const STORAGE_KEY = "@namaz_prayer_settings";
const MOSQUE_ID_KEY = "@namaz_mosque_id";
const DEFAULT_MOSQUE_ID = "main";

export function PrayerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<PrayerSettings>(defaultSettings);
  const [mosqueId, setMosqueId] = useState<string>(DEFAULT_MOSQUE_ID);
  const [isLoading, setIsLoading] = useState(true);
  const [isSynced, setIsSynced] = useState(false);

  useEffect(() => {
    init();
  }, []);

  async function init() {
    try {
      // 1. Load from AsyncStorage first for instant UI
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const storedId = await AsyncStorage.getItem(MOSQUE_ID_KEY);
      
      if (storedId) setMosqueId(storedId);
      
      if (stored) {
        const parsed = JSON.parse(stored);
        setSettings({ ...defaultSettings, ...parsed });
      }

      // 2. Initial fetch from Supabase
      const actualId = storedId || DEFAULT_MOSQUE_ID;
      await fetchFromSupabase(actualId);

      // 3. Subscribe to real-time changes
      const subscription = supabase
        .channel(`mosque_${actualId}`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "settings",
            filter: `slug=eq.${actualId}`,
          },
          (payload) => {
            console.log("Real-time update received:", payload.new);
            if (payload.new && payload.new.data) {
              const cloudSettings = payload.new.data as PrayerSettings;
              setSettings(cloudSettings);
              AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSettings));
            }
          }
        )
        .subscribe();

      return () => {
        subscription.unsubscribe();
      };
    } catch (e) {
      console.error("Initialization error:", e);
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchFromSupabase(id: string) {
    const { data, error } = await supabase
      .from("settings")
      .select("data")
      .eq("slug", id)
      .single();

    if (data && data.data) {
      const cloudSettings = data.data as PrayerSettings;
      setSettings(cloudSettings);
      setIsSynced(true);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(cloudSettings));
    } else if (error && error.code === "PGRST116") {
      // Not found, create it with defaults
      console.log("Mosque settings not found, creating default...");
      await supabase.from("settings").insert({ slug: id, data: defaultSettings });
      setIsSynced(true);
    }
  }

  async function updateSettings(newSettings: PrayerSettings) {
    // Optimistic UI update
    setSettings(newSettings);
    
    try {
      // Save locally
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newSettings));
      
      // Save to cloud
      const { error } = await supabase
        .from("settings")
        .update({ data: newSettings })
        .eq("slug", mosqueId);
        
      if (error) throw error;
      setIsSynced(true);
    } catch (e) {
      console.error("Sync error:", e);
      setIsSynced(false);
    }
  }

  async function updatePrayerTime(
    prayer: keyof PrayerTimes,
    type: keyof PrayerTime,
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
      value={{ settings, updateSettings, updatePrayerTime, isLoading, isSynced }}
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

