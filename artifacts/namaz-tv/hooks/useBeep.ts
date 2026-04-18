import { useEffect, useState, useRef } from "react";
import { Audio } from "expo-av";

export function useBeep() {
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    let activeSound: Audio.Sound | null = null;
    
    async function loadSound() {
      try {
        const { sound } = await Audio.Sound.createAsync(
          require("@/assets/sounds/beep.ogg")
        );
        activeSound = sound;
        setSound(sound);
      } catch (error) {
        console.error("Failed to load beep sound", error);
      }
    }

    loadSound();

    return () => {
      if (activeSound) {
        activeSound.unloadAsync();
      }
    };
  }, []);

  const playBeep = async () => {
    if (!sound || isPlayingRef.current) return;
    
    try {
      isPlayingRef.current = true;
      // Loop the short beep
      await sound.setIsLoopingAsync(true);
      await sound.playAsync();

      // Stop after 3 seconds exactly as requested
      setTimeout(async () => {
        await sound.stopAsync();
        isPlayingRef.current = false;
      }, 3000);
    } catch (error) {
      console.error("Failed to play beep sound", error);
      isPlayingRef.current = false;
    }
  };

  return { playBeep };
}
