import React from "react";
import { View, StyleSheet } from "react-native";
import Svg, { G, Path, Circle, Polygon } from "react-native-svg";

interface IslamicPatternProps {
  width: number;
  height: number;
  color?: string;
  opacity?: number;
}

export function IslamicPattern({
  width,
  height,
  color = "#D4AA50",
  opacity = 0.06,
}: IslamicPatternProps) {
  const size = 60;
  const cols = Math.ceil(width / size) + 1;
  const rows = Math.ceil(height / size) + 1;

  return (
    <View style={[StyleSheet.absoluteFill, { overflow: "hidden" }]} pointerEvents="none">
      <Svg width={width} height={height} opacity={opacity}>
        {Array.from({ length: rows }).map((_, row) =>
          Array.from({ length: cols }).map((_, col) => {
            const x = col * size;
            const y = row * size;
            const cx = x + size / 2;
            const cy = y + size / 2;
            const r = size * 0.42;
            const points = Array.from({ length: 8 }, (__, i) => {
              const angle = (i * Math.PI) / 4 - Math.PI / 8;
              return `${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`;
            }).join(" ");
            return (
              <G key={`${row}-${col}`}>
                <Polygon
                  points={points}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.8}
                />
                <Circle
                  cx={cx}
                  cy={cy}
                  r={size * 0.12}
                  fill="none"
                  stroke={color}
                  strokeWidth={0.6}
                />
              </G>
            );
          })
        )}
      </Svg>
    </View>
  );
}
