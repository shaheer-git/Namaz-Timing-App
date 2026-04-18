import React from "react";
import { StyleSheet, Dimensions, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Defs, RadialGradient, Stop, G, Path, Rect } from "react-native-svg";

const { width: W, height: H } = Dimensions.get("window");

// A complex Arabesque motif for corners and medallions
const ArabesqueMotif = ({ size = 100, color = "#FDF5E6", opacity = 0.4 }) => (
  <G scale={size / 100}>
     <Path 
        d="M 50 10 Q 60 30 50 50 Q 40 30 50 10 M 10 50 Q 30 40 50 50 Q 30 60 10 50 M 50 90 Q 40 70 50 50 Q 60 70 50 90 M 90 50 Q 70 60 50 50 Q 70 40 90 50" 
        fill="none" stroke={color} strokeWidth="1" opacity={opacity}
     />
     <Path 
        d="M 25 25 Q 50 35 75 25 Q 65 50 75 75 Q 50 65 25 75 Q 35 50 25 25" 
        fill="none" stroke={color} strokeWidth="0.5" opacity={opacity * 0.8}
     />
     <Circle cx="50" cy="50" r="5" fill={color} opacity={opacity} />
  </G>
);

export function DayBackground({ scale = 1 }: { scale?: number }) {
  return (
    <View style={StyleSheet.absoluteFill}>
      {/* Deep Indigo Rug Base */}
      <LinearGradient
        colors={["#050B14", "#0A1E32"]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Texture Overlay (Grain) */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: "#000", opacity: 0.15 }]} />

      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        {/* Intricate Multi-Layered Border */}
        <Rect 
          x={15 * scale} y={15 * scale} 
          width={W - 30 * scale} height={H - 30 * scale} 
          stroke="#D4AA50" strokeWidth={2 * scale} fill="none" opacity="0.4"
        />
        <Rect 
          x={25 * scale} y={25 * scale} 
          width={W - 50 * scale} height={H - 50 * scale} 
          stroke="#FDF5E6" strokeWidth={0.5 * scale} fill="none" opacity="0.2"
        />

        {/* Center Medallion (Traditional Persian Style) */}
        <G transform={`translate(${W / 2 - 150 * scale}, ${H / 2 - 150 * scale}) scale(${3 * scale})`}>
          <ArabesqueMotif size={100} opacity={0.5} />
          <G transform="rotate(45, 50, 50)">
            <ArabesqueMotif size={100} opacity={0.3} />
          </G>
          <Circle cx="50" cy="50" r="10" stroke="#D4AA50" strokeWidth="0.5" fill="none" opacity="0.4" />
        </G>

        {/* Corner Ornaments */}
        {[
          { x: 30 * scale, y: 30 * scale, r: 0 },
          { x: W - 130 * scale, y: 30 * scale, r: 90 },
          { x: 30 * scale, y: H - 130 * scale, r: -90 },
          { x: W - 130 * scale, y: H - 130 * scale, r: 180 }
        ].map((p, i) => (
          <G key={i} transform={`translate(${p.x}, ${p.y}) rotate(${p.r}, 50, 50) scale(${1 * scale})`}>
            <ArabesqueMotif size={100} opacity={0.4} />
          </G>
        ))}

        {/* Fringe / Tassels edges (simulated) */}
        <View style={styles.fringeLeft} />
        <View style={styles.fringeRight} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  fringeLeft: {
    position: "absolute",
    left: 0,
    top: "10%",
    bottom: "10%",
    width: 2,
    backgroundColor: "#FDF5E6",
    opacity: 0.1,
  },
  fringeRight: {
    position: "absolute",
    right: 0,
    top: "10%",
    bottom: "10%",
    width: 2,
    backgroundColor: "#FDF5E6",
    opacity: 0.1,
  }
});



