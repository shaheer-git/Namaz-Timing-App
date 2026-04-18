import { useRef } from "react";
import { useAudioPlayer } from "expo-audio";

export function useBeep() {
  const player = useAudioPlayer(require("@/assets/sounds/beep.wav"));
  const isPlayingRef = useRef(false);

  const playBeep = () => {
    if (!player || isPlayingRef.current) return;
    
    try {
      isPlayingRef.current = true;
      player.play();

      // Stop after 3 seconds exactly as requested
      setTimeout(() => {
        player.pause();
        player.seekTo(0);
        isPlayingRef.current = false;
      }, 3000);
    } catch (error) {
      console.error("Failed to play beep sound", error);
      isPlayingRef.current = false;
    }
  };

  return { playBeep };
}
