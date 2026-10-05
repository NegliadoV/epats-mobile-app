import { router } from 'expo-router';
import { Search, X } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, Text, TextInput, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import BrandLogo from '@/components/BrandLogo';
import TropicIcon from '@/components/TropicIcon';
import { iconForCategory } from '@/lib/tropicIconMap';
import { ARTICLES, CATEGORIES } from '@shared/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

export default function ArticlesScreen() {
  const { c } = useTheme();
  const [cat, setCat] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const list = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchCat = !cat || a.categorySlug === cat;
      const q = query.trim().toLowerCase();
      const matchQuery =
        !q ||
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [cat, query]);

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <BrandLogo size={28} />
        <Text style={{ fontFamily: fonts.display, fontSize: 18, color: c.textPrimary }}>
          epats<Text style={{ color: c.coral }}>.io</Text>
        </Text>
      </View>
      <View style={{ gap: 6 }}>
        <T v="h1">Статьи и гайды</T>
        <T v="body">{ARTICLES.length} материалов — работают и без интернета</T>
      </View>

      {/* Поиск */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: c.bgSecondary,
          borderRadius: radius.md,
          borderWidth: 1,
          borderColor: c.border,
          paddingHorizontal: 12,
          height: 44,
          gap: 8,
        }}
      >
        <Search size={18} color={c.textMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Поиск по статьям и темам…"
          placeholderTextColor={c.textMuted}
          style={{ flex: 1, fontSize: 14, color: c.textPrimary, fontFamily: fonts.body, paddingVertical: 0 }}
        />
        {query.length > 0 && (
          <Pressable onPress={() => { tap(); setQuery(''); }} hitSlop={8}>
            <X size={16} color={c.textMuted} />
          </Pressable>
        )}
      </View>

      {/* Категории */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -space.lg }}>
        <View style={{ width: space.lg - 8 }} />
        <Chip label="Все" active={!cat} onPress={() => { tap(); setCat(null); }} />
        {CATEGORIES.map(k => (
          <Chip key={k.slug} label={`${k.emoji} ${k.name}`} active={cat === k.slug} onPress={() => { tap(); setCat(k.slug); }} />
        ))}
        <View style={{ width: space.lg - 8 }} />
      </ScrollView>

      {list.length === 0 ? (
        <Card style={{ alignItems: 'center', paddingVertical: space.xl, gap: 8 }}>
          <Text style={{ fontSize: 36 }}>🔍</Text>
          <T v="h3">Ничего не найдено</T>
          <T v="muted" style={{ textAlign: 'center' }}>Попробуйте изменить запрос или сбросить фильтр категорий</T>
        </Card>
      ) : (
        list.map(a => (
          <Card key={a.slug} onPress={() => router.push(`/article/${a.slug}`)} style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'center' }}>
              <TropicIcon name={iconForCategory(a.categorySlug)} size={42} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: c.coral, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.category}</Text>
                <T v="h3" style={{ fontSize: 15.5 }}>{a.title}</T>
              </View>
            </View>
            <T v="body" numberOfLines={3} style={{ fontSize: 14 }}>{a.excerpt}</T>
            <T v="muted">⏱ {a.readTime} мин чтения</T>
          </Card>
        ))
      )}
    </Screen>
  );
}
