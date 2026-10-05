import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Heart, LogOut, Send, Star, Trash2 } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card, Chip, GradientButton, Screen, T, tap } from '@/components/ui';
import BrandLogo from '@/components/BrandLogo';
import { WEB_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getArticleBySlug } from '@shared/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const USER_CITY_KEY = 'epats_user_city_v1';
const CITIES = [
  { id: 'danang', name: '🏖️ Дананг' },
  { id: 'nhatrang', name: '🌊 Нячанг' },
  { id: 'hcm', name: '🌆 Хошимин' },
  { id: 'hanoi', name: '🏛️ Ханой' },
  { id: 'phuquoc', name: '🏝️ Фукуок' },
];

export default function MeScreen() {
  const { c } = useTheme();
  const { loading, user, favorites, toggleFavorite, loginState, login, cancelLogin, logout } = useAuth();
  const [selectedCity, setSelectedCity] = useState('danang');

  useEffect(() => {
    AsyncStorage.getItem(USER_CITY_KEY).then(val => {
      if (val) setSelectedCity(val);
    }).catch(() => {});
  }, []);

  const handleCityChange = (cityId: string) => {
    tap();
    setSelectedCity(cityId);
    AsyncStorage.setItem(USER_CITY_KEY, cityId).catch(() => {});
  };

  if (loading) {
    return <Screen><ActivityIndicator color={c.accent} style={{ marginTop: 80 }} /></Screen>;
  }

  const favArticles = favorites
    .map(slug => getArticleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BrandLogo size={28} />
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: c.textPrimary }}>
          epats<Text style={{ color: c.coral }}>.io</Text>
        </Text>
      </View>

      {/* Пользователь / Вход */}
      {user ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentGlow, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.accent }}>{user.first_name.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <T v="h2">{user.first_name} {user.last_name ?? ''}</T>
            {user.username && <T v="muted">@{user.username}</T>}
          </View>
        </View>
      ) : (
        <Card accent style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
          <Text style={{ fontSize: 44 }}>🌴</Text>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <T v="h2">Синхронизация профиля</T>
            <T v="muted" style={{ textAlign: 'center' }}>Войдите через Telegram, чтобы синхронизировать избранное и визу с сайтом epats.io</T>
          </View>
          {loginState === 'waiting' ? (
            <>
              <ActivityIndicator color={c.tg} />
              <T v="h3" style={{ textAlign: 'center' }}>Подтвердите вход в Telegram</T>
              <T v="muted" style={{ textAlign: 'center' }}>Нажмите «Start» у бота @epatsiobot и вернитесь в приложение</T>
              <Pressable onPress={cancelLogin}><Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted }}>Отмена</Text></Pressable>
            </>
          ) : (
            <>
              <GradientButton kind="tg" title="Войти через Telegram" icon={<Send size={18} color="#fff" />} onPress={login} style={{ alignSelf: 'stretch' }} />
              {loginState === 'error' && <T v="muted" style={{ color: c.danger }}>Не получилось — попробуйте ещё раз</T>}
              <T v="muted" style={{ textAlign: 'center', fontSize: 11.5 }}>Без паролей. Мы не видим ваш номер телефона.</T>
            </>
          )}
        </Card>
      )}

      {/* Мой город во Вьетнаме */}
      <Card style={{ gap: space.sm }}>
        <T v="h3">📍 Мой город во Вьетнаме</T>
        <T v="muted">Используется для быстрых подсказок по погоде и аренде</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {CITIES.map(ct => (
            <Chip
              key={ct.id}
              label={ct.name}
              active={selectedCity === ct.id}
              onPress={() => handleCityChange(ct.id)}
            />
          ))}
        </View>
      </Card>

      {/* Избранное (работает и офлайн, и с сервером) */}
      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Star size={18} color={c.gold} />
            <T v="h3">Избранные статьи ({favArticles.length})</T>
          </View>
        </View>
        {favArticles.length === 0 ? (
          <T v="muted">Пока пусто — нажмите на значок закладки в любой статье, чтобы сохранить её для чтения офлайн.</T>
        ) : (
          favArticles.map(a => (
            <View
              key={a.slug}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingVertical: 6,
                borderBottomWidth: 1,
                borderBottomColor: c.border,
              }}
            >
              <Pressable
                onPress={() => router.push(`/article/${a.slug}`)}
                style={{ flex: 1, flexDirection: 'row', gap: 10, alignItems: 'center' }}
              >
                <Text style={{ fontSize: 22 }}>{a.emoji}</Text>
                <View style={{ flex: 1 }}>
                  <Text numberOfLines={1} style={{ fontFamily: fonts.bodyBold, color: c.textPrimary, fontSize: 14 }}>
                    {a.title}
                  </Text>
                  <T v="muted" style={{ fontSize: 11 }}>{a.category} · {a.readTime} мин</T>
                </View>
              </Pressable>
              <Pressable
                onPress={() => { tap(); toggleFavorite(a.slug); }}
                hitSlop={10}
                style={{ padding: 6 }}
              >
                <Trash2 size={16} color={c.textMuted} />
              </Pressable>
            </View>
          ))
        )}
      </Card>

      <SupportCard />

      {user && (
        <Pressable onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: space.md }}>
          <LogOut size={16} color={c.textMuted} />
          <Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted }}>Выйти из аккаунта</Text>
        </Pressable>
      )}
    </Screen>
  );
}

function SupportCard() {
  const { c } = useTheme();
  return (
    <Card onPress={() => WebBrowser.openBrowserAsync(`${WEB_BASE}/support`)} style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
      <Heart size={22} color={c.coral} fill={c.coral} />
      <View style={{ flex: 1 }}>
        <T v="h3">Поддержать проект</T>
        <T v="muted">epats.io делают экспаты для экспатов</T>
      </View>
    </Card>
  );
}
