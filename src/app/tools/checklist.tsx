import AsyncStorage from '@react-native-async-storage/async-storage';
import { Check, CheckCircle2, Circle, AlertCircle, RotateCcw } from 'lucide-react-native';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { Pressable, Text, View, Alert } from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

const STORAGE_KEY = 'epats_checklist_checked_v1';

interface ChecklistItem {
  id: string;
  stage: string;
  title: string;
  detail: string;
  critical: boolean;
}

const CHECKLIST_ITEMS: ChecklistItem[] = [
  // До вылета
  { id: 'c1', stage: 'flight', title: 'Загранпаспорт от 6+ месяцев', detail: 'Строго не менее 180 дней со дня въезда во Вьетнам.', critical: true },
  { id: 'c2', stage: 'flight', title: 'E-Visa на 90 дней или обратный билет', detail: 'Для безвиза 45 дней авиакомпании требуют билет из Вьетнама.', critical: true },
  { id: 'c3', stage: 'flight', title: 'МВУ с открытой категорией А', detail: 'Международные права защищают от штрафов и проблем со страховкой.', critical: true },
  { id: 'c4', stage: 'flight', title: 'Нотариальная генеральная доверенность', detail: 'Оформить в РФ на близких до вылета (для банков, налоговой, почты).', critical: false },
  { id: 'c5', stage: 'flight', title: 'Новые доллары (2013+ года)', detail: 'Идеальные купюры $50 и $100 без надрывов, штампов и заломов.', critical: true },
  { id: 'c6', stage: 'flight', title: 'Аккаунт Bybit и KYC верификация', detail: 'Для покупки USDT с карт МИР/Т-Банк и вывода в наличный донг.', critical: true },
  { id: 'c7', stage: 'flight', title: 'Страховка с опцией «Мотобайк»', detail: 'Обычный туристический полис не покрывает падения со скутера.', critical: true },

  // Жилье и быт
  { id: 'c8', stage: 'housing', title: 'Отель на первые 3–5 дней', detail: 'Искать постоянное жилье нужно лично на месте, оценивая шум и плесень.', critical: false },
  { id: 'c9', stage: 'housing', title: 'Регистрация в полиции (Tạm trú)', detail: 'Обязан сделать хозяин отеля или квартиры в течение 24 часов.', critical: true },
  { id: 'c10', stage: 'housing', title: 'Проверка договора и тарифа на свет', detail: 'Уточнить тариф за кВт·ч (гос. тариф EVN ~2500₫, хозяева ставят 3500-4000₫).', critical: false },

  // Связь и финансы
  { id: 'c11', stage: 'daily', title: 'SIM-карта Viettel с безлимитным 4G/5G', detail: 'Купить в официальном салоне Viettel по паспорту (~150-200k ₫/мес).', critical: true },
  { id: 'c12', stage: 'daily', title: 'Приложение Grab (такси и доставка)', detail: 'Привязать наличную оплату или зарубежную карту.', critical: true },
  { id: 'c13', stage: 'daily', title: 'Аренда скутера с тест-драйвом', detail: 'Проверить тормоза, свет, шины, сфотографировать все царапины.', critical: false },
];

export default function Checklist() {
  const { c } = useTheme();
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [filter, setFilter] = useState<'all' | 'critical' | 'pending'>('all');

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then(raw => {
      if (raw) {
        try { setCheckedIds(JSON.parse(raw)); } catch {}
      }
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    tap();
    setCheckedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const resetAll = () => {
    Alert.alert('Сбросить прогресс?', 'Все отметки будут очищены', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Сбросить',
        style: 'destructive',
        onPress: () => {
          tap();
          setCheckedIds([]);
          AsyncStorage.removeItem(STORAGE_KEY);
        },
      },
    ]);
  };

  const total = CHECKLIST_ITEMS.length;
  const done = checkedIds.length;
  const pct = Math.round((done / total) * 100);

  const visibleList = useMemo(() => {
    return CHECKLIST_ITEMS.filter(it => {
      if (filter === 'critical') return it.critical;
      if (filter === 'pending') return !checkedIds.includes(it.id);
      return true;
    });
  }, [filter, checkedIds]);

  return (
    <Screen padTop={false}>
      <View style={{ gap: 6 }}>
        <T v="h1">Чеклист переезда</T>
        <T v="body">Пошаговый план подготовки к зимовке и релокации во Вьетнам</T>
      </View>

      {/* Прогресс бар карточка */}
      <Card accent style={{ gap: space.sm }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="label" style={{ color: c.coral }}>Готовность к переезду</T>
          <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 18, color: c.coral }}>{pct}%</Text>
        </View>

        <View style={{ height: 8, borderRadius: 4, backgroundColor: c.bgSecondary, overflow: 'hidden' }}>
          <View style={{ width: `${pct}%`, height: '100%', backgroundColor: c.coral, borderRadius: 4 }} />
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="muted">Выполнено: {done} из {total}</T>
          {done > 0 && (
            <Pressable onPress={resetAll} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <RotateCcw size={12} color={c.textMuted} />
              <T v="muted">Сброс</T>
            </Pressable>
          )}
        </View>
      </Card>

      {/* Фильтры */}
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Chip label="Все" active={filter === 'all'} onPress={() => setFilter('all')} />
        <Chip label="Критические ⚠️" active={filter === 'critical'} onPress={() => setFilter('critical')} />
        <Chip label="Осталось сделать" active={filter === 'pending'} onPress={() => setFilter('pending')} />
      </View>

      {/* Список пунктов */}
      <View style={{ gap: 10 }}>
        {visibleList.map(it => {
          const isDone = checkedIds.includes(it.id);
          return (
            <Card
              key={it.id}
              onPress={() => toggleItem(it.id)}
              style={{
                flexDirection: 'row', gap: space.md, alignItems: 'flex-start',
                opacity: isDone ? 0.65 : 1,
                borderColor: it.critical && !isDone ? c.coral : c.border,
              }}
            >
              <View style={{ marginTop: 2 }}>
                {isDone ? (
                  <CheckCircle2 size={24} color={c.accent} />
                ) : (
                  <Circle size={24} color={it.critical ? c.coral : c.textMuted} />
                )}
              </View>

              <View style={{ flex: 1, gap: 4 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  {it.critical && !isDone && (
                    <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 10, color: c.coral, textTransform: 'uppercase' }}>Важно</Text>
                  )}
                  <Text
                    style={{
                      fontFamily: fonts.bodyHeavy, fontSize: 15,
                      color: isDone ? c.textMuted : c.textPrimary,
                      textDecorationLine: isDone ? 'line-through' : 'none',
                    }}
                  >
                    {it.title}
                  </Text>
                </View>
                <T v="muted">{it.detail}</T>
              </View>
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
