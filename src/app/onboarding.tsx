import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight,
  Compass, DollarSign, Globe, MapPin, Plane, Send, ShieldCheck, Sparkles, User
} from 'lucide-react-native';
import { useState } from 'react';
import {
  ActivityIndicator, Pressable, ScrollView, Text, TextInput, View
} from 'react-native';

import { Card, Chip, GradientButton, Screen, T, tap } from '@/components/ui';
import BrandLogo from '@/components/BrandLogo';
import { useAuth, CityId, VisaTypeId, CurrencyId, LifestyleId, FamilyId } from '@/lib/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export const ONBOARDING_KEY = 'epats_onboarding_completed_v1';

const CITIES: { id: CityId | 'planning'; name: string; tag: string; icon: string }[] = [
  { id: 'danang', name: 'Дананг', tag: 'Пляж Ми Кхе, IT, чистота, экспаты', icon: '🏖️' },
  { id: 'nhatrang', name: 'Нячанг', tag: 'Русская диаспора, детсады, море', icon: '🌊' },
  { id: 'hcm', name: 'Хошимин (Сайгон)', tag: 'Бизнес, карьера, ритм мегаполиса', icon: '🌆' },
  { id: 'hanoi', name: 'Ханой', tag: 'Культура, старинные улочки, озера', icon: '🏛️' },
  { id: 'phuquoc', name: 'Фукуок', tag: 'Остров, белый песок, безвиз 30 дн.', icon: '🏝️' },
  { id: 'planning', name: 'Пока выбираю город', tag: 'Поможем сравнить цены и климат', icon: '✈️' },
];

const VISAS: { id: VisaTypeId | 'tourist' | 'trc' | 'exploring'; name: string; badge: string; desc: string; icon: string }[] = [
  { id: 'evisa90_single', name: 'Электронная E-Visa (90 дней)', badge: 'Зимовщики', desc: 'Оформляется онлайн перед поездкой', icon: '🛂' },
  { id: '45', name: 'Безвизовый штамп 45 дней', badge: 'Граждане РФ', desc: 'Бесплатный штамп по прилету в аэропорт', icon: '✈️' },
  { id: 'tourist', name: 'Турист / Короткий отпуск', badge: 'Отпуск', desc: 'Поездка на 1–4 недели', icon: '🏖️' },
  { id: 'trc', name: 'ВНЖ / Карта резидента (TRC)', badge: 'Долгосрочно', desc: 'Бизнес, работа или брак во Вьетнаме', icon: '🏢' },
  { id: 'exploring', name: 'Пока только изучаю правила', badge: 'Новичок', desc: 'Нужна помощь в выборе визы', icon: '🧭' },
];

const TOURIST_DAYS = [7, 10, 14, 21, 30, 45];

const LIFESTYLES: { id: LifestyleId; title: string; cost: string; desc: string; icon: string }[] = [
  { id: 'budget', title: 'Эконом', cost: '$600 – $800 / мес', desc: 'Студия, рынки, байк, без излишеств', icon: '🎒' },
  { id: 'comfort', title: 'Комфорт', cost: '$1 000 – $1 500 / мес', desc: 'Кондо с бассейном, кафе, Grab, страховка', icon: '🛋️' },
  { id: 'premium', title: 'Премиум', cost: '$2 000+ / мес', desc: 'Вилла / пентхаус, рестораны, поездки', icon: '💎' },
];

const FAMILIES: { id: FamilyId; label: string; icon: string }[] = [
  { id: 'solo', label: 'Один', icon: '👤' },
  { id: 'couple', label: 'Пара', icon: '👫' },
  { id: 'family', label: 'С семьей / детьми', icon: '👨‍👩‍👧' },
];

const FROM_CURRENCIES: { id: CurrencyId; label: string; flag: string }[] = [
  { id: 'RUB', label: 'Рубли (₽)', flag: '🇷🇺' },
  { id: 'USD', label: 'Доллары ($)', flag: '🇺🇸' },
  { id: 'USDT', label: 'USDT / P2P (₮)', flag: '🪙' },
];

