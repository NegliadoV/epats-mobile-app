import React from 'react';
import Svg, { Defs, LinearGradient, Stop, ClipPath, Rect, Circle, Path, G } from 'react-native-svg';

export default function BrandLogo({ size = 34 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 40 40">
      <Defs>
        <LinearGradient id="bl-bg" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#2a1650" />
          <Stop offset="1" stopColor="#120b1e" />
        </LinearGradient>
        <LinearGradient id="bl-sun" x1="20" y1="8" x2="20" y2="26" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor="#ffd27a" />
          <Stop offset="0.5" stopColor="#ff6b4a" />
          <Stop offset="1" stopColor="#ff9a3c" />
        </LinearGradient>
        <ClipPath id="bl-clip">
          <Rect x="1" y="1" width="38" height="38" rx="12" />
        </ClipPath>
      </Defs>
      <G clipPath="url(#bl-clip)">
        <Rect x="1" y="1" width="38" height="38" rx="12" fill="url(#bl-bg)" />
        <Circle cx="20" cy="22" r="10" fill="url(#bl-sun)" />
        <Rect x="8" y="19.5" width="24" height="1.6" fill="#1d1038" />
        <Rect x="8" y="23" width="24" height="2" fill="#1d1038" />
        <Path d="M1 28c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 7-2v13H1z" fill="#1fd1c1" />
        <Path d="M1 32c4 0 4-2 8-2s4 2 8 2 4-2 8-2 4 2 8 2 4-2 7-2v9H1z" fill="#0fa89a" />
      </G>
      <Rect x="1" y="1" width="38" height="38" rx="12" fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
    </Svg>
  );
}
