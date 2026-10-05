import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import {
  Bell, Check, CheckCircle2, ChevronRight, Clock, Heart, LogOut,
  Send, ShieldCheck, Star, Trash2, Calendar, AlertCircle
} from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Alert, Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, Chip, GradientButton, Screen, T, tap } from '@/components/ui';
import BrandLogo from '@/components/BrandLogo';
import { api, WEB_BASE } from '@/lib/api';
import { useAuth, CityId, VisaTypeId, CurrencyId, LifestyleId, FamilyId } from '@/lib/auth';
import { getArticleBySlug } from '@/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';
import { maskDateInput, toDisplayDate, toIsoDate, parseDateInput } from '@/lib/dateUtils';

const CITIES: { id: CityId; name: string }[] = [
  { id: 'danang', name: '🏖️ Дананг' },
  { id: 'nhatrang', name: '🌊 Нячанг' },
  { id: 'hcm', name: '🌆 Хошимин' },
  { id: 'hanoi', name: '🏛️ Ханой' },
  { id: 'phuquoc', name: '🏝️ Фукуок' },
];

const VISAS: { id: VisaTypeId; name: string; days: number }[] = [
  { id: '45', name: '45 дней (Безвиз)', days: 45 },
  { id: 'evisa90_single', name: 'E-Visa 90 дней (1-кратная)', days: 90 },
  { id: 'evisa90_multi', name: 'E-Visa 90 дней (Multi)', days: 90 },
  { id: 'phuquoc30', name: 'Фукуок 30 дней', days: 30 },
];

const CURRENCIES: { id: CurrencyId; label: string }[] = [
  { id: 'RUB', label: '₽ Рубли' },
  { id: 'USD', label: '$ USD' },
  { id: 'USDT', label: '₮ USDT' },
];

const LIFESTYLES: { id: LifestyleId; label: string }[] = [
  { id: 'budget', label: '🎒 Эконом' },
  { id: 'comfort', label: '🛋️ Комфорт' },
  { id: 'premium', label: '💎 Премиум' },
];

const FAMILIES: { id: FamilyId; label: string }[] = [
  { id: 'solo', label: '👤 Один' },
  { id: 'couple', label: '👫 Пара' },
  { id: 'family', label: '👨‍👩‍👧 Семья' },
  { id: 'big_family', label: '👨‍👩‍👧‍👦 Большая семья' },
];

