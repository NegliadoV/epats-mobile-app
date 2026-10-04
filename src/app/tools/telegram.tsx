import { Send, CheckCircle2, ExternalLink } from 'lucide-react-native';
import { useState } from 'react';
import { Linking, Pressable, ScrollView, Text, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

interface ChatItem {
  name: string;
  type: string;
  members: string;
  link: string;
  verified: boolean;
}

interface CityGroup {
  city: string;
  emoji: string;
  groups: ChatItem[];
}

const CHATS: CityGroup[] = [
  {
    city: 'Дананг', emoji: '🏖️',
    groups: [
      { name: 'Дананг Экспаты RU', type: 'Взаимопомощь', members: '9k+', link: 'https://t.me/danang_expats_ru', verified: true },
      { name: 'Дананг Аренда жилья', type: 'Аренда', members: '6k+', link: 'https://t.me/danang_rent_ru', verified: true },
      { name: 'Дананг IT & Digital Nomads', type: 'Работа/IT', members: '4k+', link: 'https://t.me/danang_it_ru', verified: false },
      { name: 'Дананг VND/RUB обмен', type: 'Обмен валют', members: '3k+', link: 'https://t.me/danang_exchange', verified: true },
    ],
  },
  {
    city: 'Нячанг', emoji: '🌊',
    groups: [
      { name: 'Нячанг | Экспаты RU', type: 'Взаимопомощь', members: '12k+', link: 'https://t.me/nhatrang_expats_ru', verified: true },
      { name: 'Нячанг Аренда жилья RU', type: 'Аренда', members: '8k+', link: 'https://t.me/nhatrang_rent_ru', verified: true },
      { name: 'Нячанг Обмен VND/RUB', type: 'Обмен валют', members: '5k+', link: 'https://t.me/nhatrang_vnd_rub', verified: true },
      { name: 'Байки Нячанг без залога', type: 'Транспорт', members: '3k+', link: 'https://t.me/nhatrang_bikes', verified: false },
    ],
  },
  {
    city: 'Хошимин', emoji: '🌆',
    groups: [
      { name: 'Сайгон Русские', type: 'Взаимопомощь', members: '15k+', link: 'https://t.me/saigon_ru', verified: true },
      { name: 'Сайгон Аренда RU', type: 'Аренда', members: '10k+', link: 'https://t.me/hcm_rent_ru', verified: true },
      { name: 'HCM Бизнес RU', type: 'Бизнес', members: '5k+', link: 'https://t.me/hcm_business_ru', verified: false },
    ],
  },
  {
    city: 'Весь Вьетнам', emoji: '🇻🇳',
    groups: [
      { name: 'Вьетнам Россия | Визаран', type: 'Визы', members: '20k+', link: 'https://t.me/vietnam_vizarun', verified: true },
      { name: 'Вьетнам для россиян 2026', type: 'Общение', members: '30k+', link: 'https://t.me/vietnam_ru_2026', verified: true },
      { name: 'Русские во Вьетнаме | Медицина', type: 'Медицина', members: '8k+', link: 'https://t.me/vietnam_medicine_ru', verified: true },
      { name: '🪙 Официальный Bybit P2P (МИР/Сбер/Т-Банк ⇄ VND)', type: 'P2P', members: 'Топ-1', link: 'https://www.bybit.com/invite?ref=LPYKZQM', verified: true },
      { name: 'VND/RUB/USDT Вьетнам P2P', type: 'Криптообмен', members: '12k+', link: 'https://t.me/vietnam_p2p_ru', verified: true },
    ],
  },
];

export default function TelegramChats() {
  const { c } = useTheme();
  const [selectedCity, setSelectedCity] = useState<string>('Дананг');

  const current = CHATS.find(x => x.city === selectedCity) || CHATS[0];

  const openTg = (url: string) => {
    tap();
    Linking.openURL(url).catch(() => {});
  };

  return (
    <Screen padTop={false}>
      <View style={{ gap: 6 }}>
        <T v="h1">Чаты экспатов</T>
        <T v="body">Проверенные русскоязычные сообщества, аренда и помощь</T>
      </View>

      {/* Города чипы */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CHATS.map(cg => (
          <Chip
            key={cg.city}
            label={`${cg.emoji} ${cg.city}`}
            active={selectedCity === cg.city}
            onPress={() => setSelectedCity(cg.city)}
          />
        ))}
      </ScrollView>

      {/* Список чатов */}
      <View style={{ gap: 10 }}>
        {current.groups.map((g, i) => (
          <Card
            key={i}
            onPress={() => openTg(g.link)}
            style={{ flexDirection: 'row', alignItems: 'center', gap: space.md }}
          >
            <View
              style={{
                width: 44, height: 44, borderRadius: 22,
                backgroundColor: 'rgba(42,171,238,0.15)',
                alignItems: 'center', justifyContent: 'center',
              }}
            >
              <Send size={20} color={c.tg} />
            </View>

            <View style={{ flex: 1, gap: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.textPrimary, flexShrink: 1 }}>
                  {g.name}
                </Text>
                {g.verified && <CheckCircle2 size={15} color={c.accent} />}
              </View>

              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.coral, textTransform: 'uppercase' }}>
                  {g.type}
                </Text>
                <T v="muted">· {g.members} участников</T>
              </View>
            </View>

            <ExternalLink size={16} color={c.textMuted} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
