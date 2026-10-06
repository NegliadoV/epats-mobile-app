import { router } from 'expo-router';
import { Bell, CheckCircle2, Moon, Send, Sun, WifiOff, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState, useEffect, useMemo } from 'react';
import { Pressable, ScrollView, Text, View, TextInput } from 'react-native';

import { Sparkline } from '@/components/Sparkline';
import { Card, Chip, GradientButton, Screen, SectionTitle, T, tap } from '@/components/ui';
import BrandLogo from '@/components/BrandLogo';
import TropicalHeroScene from '@/components/TropicalHeroScene';
import TropicIcon from '@/components/TropicIcon';
import { iconForCategory } from '@/lib/tropicIconMap';
import { ARTICLES } from '@/data/articles';
import { useAuth } from '@/lib/auth';
import { useHistory, useRates, useWeather } from '@/lib/data';
import { nf, timeAgo } from '@/lib/format';
import { openTool, TOOLS } from '@/lib/tools';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';
import { formatWeatherDay, toDisplayDate, parseDateInput } from '@/lib/dateUtils';

const CITY_ORDER = ['danang', 'nhatrang', 'hcm', 'hanoi', 'phuquoc'];
const CITY_NAMES: Record<string, string> = {
  danang: '🏖️ Дананг', nhatrang: '🌊 Нячанг', hcm: '🌆 Хошимин', hanoi: '🏛️ Ханой', phuquoc: '🏝️ Фукуок',
};

