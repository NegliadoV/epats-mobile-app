import { Check, X, ShieldAlert, Star, DollarSign } from 'lucide-react-native';
import { useState, useEffect } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const CITIES = [
  {
    id: 'danang', name: 'Дананг', flag: '🏖️', region: 'Центральный Вьетнам',
    tagline: 'Идеальный баланс моря, цен и чистоты',
    description: 'Чистый городской пляж Ми Кхе протяженностью 30 км. Сильное IT-сообщество, коворкинги, современная европейская застройка. Прохладнее, чем на юге.',
    pros: ['Чистый воздух и вода', 'Пляж в черте города', 'Много IT-специалистов', 'Адекватные цены на аренду', 'Безопасность'],
    cons: ['Сезон тайфунов (октябрь-ноябрь)', 'Меньше ночной жизни', 'Меньше русского сервиса, чем в Нячанге'],
    typhoonSeason: 'Октябрь – Ноябрь (высокий риск)',
    typhoonRiskColor: '#ef4444',
    rating: { price: 4, sea: 5, internet: 5, vibe: 5, eco: 5 },
    budget: { min: '$600', comfort: '$1 200', premium: '$2 500+' },
    bestFor: ['Семьи', 'Digital Nomads', 'Любители спорта и пляжа'],
  },
  {
    id: 'nhatrang', name: 'Нячанг', flag: '🌊', region: 'Южный Вьетнам',
    tagline: 'Главная столица русскоязычных экспатов',
    description: 'Самая большая русскоязычная диаспора во Вьетнаме. Русские рестораны, врачи, сервис на русском языке, развитая инфраструктура для семей с детьми.',
    pros: ['Огромная русская диаспора', 'Развитая P2P инфраструктура', 'Дешевле Дананга', 'Много кружков и детсадов'],
    cons: ['Много шумных туристов', 'Море у набережной бывает мутным', 'Смог на центральных улицах'],
    typhoonSeason: 'Ноябрь – Декабрь (низкий риск, дожди)',
    typhoonRiskColor: '#1fd1c1',
    rating: { price: 5, sea: 4, internet: 4, vibe: 4, eco: 3 },
    budget: { min: '$500', comfort: '$1 000', premium: '$2 000+' },
    bestFor: ['Новички', 'Семьи с детьми', 'Любители русской кухни'],
  },
  {
    id: 'hcm', name: 'Хошимин', flag: '🌆', region: 'Южный мегаполис (Сайгон)',
    tagline: 'Финансовый центр и стартап-хаб',
    description: 'Огромный динамичный мегаполис на 10+ млн жителей. Международные компании, лучшие клиники, насыщенная ночная жизнь и гастрономия мирового уровня.',
    pros: ['Максимум возможностей и работы', 'Лучший интернет и сервисы', 'Аэропорт с рейсами по всему миру', 'Круглосуточный город'],
    cons: ['Нет моря и пляжей', 'Плотный трафик и пробки', 'Высокие цены на аренду', 'Жарко круглый год'],
    typhoonSeason: 'Вне зоны тайфунов (0% риска)',
    typhoonRiskColor: '#1fd1c1',
    rating: { price: 3, sea: 1, internet: 5, vibe: 5, eco: 2 },
    budget: { min: '$800', comfort: '$1 700', premium: '$3 500+' },
    bestFor: ['Бизнес', 'IT-карьера', 'Любители ритма мегаполиса'],
  },
  {
    id: 'hanoi', name: 'Ханой', flag: '🏛️', region: 'Северная столица',
    tagline: 'Древняя культура, озёра и кофе',
    description: 'Столица Вьетнама с тысячелетней историей. Аутентичные старинные кварталы, культурные центры, прохладная зима (+12…+16°C).',
    pros: ['Невероятная атмосфера и культура', 'Уникальная гастрономия', 'Прохладная зима без изнуряющей жары'],
    cons: ['Зимой промозгло (нет отопления)', 'Смог и пыль в центре', 'Нет моря'],
    typhoonSeason: 'Июль – Сентябрь (умеренный риск)',
    typhoonRiskColor: '#f59e0b',
    rating: { price: 3, sea: 1, internet: 5, vibe: 4, eco: 3 },
    budget: { min: '$700', comfort: '$1 300', premium: '$2 800+' },
    bestFor: ['Творческие люди', 'Любители истории', 'Те, кто не переносит жару'],
  },
  {
    id: 'phuquoc', name: 'Фукуок', flag: '🏝️', region: 'Тропический остров',
    tagline: 'Белые пляжи и безвиз на 30 дней',
    description: 'Самый большой остров Вьетнама в Сиамском заливе. Бирюзовая вода, закаты на пляжах, морепродукты. Безвиз 30 дней для всех иностранцев.',
    pros: ['Лучшие тропические пляжи', 'Особый безвиз 30 дней', 'Спокойная расслабленная атмосфера'],
    cons: ['Дороже материка', 'Меньше выбора жилья на долгий срок', 'Медицина слабее материковой'],
    typhoonSeason: 'Вне зоны тайфунов (редкие дожди)',
    typhoonRiskColor: '#1fd1c1',
    rating: { price: 2, sea: 5, internet: 3, vibe: 3, eco: 5 },
    budget: { min: '$800', comfort: '$1 500', premium: '$3 000+' },
    bestFor: ['Перезагрузка', 'Зимовка у моря', 'Удаленщики'],
  },
];

