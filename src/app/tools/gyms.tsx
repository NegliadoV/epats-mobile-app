import { Dumbbell, ExternalLink, Filter, MapPin, Snowflake, Waves, Users, DollarSign, Search } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { DANANG_GYMS, GYM_DISTRICTS, GymItem } from '@/data/danangData';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export default function GymsScreen() {
  const { c } = useTheme();
  const [district, setDistrict] = useState<string>('all');
  const [onlyStrongAc, setOnlyStrongAc] = useState(false);
  const [onlyPool, setOnlyPool] = useState(false);
  const [onlyGroup, setOnlyGroup] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return DANANG_GYMS.filter(g => {
      if (district !== 'all' && g.district !== district) return false;
      if (onlyStrongAc && g.hasAc !== 'strong') return false;
      if (onlyPool && !g.hasPool) return false;
      if (onlyGroup && !g.hasGroupClasses) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          g.name.toLowerCase().includes(q) ||
          g.districtName.toLowerCase().includes(q) ||
          g.summary.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [district, onlyStrongAc, onlyPool, onlyGroup, search]);

  const openMap = (url: string) => {
    tap();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen padTop={false}>
      {/* Шапка */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 24 }}>🏋️</Text>
          <T v="h1">Тренажерные залы</T>
        </View>
        <T v="body">
          12 залов Дананга: где реально работают кондиционеры, есть бассейны и адекватные цены.
        </T>
      </View>

      {/* Быстрая сводка */}
      <Card accent style={{ gap: 8 }}>
        <T v="label" style={{ color: c.accent }}>Топ рекомендации экспатов</T>
        <View style={{ gap: 4 }}>
          <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.textPrimary, lineHeight: 18 }}>
            ❄️ <Text style={{ fontFamily: fonts.bodyBold }}>Мощный холод:</Text> California, Elite, TA Galaxy
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.textPrimary, lineHeight: 18 }}>
            🏊 <Text style={{ fontFamily: fonts.bodyBold }}>С бассейном:</Text> TA Galaxy, Elite, California, My An
          </Text>
          <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.textPrimary, lineHeight: 18 }}>
            💰 <Text style={{ fontFamily: fonts.bodyBold }}>Супер-эконом:</Text> 38 Gym (~320k ₫), My An Sport
          </Text>
        </View>
      </Card>

      {/* Поиск */}
      <View style={{
        backgroundColor: c.bgSecondary, borderRadius: radius.md,
        borderWidth: 1, borderColor: c.border, paddingHorizontal: 12, paddingVertical: 8,
        flexDirection: 'row', alignItems: 'center', gap: 8,
      }}>
        <Search size={16} color={c.textMuted} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Поиск по залам (йога, бассейн, бокс)..."
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, color: c.textPrimary, fontFamily: fonts.body, fontSize: 14, padding: 0 }}
        />
      </View>

      {/* Фильтры районов */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {GYM_DISTRICTS.map(d => (
          <Chip
            key={d.id}
            label={d.label}
            active={district === d.id}
            onPress={() => { tap(); setDistrict(d.id); }}
          />
        ))}
      </ScrollView>

      {/* Быстрые фильтры */}
      <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
        <Pressable
          onPress={() => { tap(); setOnlyStrongAc(!onlyStrongAc); }}
          style={{
            paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
            backgroundColor: onlyStrongAc ? c.accentGlow : c.bgSecondary,
            borderWidth: 1, borderColor: onlyStrongAc ? c.accent : c.border,
          }}
        >
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, color: onlyStrongAc ? c.accent : c.textSecondary }}>
            ❄️ Сильный кондиционер
          </Text>
        </Pressable>

        <Pressable
          onPress={() => { tap(); setOnlyPool(!onlyPool); }}
          style={{
            paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
            backgroundColor: onlyPool ? c.accentGlow : c.bgSecondary,
            borderWidth: 1, borderColor: onlyPool ? c.accent : c.border,
          }}
        >
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, color: onlyPool ? c.accent : c.textSecondary }}>
            🏊 С бассейном
          </Text>
        </Pressable>

        <Pressable
          onPress={() => { tap(); setOnlyGroup(!onlyGroup); }}
          style={{
            paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
            backgroundColor: onlyGroup ? c.accentGlow : c.bgSecondary,
            borderWidth: 1, borderColor: onlyGroup ? c.accent : c.border,
          }}
        >
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11.5, color: onlyGroup ? c.accent : c.textSecondary }}>
            👯 Групповые
          </Text>
        </Pressable>
      </View>

      {/* Список залов */}
      <View style={{ gap: 12 }}>
        {filtered.map(g => {
          const acText =
            g.hasAc === 'strong' ? '❄️ Отличный кондиционер' :
            g.hasAc === 'partial' ? '🌤️ Кондиционер частично' :
            g.hasAc === 'fans' ? '💨 Вентиляторы' : '❌ Без кондиционера';
          const acColor = g.hasAc === 'strong' ? c.accent : g.hasAc === 'partial' ? '#f59e0b' : c.textMuted;

          return (
            <Card key={g.id} style={{ gap: 10 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.textMuted }}>
                    {g.districtName}
                  </Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.textPrimary, marginTop: 2 }}>
                    {g.name}
                  </Text>
                </View>
                <View style={{ backgroundColor: c.bgPrimary, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.accent }}>
                    {g.priceEstimate}
                  </Text>
                </View>
              </View>

              <T v="muted" style={{ fontSize: 12.5, lineHeight: 18 }}>
                {g.summary}
              </T>

              {/* Характеристики */}
              <View style={{ gap: 4 }}>
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: acColor }}>
                  {acText}
                </Text>
                {g.hasPool && (
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: '#38bdf8' }}>
                    🏊 Есть плавательный бассейн
                  </Text>
                )}
                {g.hasGroupClasses && (
                  <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12, color: '#a78bfa' }}>
                    👯 Групповые тренировки
                  </Text>
                )}
              </View>

              {/* Теги */}
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {g.features.map(f => (
                  <View key={f} style={{ paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}>
                    <Text style={{ fontFamily: fonts.body, fontSize: 10.5, color: c.textSecondary }}>{f}</Text>
                  </View>
                ))}
              </View>

              {/* Предупреждение */}
              {g.warning && (
                <View style={{ padding: 8, borderRadius: 6, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: '#fca5a5' }}>
                    ⚠️ {g.warning}
                  </Text>
                </View>
              )}

              {/* Кнопка карты */}
              <Pressable
                onPress={() => openMap(g.mapUrl)}
                style={{
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  paddingVertical: 10, borderRadius: radius.md, backgroundColor: c.accentGlow,
                  borderWidth: 1, borderColor: c.borderAccent, marginTop: 4,
                }}
              >
                <MapPin size={15} color={c.accent} />
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: c.accent }}>
                  Открыть в Google Maps
                </Text>
              </Pressable>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
