import React, { useId } from 'react';
import Svg, { Path, Rect, Circle, Defs, LinearGradient, Stop, G, Ellipse } from 'react-native-svg';
import type { TropicIconName } from '@/lib/tropicIconMap';

export type TropicPalette = 'sunset' | 'mango' | 'lagoon' | 'orchid' | 'jungle' | 'berry' | 'sky';

const PALETTES: Record<TropicPalette, [string, string, string]> = {
  sunset: ['#ffb547', '#ff6b4a', '#ff9a3c'],
  mango:  ['#ffe08a', '#ffb547', '#ff7a3d'],
  lagoon: ['#7af5e8', '#1fd1c1', '#2b7fff'],
  orchid: ['#e3a8ff', '#b46bff', '#6d3dff'],
  jungle: ['#c4f57a', '#4ade80', '#0fa89a'],
  berry:  ['#d9b8ff', '#b46bff', '#6d3be0'],
  sky:    ['#b5ecff', '#5ab8ff', '#4f5bff'],
};

const DEFAULT_PALETTE: Record<TropicIconName, TropicPalette> = {
  calculator: 'mango',
  visa: 'sunset',
  passport: 'berry',
  house: 'jungle',
  pin: 'jungle',
  weather: 'sky',
  converter: 'lagoon',
  checklist: 'orchid',
  cities: 'berry',
  chat: 'sky',
  book: 'sunset',
  flights: 'sky',
  banking: 'lagoon',
  sim: 'orchid',
  scooter: 'berry',
  health: 'lagoon',
  money: 'mango',
  food: 'sunset',
  life: 'sky',
  fire: 'sunset',
  tools: 'orchid',
  electricity: 'mango',
  palm: 'jungle',
  sparkle: 'mango',
  coffee: 'mango',
  compass: 'lagoon',
  heart: 'berry',
  handshake: 'lagoon',
};