export default function CitiesComparison() {
  const { c } = useTheme();
  const { settings } = useAuth();
  const [cityId, setCityId] = useState<string>(settings?.city || 'danang');

  useEffect(() => {
    if (settings?.city) setCityId(settings.city);
  }, [settings?.city]);

  const city = CITIES.find(x => x.id === cityId) || CITIES[0];

  return (
    <Screen padTop={false}>
      <View style={{ gap: 6 }}>
        <T v="h1">Сравнение городов</T>
        <T v="body">Где лучше жить во Вьетнаме: климат, море, цены и комьюнити</T>
      </View>

      {/* Выбор города */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {CITIES.map(ct => (
          <Chip
            key={ct.id}
            label={`${ct.flag} ${ct.name}`}
            active={cityId === ct.id}
            onPress={() => setCityId(ct.id)}
          />
        ))}
      </ScrollView>

      {/* Главная карточка города */}
      <Card accent style={{ gap: space.md }}>
        <View style={{ gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontSize: 32 }}>{city.flag}</Text>
            <View>
              <T v="h2">{city.name}</T>
              <T v="muted">{city.region}</T>
            </View>
          </View>
          <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 16, color: c.coral, marginTop: 4 }}>
            {city.tagline}
          </Text>
        </View>

        <T v="body">{city.description}</T>

        {/* Теги кому подходит */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {city.bestFor.map((b, i) => (
            <View key={i} style={{ backgroundColor: c.accentGlow, paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.accent }}>{b}</Text>
            </View>
          ))}
        </View>
      </Card>

      {/* Бюджет на жизнь */}
      <Card style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <DollarSign size={18} color={c.gold} />
          <T v="h3">Бюджет в месяц (на одного)</T>
        </View>

        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 2 }}>
            <T v="muted" style={{ fontSize: 11 }}>Эконом</T>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.textPrimary }}>{city.budget.min}</Text>
          </View>
          <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.accentGlow, gap: 2 }}>
            <T v="muted" style={{ fontSize: 11, color: c.accent }}>Комфорт</T>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.accent }}>{city.budget.comfort}</Text>
          </View>
          <View style={{ flex: 1, padding: 10, borderRadius: radius.md, backgroundColor: c.bgSecondary, gap: 2 }}>
            <T v="muted" style={{ fontSize: 11 }}>Люкс</T>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 15, color: c.textPrimary }}>{city.budget.premium}</Text>
          </View>
        </View>
      </Card>

      {/* Рейтинг по факторам */}
      <Card style={{ gap: space.sm }}>
        <T v="h3">Рейтинг факторов</T>
        {[
          { label: 'Море и пляж', score: city.rating.sea },
          { label: 'Доступность цен', score: city.rating.price },
          { label: 'Интернет и коворкинги', score: city.rating.internet },
          { label: 'Атмосфера и комьюнити', score: city.rating.vibe },
          { label: 'Чистота воздуха и экология', score: city.rating.eco },
        ].map((f, i) => (
          <View key={i} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <T v="body" style={{ fontSize: 13.5 }}>{f.label}</T>
            <View style={{ flexDirection: 'row', gap: 2 }}>
              {[1, 2, 3, 4, 5].map(st => (
                <Star
                  key={st}
                  size={14}
                  color={st <= f.score ? c.gold : c.border}
                  fill={st <= f.score ? c.gold : 'transparent'}
                />
              ))}
            </View>
          </View>
        ))}
      </Card>

      {/* Тайфуны предупреждение */}
      <Card style={{ gap: 6, borderColor: city.typhoonRiskColor, backgroundColor: `${city.typhoonRiskColor}10` }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={18} color={city.typhoonRiskColor} />
          <T v="label" style={{ color: city.typhoonRiskColor }}>Сезон тайфунов</T>
        </View>
        <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.textPrimary }}>
          {city.typhoonSeason}
        </Text>
      </Card>

      {/* Плюсы и минусы */}
      <View style={{ gap: space.sm }}>
        <Card style={{ gap: space.sm }}>
          <T v="h3" style={{ color: c.accent }}>Плюсы города</T>
          {city.pros.map((p, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Check size={16} color={c.accent} />
              <T v="body" style={{ fontSize: 14 }}>{p}</T>
            </View>
          ))}
        </Card>

        <Card style={{ gap: space.sm }}>
          <T v="h3" style={{ color: c.coral }}>Минусы и нюансы</T>
          {city.cons.map((cn, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <X size={16} color={c.coral} />
              <T v="body" style={{ fontSize: 14 }}>{cn}</T>
            </View>
          ))}
        </Card>
      </View>
    </Screen>
  );
}
