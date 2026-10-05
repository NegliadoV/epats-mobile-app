import { router } from 'expo-router';
import { Bell, CheckCircle2, Moon, Send, Sun, WifiOff, ShieldCheck, Sparkles } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';

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
import { formatWeatherDay, toDisplayDate } from '@/lib/dateUtils';

const CITY_ORDER = ['danang', 'nhatrang', 'hcm', 'hanoi', 'phuquoc'];
const CITY_NAMES: Record<string, string> = {
  danang: '🏖️ Дананг', nhatrang: '🌊 Нячанг', hcm: '🌆 Хошимин', hanoi: '🏛️ Ханой', phuquoc: '🏝️ Фукуок',
};

export default function Home() {
  const { c, theme, toggle } = useTheme();
  const rates = useRates();
  const history = useHistory();
  const weather = useWeather();
  const { user, settings, login, loginState, cancelLogin } = useAuth();
  const [city, setCity] = useState<string>(settings.city || 'danang');
  useEffect(() => { if (settings.city) setCity(settings.city); }, [settings.city]);

  const r = rates.data;
  const usdtVnd = Math.round(r.usdVnd * (r.usdtRub / r.usdRub));
  const pairs = [
    { key: 'usdRub', label: 'USD/RUB', value: `${r.usdRub.toFixed(1)} ₽` },
    { key: 'usdtRub', label: 'USDT/RUB', value: `${r.usdtRub.toFixed(1)} ₽` },
    { key: 'vnd1000Rub', label: '1000₫/RUB', value: `${r.vnd1000Rub.toFixed(2)} ₽` },
    { key: 'usdVnd', label: 'USD/VND', value: `${nf(r.usdVnd)} ₫` },
    { key: 'usdtVnd', label: 'USDT/VND', value: `${nf(usdtVnd)} ₫` },
  ] as const;

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
            </View>
          )}
        </Card>
      ) : (
        <Card style={{ gap: space.sm, borderColor: 'rgba(31,209,193,0.3)', backgroundColor: 'rgba(31,209,193,0.06)' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: 'rgba(31,209,193,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Bell size={18} color={c.accent} />
              </View>
              <View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.textPrimary }}>
                    Уведомления Telegram активны
                  </Text>
                  <CheckCircle2 size={14} color={c.accent} />
                </View>
                <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
                  @epatsiobot подключен · профиль {user.first_name}
                </Text>
              </View>
            </View>
            <Pressable onPress={() => router.push('/(tabs)/me')} hitSlop={8}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.accent }}>Настроить →</Text>
            </Pressable>
          </View>

          <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textSecondary, lineHeight: 16 }}>
            🔔 Бот отслеживает дедлайн визы ({settings.entry_date ? `въезд ${toDisplayDate(settings.entry_date)}` : 'укажи дату въезда в профиле'}) и штормовые алерты по городу {CITY_NAMES[city] || city}.
          </Text>
        </Card>
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
