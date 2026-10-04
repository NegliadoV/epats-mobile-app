import { ArrowDownUp, Delete } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { convert, CURRENCIES, Cur, useRates } from '@/lib/data';
import { money, nf, timeAgo } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const QUICK: Record<Cur, number[]> = {
  VND: [50_000, 100_000, 500_000, 1_000_000, 5_000_000],
  RUB: [1_000, 5_000, 10_000, 50_000, 100_000],
  USD: [10, 50, 100, 500, 1_000],
  USDT: [10, 50, 100, 500, 1_000],
};

const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '000', '0', '⌫'];

export default function Converter() {
  const { c } = useTheme();
  const { data: r, updatedAt, offline } = useRates();
  const [from, setFrom] = useState<Cur>('VND');
  const [raw, setRaw] = useState('500000');
  const amount = Number(raw) || 0;
  const cur = CURRENCIES.find(x => x.id === from)!;

  const press = (k: string) => {
    tap();
    if (k === '⌫') return setRaw(s => s.slice(0, -1));
    setRaw(s => (s === '0' ? k.replace(/^0+/, '') || '0' : (s + k).slice(0, 12)));
  };

  // Быстрая смена направления: VND ⇄ RUB (самый частый сценарий)
  const swap = () => {
    tap();
    const to: Cur = from === 'VND' ? 'RUB' : 'VND';
    setRaw(String(Math.round(convert(amount, from, to, r))));
    setFrom(to);
  };

  return (
    <Screen padTop={false}>
      {/* Ввод */}
      <Card accent style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          {CURRENCIES.map(x => (
            <Chip key={x.id} label={`${x.flag} ${x.id}`} active={from === x.id} onPress={() => setFrom(x.id)} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View style={{ flex: 1 }}>
            <T v="label">{cur.name}</T>
            <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 38, color: c.textPrimary, fontVariant: ['tabular-nums'] }}>
              {nf(amount)} <Text style={{ color: c.coral }}>{cur.symbol}</Text>
            </Text>
          </View>
          <Pressable onPress={swap} hitSlop={8} style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: c.accentGlow, alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownUp size={20} color={c.accent} />
          </Pressable>
        </View>
        <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
          {QUICK[from].map(q => (
            <Pressable key={q} onPress={() => { tap(); setRaw(String(q)); }} style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: c.bgSecondary }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textSecondary }}>
                {q >= 1_000_000 ? `${q / 1_000_000}м` : q >= 1000 ? `${q / 1000}k` : q}
              </Text>
            </Pressable>
          ))}
        </View>
      </Card>

      {/* Результаты */}
      <View style={{ gap: 10 }}>
        {CURRENCIES.filter(x => x.id !== from).map(x => (
          <Card key={x.id} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 24, color: c.textPrimary }}>{x.flag}</Text>
              <View>
                <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 15 }}>{x.id}</Text>
                <T v="muted" style={{ fontSize: 11 }}>{x.name}</T>
              </View>
            </View>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 20, color: c.accent, fontVariant: ['tabular-nums'] }}>
              {money(convert(amount, from, x.id, r), x.id)}
            </Text>
          </Card>
        ))}
      </View>

      {from === 'RUB' || from === 'VND' ? (
        r.p2pVndRub ? (
          <Card style={{ backgroundColor: c.accentGlow, borderColor: 'transparent' }}>
            <T v="muted" style={{ color: c.textSecondary }}>
              💡 Через P2P (рубли → USDT → донги) реальный курс ≈ {nf(r.p2pVndRub, 1)} ₫ за 1 ₽
              {from === 'RUB' ? ` → ${money(amount * r.p2pVndRub, 'VND')}` : ` → ${money(amount / r.p2pVndRub, 'RUB')}`}
            </T>
          </Card>
        ) : null
      ) : null}

      {/* Цифровая клавиатура */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {KEYS.map(k => (
          <Pressable
            key={k}
            onPress={() => press(k)}
            onLongPress={k === '⌫' ? () => { tap(); setRaw(''); } : undefined}
            style={({ pressed }) => ({
              width: '31.5%', flexGrow: 1, height: 56, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center',
              backgroundColor: pressed ? c.bgCardHover : c.bgCard, borderWidth: 1, borderColor: c.border,
            })}
          >
            {k === '⌫'
              ? <Delete size={22} color={c.textSecondary} />
              : <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 22, color: c.textPrimary }}>{k}</Text>}
          </Pressable>
        ))}
      </View>

      <T v="muted" style={{ textAlign: 'center' }}>
        {offline ? 'Офлайн — используется последний сохранённый курс · ' : 'Курс '}{timeAgo(updatedAt)}
      </T>
    </Screen>
  );
}
