import { Stack, useLocalSearchParams } from 'expo-router';
import { Bookmark, Share2 } from 'lucide-react-native';
import { Pressable, Share, Text, View } from 'react-native';

import { Markdown } from '@/components/Markdown';
import TropicIcon from '@/components/TropicIcon';
import { iconForCategory } from '@/lib/tropicIconMap';
import { Screen, T, tap } from '@/components/ui';
import { WEB_BASE } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { getArticleBySlug } from '@/data/articles';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, space } from '@/theme/tokens';

export default function ArticleScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { c } = useTheme();
  const { isFavorite, toggleFavorite } = useAuth();
  const a = getArticleBySlug(slug);

  if (!a) {
    return <Screen padTop={false}><T v="h2">Статья не найдена</T></Screen>;
  }

  const url = `${WEB_BASE}/article/${a.slug}`;
  const favorited = isFavorite(a.slug);

  const handleToggleFav = () => {
    tap();
    toggleFavorite(a.slug);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <Pressable hitSlop={10} onPress={handleToggleFav}>
                <Bookmark
                  size={20}
                  color={favorited ? c.coral : c.textPrimary}
                  fill={favorited ? c.coral : 'transparent'}
                />
              </Pressable>
              <Pressable hitSlop={10} onPress={() => Share.share({ message: `${a.title}\n${url}`, url })}>
                <Share2 size={20} color={c.textPrimary} />
              </Pressable>
            </View>
          ),
        }}
      />
      <Screen padTop={false}>
        <View style={{ gap: space.sm }}>
          <TropicIcon name={iconForCategory(a.categorySlug)} size={52} />
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.coral, textTransform: 'uppercase', letterSpacing: 0.6 }}>
            {a.category} · {a.readTime} мин
          </Text>
          <T v="h1" style={{ fontSize: 24, lineHeight: 31 }}>{a.title}</T>
          <T v="body" style={{ color: c.textMuted }}>{a.excerpt}</T>
        </View>
        <View style={{ height: 1, backgroundColor: c.border }} />
        <Markdown source={a.content} />
      </Screen>
    </>
  );
}