export default function Home() {
  const { c, theme, toggle } = useTheme();
  const rates = useRates();
  const history = useHistory();
  const weather = useWeather();
  const { user, settings, login, loginDemo, loginState, cancelLogin } = useAuth();
  const [city, setCity] = useState<string>(settings.city || 'danang');
  useEffect(() => { if (settings.city) setCity(settings.city); }, [settings.city]);

  const r = rates.data;
  const pairs = [
    { key: 'usdRub', label: 'USD/RUB', value: `${r.usdRub.toFixed(1)} ₽` },
    { key: 'vnd1000Rub', label: '1000₫/RUB', value: `${r.vnd1000Rub.toFixed(2)} ₽` },
    { key: 'usdVnd', label: 'USD/VND', value: `${nf(r.usdVnd)} ₫` },
    { key: 'rubVnd', label: 'RUB/VND', value: `${nf(Math.round(r.usdVnd / r.usdRub))} ₫` },
  ] as const;

    // ─── Состояния для 4 ключевых инструментов авторизованного пользователя ───
  const [mobileConvMode, setMobileConvMode] = useState<'vnd_rub' | 'rub_vnd' | 'usd_vnd'>('vnd_rub');
  const [mobileConvAmt, setMobileConvAmt] = useState<string>('100000');

  const mobileConvResult = useMemo(() => {
    const val = parseFloat(mobileConvAmt.replace(/\s+/g, '')) || 0;
    const usdVnd = r.usdVnd || 25940;
    const vnd1000Rub = r.vnd1000Rub || 3.22;
    const rubToVnd = 1000 / vnd1000Rub;

    if (mobileConvMode === 'vnd_rub') {
      const inRub = (val / 1000) * vnd1000Rub;
      const inUsd = val / usdVnd;
      return {
        primary: `${Math.round(inRub).toLocaleString('ru-RU')} ₽`,
        secondary: `≈ ${inUsd.toFixed(2)}`,
        rateDesc: `1 000 ₫ = ${vnd1000Rub.toFixed(2)} ₽`,
      };
    } else if (mobileConvMode === 'rub_vnd') {
      const inVnd = Math.round(val * rubToVnd);
      const inUsd = val / (r.usdRub || 83.5);
      return {
        primary: `${nf(inVnd)} ₫`,
        secondary: `≈ ${inUsd.toFixed(2)}`,
        rateDesc: `1 ₽ ≈ ${Math.round(rubToVnd)} ₫`,
      };
    } else {
      const inVnd = Math.round(val * usdVnd);
      const inRub = val * (r.usdRub || 83.5);
      return {
        primary: `${nf(inVnd)} ₫`,
        secondary: `≈ ${Math.round(inRub).toLocaleString('ru-RU')} ₽`,
        rateDesc: `$1 = ${nf(usdVnd)} ₫`,
      };
    }
  }, [mobileConvMode, mobileConvAmt, r]);

  const visaData = useMemo(() => {
    if (!settings.entry_date) return null;
    const entry = parseDateInput(settings.entry_date);
    if (!entry || isNaN(entry.getTime())) return null;
    const totalDays = settings.visa_type === '45' ? 45 : settings.visa_type === 'phuquoc30' ? 30 : 90;
    const deadline = new Date(entry);
    deadline.setDate(deadline.getDate() + (totalDays - 1));
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const daysLeft = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    const daysSpent = Math.max(0, totalDays - daysLeft);
    const pct = Math.min(100, Math.max(0, Math.round((daysSpent / totalDays) * 100)));
    return {
      totalDays,
      daysLeft,
      pct,
      deadlineStr: toDisplayDate(deadline),
      entryStr: toDisplayDate(entry),
      statusColor: daysLeft < 0 ? '#ef4444' : daysLeft <= 7 ? '#ef4444' : daysLeft <= 14 ? '#f59e0b' : '#10b981',
      statusText: daysLeft < 0 ? 'Оверстей!' : daysLeft <= 7 ? 'Срочно на визаран!' : daysLeft <= 14 ? 'Пора готовить выезд' : 'Зелёная зона · Всё спокойно',
    };
  }, [settings.entry_date, settings.visa_type]);

  const w = weather.data?.cities?.[city];
  const featured = ARTICLES.filter(a => a.featured).slice(0, 4);

  const refreshAll = () => { rates.refresh(); history.refresh(); weather.refresh(); };

  return (
    <Screen refreshing={rates.refreshing} onRefresh={refreshAll}>
      {/* Шапка */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <BrandLogo size={32} />
          <Text style={{ fontFamily: fonts.display, fontSize: 20, color: c.textPrimary }}>
            epats<Text style={{ color: c.coral }}>.wiki</Text>
          </Text>
        </View>
        <Pressable
          onPress={() => { tap(); toggle(); }}
          hitSlop={10}
          style={{ width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center', backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}
        >
          {theme === 'dark' ? <Moon size={18} color={c.orchid} /> : <Sun size={18} color={c.gold} />}
        </Pressable>
      </View>

      <View style={{ gap: 6 }}>
        <T v="label" style={{ color: c.coral }}>Вьетнам для своих · 2026</T>
        <T v="h1">Курсы, погода и всё для жизни во Вьетнаме</T>
      </View>

      {/* ─── Быстрый скролл сервисов (влево-вправо) ─── */}
      <View style={{ gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <T v="label" style={{ color: c.accent, letterSpacing: 0.5 }}>⚡ Быстрый доступ к сервисам</T>
          <Pressable onPress={() => { tap(); router.push('/tools'); }}>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.coral }}>Все 11 сервисов →</Text>
          </Pressable>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ gap: 8, paddingVertical: 2 }}
        >
          {TOOLS.map(t => (
            <Pressable
              key={t.href}
              onPress={() => { tap(); openTool(t.href); }}
              style={({ pressed }) => ({
                flexDirection: 'row',
                alignItems: 'center',
                gap: 8,
                paddingVertical: 8,
                paddingHorizontal: 12,
                borderRadius: radius.pill,
                backgroundColor: pressed ? c.bgCardHover : c.bgSecondary,
                borderWidth: 1,
                borderColor: c.border,
              })}
            >
              <TropicIcon name={t.icon} size={22} />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, color: c.textPrimary }}>
                {t.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Тропическая ретро-иллюстрация */}
      <TropicalHeroScene
        cityId={city}
        waterTemp={w?.waterTemp ?? (w?.temp ? Math.round(w.temp) : 30)}
      />

      {/* Курсы */}
      <Card accent>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: space.md }}>
          <T v="h3">💹 Курсы валют</T>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            {rates.offline && <WifiOff size={13} color={c.textMuted} />}
            <T v="muted">{rates.offline ? 'офлайн · ' : ''}{timeAgo(rates.updatedAt)}</T>
          </View>
        </View>
        <View style={{ gap: 10 }}>
          {pairs.map(p => (
            <View key={p.key} style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T v="muted" style={{ width: 86, fontSize: 13 }}>{p.label}</T>
              {history.data?.series?.[p.key] && (
                <Sparkline id={`s-${p.key}`} data={history.data.series[p.key]} width={90} height={24} color={c.accent} />
              )}
              <T v="mono" style={{ minWidth: 92, textAlign: 'right' }}>{p.value}</T>
            </View>
          ))}
        </View>
        {r.p2pUsdtVnd && (
          <View style={{ marginTop: space.md, padding: space.md, borderRadius: radius.md, backgroundColor: c.accentGlow }}>
            <T v="muted" style={{ color: c.textSecondary }}>
              P2P Bybit: 1 USDT = <Text style={{ color: c.accent, fontFamily: fonts.bodyHeavy }}>{nf(r.p2pUsdtVnd)} ₫</Text>
              {r.p2pSpreadPct ? ` · спред ${r.p2pSpreadPct.toFixed(1)}%` : ''}
            </T>
          </View>
        )}
        <Pressable onPress={() => openTool('/tools/converter')} style={{ marginTop: space.md }}>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.coral, fontSize: 14 }}>Открыть конвертер →</Text>
        </Pressable>
      </Card>

      
      {/* ─── ПРЕИМУЩЕСТВА TELEGRAM И УВЕДОМЛЕНИЯ ─── */}
      {!user ? (
        <Card accent style={{ gap: space.md, borderWidth: 1.5, borderColor: 'rgba(42,171,238,0.4)', backgroundColor: 'rgba(42,171,238,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(42,171,238,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Send size={20} color={c.tg} />
              </View>
              <View>
                <T v="label" style={{ color: c.tg, letterSpacing: 0.5 }}>Вход через Telegram</T>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.textPrimary }}>
                  Зачем подключать Telegram?
                </Text>
              </View>
            </View>
            <View style={{ paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill, backgroundColor: 'rgba(42,171,238,0.18)' }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.tg }}>5 секунд</Text>
            </View>
          </View>

          <T v="body" style={{ color: c.textSecondary, fontSize: 13, lineHeight: 18 }}>
            Подключи бота <Text style={{ fontFamily: fonts.bodyHeavy, color: c.tg }}>@epatsiobot</Text> в один клик. Приложение синхронизирует профиль, а бот будет присылать критически важные уведомления:
          </T>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>🛂</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13.5, color: c.textPrimary }}>
                  Уведомления о дедлайне визы
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, lineHeight: 16 }}>
                  Напоминания в чат за 10, 5 и 3 дня до визарана. Без риска просрочки и штрафов ($50–$200+ на границе).
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>🌪️</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13.5, color: c.textPrimary }}>
                  Экстренные штормовые алерты
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, lineHeight: 16 }}>
                  Мгновенные предупреждения при приближении тайфуна, наводнения или шторма к твоему городу.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>☁️</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13.5, color: c.textPrimary }}>
                  Сквозная синхронизация без паролей
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, lineHeight: 16 }}>
                  Твой город, валюта, состав семьи и бюджет сохранены в Supabase и синхронизированы с мобилкой и сайтом.
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
              <Text style={{ fontSize: 20 }}>⭐</Text>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13.5, color: c.textPrimary }}>
                  Избранные статьи и чеклисты
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textMuted, lineHeight: 16 }}>
                  Сохраняй статьи, чеклист переезда и контакты чатов — всё доступно с любого устройства.
                </Text>
              </View>
            </View>
          </View>

          {loginState === 'waiting' ? (
            <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: 'rgba(42,171,238,0.12)', alignItems: 'center', gap: 6 }}>
              <Text style={{ fontFamily: fonts.bodyHeavy, color: c.tg, fontSize: 13 }}>
                ⏳ Подтвердите вход в Telegram
              </Text>
              <Text style={{ fontFamily: fonts.body, color: c.textSecondary, fontSize: 11, textAlign: 'center' }}>
                Нажмите «Start» или «Войти» в диалоге с @epatsiobot
              </Text>
              <Pressable onPress={cancelLogin} hitSlop={8}>
                <Text style={{ fontFamily: fonts.bodyBold, color: c.textMuted, fontSize: 12, marginTop: 4 }}>Отмена</Text>
              </Pressable>
            </View>
          ) : (
            <View style={{ gap: 6 }}>
              <GradientButton
                kind="tg"
                title="Войти через Telegram"
                icon={<Send size={18} color="#fff" />}
                onPress={login}
              />
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted, textAlign: 'center' }}>
                Без паролей и почты · Номер телефона остаётся скрытым
              </Text>
              <Pressable onPress={() => { tap(); loginDemo(); }} hitSlop={10} style={{ paddingVertical: 4 }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: c.accent, textAlign: 'center' }}>
                  ⚡ Войти в демо-профиль для теста (без Telegram) →
                </Text>
              </Pressable>
            </View>
          )}
        </Card>
      ) : (
        <>
          {/* ─── СЧЁТЧИК ВИЗЫ (Для авторизованных) ─── */}
          <Card accent style={{ gap: space.sm, borderColor: visaData ? (visaData.statusColor + '60') : c.border }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TropicIcon name="visa" size={28} />
                <View>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.textPrimary }}>
                    Счётчик дней визы
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
                    {visaData ? `Въезд ${visaData.entryStr} · ${visaData.totalDays} дней` : 'Контроль срока пребывания'}
                  </Text>
                </View>
              </View>
              {visaData && (
                <View style={{
                  paddingVertical: 3,
                  paddingHorizontal: 8,
                  borderRadius: radius.pill,
                  backgroundColor: visaData.statusColor + '20',
                  borderWidth: 1,
                  borderColor: visaData.statusColor + '50',
                }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: visaData.statusColor }}>
                    {visaData.statusText}
                  </Text>
                </View>
              )}
            </View>

            {visaData ? (
              <View style={{ gap: 8, marginTop: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 6 }}>
                  <Text style={{ fontFamily: fonts.display, fontSize: 36, color: visaData.statusColor }}>
                    {visaData.daysLeft >= 0 ? visaData.daysLeft : 0}
                  </Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.textSecondary }}>
                    {visaData.daysLeft >= 0 ? 'дней осталось' : 'дней оверстея!'}
                  </Text>
                </View>

                <Text style={{ fontFamily: fonts.body, fontSize: 13, color: c.textSecondary }}>
                  Выезд строго до <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>{visaData.deadlineStr}</Text>
                </Text>

                {/* Progress bar */}
                <View style={{ width: '100%', height: 6, borderRadius: 3, backgroundColor: c.bgSecondary, overflow: 'hidden' }}>
                  <View style={{ width: `${visaData.pct}%`, height: '100%', backgroundColor: visaData.statusColor, borderRadius: 3 }} />
                </View>
              </View>
            ) : (
              <View style={{ gap: 8, marginTop: 4 }}>
                <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.textSecondary, lineHeight: 17 }}>
                  Укажи дату въезда во Вьетнам, чтобы видеть оставшиеся дни и получать пуш-напоминания:
                </Text>
                <Pressable
                  onPress={() => { tap(); router.push('/(tabs)/me'); }}
                  style={{
                    paddingVertical: 8,
                    paddingHorizontal: 12,
                    borderRadius: radius.md,
                    backgroundColor: c.accentGlow,
                    borderWidth: 1,
                    borderColor: c.accent,
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, color: c.accent }}>
                    Указать дату въезда в профиле →
                  </Text>
                </Pressable>
              </View>
            )}

            <Pressable onPress={() => { tap(); openTool('/tools/visa'); }} style={{ marginTop: 4 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: c.coral, fontSize: 13 }}>
                Маршруты визарана и правила →
              </Text>
            </Pressable>
          </Card>

          {/* ─── БЫСТРЫЙ КОНВЕРТЕР (Для авторизованных) ─── */}
          <Card style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <TropicIcon name="converter" size={28} />
                <View>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.textPrimary }}>
                    Быстрый конвертер
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
                    {mobileConvResult.rateDesc}
                  </Text>
                </View>
              </View>

              {/* Mode pills */}
              <View style={{ flexDirection: 'row', gap: 4, backgroundColor: c.bgSecondary, padding: 3, borderRadius: radius.pill }}>
                {(['vnd_rub', 'rub_vnd', 'usd_vnd'] as const).map(mode => (
                  <Pressable
                    key={mode}
                    onPress={() => {
                      tap();
                      setMobileConvMode(mode);
                      if (mode === 'vnd_rub') setMobileConvAmt('100000');
                      else if (mode === 'rub_vnd') setMobileConvAmt('5000');
                      else setMobileConvAmt('100');
                    }}
                    style={{
                      paddingVertical: 3,
                      paddingHorizontal: 7,
                      borderRadius: radius.pill,
                      backgroundColor: mobileConvMode === mode ? c.orchid : 'transparent',
                    }}
                  >
                    <Text style={{
                      fontFamily: fonts.bodyBold,
                      fontSize: 10.5,
                      color: mobileConvMode === mode ? '#fff' : c.textMuted,
                    }}>
                      {mode === 'vnd_rub' ? '₫→₽' : mode === 'rub_vnd' ? '₽→₫' : '$→₫'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Input and result */}
            <View style={{ gap: 8, marginTop: 4 }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                backgroundColor: c.bgSecondary,
                borderRadius: radius.md,
                paddingHorizontal: 12,
                borderWidth: 1,
                borderColor: c.border,
              }}>
                <TextInput
                  value={mobileConvAmt}
                  onChangeText={t => setMobileConvAmt(t.replace(/[^0-9]/g, ''))}
                  keyboardType="numeric"
                  placeholder="Сумма..."
                  placeholderTextColor={c.textMuted}
                  style={{
                    flex: 1,
                    fontFamily: fonts.bodyBold,
                    fontSize: 16,
                    color: c.textPrimary,
                    paddingVertical: 8,
                  }}
                />
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.textMuted }}>
                  {mobileConvMode === 'vnd_rub' ? 'VND' : mobileConvMode === 'rub_vnd' ? 'RUB' : 'USD'}
                </Text>
              </View>

              {/* Preset chips */}
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
                {mobileConvMode === 'vnd_rub'
                  ? ['50000', '100000', '500000', '1000000'].map(amt => (
                      <Chip
                        key={amt}
                        label={amt === '50000' ? '50к ₫' : amt === '100000' ? '100к ₫' : amt === '500000' ? '500к ₫' : '1 млн ₫'}
                        active={mobileConvAmt === amt}
                        onPress={() => setMobileConvAmt(amt)}
                      />
                    ))
                  : mobileConvMode === 'rub_vnd'
                  ? ['1000', '3000', '5000', '10000'].map(amt => (
                      <Chip key={amt} label={`${amt} ₽`} active={mobileConvAmt === amt} onPress={() => setMobileConvAmt(amt)} />
                    ))
                  : ['50', '100', '300', '1000'].map(amt => (
                      <Chip key={amt} label={`${amt}`} active={mobileConvAmt === amt} onPress={() => setMobileConvAmt(amt)} />
                    ))}
              </ScrollView>

              {/* Output result */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                padding: 10,
                borderRadius: radius.md,
                backgroundColor: c.bgSecondary,
                marginTop: 2,
              }}>
                <View>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>Результат:</Text>
                  <Text style={{ fontFamily: fonts.display, fontSize: 22, color: c.orchid }}>
                    {mobileConvResult.primary}
                  </Text>
                </View>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: c.textSecondary }}>
                  {mobileConvResult.secondary}
                </Text>
              </View>
            </View>

            <Pressable onPress={() => { tap(); openTool('/tools/converter'); }} style={{ marginTop: 4 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: c.orchid, fontSize: 13 }}>
                Полный калькулятор цен →
              </Text>
            </Pressable>
          </Card>
        </>
      )}

      {/* Погода */}
      <SectionTitle title="Погода" action="Радар" onAction={() => openTool('/tools/weather')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CITY_ORDER.map(id => {
          return <Chip key={id} label={CITY_NAMES[id]} active={city === id} onPress={() => setCity(id)} />;
        })}
      </ScrollView>
      <Card>
        {w ? (
          <View style={{ gap: space.md }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <View>
                <Text style={{ fontFamily: fonts.display, fontSize: 44, color: c.textPrimary }}>{Math.round(w.temp)}°</Text>
                <T v="muted">ощущается как {Math.round(w.feelsLike)}° · {w.condition}</T>
              </View>
              <Text style={{ fontSize: 56 }}>{w.emoji}</Text>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Stat label="Ветер" value={`${Math.round(w.windSpeed)} км/ч`} />
              <Stat label="Влажность" value={`${w.humidity}%`} />
              {w.waveHeight != null && <Stat label="Волны" value={`${w.waveHeight} м`} />}
              {w.airQuality && <Stat label="AQI" value={String(w.airQuality.aqi)} color={w.airQuality.color} />}
            </View>
            {w.daily?.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {w.daily.slice(0, 7).map(d => (
                  <View key={d.date} style={{ alignItems: 'center', gap: 2, paddingVertical: 8, paddingHorizontal: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary }}>
                    <T v="muted" style={{ fontSize: 11 }}>{formatWeatherDay(d.date)}</T>
                    <Text style={{ fontSize: 20 }}>{d.emoji}</Text>
                    <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 13 }}>{Math.round(d.tempMax)}°</Text>
                    <T v="muted" style={{ fontSize: 11 }}>{Math.round(d.tempMin)}°</T>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        ) : (
          <T v="muted">{weather.offline ? 'Нет связи — погода появится, когда вернётся интернет' : 'Загружаем погоду…'}</T>
        )}
      </Card>

      {/* Инструменты */}
      <SectionTitle title="Инструменты" action="Все" onAction={() => router.push('/tools')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TOOLS.map(t => (
          <Card key={t.href} onPress={() => openTool(t.href)} style={{ width: '31%', flexGrow: 1, padding: space.md, alignItems: 'flex-start', gap: 8 }}>
            <TropicIcon name={t.icon} size={36} />
            <Text numberOfLines={2} style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, color: c.textPrimary }}>{t.name}</Text>
          </Card>
        ))}
      </View>

      {/* Статьи */}
      <SectionTitle title="Главное почитать" action="Все статьи" onAction={() => router.push('/articles')} />
      {featured.map(a => (
        <Card key={a.slug} onPress={() => router.push(`/article/${a.slug}`)} style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
          <TropicIcon name={iconForCategory(a.categorySlug)} size={42} />
          <View style={{ flex: 1, gap: 4 }}>
            <T v="h3" numberOfLines={2} style={{ fontSize: 15 }}>{a.title}</T>
            <T v="muted">{a.category} · {a.readTime} мин</T>
          </View>
        </Card>
      ))}
    </Screen>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  const { c } = useTheme();
  return (
    <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 2 }}>
      <T v="muted" style={{ fontSize: 11 }}>{label}</T>
      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: color ?? c.textPrimary }}>{value}</Text>
    </View>
  );
}
