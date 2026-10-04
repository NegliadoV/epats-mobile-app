import { Copy, Check, Zap, AlertTriangle } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Pressable, Text, TextInput, View, Alert } from 'react-native';
import * as Clipboard from 'expo-clipboard';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { nf } from '@/lib/format';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const EVN_TIERS = [
  { tier: 1, name: 'Bậc 1', range: '0 – 50 kWh', max: 50, rate: 1893 },
  { tier: 2, name: 'Bậc 2', range: '51 – 100 kWh', max: 50, rate: 1956 },
  { tier: 3, name: 'Bậc 3', range: '101 – 200 kWh', max: 100, rate: 2271 },
  { tier: 4, name: 'Bậc 4', range: '201 – 300 kWh', max: 100, rate: 2860 },
  { tier: 5, name: 'Bậc 5', range: '301 – 400 kWh', max: 100, rate: 3197 },
  { tier: 6, name: 'Bậc 6', range: 'от 401 kWh', max: Infinity, rate: 3302 },
];

const PRESETS = [3500, 3800, 4000, 4500, 5000];

export default function ElectricityCalculator() {
  const { c } = useTheme();
  const [prevMeter, setPrevMeter] = useState('1240');
  const [currMeter, setCurrMeter] = useState('1620');
  const [landlordRate, setLandlordRate] = useState<number>(4000);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const prev = Math.max(0, parseInt(prevMeter) || 0);
  const curr = Math.max(prev, parseInt(currMeter) || 0);
  const totalKwh = Math.max(0, curr - prev);

  const { subtotalEvn, vatEvn, totalEvn, avgEvnRate } = useMemo(() => {
    let rem = totalKwh;
    let sub = 0;
    for (const t of EVN_TIERS) {
      if (rem <= 0) break;
      const used = Math.min(rem, t.max);
      sub += used * t.rate;
      rem -= used;
    }
    const vat = Math.round(sub * 0.08); // 8% VAT
    const tot = sub + vat;
    const avg = totalKwh > 0 ? Math.round(tot / totalKwh) : 0;
    return { subtotalEvn: sub, vatEvn: vat, totalEvn: tot, avgEvnRate: avg };
  }, [totalKwh]);

  const landlordTotal = Math.round(totalKwh * landlordRate);
  const overpayVnd = landlordTotal - totalEvn;
  const overpayPct = totalEvn > 0 ? Math.round((overpayVnd / totalEvn) * 100) : 0;

  const landlordMessage = lang === 'vi'
    ? `Chào anh/chị chủ nhà,
Em xin gửi chỉ số điện tháng này:
• Chỉ số cũ: ${nf(prev)} kWh
• Chỉ số mới: ${nf(curr)} kWh
• Tiêu thụ: ${nf(totalKwh)} kWh

Theo biểu giá điện sinh hoạt 6 bậc chính thức của EVN (đã gồm 8% VAT):
👉 Tổng tiền điện EVN thực tế: ${nf(totalEvn)} ₫ (trung bình ~${nf(avgEvnRate)} ₫/kWh)
👉 Số tiền theo giá ${nf(landlordRate)} ₫/kWh: ${nf(landlordTotal)} ₫
(Khoản chênh lệch: +${nf(overpayVnd)} ₫)

Theo Nghị định 134/2013/NĐ-CP, người thuê trọ được áp dụng đúng biểu giá điện sinh hoạt của EVN. Em xin gửi để anh/chị đối chiếu hóa đơn từ Điện Lực. Em cảm ơn anh/chị!`
    : `Hello! Here is the electricity meter check for this month:
• Previous meter: ${nf(prev)} kWh
• Current meter: ${nf(curr)} kWh
• Total consumption: ${nf(totalKwh)} kWh

According to the official government EVN progressive 6-tier residential tariff (including 8% VAT):
👉 Official EVN bill: ${nf(totalEvn)} VND (average ~${nf(avgEvnRate)} VND/kWh)
👉 Flat bill at ${nf(landlordRate)} VND/kWh: ${nf(landlordTotal)} VND
(Difference / Overpayment: +${nf(overpayVnd)} VND)

Could we please align the payment with the actual official EVN invoice? Thank you!`;

  const copy = async () => {
    tap();
    await Clipboard.setStringAsync(landlordMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <Screen padTop={false}>
      <View style={{ gap: 6 }}>
        <T v="h1">Счёт за электричество</T>
        <T v="body">Калькулятор тарифов EVN и проверка переплаты лендлорду</T>
      </View>

      {/* Показания счётчика */}
      <Card accent style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Zap size={20} color={c.gold} />
          <T v="h3">Показания счётчика (кВт·ч)</T>
        </View>

        <View style={{ flexDirection: 'row', gap: space.md }}>
          <View style={{ flex: 1, gap: 4 }}>
            <T v="label">Прошлый месяц</T>
            <TextInput
              keyboardType="number-pad"
              value={prevMeter}
              onChangeText={setPrevMeter}
              placeholder="1240"
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor: c.bgSecondary,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: c.border,
                padding: 12,
                fontSize: 18,
                fontFamily: fonts.bodyHeavy,
                color: c.textPrimary,
              }}
            />
          </View>
          <View style={{ flex: 1, gap: 4 }}>
            <T v="label">Текущий месяц</T>
            <TextInput
              keyboardType="number-pad"
              value={currMeter}
              onChangeText={setCurrMeter}
              placeholder="1620"
              placeholderTextColor={c.textMuted}
              style={{
                backgroundColor: c.bgSecondary,
                borderRadius: radius.md,
                borderWidth: 1,
                borderColor: c.border,
                padding: 12,
                fontSize: 18,
                fontFamily: fonts.bodyHeavy,
                color: c.textPrimary,
              }}
            />
          </View>
        </View>

        <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: c.bgSecondary, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="body">Итого израсходовано:</T>
          <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.accent }}>{nf(totalKwh)} кВт·ч</Text>
        </View>
      </Card>

      {/* Тариф лендлорда */}
      <Card style={{ gap: space.md }}>
        <T v="h3">Тариф от хозяина жилья (₫ / кВт·ч)</T>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {PRESETS.map(rate => (
            <Chip
              key={rate}
              label={`${nf(rate)} ₫`}
              active={landlordRate === rate}
              onPress={() => setLandlordRate(rate)}
            />
          ))}
        </View>
      </Card>

      {/* Сравнение счетов */}
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <Card style={{ flex: 1, gap: 4, backgroundColor: c.accentGlow, borderColor: 'transparent' }}>
          <T v="label" style={{ color: c.accent }}>Гос. тариф EVN</T>
          <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 22, color: c.textPrimary }}>
            {nf(totalEvn)} ₫
          </Text>
          <T v="muted">~{nf(avgEvnRate)} ₫/кВт·ч с НДС</T>
        </Card>

        <Card style={{ flex: 1, gap: 4 }}>
          <T v="label">Счёт лендлорда</T>
          <Text adjustsFontSizeToFit numberOfLines={1} style={{ fontFamily: fonts.display, fontSize: 22, color: c.textPrimary }}>
            {nf(landlordTotal)} ₫
          </Text>
          <T v="muted">по {nf(landlordRate)} ₫/кВт·ч</T>
        </Card>
      </View>

      {/* Переплата */}
      {overpayVnd > 0 && (
        <Card style={{ gap: 8, borderColor: c.coral, backgroundColor: 'rgba(255,107,74,0.08)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <AlertTriangle size={20} color={c.coral} />
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.coral }}>
              Переплата: +{nf(overpayVnd)} ₫ (+{overpayPct}%)
            </Text>
          </View>
          <T v="body">
            В год вы переплачиваете около <Text style={{ color: c.textPrimary, fontFamily: fonts.bodyHeavy }}>{nf(overpayVnd * 12)} ₫</Text> (~{nf(Math.round((overpayVnd * 12) / 310))} ₽).
          </T>
        </Card>
      )}

      {/* Шаблон сообщения хозяину */}
      <Card style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="h3">Сообщение для хозяина</T>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            <Chip label="VI" active={lang === 'vi'} onPress={() => setLang('vi')} />
            <Chip label="EN" active={lang === 'en'} onPress={() => setLang('en')} />
          </View>
        </View>

        <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 13, lineHeight: 20, color: c.textSecondary }}>
            {landlordMessage}
          </Text>
        </View>

        <Pressable
          onPress={copy}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: copied ? c.accent : c.coral, borderRadius: radius.pill, paddingVertical: 12,
          }}
        >
          {copied ? <Check size={18} color="#fff" /> : <Copy size={18} color="#fff" />}
          <Text style={{ fontFamily: fonts.bodyHeavy, color: '#fff', fontSize: 14 }}>
            {copied ? 'Скопировано в буфер!' : 'Скопировать текст сообщения'}
          </Text>
        </Pressable>
      </Card>
    </Screen>
  );
}
