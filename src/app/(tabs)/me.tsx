import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { Heart, LogOut, Send, Star } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

import { Card, GradientButton, Screen, T } from '@/components/ui';
import { WEB_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getArticleBySlug } from '@shared/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, space } from '@/theme/tokens';

export default function MeScreen() {
  const { c } = useTheme();
  const { loading, user, me, loginState, login, cancelLogin, logout } = useAuth();

  if (loading) {
    return <Screen><ActivityIndicator color={c.accent} style={{ marginTop: 80 }} /></Screen>;
  }

  if (!user) {
    return (
      <Screen>
        <View style={{ gap: 6 }}>
          <T v="h1">Мой Вьетнам</T>
          <T v="body">Войдите через Telegram — избранное, город и срок визы синхронизируются с сайтом epats.io</T>
        </View>
        <Card accent style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xxl }}>
          <Text style={{ fontSize: 54 }}>🌴</Text>
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
              <T v="muted" style={{ textAlign: 'center' }}>Без паролей и SMS. Мы не видим ваш номер телефона.</T>
            </>
          )}
        </Card>
        <SupportCard />
      </Screen>
    );
  }

  const favArticles = (me?.favorites ?? [])
    .filter(f => f.kind === 'article')
    .map(f => getArticleBySlug(f.ref))
    .filter(a => !!a);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
        <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: c.accentGlow, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.accent }}>{user.first_name.slice(0, 1)}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <T v="h2">{user.first_name} {user.last_name ?? ''}</T>
          {user.username && <T v="muted">@{user.username}</T>}
        </View>
      </View>

      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Star size={18} color={c.gold} />
          <T v="h3">Избранное</T>
        </View>
        {favArticles.length === 0 ? (
          <T v="muted">Пока пусто — сохраняйте статьи на сайте или в приложении</T>
        ) : favArticles.map(a => (
          <Pressable key={a!.slug} onPress={() => router.push(`/article/${a!.slug}`)} style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
            <Text style={{ fontSize: 22 }}>{a!.emoji}</Text>
            <Text numberOfLines={1} style={{ flex: 1, fontFamily: fonts.bodyBold, color: c.textPrimary }}>{a!.title}</Text>
          </Pressable>
        ))}
      </Card>

      <Card onPress={() => WebBrowser.openBrowserAsync(`${WEB_BASE}/me`)} style={{ gap: 4 }}>
        <T v="h3">⚙️ Город, виза и напоминания</T>
        <T v="muted">Пока настраиваются на сайте — нативный экран в следующем обновлении</T>
      </Card>

      <SupportCard />

      <Pressable onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, alignSelf: 'center', padding: space.md }}>
        <LogOut size={16} color={c.textMuted} />
        <Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted }}>Выйти</Text>
      </Pressable>
    </Screen>
  );
}

function SupportCard() {
  const { c } = useTheme();
  // Донаты открываем во внешнем браузере — требование App Store к внешним платежам
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
