import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, {
  Defs, LinearGradient, RadialGradient, Stop, Rect, Circle, Path, G
} from 'react-native-svg';

interface TropicalHeroSceneProps {
  cityId?: string | null;
  waterTemp?: number | null;
  style?: any;
}

const CITY_COORDS: Record<string, string> = {
  danang: 'Đà Nẵng · 16°N',
  nhatrang: 'Nha Trang · 12°N',
  hcm: 'Sài Gòn · 10°N',
  hanoi: 'Hà Nội · 21°N',
  phuquoc: 'Phú Quốc · 10°N',
};

export default function TropicalHeroScene({
  cityId = 'danang',
  waterTemp,
  style,
}: TropicalHeroSceneProps) {
  const cityTag = (cityId && CITY_COORDS[cityId]) || 'Đà Nẵng · 16°N';
  const seaTemp = waterTemp != null ? Math.round(waterTemp) : 30;

  return (
    <View style={[styles.container, style]}>
      {/* SVG Background, Sun, Waves, and Palms */}
      <Svg viewBox="0 0 400 360" style={StyleSheet.absoluteFill}>
        <Defs>
          {/* Sky Gradient */}
          <LinearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#1f0b3b" />
            <Stop offset="0.38" stopColor="#52164a" />
            <Stop offset="0.66" stopColor="#e0485c" />
            <Stop offset="1" stopColor="#ffa138" />
          </LinearGradient>

          {/* Sun Glow */}
          <RadialGradient id="sunGlow" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#ffa032" stopOpacity={0.7} />
            <Stop offset="0.65" stopColor="#ff6b4a" stopOpacity={0.25} />
            <Stop offset="1" stopColor="#1f0b3b" stopOpacity={0} />
          </RadialGradient>

          {/* Sun Gradient */}
          <LinearGradient id="sunGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#ffe066" />
            <Stop offset="1" stopColor="#ff5252" />
          </LinearGradient>
        </Defs>

        {/* Sky Fill */}
        <Rect x="0" y="0" width="400" height="360" fill="url(#skyGrad)" />

        {/* Twinkling Stars */}
        <Circle cx="40" cy="40" r="1.6" fill="#fff" opacity={0.8} />
        <Circle cx="90" cy="70" r="1.2" fill="#fff" opacity={0.6} />
        <Circle cx="150" cy="30" r="1.8" fill="#fff" opacity={0.85} />
        <Circle cx="300" cy="50" r="1.3" fill="#fff" opacity={0.7} />
        <Circle cx="350" cy="90" r="1.6" fill="#fff" opacity={0.75} />
        <Circle cx="260" cy="20" r="1.2" fill="#fff" opacity={0.65} />
        <Circle cx="200" cy="80" r="1.8" fill="#fff" opacity={0.9} />
        <Circle cx="60" cy="120" r="1.3" fill="#fff" opacity={0.6} />
        <Circle cx="340" cy="140" r="1.5" fill="#fff" opacity={0.7} />

        {/* Sun Outer Glow */}
        <Circle cx="230" cy="175" r="145" fill="url(#sunGlow)" />

        {/* Floating Glowing Retro Sun */}
        <Circle cx="230" cy="175" r="95" fill="url(#sunGrad)" />

        {/* Drifting Waves (Back) */}
        <Path
          d="M0 260 Q100 235 200 260 T400 260 T600 260 T800 260 V360 H0z"
          fill="#1fd1c1"
          opacity={0.6}
        />

        {/* Drifting Waves (Middle) */}
        <Path
          d="M0 275 Q100 250 200 275 T400 275 T600 275 T800 275 V360 H0z"
          fill="#0fa89a"
        />

        {/* Drifting Waves (Front) */}
        <Path
          d="M0 295 Q100 270 200 295 T400 295 T600 295 T800 295 V360 H0z"
          fill="#082f3a"
        />

        {/* Swaying Tropical Palm Tree Silhouette */}
        <G fill="#130826">
          {/* Trunk */}
          <Path d="M96 360c-6-80 0-160 26-220l9 3c-23 64-30 142-23 217z" />
          {/* Left Fronds */}
          <Path d="M125 140c-30-40-80-50-130-32 44-2 80 10 103 35-41-11-80-2-112 25 43-14 87-11 121-2z" />
          {/* Right Fronds */}
          <Path d="M125 140c16-46 62-71 112-64-43 9-73 27-91 57 34-23 73-25 112-9-46-2-85 9-119 27z" />
          {/* Top-Right Sprout */}
          <Path d="M125 140c-5-43 11-82 48-110-21 34-30 66-26 103z" />
          {/* Top-Left Sprout */}
          <Path d="M125 140c-25-30-34-66-23-110 7 39 16 71 37 103z" />
        </G>
      </Svg>

      {/* Top-right Floating Badge: Sea Temp */}
      <View style={styles.topBadge}>
        <Text style={styles.topBadgeText}>🌊 Тёплое море {seaTemp}°C</Text>
      </View>

      {/* Bottom-left Floating Badge: City Tag */}
      <View style={styles.bottomBadge}>
        <Text style={styles.bottomBadgeText}>📍 {cityTag}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    aspectRatio: 1.15,
    borderRadius: 28,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    backgroundColor: '#1f0b3b',
    ...(Platform.OS === 'web'
      ? {
          boxShadow: '0 24px 60px -15px rgba(255,107,74,0.35)',
        }
      : {
          shadowColor: '#ff6b4a',
          shadowOffset: { width: 0, height: 16 },
          shadowOpacity: 0.35,
          shadowRadius: 28,
          elevation: 10,
        }),
  },
  topBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(31, 209, 193, 0.22)',
    borderWidth: 1,
    borderColor: 'rgba(31, 209, 193, 0.55)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 20px rgba(31,209,193,0.3)',
        }
      : {}),
  },
  topBadgeText: {
    color: '#1fd1c1',
    fontSize: 11.5,
    fontWeight: '800',
  },
  bottomBadge: {
    position: 'absolute',
    bottom: 14,
    left: 14,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(12, 7, 20, 0.82)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    ...(Platform.OS === 'web'
      ? {
          backdropFilter: 'blur(12px)',
          boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
        }
      : {}),
  },
  bottomBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    textTransform: 'uppercase',
  },
});
