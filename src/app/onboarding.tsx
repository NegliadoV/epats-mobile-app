import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  ArrowLeft, ArrowRight, Check, CheckCircle2, ChevronRight,
  Compass, DollarSign, Globe, MapPin, Plane, Send, ShieldCheck, Sparkles, User
} from 'lucide-react-native';
import { useState, useEffect } from 'react';
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

const FAMILIES: { id: FamilyId; label: string; icon: string }[] = [
  { id: 'solo', label: 'Один', icon: '👤' },
  { id: 'couple', label: 'Вдвоём (пара)', icon: '👫' },
  { id: 'family', label: 'С семьей / детьми', icon: '👨‍👩‍👧' },
];

const LIFESTYLES: { id: LifestyleId; title: string; icon: string }[] = [
  { id: 'budget', title: 'Эконом', icon: '🎒' },
  { id: 'comfort', title: 'Комфорт', icon: '🛋️' },
  { id: 'premium', title: 'Премиум', icon: '💎' },
];

const BUDGET_CONFIG: Record<FamilyId, Record<LifestyleId, { cost: string; min: number; max: number; desc: string }>> = {
  solo: {
    budget: { cost: '$500 – $800 / мес', min: 500, max: 800, desc: 'Студия, рынки, байк, кафе для местных' },
    comfort: { cost: '$1 000 – $1 500 / мес', min: 1000, max: 1500, desc: '1-к кондо с бассейном, Grab, европейские кафе' },
    premium: { cost: '$2 000 – $3 500 / мес', min: 2000, max: 3500, desc: 'Апартаменты у моря, рестораны, путешествия' },
  },
  couple: {
    budget: { cost: '$800 – $1 200 / мес', min: 800, max: 1200, desc: 'Хорошая 1-к квартира, совместные расходы, байк' },
    comfort: { cost: '$1 500 – $2 300 / мес', min: 1500, max: 2300, desc: 'Просторное 2-к кондо, кафе, такси, коворкинг' },
    premium: { cost: '$3 000 – $5 000 / мес', min: 3000, max: 5000, desc: 'Видовой кондо / вилла, путешествия по Азии' },
  },
  family: {
    budget: { cost: '$1 300 – $1 900 / мес', min: 1300, max: 1900, desc: '2-к квартира или дом, рынки, без платной школы' },
    comfort: { cost: '$2 200 – $3 500 / мес', min: 2200, max: 3500, desc: '3-к кондо с охраной, детсад/секции, авто/Grab' },
    premium: { cost: '$4 000 – $7 000 / мес', min: 4000, max: 7000, desc: 'Вилла, международная школа, страховка, помощница' },
  },
  big_family: {
    budget: { cost: '$1 800 – $2 600 / мес', min: 1800, max: 2600, desc: '3-к квартира или просторный дом, рынки' },
    comfort: { cost: '$3 000 – $4 800 / мес', min: 3000, max: 4800, desc: 'Большое кондо/вилла, секции, авто, медицина' },
    premium: { cost: '$5 000 – $9 000 / мес', min: 5000, max: 9000, desc: 'Премиум вилла, международные школы, персонал' },
  },
};

const FROM_CURRENCIES: { id: CurrencyId; label: string; flag: string }[] = [
  { id: 'RUB', label: 'Рубли (₽)', flag: '🇷🇺' },
  { id: 'USD', label: 'Доллары ($)', flag: '🇺🇸' },
  { id: 'USDT', label: 'USDT / P2P (₮)', flag: '🪙' },
];

type StepType = 'auth' | 'city' | 'visa' | 'budget' | 'currency';

