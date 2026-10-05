import { useState, useMemo, useEffect } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { useAuth, CityId, LifestyleId, FamilyId, CurrencyId } from '@/lib/auth';
import { useRates, Cur } from '@/lib/data';
import { nf, money } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const CITIES = [
  { id: 'danang', name: 'Дананг', flag: '🏖️', factor: 1.0 },
  { id: 'nhatrang', name: 'Нячанг', flag: '🌊', factor: 0.93 },
  { id: 'hcm', name: 'Хошимин', flag: '🌆', factor: 1.25 },
  { id: 'hanoi', name: 'Ханой', flag: '🏛️', factor: 1.12 },
  { id: 'phuquoc', name: 'Фукуок', flag: '🏝️', factor: 1.18 },
] as const;

const LIFESTYLES = [
  { id: 'budget', name: 'Эконом', icon: '🎒', factor: 0.72, desc: 'Студия, рынки, без излишеств' },
  { id: 'comfort', name: 'Комфорт', icon: '🛋️', factor: 1.0, desc: 'Кондо с бассейном, кафе, Grab' },
  { id: 'premium', name: 'Премиум', icon: '💎', factor: 1.65, desc: 'Вилла / пентхаус, рестораны' },
] as const;

const FAMILY_OPTIONS = [
  { id: 'solo', name: 'Один', icon: '👤', mults: { rent: 1.0, food: 1.0, transport: 1.0, visa: 1.0, other: 1.0 } },
  { id: 'couple', name: 'Пара', icon: '👫', mults: { rent: 1.15, food: 1.7, transport: 1.4, visa: 2.0, other: 1.6 } },
  { id: 'family', name: 'Семья', icon: '👨‍👩‍👧', mults: { rent: 1.35, food: 2.1, transport: 1.6, visa: 2.8, other: 2.1 } },
  { id: 'big_family', name: 'Большая семья', icon: '👨‍👩‍👧‍👦', mults: { rent: 1.7, food: 2.8, transport: 2.0, visa: 3.8, other: 2.8 } },
] as const;

const BASE_ITEMS = [
  { key: 'rent', name: 'Жильё и коммуналка', emoji: '🏠', baseVnd: 10_000_000, type: 'rent' },
  { key: 'food', name: 'Еда и продукты', emoji: '🍜', baseVnd: 7_000_000, type: 'food' },
  { key: 'transport', name: 'Байк и бензин', emoji: '🛵', baseVnd: 2_500_000, type: 'transport' },
  { key: 'visa', name: 'Виза и визараны', emoji: '🚌', baseVnd: 1_800_000, type: 'visa' },
  { key: 'cafes', name: 'Кафе и развлечения', emoji: '☕', baseVnd: 3_500_000, type: 'other' },
  { key: 'buffer', name: 'Медицина и буфер', emoji: '🛡️', baseVnd: 2_200_000, type: 'other' },
];