const W = { stroke: '#fff', strokeWidth: 2.6, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
const F = { fill: '#fff' };

function Glyph({ name }: { name: TropicIconName }) {
  switch (name) {
    case 'calculator':
      return (
        <G>
          <Rect x="15.5" y="11.5" width="17" height="25" rx="3.5" {...W} />
          <Rect x="19" y="15" width="10" height="5" rx="1.2" {...F} />
          <Circle cx="20" cy="24.5" r="1.6" {...F} />
          <Circle cx="24" cy="24.5" r="1.6" {...F} />
          <Circle cx="28" cy="24.5" r="1.6" {...F} />
          <Circle cx="20" cy="29.5" r="1.6" {...F} />
          <Circle cx="24" cy="29.5" r="1.6" {...F} />
          <Circle cx="28" cy="29.5" r="1.6" {...F} />
        </G>
      );
    case 'electricity':
      return (
        <G>
          <Path d="M26 9.5 15 23.5h7.5l-2.5 15 13-16h-7.5l4-13z" {...F} />
        </G>
      );
    case 'visa':
      return (
        <G>
          <Rect x="12.5" y="13" width="23" height="18" rx="4.5" {...W} />
          <Path d="M12.5 21.5h23" {...W} />
          <Path d="M24 13v8.5" {...W} />
          <Circle cx="18" cy="33" r="2.8" {...F} />
          <Circle cx="30" cy="33" r="2.8" {...F} />
          <Path d="M16 26.5h2M30 26.5h2" {...W} />
        </G>
      );
    case 'passport':
      return (
        <G>
          <Rect x="15" y="11" width="18" height="26" rx="3.5" {...W} />
          <Circle cx="24" cy="21.5" r="4.8" stroke="#fff" strokeWidth={2.2} fill="none" />
          <Path d="M19.2 21.5h9.6M24 16.7c-2.2 2.8-2.2 6.8 0 9.6 2.2-2.8 2.2-6.8 0-9.6" stroke="#fff" strokeWidth={1.6} fill="none" />
          <Path d="M19.5 31.5h9" {...W} />
        </G>
      );
    case 'house':
      return (
        <G>
          <Path d="M12 24.5 24 14l12 10.5" {...W} />
          <Path d="M15.5 22v13h17V22" {...W} />
          <Rect x="21.2" y="27" width="5.6" height="8" rx="1.2" {...F} />
        </G>
      );
    case 'pin':
      return (
        <G>
          <Path d="M24 36c-6.5-7-9.5-11.2-9.5-15.2a9.5 9.5 0 0 1 19 0c0 4-3 8.2-9.5 15.2z" {...W} />
          <Circle cx="24" cy="20.8" r="3.3" {...F} />
        </G>
      );
    case 'weather':
      return (
        <G>
          <Circle cx="19" cy="18.5" r="5" fill="#fff" opacity={0.75} />
          <Path d="M19 10.5v1.5M11 18.5h1.5M13.3 12.8l1.1 1.1M24.7 12.8l-1.1 1.1" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Path d="M18.5 35h13.5a5.3 5.3 0 0 0 .6-10.6 7.4 7.4 0 0 0-14-1.3A6 6 0 0 0 18.5 35z" {...F} />
        </G>
      );
    case 'converter':
      return (
        <G>
          <Path d="M13.5 19h20l-4.5-4.5" {...W} />
          <Path d="M34.5 29h-20l4.5 4.5" {...W} />
        </G>
      );
    case 'checklist':
      return (
        <G>
          <Rect x="14.5" y="11.5" width="19" height="25" rx="3.5" {...W} />
          <Path d="m18.8 19.5 2.4 2.4 4.6-4.6" {...W} />
          <Path d="M19 27.5h10M19 32h6.5" {...W} />
        </G>
      );
    case 'cities':
      return (
        <G>
          <Rect x="12.5" y="21" width="8" height="15" rx="1.5" {...W} />
          <Rect x="20.5" y="12.5" width="8" height="23.5" rx="1.5" {...W} />
          <Rect x="28.5" y="24" width="7" height="12" rx="1.5" {...W} />
          <Path d="M23.5 18h2M23.5 22.5h2M23.5 27h2M15.5 26h2" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'chat':
      return (
        <G>
          <Path d="M13 16.5a3.5 3.5 0 0 1 3.5-3.5h15a3.5 3.5 0 0 1 3.5 3.5v10a3.5 3.5 0 0 1-3.5 3.5H23l-6 5v-5h-.5A3.5 3.5 0 0 1 13 26.5z" {...W} />
          <Circle cx="19.5" cy="21.5" r="1.7" {...F} />
          <Circle cx="24" cy="21.5" r="1.7" {...F} />
          <Circle cx="28.5" cy="21.5" r="1.7" {...F} />
        </G>
      );
    case 'book':
      return (
        <G>
          <Path d="M24 16.5c-3.5-2.8-8-3.2-11-2.2v19c3-1 7.5-.6 11 2.2 3.5-2.8 8-3.2 11-2.2v-19c-3-1-7.5-.6-11 2.2z" {...W} />
          <Path d="M24 16.5v19" {...W} />
        </G>
      );
    case 'flights':
      return (
        <Path d="M24 10.5c1.4 0 2.2 1.6 2.2 3.2v6.8l9.3 5.3v3.2l-9.3-2.7v5.5l3 2.6V37L24 35.4 18.8 37v-2.6l3-2.6v-5.5l-9.3 2.7v-3.2l9.3-5.3v-6.8c0-1.6.8-3.2 2.2-3.2z" {...F} />
      );
    case 'banking':
      return (
        <G>
          <Rect x="11.5" y="15" width="25" height="18" rx="3.5" {...W} />
          <Path d="M11.5 21h25" stroke="#fff" strokeWidth={3.4} strokeLinecap="round" fill="none" />
          <Rect x="15.5" y="25.5" width="6" height="4" rx="1" {...F} />
        </G>
      );
    case 'sim':
      return (
        <G>
          <Rect x="16.5" y="10.5" width="15" height="27" rx="3.5" {...W} />
          <Path d="M22 33h4" {...W} />
          <Path d="M20.5 20.5a5 5 0 0 1 7 0M22.4 23a2.2 2.2 0 0 1 3.2 0" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'scooter':
      return (
        <G>
          <Circle cx="15.5" cy="31" r="3.8" {...W} />
          <Circle cx="32.5" cy="31" r="3.8" {...W} />
          <Path d="M15.5 31h10l4-10h3.5" {...W} />
          <Path d="M29.5 21 27 14.5h-3.5" {...W} />
          <Path d="M17 24.5h8" stroke="#fff" strokeWidth={3.2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'health':
      return (
        <Path d="M20.8 12.5h6.4v8.3h8.3v6.4h-8.3v8.3h-6.4v-8.3h-8.3v-6.4h8.3z" {...F} />
      );
    case 'money':
      return (
        <G>
          <Ellipse cx="24" cy="16.5" rx="9.5" ry="3.8" {...W} />
          <Path d="M14.5 16.5v6c0 2.1 4.3 3.8 9.5 3.8s9.5-1.7 9.5-3.8v-6" {...W} />
          <Path d="M14.5 22.5v6c0 2.1 4.3 3.8 9.5 3.8s9.5-1.7 9.5-3.8v-6" {...W} />
        </G>
      );
    case 'food':
      return (
        <G>
          <Path d="M13.5 14.5h21L24 26z" {...F} />
          <Path d="M24 26v9M19 35.5h10" {...W} />
          <Path d="m28.5 9.5-3 8" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
          <Circle cx="33.5" cy="14" r="3.2" fill="none" stroke="#fff" strokeWidth={2} />
        </G>
      );
    case 'coffee':
      return (
        <G>
          <Path d="M13.5 20h17v6.5a7 7 0 0 1-7 7h-3a7 7 0 0 1-7-7z" {...F} />
          <Path d="M30.5 22.5h1.5a3.2 3.2 0 0 1 0 6.4h-2" {...W} />
          <Path d="M19 11.5c-1.2 1.4 1.2 2.8 0 4.5M24 11.5c-1.2 1.4 1.2 2.8 0 4.5" stroke="#fff" strokeWidth={2} strokeLinecap="round" fill="none" />
        </G>
      );
    case 'life':
      return (
        <G>
          <Path d="M24 10.5 34.5 14.5v8.3c0 7-4.5 11.6-10.5 13.7-6-2.1-10.5-6.7-10.5-13.7v-8.3z" {...W} />
          <Path d="m19.3 23.3 3.2 3.2 6.2-6.2" {...W} />
        </G>
      );
    case 'fire':
      return (
        <Path d="M24.5 10.5c2 5.2 8.5 8 8.5 15.5a9 9 0 0 1-18 0c0-4.3 2.2-6.6 4.3-8.6 0 3.2 1.1 5.1 3.1 5.4-.3-4.3-.8-8.4 2.1-12.3z" {...F} />
      );
    case 'tools':
      return (
        <Path d="M31 12.5a6.5 6.5 0 0 0-7.6 8.7l-9.6 9.6a2.7 2.7 0 0 0 3.8 3.8l9.6-9.6a6.5 6.5 0 0 0 8.7-7.6l-3.8 3.8-3.4-.9-.9-3.4z" {...F} />
      );
    case 'palm':
      return (
        <G>
          <Path d="M25 36c-.3-6.5.3-12 2.3-17" {...W} />
          <Path d="M27.3 19c-3-4.2-8.4-5.5-13.3-3.6 4.4-.1 8 1.3 10.4 3.8-4-.9-7.8 0-11 2.8 4.3-1.4 8.7-1.2 12.2-.2z" {...F} />
          <Path d="M27.3 19c1.8-4.6 6.3-7.2 11.2-6.6-4.2.9-7.2 2.9-8.9 5.9 3.4-2.2 7.2-2.5 11-.8-4.4-.3-8.4.8-11.6 2.8z" {...F} />
          <Path d="M14 36h20" {...W} />
        </G>
      );
    case 'sparkle':
      return (
        <G>
          <Path d="M22 11c1 6 3 8 9 9-6 1-8 3-9 9-1-6-3-8-9-9 6-1 8-3 9-9z" {...F} />
          <Path d="M32 27c.5 2.8 1.4 3.7 4.2 4.2-2.8.5-3.7 1.4-4.2 4.2-.5-2.8-1.4-3.7-4.2-4.2 2.8-.5 3.7-1.4 4.2-4.2z" {...F} />
        </G>
      );
    case 'compass':
      return (
        <G>
          <Circle cx="24" cy="24" r="11" {...W} />
          <Path d="m28.5 19.5-2.8 6.2-6.2 2.8 2.8-6.2z" {...F} />
        </G>
      );
    case 'heart':
      return (
        <Path d="M24 35.5s-11.5-6.8-11.5-14.6a6.2 6.2 0 0 1 11.5-3.3 6.2 6.2 0 0 1 11.5 3.3c0 7.8-11.5 14.6-11.5 14.6z" {...F} />
      );
    case 'handshake':
      return (
        <G>
          <Path d="M10.5 20.5l5-5 5.5 2.5" {...W} />
          <Path d="M37.5 20.5l-5-5-8 3.5-4.5 4.5a2.2 2.2 0 0 0 3.1 3.1l3.4-3.1 7 7" {...W} />
          <Path d="M13 23l8.5 8.5a2 2 0 0 0 2.8 0l1.2-1.2M19 28.5l2.5 2.5M22 25.5l4 4" {...W} />
        </G>
      );
    default:
      return null;
  }
}

interface TropicIconProps {
  name: TropicIconName;
  size?: number;
  palette?: TropicPalette;
}

export default function TropicIcon({ name, size = 44, palette }: TropicIconProps) {
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');
  const [c1, c2, c3] = PALETTES[palette ?? DEFAULT_PALETTE[name] ?? 'sunset'];
  const gid = 'tg' + uid;
  const hid = 'th' + uid;

  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Defs>
        <LinearGradient id={gid} x1="6" y1="4" x2="42" y2="46" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={c1} />
          <Stop offset="0.5" stopColor={c2} />
          <Stop offset="1" stopColor={c3} />
        </LinearGradient>
        <LinearGradient id={hid} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#ffffff" stopOpacity={0.45} />
          <Stop offset="1" stopColor="#ffffff" stopOpacity={0.0} />
        </LinearGradient>
      </Defs>

      {/* Squircle Sticker Body */}
      <Path
        d="M24 2.5c15.6 0 21.5 5.9 21.5 21.5S39.6 45.5 24 45.5 2.5 39.6 2.5 24 8.4 2.5 24 2.5z"
        fill={'url(#' + gid + ')'}
      />
      {/* Soft Top Highlight */}
      <Path
        d="M24 2.5c15.6 0 21.5 5.9 21.5 21.5S39.6 45.5 24 45.5 2.5 39.6 2.5 24 8.4 2.5 24 2.5z"
        fill={'url(#' + hid + ')'}
      />
      {/* Fine Border Ring */}
      <Path
        d="M24 3.5c14.8 0 20.5 5.7 20.5 20.5"
        fill="none"
        stroke="#ffffff"
        strokeOpacity={0.35}
        strokeWidth={1}
        strokeLinecap="round"
      />

      {/* Vector Glyph */}
      <Glyph name={name} />

      {/* Sparkle Dot */}
      <Circle cx="37" cy="10.5" r="1.8" fill="#ffffff" opacity={0.8} />
    </Svg>
  );
}
