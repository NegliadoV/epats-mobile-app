import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import { BookOpen, Grid2x2, Palmtree, UserRound } from 'lucide-react-native';
import { Platform, StyleSheet, View } from 'react-native';

import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

export default function TabsLayout() {
  const { c, theme } = useTheme();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.coral,
        tabBarInactiveTintColor: c.textMuted,
        tabBarLabelStyle: { fontFamily: fonts.bodyBold, fontSize: 11 },
        tabBarStyle: {
          position: 'absolute',
          borderTopColor: c.border,
          backgroundColor: Platform.OS === 'ios' ? 'transparent' : c.bgPrimary,
          elevation: 0,
        },
        tabBarBackground: () =>
          Platform.OS === 'ios' ? (
            <BlurView tint={theme === 'dark' ? 'dark' : 'light'} intensity={60} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: c.bgPrimary }]} />
          ),
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная', tabBarIcon: ({ color, size }) => <Palmtree color={color} size={size} /> }} />
      <Tabs.Screen name="tools" options={{ title: 'Инструменты', tabBarIcon: ({ color, size }) => <Grid2x2 color={color} size={size} /> }} />
      <Tabs.Screen name="articles" options={{ title: 'Статьи', tabBarIcon: ({ color, size }) => <BookOpen color={color} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: 'Мой Вьетнам', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
    </Tabs>
  );
}