export default function MeScreen() {
  const { c } = useTheme();
  const { loading, user, settings, saveSettings, favorites, toggleFavorite, loginState, botUrl, login, checkLogin, cancelLogin, logout } = useAuth();
  const [entryInput, setEntryInput] = useState(() => toDisplayDate(settings.entry_date) || '');

  useEffect(() => {
    setEntryInput(toDisplayDate(settings.entry_date) || '');
  }, [settings.entry_date]);
  const [savingMsg, setSavingMsg] = useState(false);

  // Расчет статуса визы
  const visaStatus = useMemo(() => {
    if (!settings.entry_date) return null;
    const entry = new Date(settings.entry_date);
    if (isNaN(entry.getTime())) return null;

    const opt = VISAS.find(v => v.id === settings.visa_type) || VISAS[1];
    const deadline = new Date(entry);
    deadline.setDate(deadline.getDate() + opt.days - 1);

    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      entry,
      deadline,
      daysLeft,
      visaName: opt.name,
      deadlineStr: deadline.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }),
    };
  }, [settings.entry_date, settings.visa_type]);

  const handleSaveEntryDate = () => {
    tap();
    const val = entryInput.trim();
    if (!val) {
      saveSettings({ entry_date: null });
      setSavingMsg(true);
      setTimeout(() => setSavingMsg(false), 2000);
      return;
    }
    const parsed = parseDateInput(val);
    if (parsed) {
      const iso = toIsoDate(parsed);
      saveSettings({ entry_date: iso });
      setSavingMsg(true);
      setTimeout(() => setSavingMsg(false), 2000);
    } else {
      Alert.alert('Неверный формат даты', 'Используйте формат ДД.ММ.ГГГГ (например: 01.03.2026)');
    }
  };

  const setTodayEntry = () => {
    tap();
    const now = new Date();
    const display = toDisplayDate(now);
    setEntryInput(display);
    saveSettings({ entry_date: toIsoDate(now) });
    setSavingMsg(true);
    setTimeout(() => setSavingMsg(false), 2000);
  };

  if (loading) {
    return <Screen><ActivityIndicator color={c.accent} style={{ marginTop: 80 }} /></Screen>;
  }

  const favArticles = favorites
    .map(slug => getArticleBySlug(slug))
    .filter((a): a is NonNullable<typeof a> => !!a);

  return (
    <Screen>
      {/* Шапка бренда */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BrandLogo size={28} />
          <Text style={{ fontFamily: fonts.display, fontSize: 18, color: c.textPrimary }}>
            epats<Text style={{ color: c.coral }}>.io</Text>
          </Text>
        </View>

        {/* Статус синхронизации с базой */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 5,
          paddingVertical: 4, paddingHorizontal: 9, borderRadius: radius.pill,
          backgroundColor: user ? 'rgba(31,209,193,0.12)' : 'rgba(255,255,255,0.06)',
          borderWidth: 1, borderColor: user ? c.accent : c.border,
        }}>
          <ShieldCheck size={13} color={user ? c.accent : c.textMuted} />
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: user ? c.accent : c.textMuted }}>
            {user ? 'БД синхронизирована' : 'Локальное хранилище'}
          </Text>
        </View>
      </View>

      {/* Пользователь / Авторизация */}
      {user ? (
        <Card accent style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}>
          <View style={{ width: 54, height: 54, borderRadius: 27, backgroundColor: c.accentGlow, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.accent }}>{user.first_name.slice(0, 1)}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <T v="h2">{user.first_name} {user.last_name ?? ''}</T>
            {user.username && <T v="muted">@{user.username}</T>}
            <Text style={{ fontFamily: fonts.bodySemi, color: c.accent, fontSize: 11 }}>
              Критерии сохранены в Supabase DB
            </Text>
          </View>
        </Card>
      ) : (
        <Card accent style={{ gap: space.md, alignItems: 'center', paddingVertical: space.lg }}>
          <Text style={{ fontSize: 40 }}>🌴</Text>
          <View style={{ gap: 4, alignItems: 'center' }}>
            <T v="h2">Синхронизация профиля</T>
            <T v="muted" style={{ textAlign: 'center', fontSize: 13 }}>
              Войдите через Telegram — город, виза, даты и избранное синхронизируются с сервером и базой данных epats.wiki.
            </T>
          </View>
          {loginState === 'waiting' ? (
            <View style={{ width: '100%', alignItems: 'center', gap: 12 }}>
              <ActivityIndicator size="large" color={c.tg} />
              <View style={{ alignItems: 'center', gap: 4 }}>
                <T v="h3" style={{ textAlign: 'center' }}>Ожидаем вход из Telegram...</T>
                <T v="muted" style={{ textAlign: 'center', fontSize: 13 }}>
                  Нажмите «Start» у бота @epatsiobot и подтвердите вход
                </T>
              </View>

              <View style={{ width: '100%', gap: 8, marginTop: 4 }}>
                <GradientButton
                  kind="tg"
                  title="Я нажал Start в боте (проверить)"
                  icon={<CheckCircle2 size={18} color="#fff" />}
                  onPress={checkLogin}
                />
                {botUrl && (
                  <Pressable
                    onPress={() => Linking.openURL(botUrl)}
                    style={{
                      paddingVertical: 10,
                      borderRadius: radius.pill,
                      backgroundColor: 'rgba(42,171,238,0.12)',
                      alignItems: 'center',
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bodyBold, color: c.tg, fontSize: 13 }}>
                      Открыть бота снова ↗
                    </Text>
                  </Pressable>
                )}
                <Pressable onPress={cancelLogin} style={{ paddingVertical: 6, alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted, fontSize: 13 }}>
                    Отмена
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              <GradientButton kind="tg" title="Войти через Telegram" icon={<Send size={18} color="#fff" />} onPress={login} style={{ alignSelf: 'stretch' }} />
              {loginState === 'error' && <T v="muted" style={{ color: c.danger }}>Не получилось — попробуйте ещё раз</T>}
              <T v="muted" style={{ textAlign: 'center', fontSize: 11 }}>Без паролей. Номер телефона остаётся скрытым.</T>
            </>
          )}
        </Card>
      )}

      {/* 1. ВИЗОВЫЙ СТАТУС И ТРЕКЕР */}
      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Clock size={18} color={c.coral} />
            <T v="h3">Моя виза и даты</T>
          </View>
          {visaStatus && (
            <View style={{
              paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.pill,
              backgroundColor: visaStatus.daysLeft > 14 ? 'rgba(31,209,193,0.15)' : visaStatus.daysLeft > 3 ? 'rgba(245,158,11,0.15)' : 'rgba(255,107,74,0.15)',
            }}>
              <Text style={{
                fontFamily: fonts.bodyHeavy, fontSize: 11,
                color: visaStatus.daysLeft > 14 ? c.accent : visaStatus.daysLeft > 3 ? c.gold : c.coral,
              }}>
                {visaStatus.daysLeft > 0 ? `Осталось ${visaStatus.daysLeft} дн.` : 'Виза истекла!'}
              </Text>
            </View>
          )}
        </View>

        {/* Выбор типа визы */}
        <View style={{ gap: 6 }}>
          <T v="label">Тип визы</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {VISAS.map(v => (
              <Chip
                key={v.id}
                label={v.name}
                active={settings.visa_type === v.id}
                onPress={() => { tap(); saveSettings({ visa_type: v.id }); }}
              />
            ))}
          </ScrollView>
        </View>

        {/* Дата въезда */}
        <View style={{ gap: 6 }}>
          <T v="label">Дата въезда во Вьетнам (ДД.ММ.ГГГГ)</T>
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
            <TextInput
              value={entryInput}
              onChangeText={v => setEntryInput(maskDateInput(v))}
              placeholder="01.03.2026"
              keyboardType="numeric"
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, backgroundColor: c.bgSecondary, borderRadius: radius.md,
                borderWidth: 1, borderColor: c.border, padding: 10,
                color: c.textPrimary, fontFamily: fonts.bodyHeavy, fontSize: 15,
              }}
            />
            <Pressable
              onPress={setTodayEntry}
              style={{ paddingVertical: 10, paddingHorizontal: 12, backgroundColor: c.bgSecondary, borderRadius: radius.md, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodyBold, color: c.accent, fontSize: 12 }}>Сегодня</Text>
            </Pressable>
            <Pressable
              onPress={handleSaveEntryDate}
              style={{ paddingVertical: 10, paddingHorizontal: 14, backgroundColor: c.accent, borderRadius: radius.md }}
            >
              <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 13 }}>OK</Text>
            </Pressable>
          </View>
        </View>

        {/* Результат расчета дедлайна */}
        {visaStatus ? (
          <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 4 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Крайний срок выезда:</T>
              <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 14 }}>
                {visaStatus.deadlineStr}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 4 }}>
              <T v="muted">Рекомендация:</T>
              <Text style={{ fontFamily: fonts.bodySemi, color: c.coral, fontSize: 12 }}>
                {visaStatus.daysLeft > 14 ? 'Сроки в норме' : 'Пора планировать визаран'}
              </Text>
            </View>
          </View>
        ) : (
          <T v="muted" style={{ fontSize: 12 }}>Укажите дату въезда, чтобы приложение рассчитало дедлайн и напомнило о визаране.</T>
        )}

        <Pressable
          onPress={() => router.push('/tools/visa')}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 4 }}
        >
          <Text style={{ fontFamily: fonts.bodyBold, color: c.accent, fontSize: 13 }}>
            Открыть полный калькулятор визарана →
          </Text>
          <ChevronRight size={16} color={c.accent} />
        </Pressable>
      </Card>

      {/* 2. МОЙ ГОРОД ПРОЖИВАНИЯ */}
      <Card style={{ gap: space.sm }}>
        <T v="h3">📍 Мой город во Вьетнаме</T>
        <T v="muted">Под этот город открываются прогноз погоды, карта районов и калькулятор цен</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 4 }}>
          {CITIES.map(ct => (
            <Chip
              key={ct.id}
              label={ct.name}
              active={settings.city === ct.id}
              onPress={() => { tap(); saveSettings({ city: ct.id }); }}
            />
          ))}
        </View>
      </Card>

      {/* 3. ФИНАНСЫ И СТИЛЬ ЖИЗНИ */}
      <Card style={{ gap: space.md }}>
        <T v="h3">💰 Финансовые критерии</T>

        <View style={{ gap: 6 }}>
          <T v="label">Основная валюта</T>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {CURRENCIES.map(cu => (
              <Chip
                key={cu.id}
                label={cu.label}
                active={settings.currency === cu.id}
                onPress={() => { tap(); saveSettings({ currency: cu.id }); }}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <T v="label">Стиль жизни</T>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {LIFESTYLES.map(lf => (
              <Chip
                key={lf.id}
                label={lf.label}
                active={settings.lifestyle === lf.id}
                onPress={() => { tap(); saveSettings({ lifestyle: lf.id }); }}
              />
            ))}
          </View>
        </View>

        <View style={{ gap: 6 }}>
          <T v="label">Состав</T>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {FAMILIES.map(fm => (
              <Chip
                key={fm.id}
                label={fm.label}
                active={settings.family === fm.id}
                onPress={() => { tap(); saveSettings({ family: fm.id }); }}
              />
            ))}
          </View>
        </View>
      </Card>

      {/* 4. УВЕДОМЛЕНИЯ */}
      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Bell size={18} color={c.gold} />
          <T v="h3">Уведомления</T>
        </View>

        <Pressable
          onPress={() => { tap(); saveSettings({ notify_visa: !settings.notify_visa }); }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 14 }}>Напоминать о визе</Text>
            <T v="muted" style={{ fontSize: 12 }}>Уведомления за 14, 7 и 3 дня до дедлайна</T>
          </View>
          <View style={{
            width: 44, height: 26, borderRadius: 13,
            backgroundColor: settings.notify_visa ? c.accent : c.border,
            alignItems: settings.notify_visa ? 'flex-end' : 'flex-start',
            padding: 3,
          }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
          </View>
        </Pressable>

        <Pressable
          onPress={() => { tap(); saveSettings({ notify_alerts: !settings.notify_alerts }); }}
          style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}
        >
          <View style={{ flex: 1, paddingRight: 10 }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 14 }}>Штормы и тайфуны</Text>
            <T v="muted" style={{ fontSize: 12 }}>Экстренные сводки GDACS по прибрежным городам</T>
          </View>
          <View style={{
            width: 44, height: 26, borderRadius: 13,
            backgroundColor: settings.notify_alerts ? c.accent : c.border,
            alignItems: settings.notify_alerts ? 'flex-end' : 'flex-start',
            padding: 3,
          }}>
            <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' }} />
          </View>
        </Pressable>
      </Card>

      {/* 5. ИЗБРАННОЕ */}
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

      
      {/* Кнопка повторного прохождения опроса */}
      <Card
        onPress={() => router.push('/onboarding')}
        style={{ flexDirection: 'row', alignItems: 'center', gap: space.md, backgroundColor: 'rgba(31,209,193,0.06)', borderColor: c.accent }}
      >
        <Text style={{ fontSize: 24 }}>✨</Text>
        <View style={{ flex: 1, gap: 2 }}>
          <T v="h3" style={{ color: c.accent }}>Первичный опрос экспата</T>
          <T v="muted" style={{ fontSize: 12 }}>Пройти опрос заново для перенастройки всех рекомендаций</T>
        </View>
        <ChevronRight size={18} color={c.accent} />
      </Card>
  
      <SupportCard />

      {/* Политика конфиденциальности (требование Google Play и App Store) */}
      <Pressable
        onPress={() => WebBrowser.openBrowserAsync(`${WEB_BASE}/privacy`)}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 6,
          paddingVertical: 10,
        }}
      >
        <ShieldCheck size={14} color={c.textMuted} />
        <Text style={{ fontFamily: fonts.bodySemi, color: c.textMuted, fontSize: 12 }}>
          Политика конфиденциальности epats.wiki ↗
        </Text>
      </Pressable>

      {user && (
        <View style={{ gap: 4, alignItems: 'center', marginTop: 4, marginBottom: space.lg }}>
          <Pressable onPress={logout} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, padding: space.sm }}>
            <LogOut size={16} color={c.textMuted} />
            <Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted, fontSize: 13 }}>Выйти из аккаунта</Text>
          </Pressable>

          {/* Удаление аккаунта по требованию Google Play Data Safety */}
          <Pressable
            onPress={() => {
              Alert.alert(
                'Удаление аккаунта',
                'Все ваши данные (город, визовые даты, сохраненные статьи и профиль) будут безвозвратно удалены из базы данных.',
                [
                  { text: 'Отмена', style: 'cancel' },
                  {
                    text: 'Удалить аккаунт',
                    style: 'destructive',
                    onPress: async () => {
                      try {
                        await api('/api/me', { method: 'DELETE' });
                      } catch {}
                      await logout();
                      Alert.alert('Готово', 'Ваш аккаунт и данные успешно удалены.');
                    },
                  },
                ]
              );
            }}
            style={{ padding: space.xs }}
          >
            <Text style={{ fontFamily: fonts.bodySemi, color: c.danger, fontSize: 11 }}>
              Удалить аккаунт и все данные
            </Text>
          </Pressable>
        </View>
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
        <T v="muted">epats.wiki делают экспаты для экспатов</T>
      </View>
    </Card>
  );
}