export default function OnboardingScreen() {
  const { c } = useTheme();
  const { user, settings, loginState, login, cancelLogin, saveSettings } = useAuth();

  // Если пользователь авторизован — шаг логина исключается!
  const steps: StepType[] = user
    ? ['city', 'visa', 'budget', 'currency']
    : ['auth', 'city', 'visa', 'budget', 'currency'];

  const [stepIdx, setStepIdx] = useState<number>(0);
  const [selectedCity, setSelectedCity] = useState<CityId | 'planning'>((settings.city as CityId) || 'danang');
  const [selectedVisa, setSelectedVisa] = useState<VisaTypeId | 'tourist' | 'trc' | 'exploring'>((settings.visa_type as VisaTypeId) || 'evisa90_single');
  const [touristDays, setTouristDays] = useState<number>(14);
  const [selectedLifestyle, setSelectedLifestyle] = useState<LifestyleId>((settings.lifestyle as LifestyleId) || 'comfort');
  const [selectedFamily, setSelectedFamily] = useState<FamilyId>((settings.family as FamilyId) || 'solo');
  const [fromCurrency, setFromCurrency] = useState<CurrencyId>((settings.currency as CurrencyId) || 'RUB');

  // Если пользователь уже авторизован — сразу перенаправляем в приложение!
  useEffect(() => {
    if (user) {
      AsyncStorage.setItem(ONBOARDING_KEY, 'true').catch(() => {});
      router.replace('/(tabs)');
    }
  }, [user]);

  const currentStep = steps[stepIdx] || 'city';
  const totalSteps = steps.length;
  const isFirstStep = stepIdx === 0;
  const isLastStep = stepIdx === totalSteps - 1;

  const nextStep = () => {
    tap();
    if (!isLastStep) {
      setStepIdx(i => i + 1);
    } else {
      finishOnboarding();
    }
  };

  const prevStep = () => {
    tap();
    if (!isFirstStep) setStepIdx(i => i - 1);
  };

  const finishOnboarding = async () => {
    tap();
    const city = selectedCity === 'planning' ? 'danang' : selectedCity;
    const visaType = selectedVisa === 'tourist' || selectedVisa === 'exploring' || selectedVisa === 'trc'
      ? '45'
      : selectedVisa;

    const range = BUDGET_CONFIG[selectedFamily]?.[selectedLifestyle] || BUDGET_CONFIG.solo.comfort;
    const calculatedBudget = Math.round((range.min + range.max) / 2);

    await saveSettings({
      city,
      visa_type: visaType,
      currency: fromCurrency,
      lifestyle: selectedLifestyle,
      family: selectedFamily,
      budget_usd: calculatedBudget,
      notify_visa: true,
      notify_alerts: true,
    });

    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
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
              Шаг {stepIdx + 1} из {totalSteps}
            </Text>
          </View>
        </View>

        {/* Прогресс-бар */}
        <View style={{ flexDirection: 'row', gap: 4, height: 4 }}>
          {Array.from({ length: totalSteps }).map((_, i) => (
            <View
              key={i}
              style={{
                flex: 1,
                borderRadius: 2,
                backgroundColor: i <= stepIdx ? c.accent : c.bgSecondary,
              }}
            />
          ))}
        </View>
      </View>

      {/* ШАГ: ВХОД ЧЕРЕЗ TELEGRAM (ТОЛЬКО ДЛЯ НЕАВТОРИЗОВАННЫХ) */}
      {currentStep === 'auth' && (
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

          <Pressable
            onPress={nextStep}
            style={{
              flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              backgroundColor: c.accent, borderRadius: radius.pill, paddingVertical: 14, marginTop: 4,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 15 }}>
              Продолжить без входа (гость) →
            </Text>
          </Pressable>
        </View>
      )}

      {/* ШАГ: ГОРОД ВО ВЬЕТНАМЕ */}
      {currentStep === 'city' && (
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

      {/* ШАГ: ВИЗА ИЛИ ТУРИСТ */}
      {currentStep === 'visa' && (
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

      {/* ШАГ: БЮДЖЕТ И СТИЛЬ ЖИЗНИ */}
      {currentStep === 'budget' && (
        <View style={{ gap: space.md, marginTop: space.sm }}>
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <DollarSign size={18} color={c.gold} />
              <T v="label" style={{ color: c.gold }}>Бюджет и расходы</T>
            </View>
            <T v="h1">Какой уровень комфорта вы планируете?</T>
            <T v="body">
              Калькулятор расходов подберёт реалистичный диапазон «от и до» под ваш состав.
            </T>
          </View>

          {/* Состав семьи сверху */}
          <Card style={{ gap: space.sm }}>
            <T v="label">С кем вы путешествуете?</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
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

          {/* Уровни комфорта с динамическими диапазонами от-до */}
          <View style={{ gap: 10 }}>
            {LIFESTYLES.map(lf => {
              const active = selectedLifestyle === lf.id;
              const info = BUDGET_CONFIG[selectedFamily]?.[lf.id] || BUDGET_CONFIG.solo[lf.id];
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
                        {info.cost}
                      </Text>
                    </View>
                    <T v="muted" style={{ fontSize: 12 }}>{info.desc}</T>
                  </View>
                  {active && <CheckCircle2 size={20} color={c.accent} />}
                </Card>
              );
            })}
          </View>
        </View>
      )}

      {/* ШАГ: ВАЛЮТЫ И КОНВЕРТАЦИЯ */}
      {currentStep === 'currency' && (
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

      {/* НИЖНЯЯ ПАНЕЛЬ НАВИГАЦИИ (ПОКАЗЫВАЕТСЯ НА ВСЕХ ШАГАХ КРОМЕ ЛОГИНА ДЛЯ ГОСТЯ) */}
      {(currentStep !== 'auth' || user) && (
        <View style={{ flexDirection: 'row', gap: space.md, marginTop: space.lg, paddingBottom: space.xl }}>
          {!isFirstStep && (
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
          )}

          <Pressable
            onPress={nextStep}
            style={{
              flex: isFirstStep ? 1 : 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
              paddingVertical: 14, borderRadius: radius.pill, backgroundColor: c.accent,
            }}
          >
            <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 15 }}>
              {isLastStep ? 'Готово, открыть epats.wiki 🚀' : 'Далее →'}
            </Text>
          </Pressable>
        </View>
      )}
    </Screen>
  );
}