export default function OnboardingScreen() {
  const { c } = useTheme();
  const { user, loginState, login, cancelLogin, saveSettings } = useAuth();

  const [step, setStep] = useState<number>(1);
  const [selectedCity, setSelectedCity] = useState<CityId | 'planning'>('danang');
  const [selectedVisa, setSelectedVisa] = useState<VisaTypeId | 'tourist' | 'trc' | 'exploring'>('evisa90_single');
  const [touristDays, setTouristDays] = useState<number>(14);
  const [selectedLifestyle, setSelectedLifestyle] = useState<LifestyleId>('comfort');
  const [selectedFamily, setSelectedFamily] = useState<FamilyId>('solo');
  const [fromCurrency, setFromCurrency] = useState<CurrencyId>('RUB');

  const totalSteps = 5;

  const nextStep = () => {
    tap();
    if (step < totalSteps) {
      setStep(s => s + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    tap();
    if (step > 1) setStep(s => s - 1);
  };

  const finishOnboarding = async () => {
    tap();
    // 1. Формируем и сохраняем критерии в Supabase БД и AsyncStorage
    const city = selectedCity === 'planning' ? 'danang' : selectedCity;
    const visaType = selectedVisa === 'tourist' || selectedVisa === 'exploring' || selectedVisa === 'trc'
      ? '45'
      : selectedVisa;

    await saveSettings({
      city,
      visa_type: visaType,
      currency: fromCurrency,
      lifestyle: selectedLifestyle,
      family: selectedFamily,
      budget_usd: selectedLifestyle === 'budget' ? 700 : selectedLifestyle === 'comfort' ? 1200 : 2500,
      notify_visa: true,
      notify_alerts: true,
    });

    // 2. Помечаем опрос пройденным
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');

    // 3. Переходим на главный экран
    router.replace('/(tabs)');
  };

  return (
    <Screen padTop={false}>
      {/* Шапка онбординга */}
      <View style={{ paddingTop: space.md, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <BrandLogo size={26} />
            <Text style={{ fontFamily: fonts.display, fontSize: 17, color: c.textPrimary }}>
              epats<Text style={{ color: c.coral }}>.io</Text>
            </Text>
          </View>

          {/* Индикатор шага */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textMuted }}>
              Шаг {step} из {totalSteps}
            </Text>
            <Pressable onPress={finishOnboarding} hitSlop={10}>
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: c.accent }}>
                Пропустить
              </Text>
            </Pressable>
          </View>
        </View>

        {/* Прогресс-бар из 5 делений */}
        <View style={{ flexDirection: 'row', gap: 4, height: 4 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                borderRadius: 2,
                backgroundColor: i + 1 <= step ? c.accent : c.bgSecondary,
              }}
            />
          ))}
        </View>
      </View>

      {/* ШАГ 1: ВХОД ЧЕРЕЗ TELEGRAM */}
      {step === 1 && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Sparkles size={18} color={c.coral} />
              <T v="label" style={{ color: c.coral }}>Вьетнам для своих · 2026</T>
            </View>
            <T v="h1">Добро пожаловать!</T>
            <T v="body">
              Пройдите быстрый опрос (1 минута), чтобы приложение и Telegram-бот подготовили персональные курсы, визовые сроки и бюджет под вас.
            </T>
          </View>

          {user ? (
            <Card accent style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
              <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: c.accentGlow, alignItems: 'center', justifyContent: 'center' }}>
                <CheckCircle2 size={36} color={c.accent} />
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <T v="h2">Вы авторизованы!</T>
                <T v="body" style={{ color: c.accent, fontFamily: fonts.bodyHeavy }}>
                  {user.first_name} {user.last_name ?? ''} {user.username ? `(@${user.username})` : ''}
                </T>
                <T v="muted" style={{ textAlign: 'center' }}>Критерии будут синхронизироваться с базой данных epats.io</T>
              </View>
            </Card>
          ) : (
            <Card accent style={{ gap: space.md, alignItems: 'center', paddingVertical: space.xl }}>
              <View style={{ width: 60, height: 60, borderRadius: 30, backgroundColor: 'rgba(42,171,238,0.15)', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={28} color={c.tg} />
              </View>
              <View style={{ alignItems: 'center', gap: 4 }}>
                <T v="h2">Вход через Telegram</T>
                <T v="muted" style={{ textAlign: 'center', fontSize: 13 }}>
                  Синхронизирует ваши критерии, сохраненные статьи и напоминания о визе между телефоном и сайтом.
                </T>
              </View>

              {loginState === 'waiting' ? (
                <View style={{ alignItems: 'center', gap: 8 }}>
                  <ActivityIndicator color={c.tg} />
                  <T v="h3" style={{ textAlign: 'center' }}>Подтвердите вход в Telegram</T>
                  <T v="muted" style={{ textAlign: 'center' }}>Нажмите «Start» у бота @epatsiobot и вернитесь</T>
                  <Pressable onPress={cancelLogin}><Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted }}>Отмена</Text></Pressable>
                </View>
              ) : (
                <View style={{ width: '100%', gap: 10 }}>
                  <GradientButton
                    kind="tg"
                    title="Войти через Telegram"
                    icon={<Send size={18} color="#fff" />}
                    onPress={login}
                  />
                  <T v="muted" style={{ textAlign: 'center', fontSize: 11.5 }}>
                    Без паролей. Мы не видим ваш номер телефона.
                  </T>
                </View>
              )}
            </Card>
          )}

          <Pressable
            onPress={nextStep}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: c.accent, borderRadius: radius.pill, paddingVertical: 14, marginTop: 4,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 15 }}>
              {user ? 'Продолжить к выбору города →' : 'Продолжить без входа (гость) →'}
            </Text>
          </Pressable>
        </View>
      )}

      {/* ШАГ 2: ГОРОД ВО ВЬЕТНАМЕ */}
      {step === 2 && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <MapPin size={18} color={c.coral} />
              <T v="label" style={{ color: c.coral }}>Локация</T>
            </View>
            <T v="h1">Где вы живёте или планируете жить?</T>
            <T v="body">
              Погода, аренда жилья и чаты экспатов сразу настроятся под ваш город.
            </T>
          </View>

          <View style={{ gap: 10 }}>
            {CITIES.map(ct => {
              const active = selectedCity === ct.id;
              return (
                <Card
                  key={ct.id}
                  onPress={() => { tap(); setSelectedCity(ct.id); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: space.md,
                    borderColor: active ? c.accent : c.border,
                    backgroundColor: active ? c.accentGlow : c.bgCard,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{ct.icon}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: active ? c.accent : c.textPrimary }}>
                      {ct.name}
                    </Text>
                    <T v="muted" style={{ fontSize: 12 }}>{ct.tag}</T>
                  </View>
                  {active && <CheckCircle2 size={20} color={c.accent} />}
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* ШАГ 3: ВИЗА ИЛИ ТУРИСТ */}
      {step === 3 && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Plane size={18} color={c.coral} />
              <T v="label" style={{ color: c.coral }}>Визовый статус</T>
            </View>
            <T v="h1">Какая у вас виза или цель поездки?</T>
            <T v="body">
              Приложение рассчитает точный дедлайн выезда и вовремя напомнит о визаране.
            </T>
          </View>

          <View style={{ gap: 10 }}>
            {VISAS.map(v => {
              const active = selectedVisa === v.id;
              return (
                <Card
                  key={v.id}
                  onPress={() => { tap(); setSelectedVisa(v.id); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: space.md,
                    borderColor: active ? c.coral : c.border,
                    backgroundColor: active ? 'rgba(255,107,74,0.08)' : c.bgCard,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{v.icon}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: active ? c.coral : c.textPrimary }}>
                        {v.name}
                      </Text>
                    </View>
                    <T v="muted" style={{ fontSize: 12 }}>{v.desc}</T>
                  </View>
                  {active && <CheckCircle2 size={20} color={c.coral} />}
                </Card>
              );
            })}
          </View>

          {/* Дополнительный вопрос, если турист */}
          {selectedVisa === 'tourist' && (
            <Card accent style={{ gap: space.sm }}>
              <T v="label" style={{ color: c.coral }}>Сколько дней планируете провести во Вьетнаме?</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {TOURIST_DAYS.map(d => (
                  <Chip
                    key={d}
                    label={`${d} дней`}
                    active={touristDays === d}
                    onPress={() => { tap(); setTouristDays(d); }}
                  />
                ))}
              </View>
              <T v="muted">
                {touristDays <= 45
                  ? '✓ Подходит бесплатный безвизовый штамп 45 дней (для граждан РФ).'
                  : '⚠️ Потребуется оформить электронную визу E-Visa 90 дней.'}
              </T>
            </Card>
          )}
        </View>
      )}

      {/* ШАГ 4: БЮДЖЕТ И СТИЛЬ ЖИЗНИ */}
      {step === 4 && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <DollarSign size={18} color={c.gold} />
              <T v="label" style={{ color: c.gold }}>Бюджет и расходы</T>
            </View>
            <T v="h1">Какой уровень комфорта вы планируете?</T>
            <T v="body">
              Калькулятор расходов и подбор районов сразу подстроятся под ваши ожидания.
            </T>
          </View>

          <View style={{ gap: 10 }}>
            {LIFESTYLES.map(lf => {
              const active = selectedLifestyle === lf.id;
              return (
                <Card
                  key={lf.id}
                  onPress={() => { tap(); setSelectedLifestyle(lf.id); }}
                  style={{
                    flexDirection: 'row', alignItems: 'center', gap: space.md,
                    borderColor: active ? c.accent : c.border,
                    backgroundColor: active ? c.accentGlow : c.bgCard,
                  }}
                >
                  <Text style={{ fontSize: 32 }}>{lf.icon}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: active ? c.accent : c.textPrimary }}>
                        {lf.title}
                      </Text>
                      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: c.coral }}>
                        {lf.cost}
                      </Text>
                    </View>
                    <T v="muted" style={{ fontSize: 12 }}>{lf.desc}</T>
                  </View>
                  {active && <CheckCircle2 size={20} color={c.accent} />}
                </Card>
              );
            })}
          </View>

          {/* Состав семьи */}
          <Card style={{ gap: space.sm }}>
            <T v="label">С кем вы едете?</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {FAMILIES.map(fm => (
                <Chip
                  key={fm.id}
                  label={`${fm.icon} ${fm.label}`}
                  active={selectedFamily === fm.id}
                  onPress={() => { tap(); setSelectedFamily(fm.id); }}
                />
              ))}
            </View>
          </Card>
        </View>
      )}

      {/* ШАГ 5: ВАЛЮТЫ И КОНВЕРТАЦИЯ */}
      {step === 5 && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Globe size={18} color={c.accent} />
              <T v="label" style={{ color: c.accent }}>Валюты</T>
            </View>
            <T v="h1">В какой валюте удобнее считать?</T>
            <T v="body">
              Конвертер и калькулятор цен будут сразу переводить донги (VND) в вашу привычную валюту с учетом реального P2P курса.
            </T>
          </View>

          <Card accent style={{ gap: space.md }}>
            <T v="label">Основная валюта доходов и сбережений</T>
            <View style={{ gap: 10 }}>
              {FROM_CURRENCIES.map(fc => {
                const active = fromCurrency === fc.id;
                return (
                  <Pressable
                    key={fc.id}
                    onPress={() => { tap(); setFromCurrency(fc.id); }}
                    style={{
                      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
                      padding: 14, borderRadius: radius.md, borderWidth: 1,
                      borderColor: active ? c.accent : c.border,
                      backgroundColor: active ? c.accentGlow : c.bgSecondary,
                    }}
                  >
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                      <Text style={{ fontSize: 24 }}>{fc.flag}</Text>
                      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: active ? c.accent : c.textPrimary }}>
                        {fc.label}
                      </Text>
                    </View>
                    {active && <CheckCircle2 size={20} color={c.accent} />}
                  </Pressable>
                );
              })}
            </View>
          </Card>

          {/* Итоговая карточка конвертации */}
          <Card style={{ gap: 8, backgroundColor: 'rgba(31,209,193,0.08)', borderColor: c.accent }}>
            <T v="h3" style={{ color: c.accent }}>Автоматическая пара:</T>
            <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.textPrimary }}>
              {fromCurrency} ⇄ VND (Вьетнамский донг ₫)
            </Text>
            <T v="muted" style={{ fontSize: 12 }}>
              Включает прямые котировки госбанков Vietcombank и актуальный P2P-курс на Bybit.
            </T>
          </Card>
        </View>
      )}

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ */}
      {step > 1 && (
        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg, paddingBottom: space.xl }}>
          <Pressable
            onPress={prevStep}
            style={{
              flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
              paddingVertical: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: c.border,
              backgroundColor: c.bgSecondary,
            }}
          >
            <ArrowLeft size={18} color={c.textSecondary} />
            <Text style={{ fontFamily: fonts.bodyBold, color: c.textSecondary, fontSize: 14 }}>Назад</Text>
          </Pressable>

          <Pressable
            onPress={nextStep}
            style={{
              flex: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 14, borderRadius: radius.pill, backgroundColor: c.accent,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 15 }}>
              {step === totalSteps ? 'Готово, открыть epats.io 🚀' : 'Далее →'}
            </Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}