export default function BudgetCalculator() {
  const { c } = useTheme();
  const { data: r } = useRates();
  const { settings, saveSettings } = useAuth();

  const [cityId, setCityId] = useState<CityId>((settings.city as CityId) || 'danang');
  const [lifeId, setLifeId] = useState<LifestyleId>((settings.lifestyle as LifestyleId) || 'comfort');
  const [famId, setFamId] = useState<FamilyId>((settings.family as FamilyId) || 'solo');
  const [cur, setCur] = useState<Cur>((settings.currency as Cur) || 'RUB');

  useEffect(() => {
    if (settings.city) setCityId(settings.city as CityId);
    if (settings.lifestyle) setLifeId(settings.lifestyle as LifestyleId);
    if (settings.family) setFamId(settings.family as FamilyId);
    if (settings.currency) setCur(settings.currency as Cur);
  }, [settings.city, settings.lifestyle, settings.family, settings.currency]);

  const handleCity = (id: CityId) => {
    tap();
    setCityId(id);
    saveSettings({ city: id });
  };

  const handleLife = (id: LifestyleId) => {
    tap();
    setLifeId(id);
    saveSettings({ lifestyle: id });
  };

  const handleFam = (id: FamilyId) => {
    tap();
    setFamId(id);
    saveSettings({ family: id });
  };

  const handleCur = (id: Cur) => {
    tap();
    setCur(id);
    if (id === 'RUB' || id === 'USD' || id === 'USDT') {
      saveSettings({ currency: id });
    }
  };

  const city = CITIES.find(x => x.id === cityId) || CITIES[0];
  const life = LIFESTYLES.find(x => x.id === lifeId) || LIFESTYLES[1];
  const fam = FAMILY_OPTIONS.find(x => x.id === famId) || FAMILY_OPTIONS[0];

  const { items, totalVnd } = useMemo(() => {
    let tot = 0;
    const list = BASE_ITEMS.map(item => {
      const famMult = fam.mults[item.type as keyof typeof fam.mults] || 1.0;
      const vnd = Math.round(item.baseVnd * city.factor * life.factor * famMult);
      tot += vnd;
      return { ...item, vnd };
    });
    return { items: list, totalVnd: tot };
  }, [city.factor, life.factor, fam.mults]);

  const displaySum = (vnd: number) => {
    if (cur === 'VND') return `${nf(Math.round(vnd / 1000) * 1000)} ₫`;
    if (cur === 'RUB') return `${nf(Math.round(vnd * (r.vndRub || 0.003218)))} ₽`;
    if (cur === 'USD') return `$${nf(Math.round(vnd / (r.usdVnd || 25940)))}`;
    return `${nf(Math.round((vnd / (r.usdVnd || 25940)) * (r.usdRub / (r.usdtRub || r.usdRub))))} ₮`;
  };

  return (
    <Screen padTop={false}>
      <View style={{ gap: 6 }}>
        <T v="h1">Калькулятор бюджета</T>
        <T v="body">Критерии синхронизируются с вашим профилем и базой данных</T>
      </View>

      {/* Город */}
      <Card style={{ gap: space.sm }}>
        <T v="label">Город проживания</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {CITIES.map(ct => (
            <Chip
              key={ct.id}
              label={`${ct.flag} ${ct.name}`}
              active={cityId === ct.id}
              onPress={() => handleCity(ct.id)}
            />
          ))}
        </View>
      </Card>

      {/* Стиль жизни */}
      <Card style={{ gap: space.sm }}>
        <T v="label">Стиль жизни</T>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {LIFESTYLES.map(lf => (
            <Pressable
              key={lf.id}
              onPress={() => handleLife(lf.id)}
              style={{
                flex: 1, padding: 12, borderRadius: radius.md, borderWidth: 1,
                borderColor: lifeId === lf.id ? c.accent : c.border,
                backgroundColor: lifeId === lf.id ? c.accentGlow : c.bgSecondary,
                alignItems: 'center', gap: 4,
              }}
            >
              <Text style={{ fontSize: 24 }}>{lf.icon}</Text>
              <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: lifeId === lf.id ? c.accent : c.textPrimary }}>
                {lf.name}
              </Text>
            </Pressable>
          ))}
        </View>
        <T v="muted">{life.desc}</T>
      </Card>

      {/* Состав семьи */}
      <Card style={{ gap: space.sm }}>
        <T v="label">Состав</T>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {FAMILY_OPTIONS.map(fm => (
            <Chip
              key={fm.id}
              label={`${fm.icon} ${fm.name}`}
              active={famId === fm.id}
              onPress={() => handleFam(fm.id)}
            />
          ))}
        </View>
      </Card>

      {/* Итоговая сумма карточка */}
      <Card accent style={{ gap: space.md, backgroundColor: c.accentGlow, borderColor: c.accent }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="label" style={{ color: c.accent }}>Итого в месяц</T>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {(['VND', 'RUB', 'USD', 'USDT'] as Cur[]).map(cu => (
              <Chip key={cu} label={cu} active={cur === cu} onPress={() => handleCur(cu)} />
            ))}
          </View>
        </View>

        <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 34, color: c.textPrimary }}>
          {displaySum(totalVnd)}
        </Text>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: c.border, paddingTop: 10 }}>
          <T v="muted">В день: ~${displaySum(Math.round(totalVnd / 30))}</T>
          <T v="muted">
            {cur !== 'RUB' && `≈ ${money(Math.round(totalVnd * (r.vndRub || 0.003218)), 'RUB')}`}
          </T>
        </View>
      </Card>

      {/* Разбивка по категориям */}
      <View style={{ gap: space.sm }}>
        <T v="h3">Статьи расходов</T>
        {items.map(it => {
          const pct = Math.round((it.vnd / totalVnd) * 100);
          return (
            <Card key={it.key} style={{ paddingVertical: 12, gap: 8 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={{ fontSize: 20 }}>{it.emoji}</Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 14 }}>{it.name}</Text>
                </View>
                <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 15 }}>
                  {displaySum(it.vnd)}
                </Text>
              </View>

              <View style={{ height: 4, borderRadius: 2, backgroundColor: c.bgSecondary, overflow: 'hidden' }}>
                <View style={{ width: `${pct}%`, height: '100%', backgroundColor: c.coral, borderRadius: 2 }} />
              </View>

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="muted" style={{ fontSize: 11 }}>{pct}% от бюджета</T>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
