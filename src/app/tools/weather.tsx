import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Chip, Screen, Stat, T } from '@/components/ui';
import { CITY_NAMES, CITY_ORDER, useWeather } from '@/lib/data';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export default function WeatherScreen() {
  const { c } = useTheme();
  const { settings } = useAuth();
  const { data: weatherData, refreshing, refresh } = useWeather();
  const [city, setCity] = useState<string>(settings?.city || 'danang');

  useEffect(() => {
    if (settings?.city && CITY_ORDER.includes(settings.city)) {
      setCity(settings.city);
    }
  }, [settings?.city]);
  const w = weatherData?.cities?.[city];

  return (
    <Screen refreshing={refreshing} onRefresh={refresh} padTop={false}>
      {/* Переключатель городов */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CITY_ORDER.map((id: string) => (
          <Chip key={id} label={CITY_NAMES[id]} active={city === id} onPress={() => setCity(id)} />
        ))}
      </ScrollView>

      {/* Текущая погода */}
      {w ? (
        <Card accent style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View>
              <Text style={{ fontFamily: fonts.display, fontSize: 52, color: c.textPrimary }}>
                {Math.round(w.temp)}°
              </Text>
              <T v="body" style={{ color: c.textSecondary, marginTop: 4 }}>
                ощущается как <Text style={{ fontFamily: fonts.bodyHeavy, color: c.accent }}>{Math.round(w.feelsLike)}°</Text> · {w.condition}
              </T>
            </View>
            <Text style={{ fontSize: 60 }}>{w.emoji}</Text>
          </View>

          {/* Метрики */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Stat label="Ветер" value={`${Math.round(w.windSpeed)} км/ч`} />
            <Stat label="Влажность" value={`${w.humidity}%`} />
            {w.waveHeight != null && <Stat label="Волны" value={`${w.waveHeight} м`} />}
            {w.airQuality && (
              <Stat label="AQI" value={String(w.airQuality.aqi)} color={w.airQuality.color} />
            )}
          </View>
        </Card>
      ) : null}

      {/* Качество воздуха */}
      {w?.airQuality ? (
        <Card style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 20 }}>🍃</Text>
            <T v="h3">Качество воздуха (AQI)</T>
            <View style={{ paddingVertical: 2, paddingHorizontal: 8, borderRadius: radius.pill, backgroundColor: w.airQuality.color + '22' }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: w.airQuality.color, fontSize: 12 }}>
                {w.airQuality.aqi} · {w.airQuality.short}
              </Text>
            </View>
          </View>
          <T v="body">
            {w.airQuality.aqi <= 50 ? 'Воздух чистый и безопасный для прогулок и пробежек вдоль пляжа.' : 'Умеренный уровень взвешенных частиц. При долгих поездках на байке рекомендуется маска.'}
          </T>
        </Card>
      ) : null}

      {/* Прогноз на 7 дней */}
      {w?.daily && w.daily.length > 0 && (
        <Card style={{ gap: space.sm }}>
          <T v="label">Прогноз на неделю</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingTop: 4 }}>
            {w.daily.slice(0, 7).map(d => (
              <View
                key={d.date}
                style={{
                  alignItems: 'center',
                  gap: 4,
                  paddingVertical: 12,
                  paddingHorizontal: 12,
                  borderRadius: radius.md,
                  backgroundColor: c.bgSecondary,
                  minWidth: 64,
                }}
              >
                <T v="muted" style={{ fontSize: 11 }}>
                  {new Date(d.date).toLocaleDateString('ru-RU', { weekday: 'short' })}
                </T>
                <Text style={{ fontSize: 24 }}>{d.emoji}</Text>
                <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary, fontSize: 14 }}>
                  {Math.round(d.tempMax)}°
                </Text>
                <T v="muted" style={{ fontSize: 11 }}>{Math.round(d.tempMin)}°</T>
                {d.rainProb > 20 && (
                  <Text style={{ fontFamily: fonts.bodySemi, color: c.accent, fontSize: 10 }}>
                    {d.rainProb}%
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </Card>
      )}

      {/* Статус циклонов GDACS */}
      <Card style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 20 }}>🌀</Text>
          <T v="h3">Радар тайфунов (Biển Đông)</T>
        </View>
        <T v="body">
          По данным глобальной системы мониторинга катастроф GDACS (ООН/ЕС), вблизи побережья Вьетнама опасных тайфунов не зафиксировано.
        </T>
        <View style={{ padding: 12, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 6 }}>
          <T v="muted">🚨 Экстренные службы при наводнениях:</T>
          <Text style={{ fontFamily: fonts.bodyBold, color: c.accent }}>112 — Спасение и ЧС · 113 — Полиция · 115 — Скорая</Text>
        </View>
      </Card>
    </Screen>
  );
}
