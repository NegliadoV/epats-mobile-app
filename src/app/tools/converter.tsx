import { ArrowDownUp, Delete } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { convert, CURRENCIES, Cur, useRates } from '@/lib/data';
import { money, nf, timeAgo } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const QUICK: Record<Cur, { value: number; label: string }[]> = {
  VND: [
    { value: 50_000, label: '50k' },
    { value: 100_000, label: '100k' },
    { value: 200_000, label: '200k' },
    { value: 500_000, label: '500k' },
    { value: 1_000_000, label: '1м' },
    { value: 5_000_000, label: '5м' },
  ],
  RUB: [
    { value: 500, label: '500 ₽' },
    { value: 1_000, label: '1k ₽' },
    { value: 3_000, label: '3k ₽' },
    { value: 5_000, label: '5k ₽' },
    { value: 10_000, label: '10k ₽' },
    { value: 50_000, label: '50k ₽' },
  ],
  USD: [
    { value: 10, label: '$10' },
    { value: 50, label: '$50' },
    { value: 100, label: '$100' },
    { value: 200, label: '$200' },
    { value: 500, label: '$500' },
    { value: 1_000, label: '$1k' },
  ],
};

const NOTES = [
  { value: '500 000 ₫', color: '#3b82f6', warning: true, label: '500k — синяя! Осторожно — похожа на 20k' },
  { value: '200 000 ₫', color: '#f59e0b', warning: false, label: '200k — жёлтая' },
  { value: '100 000 ₫', color: '#1fd1c1', warning: true, label: '100k — зелёная! Осторожно — похожа на 10k' },
  { value: '50 000 ₫', color: '#ec4899', warning: false, label: '50k — розовая' },
  { value: '20 000 ₫', color: '#3b82f6', warning: true, label: '20k — синяя! Осторожно — похожа на 500k' },
  { value: '10 000 ₫', color: '#8b5cf6', warning: true, label: '10k — фиолетовая! Осторожно — похожа на 100k' },
];

