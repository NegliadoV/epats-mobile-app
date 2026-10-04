import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card, Chip, Screen, T } from '@/components/ui';
import { ARTICLES, CATEGORIES } from '@shared/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, space } from '@/theme/tokens';

export default function ArticlesScreen() {
  const { c } = useTheme();
  const [cat, setCat] = useState<string | null>(null);
  const list = useMemo(() => (cat ? ARTICLES.filter(a => a.categorySlug === cat) : ARTICLES), [cat]);

  return (
    <Screen>
      <View style={{ gap: 6 }}>
        <T v="h1">Статьи и гайды</T>
        <T v="body">{ARTICLES.length} материалов — работают и без интернета</T>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }} style={{ marginHorizontal: -space.lg }}>
        <View style={{ width: space.lg - 8 }} />
        <Chip label="Все" active={!cat} onPress={() => setCat(null)} />
        {CATEGORIES.map(k => (
          <Chip key={k.slug} label={`${k.emoji} ${k.name}`} active={cat === k.slug} onPress={() => setCat(k.slug)} />
        ))}
        <View style={{ width: space.lg - 8 }} />
      </ScrollView>

      {list.map(a => (
        <Card key={a.slug} onPress={() => router.push(`/article/${a.slug}`)} style={{ gap: 8 }}>
          <View style={{ flexDirection: 'row', gap: space.md, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 30 }}>{a.emoji}</Text>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: c.coral, textTransform: 'uppercase', letterSpacing: 0.5 }}>{a.category}</Text>
              <T v="h3" style={{ fontSize: 15.5 }}>{a.title}</T>
            </View>
          </View>
          <T v="body" numberOfLines={3} style={{ fontSize: 14 }}>{a.excerpt}</T>
          <T v="muted">⏱ {a.readTime} мин чтения</T>
        </Card>
      ))}
    </Screen>
  );
}
