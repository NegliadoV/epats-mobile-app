import { Baby, ExternalLink, MapPin, Search, Sparkles, Clock } from 'lucide-react-native';
import { useState, useMemo } from 'react';
import { Linking, Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { DANANG_KIDS_PLACES, KIDS_CATEGORIES } from '@/data/danangData';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export default function KidsScreen() {
  const { c } = useTheme();
  const [category, setCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return DANANG_KIDS_PLACES.filter(item => {
      if (category !== 'all' && item.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.features.some(f => f.toLowerCase().includes(q))
        );
      }
      return true;
    });
  }, [category, search]);

  const openMap = (url?: string) => {
    if (!url) return;
    tap();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen padTop={false}>
      {/* Шапка */}
      <View style={{ gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ fontSize: 24 }}>🛝</Text>
          <T v="h1">Детский Дананг</T>
        </View>
        <T v="body">
          17 локаций для детей: площадки у моря, вечерние машинки, игровые комнаты с кондиционерами и пагоды.
        </T>
      </View>

      {/* Карточка Шоу Дракона */}
      <Card style={{ borderColor: '#f59e0b', backgroundColor: 'rgba(245, 158, 11, 0.08)', gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
            <Text style={{ fontSize: 22 }}>🐉</Text>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: '#f59e0b', flex: 1 }}>
              Шоу Моста Дракона (Cầu Rồng)
            </Text>
          </View>
          <View style={{ backgroundColor: '#f59e0b', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6, flexShrink: 0 }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 10, color: '#170e24' }}>СБ & ВС</Text>
          </View>
        </View>
        <Text style={{ fontFamily: fonts.body, fontSize: 12.5, color: c.textPrimary, lineHeight: 18 }}>
          Каждую субботу и воскресенье ровно в <Text style={{ fontFamily: fonts.bodyBold, color: '#f59e0b' }}>21:00</Text> дракон извергает огонь и воду! Приходите к 20:00 погулять по набережной и парку.
        </Text>
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
          placeholder="Поиск мест (машинки, животные, качели)..."
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, color: c.textPrimary, fontFamily: fonts.body, fontSize: 14, padding: 0 }}
        />
      </View>

      {/* Фильтры категорий */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {KIDS_CATEGORIES.map(cat => (
          <Chip
            key={cat.id}
            label={cat.label}
            active={category === cat.id}
            onPress={() => { tap(); setCategory(cat.id); }}
          />
        ))}
      </ScrollView>

      {/* Список мест */}
      <View style={{ gap: 12 }}>
        {filtered.map(item => (
          <Card key={item.id} style={{ gap: 10 }}>
            {/* Заголовок места: эмодзи + категория + название */}
            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ fontSize: 24, marginTop: 2 }}>{item.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.coral, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                  {item.categoryLabel}
                </Text>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.textPrimary, marginTop: 2, lineHeight: 22 }}>
                  {item.name}
                </Text>
              </View>
            </View>

            {/* Время посещения (отдельный бейдж с иконкой часов) */}
            {item.bestTime && (
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: c.bgSecondary,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: radius.sm,
                borderWidth: 1,
                borderColor: c.border,
                alignSelf: 'flex-start',
              }}>
                <Clock size={12} color="#f59e0b" />
                <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: '#f59e0b', flexShrink: 1 }}>
                  {item.bestTime}
                </Text>
              </View>
            )}

            <T v="muted" style={{ fontSize: 12.5, lineHeight: 18 }}>
              {item.desc}
            </T>

            {item.highlight && (
              <View style={{ paddingVertical: 6, paddingHorizontal: 10, borderRadius: radius.sm, backgroundColor: c.accentGlow }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.accent }}>
                  ✨ {item.highlight}
                </Text>
              </View>
            )}

            {/* Теги */}
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              {item.features.map(f => (
                <View key={f} style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.sm, backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.body, fontSize: 10.5, color: c.textSecondary }}>{f}</Text>
                </View>
              ))}
            </View>

            {/* Кнопка карты */}
            {item.mapUrl && (
              <Pressable
                onPress={() => openMap(item.mapUrl)}
                style={({ pressed }) => ({
                  flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                  paddingVertical: 10, borderRadius: radius.md, backgroundColor: pressed ? 'rgba(236,72,153,0.18)' : 'rgba(236,72,153,0.1)',
                  borderWidth: 1, borderColor: '#ec4899', marginTop: 4,
                })}
              >
                <MapPin size={15} color="#ec4899" />
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: '#ec4899' }}>
                  Открыть точку в Google Maps
                </Text>
              </Pressable>
            )}
          </Card>
        ))}
      </View>
    </Screen>
  );
}
