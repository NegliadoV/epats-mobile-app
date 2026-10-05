import { useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card, Chip, Screen, T } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { NEIGHBORHOODS, NeighborhoodData } from '@/lib/neighborhoodsData';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const CITIES = [
  { id: 'all', label: 'Все города' },
  { id: 'danang', label: 'Дананг' },
  { id: 'nhatrang', label: 'Нячанг' },
  { id: 'hcm', label: 'Хошимин' },
  { id: 'hanoi', label: 'Ханой' },
  { id: 'phuquoc', label: 'Фукуок' },
];

export default function NeighborhoodsScreen() {
  const { c } = useTheme();
  const { settings } = useAuth();
  const [selectedCity, setSelectedCity] = useState(settings?.city || 'all');
  const [filterGen, setFilterGen] = useState(false);
  const [filterFiber, setFilterFiber] = useState(false);

  const filtered = NEIGHBORHOODS.filter(n => {
    if (selectedCity !== 'all' && n.cityId !== selectedCity) return false;
    if (filterGen && !n.hasGenerator) return false;
    if (filterFiber && !n.hasFiber) return false;
    return true;
  });

  return (
    <Screen padTop={false}>
      {/* Города */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CITIES.map(ct => (
          <Chip
            key={ct.id}
            label={ct.label}
            active={selectedCity === ct.id}
            onPress={() => setSelectedCity(ct.id)}
          />
        ))}
      </ScrollView>

      {/* Фильтры */}
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        <Chip
          label="⚡ Генератор"
          active={filterGen}
          onPress={() => setFilterGen(v => !v)}
        />
        <Chip
          label="🌐 FTTH Оптоволокно"
          active={filterFiber}
          onPress={() => setFilterFiber(v => !v)}
        />
      </View>

      {/* Список районов */}
      <View style={{ gap: space.md }}>
        {filtered.map(n => (
          <Card key={n.id} style={{ gap: space.sm }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <View style={{ flex: 1 }}>
                <T v="label">{n.cityName}</T>
                <T v="h3" style={{ marginTop: 2 }}>{n.shortName}</T>
              </View>
              <View style={{ paddingVertical: 3, paddingHorizontal: 8, borderRadius: radius.sm, backgroundColor: n.noiseColor + '22' }}>
                <Text style={{ fontFamily: fonts.bodyBold, color: n.noiseColor, fontSize: 11 }}>
                  {n.noiseLevel}
                </Text>
              </View>
            </View>

            <T v="muted">{n.vibe}</T>

            {/* Цены */}
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary }}>
                <T v="label">Студия</T>
                <Text style={{ fontFamily: fonts.bodyHeavy, color: c.accent, fontSize: 15, marginTop: 2 }}>
                  {n.studioPriceUsd}
                </Text>
              </View>
              <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary }}>
                <T v="label">2 спальни</T>
                <Text style={{ fontFamily: fonts.bodyHeavy, color: c.coral, fontSize: 15, marginTop: 2 }}>
                  {n.twoBedPriceUsd}
                </Text>
              </View>
            </View>

            {/* Особенности */}
            <View style={{ gap: 4, marginTop: 4 }}>
              <T v="body" style={{ fontSize: 13 }}>📍 Пляж: {n.beachProximity}</T>
              {n.hasGenerator && (
                <T v="muted" style={{ fontSize: 12 }}>⚡ {n.generatorDesc}</T>
              )}
              {n.hasFiber && (
                <T v="muted" style={{ fontSize: 12 }}>🌐 {n.fiberSpeed}</T>
              )}
            </View>

            {/* Плюсы */}
            <View style={{ marginTop: 4, gap: 2 }}>
              <Text style={{ fontFamily: fonts.bodyBold, color: c.accent, fontSize: 12 }}>Плюсы:</Text>
              {n.pros.slice(0, 2).map((p, idx) => (
                <T key={idx} v="muted" style={{ fontSize: 12 }}>• {p}</T>
              ))}
            </View>

            {/* Для кого */}
            <View style={{ marginTop: 6, padding: 10, borderRadius: radius.md, backgroundColor: c.accentGlow }}>
              <Text style={{ fontFamily: fonts.bodySemi, color: c.textPrimary, fontSize: 12 }}>
                🎯 <Text style={{ fontFamily: fonts.bodyBold }}>Кому подходит:</Text> {n.bestFor}
              </Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
