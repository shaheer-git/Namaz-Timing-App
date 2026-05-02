import { useMemo } from "react";
import { useWindowDimensions } from "react-native";

export type DisplayMetrics = {
  scale: number;
  /** True for large viewports where the original TV layout/scaling applies. */
  tvLikeLayout: boolean;
  screenW: number;
  screenH: number;
};

/**
 * Scale for the TV prayer board. Large TV / tablet viewports keep the original
 * height-based rule (`max(1, height/720)`). Small phones get extra downscaling so
 * the clock fits the left column and nothing bleeds into the table.
 */
export function useDisplayMetrics(): DisplayMetrics {
  const { width: screenW, height: screenH } = useWindowDimensions();

  return useMemo(() => {
    const shortSide = Math.min(screenW, screenH);
    const longSide = Math.max(screenW, screenH);

    const tvLikeLayout = shortSide >= 600 && longSide >= 1100;

    const heightScale = screenH / 900;

    let scale: number;
    if (tvLikeLayout) {
      scale = Math.max(0.8, heightScale);
    } else {
      const innerPad = 60;
      const mainW = Math.max(200, screenW - innerPad);
      const flexSum = 1.1 + 2.1;
      const betweenCols = 32;
      const leftColW = ((mainW - betweenCols) * 1.1) / flexSum;

      const refDigit = 110;
      const clockWidthFactor = 2.95;
      const maxScaleByWidth = (leftColW * 0.88) / (refDigit * clockWidthFactor);

      const heightCap = Math.min(1.1, heightScale);
      scale = Math.max(0.3, Math.min(heightCap, maxScaleByWidth));
    }

    return { scale, tvLikeLayout, screenW, screenH };
  }, [screenW, screenH]);
}
