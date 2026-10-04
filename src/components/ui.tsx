import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { ReactNode } from 'react';
import {
  Platform, Pressable, RefreshControl, ScrollView, StyleProp, StyleSheet, Text, TextProps, View, ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

/* ─── Экран с фоном-свечением как на сайте ─── */
export function Screen({
  children, refreshing, onRefresh, padTop = true,
}: { children: ReactNode; refreshing?: boolean; onRefresh?: () => void; padTop?: boolean }) {
  const { c } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: c.bgPrimary }}>
      <LinearGradient colors={c.glow} style={StyleSheet.absoluteFill} start={{ x: 0.9, y: 0 }} end={{ x: 0.2, y: 0.6 }} />
      <ScrollView
        contentContainerStyle={{
          paddingTop: padTop ? insets.top + space.md : space.md,
          paddingHorizontal: space.lg,
          paddingBottom: insets.bottom + 110,
          alignItems: 'center',
        }}
        refreshControl={onRefresh ? <RefreshControl refreshing={!!refreshing} onRefresh={onRefresh} tintColor={c.accent} /> : undefined}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ width: '100%', maxWidth: 860, gap: space.lg }}>
          {children}
        </View>
      </ScrollView>
    </View>
  );
}

/* ─── Типографика ─── */
type Variant = 'h1' | 'h2' | 'h3' | 'body' | 'muted' | 'label' | 'mono';
export function T({ v = 'body', style, ...p }: TextProps & { v?: Variant }) {
  const { c } = useTheme();
  const s: Record<Variant, object> = {
    h1: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32, color: c.textPrimary },
    h2: { fontFamily: fonts.display, fontSize: 19, lineHeight: 25, color: c.textPrimary },
    h3: { fontFamily: fonts.bodyHeavy, fontSize: 16, lineHeight: 22, color: c.textPrimary },
    body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 22, color: c.textSecondary },
    muted: { fontFamily: fonts.bodySemi, fontSize: 12.5, lineHeight: 17, color: c.textMuted },
    label: { fontFamily: fonts.bodyBold, fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: c.textMuted },
    mono: { fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.accent, fontVariant: ['tabular-nums'] },
  };
  return <Text {...p} style={[s[v], style]} />;
}

/* ─── Карточка ─── */
export function Card({
  children, style, onPress, accent,
}: { children: ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; accent?: boolean }) {
  const { c, theme } = useTheme();
  const base: ViewStyle = {
    backgroundColor: c.bgCard,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: accent ? c.borderAccent : c.border,
    padding: space.lg,
    ...shadow(theme === 'dark' ? 0.45 : 0.12, c.shadow),
  };
  if (!onPress) return <View style={[base, style]}>{children}</View>;
  return (
    <Pressable
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [base, style, pressed && { transform: [{ scale: 0.98 }], opacity: 0.92 }]}
    >
      {children}
    </Pressable>
  );
}

/* ─── Градиентная кнопка (sunset / lagoon / telegram) ─── */
export function GradientButton({
  title, onPress, icon, kind = 'sunset', style, disabled,
}: { title: string; onPress: () => void; icon?: ReactNode; kind?: 'sunset' | 'lagoon' | 'tg'; style?: StyleProp<ViewStyle>; disabled?: boolean }) {
  const { c } = useTheme();
  const colors = kind === 'sunset' ? c.sunset : kind === 'lagoon' ? c.lagoon : (['#2aabee', '#1d8fd1'] as const);
  return (
    <Pressable
      disabled={disabled}
      onPress={() => { tap(); onPress(); }}
      style={({ pressed }) => [{ borderRadius: radius.pill, opacity: disabled ? 0.5 : 1 }, pressed && { transform: [{ scale: 0.97 }] }, style]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
        style={{ borderRadius: radius.pill, paddingVertical: 14, paddingHorizontal: 22, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        {icon}
        <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: '#fff' }}>{title}</Text>
      </LinearGradient>
    </Pressable>
  );
}

/* ─── Чип-переключатель ─── */
export function Chip({ label, active, onPress }: { label: string; active?: boolean; onPress: () => void }) {
  const { c } = useTheme();
  return (
    <Pressable
      onPress={() => { tap(); onPress(); }}
      style={{
        paddingVertical: 8, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1,
        borderColor: active ? c.accent : c.border,
        backgroundColor: active ? c.accentGlow : c.bgSecondary,
      }}
    >
      <Text style={{ fontFamily: active ? fonts.bodyHeavy : fonts.bodySemi, fontSize: 13, color: active ? c.accent : c.textSecondary }}>
        {label}
      </Text>
    </Pressable>
  );
}

/* ─── Заголовок секции ─── */
export function SectionTitle({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  const { c } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: space.sm }}>
      <T v="h2">{title}</T>
      {action && (
        <Pressable onPress={onAction} hitSlop={10}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.coral, fontSize: 13 }}>{action} →</Text>
        </Pressable>
      )}
    </View>
  );
}

/* ─── Утилиты ─── */
export function shadow(opacity: number, color: string): ViewStyle {
  return Platform.select<ViewStyle>({
    ios: { shadowColor: color, shadowOpacity: opacity, shadowRadius: 18, shadowOffset: { width: 0, height: 10 } },
    android: { elevation: opacity > 0.3 ? 6 : 3, shadowColor: color },
    default: {},
  })!;
}

export function tap() {
  if (Platform.OS !== 'web') Haptics.selectionAsync().catch(() => {});
}

/* ─── Метрика / Статистика ─── */
export function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, minWidth: 64, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 2 }}>
      <T v="muted" style={{ fontSize: 11 }}>{label}</T>
      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: color ?? c.textPrimary }}>{value}</Text>
    </View>
  );
}