export default function Converter() {
  const { c } = useTheme();
  const { settings } = useAuth();
  const { data: r, updatedAt, offline } = useRates();

  const rawTarget = settings?.currency as string;
  const defaultTarget: Cur = (rawTarget === 'USD' ? 'USD' : 'RUB');
  const [from, setFrom] = useState<Cur>('VND');
  const [to, setTo] = useState<Cur>(defaultTarget);
  const [raw, setRaw] = useState('100000');

  const amount = parseFloat(raw.replace(',', '.')) || 0;
  const fromCur = CURRENCIES.find(x => x.id === from)!;
  const toCur = CURRENCIES.find(x => x.id === to)!;

  // Главный расчетный результат
  const mainResult = convert(amount, from, to, r);

  // Расчет Bybit P2P
  const getP2P = (amt: number, f: Cur, t: Cur): number | null => {
    if (!amt) return null;
    const p2pVndRub = r.p2pVndRub || 308.5;

    if (f === 'RUB' && t === 'VND') return amt * p2pVndRub;
    if (f === 'VND' && t === 'RUB') return amt / p2pVndRub;
    return null;
  };

  const p2pResult = getP2P(amount, from, to);

  // Клавиатура
  const press = (k: string) => {
    tap();
    if (k === '⌫') {
      return setRaw(s => (s.length <= 1 ? '0' : s.slice(0, -1)));
    }
    if (k === '.') {
      if (from === 'VND') return;
      return setRaw(s => (s.includes('.') ? s : `${s || '0'}.`));
    }
    if (k === '000') {
      return setRaw(s => (!s || s === '0' ? '0' : (s + '000').slice(0, 12)));
    }
    setRaw(s => (!s || s === '0' ? k : (s + k).slice(0, 12)));
  };

  // Выбор валюты ввода ("Вы отдаёте")
  const selectFrom = (newFrom: Cur) => {
    tap();
    if (newFrom === from) return;
    if (newFrom === to) {
      setTo(from);
    }
    if (amount > 0) {
      const converted = convert(amount, from, newFrom, r);
      setRaw(String(newFrom === 'VND' ? Math.round(converted / 1000) * 1000 : Number(converted.toFixed(2))));
    }
    setFrom(newFrom);
  };

  // Выбор целевой валюты ("Вы получаете")
  const selectTo = (newTo: Cur) => {
    tap();
    if (newTo === to) return;
    if (newTo === from) {
      swap();
    } else {
      setTo(newTo);
    }
  };

  // Смена направления (Swap)
  const swap = () => {
    tap();
    const nextFrom = to;
    const nextTo = from;
    if (amount > 0) {
      const converted = convert(amount, from, nextFrom, r);
      setRaw(String(nextFrom === 'VND' ? Math.round(converted / 1000) * 1000 : Number(converted.toFixed(2))));
    }
    setFrom(nextFrom);
    setTo(nextTo);
  };

  // Курс обмена для бейджа
  const rateText =
    from === 'VND'
      ? `100k ₫ ≈ ${money(convert(100_000, 'VND', to, r), to)}`
      : `1 ${fromCur.symbol} ≈ ${money(convert(1, from, to, r), to)}`;

  // Форматирование ввода на экране
  const displayInput = () => {
    if (!raw || raw === '0') return '0';
    if (from === 'VND') {
      const parsed = parseInt(raw, 10) || 0;
      return nf(parsed);
    }
    if (raw.includes('.')) {
      const [i, d] = raw.split('.');
      return `${nf(parseInt(i, 10) || 0)}.${d}`;
    }
    return nf(parseInt(raw, 10) || 0);
  };

  const isVnd = from === 'VND';
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', isVnd ? '000' : '.', '0', '⌫'];

  return (
    <Screen padTop={false}>
      {/* ─── 1. КАРТОЧКА ВВОДА: ВЫ ОТДАЁТЕ ─── */}
      <Card accent style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.coral }} />
            <T v="label" style={{ color: c.coral }}>ВЫ ОТДАЁТЕ (ВВОД)</T>
          </View>
          <T v="muted" style={{ fontSize: 12 }}>{fromCur.name}</T>
        </View>

        {/* Чипы валюты ввода */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {CURRENCIES.map(x => (
            <Chip
              key={x.id}
              label={`${x.flag} ${x.id}`}
              active={from === x.id}
              onPress={() => selectFrom(x.id)}
            />
          ))}
        </View>

        {/* Вводимая сумма */}
        <View style={{ paddingVertical: 2 }}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              fontFamily: fonts.display,
              fontSize: 36,
              color: c.textPrimary,
              fontVariant: ['tabular-nums'],
            }}
          >
            {displayInput()} <Text style={{ color: c.coral }}>{fromCur.symbol}</Text>
          </Text>
        </View>

        {/* Быстрые пресеты для выбранной валюты ввода */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', paddingTop: 2 }}>
          {QUICK[from].map(q => (
            <Pressable
              key={q.value}
              onPress={() => {
                tap();
                setRaw(String(q.value));
              }}
              style={{
                paddingVertical: 5,
                paddingHorizontal: 10,
                borderRadius: radius.pill,
                backgroundColor: c.bgSecondary,
                borderWidth: 1,
                borderColor: c.border,
              }}
            >
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textSecondary }}>
                {q.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* ─── 2. ПАНЕЛЬ НАПРАВЛЕНИЯ / SWAP ─── */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 4,
          marginVertical: -4,
        }}
      >
        <Pressable
          onPress={swap}
          hitSlop={8}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 6,
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: radius.pill,
            backgroundColor: c.accentGlow,
            borderWidth: 1,
            borderColor: c.accent,
          }}
        >
          <ArrowDownUp size={15} color={c.accent} />
          <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12, color: c.accent }}>
            Поменять местами
          </Text>
        </Pressable>

        <View
          style={{
            paddingVertical: 5,
            paddingHorizontal: 10,
            borderRadius: radius.pill,
            backgroundColor: c.bgSecondary,
            borderWidth: 1,
            borderColor: c.border,
          }}
        >
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.textSecondary }}>
            {rateText}
          </Text>
        </View>
      </View>

      {/* ─── 3. КАРТОЧКА РЕЗУЛЬТАТА: ВЫ ПОЛУЧАЕТЕ ─── */}
      <Card style={{ gap: space.sm, borderColor: c.accent }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: c.accent }} />
            <T v="label" style={{ color: c.accent }}>ВЫ ПОЛУЧАЕТЕ (РЕЗУЛЬТАТ)</T>
          </View>
          <T v="muted" style={{ fontSize: 12 }}>{toCur.name}</T>
        </View>

        {/* Чипы целевой валюты */}
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {CURRENCIES.map(x => (
            <Chip
              key={x.id}
              label={`${x.flag} ${x.id}`}
              active={to === x.id}
              onPress={() => selectTo(x.id)}
            />
          ))}
        </View>

        {/* Рассчитанный результат */}
        <View style={{ paddingVertical: 2 }}>
          <Text
            adjustsFontSizeToFit
            numberOfLines={1}
            style={{
              fontFamily: fonts.display,
              fontSize: 36,
              color: c.accent,
              fontVariant: ['tabular-nums'],
            }}
          >
            {money(mainResult, to)}
          </Text>
          {p2pResult != null && (
            <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: c.gold, marginTop: 2 }}>
              ⚡ Bybit P2P: ≈ {money(p2pResult, to)}
            </Text>
          )}
        </View>

        {/* В других валютах */}
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: c.border,
            paddingTop: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 6,
          }}
        >
          <T v="muted" style={{ fontSize: 11 }}>В других валютах:</T>
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {CURRENCIES.filter(x => x.id !== from && x.id !== to).map(x => (
              <Pressable
                key={x.id}
                onPress={() => selectTo(x.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  borderRadius: radius.sm,
                  backgroundColor: c.bgSecondary,
                  borderWidth: 1,
                  borderColor: c.border,
                }}
              >
                <Text style={{ fontSize: 12 }}>{x.flag}</Text>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>
                  {money(convert(amount, from, x.id, r), x.id)}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </Card>

      {/* ─── 4. ЦИФРОВАЯ КЛАВИАТУРА ─── */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {keys.map(k => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            onLongPress={k === '⌫' ? () => { tap(); setRaw('0'); } : undefined}
            style={({ pressed }) => ({
              width: '31.5%',
              flexGrow: 1,
              height: 54,
              borderRadius: radius.md,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: pressed ? c.bgCardHover : c.bgCard,
              borderWidth: 1,
              borderColor: c.border,
            })}
          >
            {k === '⌫' ? (
              <Delete size={22} color={c.textSecondary} />
            ) : (
              <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 21, color: c.textPrimary }}>
                {k}
              </Text>
            )}
          </Pressable>
        ))}
      </View>

      {/* ─── 5. P2P ИНФО-КАРТОЧКА ─── */}
      {(from === 'RUB' || from === 'VND' || to === 'RUB' || to === 'VND') && r.p2pVndRub ? (
        <Card style={{ backgroundColor: c.accentGlow, borderColor: 'transparent', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 15 }}>⚡</Text>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.accent }}>
              P2P курс Bybit для экспатов
            </Text>
          </View>
          <T v="muted" style={{ color: c.textSecondary, fontSize: 12, lineHeight: 17 }}>
            Реальный обмен рублей на донги через Bybit P2P: 1 ₽ ≈ {nf(r.p2pVndRub, 1)} ₫.
            При обмене {money(amount, from)} вы получите около{' '}
            <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>
              {money(p2pResult ?? mainResult, to)}
            </Text>.
          </T>
        </Card>
      ) : null}

      {/* ─── 6. ПАМЯТКА ПО КУПЮРАМ ВЬЕТНАМА ─── */}
      <Card style={{ gap: 8 }}>
        <T v="label" style={{ color: c.coral }}>Шпаргалка по купюрам Вьетнама</T>
        <View style={{ gap: 6 }}>
          {NOTES.map((n, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: n.color }} />
              <Text
                style={{
                  fontFamily: fonts.bodyBold,
                  fontSize: 13,
                  color: n.warning ? c.gold : c.textPrimary,
                  flex: 1,
                }}
              >
                {n.label}
              </Text>
            </View>
          ))}
        </View>
      </Card>

      {/* ─── 7. ВРЕМЯ ОБНОВЛЕНИЯ КУРСА ─── */}
      <T v="muted" style={{ textAlign: 'center', fontSize: 11 }}>
        {offline ? 'Офлайн — сохранённый курс · ' : 'Курс обновлён '}{timeAgo(updatedAt)}
      </T>
    </Screen>
  );
}
