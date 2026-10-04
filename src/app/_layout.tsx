import { Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold, Manrope_800ExtraBold } from '@expo-google-fonts/manrope';
import { Unbounded_600SemiBold, Unbounded_800ExtraBold } from '@expo-google-fonts/unbounded';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from '@/lib/auth';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

SplashScreen.preventAutoHideAsync();

function RootStack() {
  const { c, theme } = useTheme();
  return (
    <>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: c.bgPrimary },
          headerTintColor: c.textPrimary,
          headerTitleStyle: { fontFamily: fonts.bodyHeavy },
          headerShadowVisible: false,
          headerBackButtonDisplayMode: 'minimal',
          contentStyle: { backgroundColor: c.bgPrimary },
        }}
      >
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
    if (loaded) SplashScreen.hideAsync();
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
