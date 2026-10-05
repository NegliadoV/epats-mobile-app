import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Unbounded_600SemiBold, Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider, useAuth } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync().catch(() => {});

function RootStack() {
  const { c, theme } = useTheme();
  const { user, settings, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    // Если пользователь уже авторизован — онбординг не показываем!
    if (user) {
      AsyncStorage.setItem('epats_onboarding_completed_v1', 'true').catch(() => {});
      return;
    }
    AsyncStorage.getItem('epats_onboarding_completed_v1').then(completed => {
      if (!completed && !user) {
        router.replace('/onboarding');
      }
    }).catch(() => {});
  }, [user, loading]);
    return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bgPrimary },
          headerTintColor: c.textPrimary,
          headerTitleStyle: { fontFamily: fonts.bodyHeavy },
          headerShadowVisible: false,
          headerBackTitleVisible: false,
          contentStyle: { backgroundColor: c.bgPrimary },
        }}
      >
        <Stack.Screen name="onboarding" options={{ headerShown: false, presentation: "fullScreenModal" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="article/[slug]" options={{ title: '' }} />
        <Stack.Screen name="tools/converter" options={{ title: 'Конвертер VND' }} />
        <Stack.Screen name="tools/calculator" options={{ title: 'Калькулятор бюджета' }} />
        <Stack.Screen name="tools/electricity" options={{ title: 'Счёт за свет' }} />
        <Stack.Screen name="tools/checklist" options={{ title: 'Чеклист переезда' }} />
        <Stack.Screen name="tools/cities" options={{ title: 'Сравнение городов' }} />
        <Stack.Screen name="tools/telegram" options={{ title: 'Чаты экспатов' }} />
        <Stack.Screen name="tools/visa" options={{ title: 'Визаран и калькулятор' }} />
        <Stack.Screen name="tools/weather" options={{ title: 'Погода & Радар' }} />
        <Stack.Screen name="tools/neighborhoods" options={{ title: 'Карта жилья' }} />
      </Stack>
    </>
  );
}



export default function RootLayout() {
  const [loaded] = useFonts({
    Unbounded_600SemiBold, Unbounded_800ExtraBold,
    Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold,
  });

  useEffect(() => {
    if (loaded) SplashScreen.hideAsync().catch(() => {});
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      const styleId = 'expo-web-scroll-fix';
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.innerHTML = `
          html, body, #root {
            height: 100% !important;
            overflow-x: hidden !important;
          }
          /* Custom sleek scrollbar */
          ::-webkit-scrollbar {
            width: 5px;
            height: 5px;
          }
          ::-webkit-scrollbar-track {
            background: transparent;
          }
          ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 999px;
          }
          ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.3);
          }
          .no-scrollbar::-webkit-scrollbar {
            display: none !important;
          }
          .no-scrollbar {
            -ms-overflow-style: none !important;
            scrollbar-width: none !important;
          }

          /* ─── Epats Rich Animation Engine ─── */
          @keyframes sunFloat {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-10px); }
          }
          @keyframes waveDrift {
            from { transform: translateX(0); }
            to { transform: translateX(-50%); }
          }
          @keyframes palmSway {
            0%, 100% { transform: rotate(-2deg); }
            50% { transform: rotate(2deg); }
          }
          @keyframes neonBlink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          @keyframes pulseGlow {
            0%, 100% { box-shadow: 0 0 15px rgba(31, 209, 193, 0.2); }
            50% { box-shadow: 0 0 32px rgba(31, 209, 193, 0.55); }
          }
          @keyframes floatSlow {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-6px) rotate(1deg); }
          }
          @keyframes floatSlowRev {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-7px) rotate(-1.5deg); }
          }
          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          @keyframes radarSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes gradientShift {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(16px); }
            to { opacity: 1; transform: translateY(0); }
          }

          /* Classes */
          .animate-sun-float { animation: sunFloat 7s ease-in-out infinite; }
          .animate-wave { animation: waveDrift 16s linear infinite; will-change: transform; }
          .animate-wave-slow { animation: waveDrift 24s linear infinite reverse; will-change: transform; }
          .animate-palm-sway { transform-origin: 50% 100%; animation: palmSway 5s ease-in-out infinite; will-change: transform; }
          .animate-neon-blink { animation: neonBlink 2.2s ease-in-out infinite; }
          .animate-float-slow { animation: floatSlow 5s ease-in-out infinite; }
          .animate-float-slow-rev { animation: floatSlowRev 6s ease-in-out infinite; }
          .animate-pulse-glow { animation: pulseGlow 3s ease-in-out infinite; }
          .animate-fade-in-up { animation: fadeInUp 0.45s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .animate-radar-spin { animation: radarSpin 4s linear infinite; transform-origin: center center; }

          /* Interactive Cards */
          .epats-card {
            transition: transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s ease, border-color 0.25s ease, background-color 0.25s ease;
          }
          .epats-card:hover {
            transform: translateY(-4px);
            border-color: rgba(31, 209, 193, 0.35) !important;
            box-shadow: 0 16px 36px -10px rgba(0, 0, 0, 0.6), 0 0 24px rgba(31, 209, 193, 0.16) !important;
          }
          .epats-card:active {
            transform: translateY(-1px) scale(0.99);
          }

          /* Interactive Buttons */
          .epats-btn {
            transition: transform 0.2s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.2s ease, filter 0.2s ease;
          }
          .epats-btn:hover {
            transform: translateY(-2px);
            filter: brightness(1.12);
          }
          .epats-btn:active {
            transform: translateY(0px) scale(0.97);
          }

          /* Icon spring on card hover */
          .icon-spring {
            display: inline-block;
            transition: transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
          }
          .epats-card:hover .icon-spring {
            transform: scale(1.18) rotate(-7deg);
          }

          /* Shimmer */
          .shimmer-bg {
            background-size: 200% 200%;
            animation: gradientShift 6s ease infinite;
          }
        `;
        document.head.appendChild(style);
      }
    }
  }, [loaded]);

  if (!loaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <AuthProvider>
            <RootStack />
          </AuthProvider>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
