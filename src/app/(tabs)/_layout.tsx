import { BlurView } from 'expo-blur';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import { BookOpen, Grid2x2, Palmtree, UserRound } from 'lucide-react-native';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { tap } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts } from '@/theme/tokens';

// React Navigation теперь встроен в expo-router, поэтому тип берём из пропсов Tabs
type BottomTabBarProps = Parameters<NonNullable<ComponentProps<typeof Tabs>['tabBar']>>[0];

const TAB_CONFIG: Record<string, { label: string; Icon: typeof Palmtree }> = {
  index: { label: 'Главная', Icon: Palmtree },
  tools: { label: 'Инструменты', Icon: Grid2x2 },
  articles: { label: 'Статьи', Icon: BookOpen },
  me: { label: 'Мой Вьетнам', Icon: UserRound },
};

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { c, theme } = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        position: 'absolute',
        left: 14,
        right: 14,
        bottom: Math.max(insets.bottom, 10),
        height: 64,
        borderRadius: 24,
        backgroundColor: theme === 'dark' ? 'rgba(24, 15, 42, 0.94)' : 'rgba(255, 255, 255, 0.96)',
        borderWidth: 1.5,
        borderColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.10)' : 'rgba(0, 0, 0, 0.08)',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 6,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.35,
        shadowRadius: 16,
        elevation: 10,
        overflow: 'hidden',
      }}
    >
      {Platform.OS === 'ios' && (
        <BlurView
          tint={theme === 'dark' ? 'dark' : 'light'}
          intensity={85}
          style={StyleSheet.absoluteFill}
        />
      )}

      {state.routes.map((route, index) => {
        const isFocused = state.index === index;
        const conf = TAB_CONFIG[route.name] || { label: route.name, Icon: Palmtree };
        const Icon = conf.Icon;

        const onPress = () => {
          tap();
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: 'tabLongPress',
            target: route.key,
          });
        };

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            onLongPress={onLongPress}
            style={{
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 6,
            }}
          >
            {/* Иконка с аккуратной капсулой-подсветкой */}
            <View
              style={{
                alignItems: 'center',
                justifyContent: 'center',
                paddingVertical: 4,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: isFocused ? c.accentGlow : 'transparent',
                marginBottom: 2,
              }}
            >
              <Icon
                size={21}
                color={isFocused ? c.accent : c.textMuted}
                strokeWidth={isFocused ? 2.4 : 1.9}
              />
            </View>

            {/* Текстовая подпись */}
            <Text
              style={{
                fontFamily: isFocused ? fonts.bodyHeavy : fonts.bodyBold,
                fontSize: 10.5,
                color: isFocused ? c.accent : c.textMuted,
              }}
            >
              {conf.label}
            </Text>

            {/* Микро-точка активности */}
            <View
              style={{
                width: 4,
                height: 4,
                borderRadius: 2,
                backgroundColor: c.accent,
                marginTop: 3,
                opacity: isFocused ? 1 : 0,
              }}
            />
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Главная' }} />
      <Tabs.Screen name="tools" options={{ title: 'Инструменты' }} />
      <Tabs.Screen name="articles" options={{ title: 'Статьи' }} />
      <Tabs.Screen name="me" options={{ title: 'Мой Вьетнам' }} />
    </Tabs>
  );
}
