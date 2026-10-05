import * as Clipboard from 'expo-clipboard';
import * as WebBrowser from 'expo-web-browser';
import {
  Calendar, Check, ChevronDown, ChevronRight, Copy, ExternalLink,
  Info, MapPin, ShieldAlert, Sparkles, AlertTriangle, ArrowRight,
  Clock, DollarSign, FileText, CheckCircle2, AlertCircle, Bell
} from 'lucide-react-native';
import { useState, useMemo } from 'react';
import {
  Platform, Pressable, ScrollView, StyleSheet, Text,
  TextInput, TouchableOpacity, View
} from 'react-native';

import { Card, Chip, Screen, T, tap } from '@/components/ui';
import { scheduleVisaReminder } from '@/lib/notifications';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

/* ─── Данные виз и маршрутов (1-в-1 из веб-версии) ─── */

type VisaType = 'evisa90_single' | 'evisa90_multi' | '45' | 'phuquoc30';
type CalcMode = 'entry' | 'exit';
type RouteKey = 'danang_laobao' | 'hcm_mokbai' | 'nhatrang_laobao' | 'hanoi_cautreo' | 'danang_bkk';

interface VisaOption {
  id: VisaType;
  name: string;
  days: number;
  cost: string;
  badge: string;
  desc: string;
  details: string;
}

const VISA_TYPES: VisaOption[] = [
  {
    id: 'evisa90_single',
    name: 'E-Visa 90 дней (Однократная)',
    days: 90,
    cost: '$25 USD',
    badge: 'Топ выбор зимовщиков',
    desc: 'Оформляется онлайн. Сгорает при любом выезде из страны.',
    details: 'Оформляется за 4–7 рабочих дней до поездки на официальном сайте. Въезд строго через КПП, указанный в анкете.',
  },
  {
    id: 'evisa90_multi',
    name: 'E-Visa 90 дней (Многократная)',
    days: 90,
    cost: '$50 USD',
    badge: 'Для путешествий по Азии',
    desc: 'Неограниченные выезды и въезды в течение 90 дней без потери визы.',
    details: 'Идеально, если планируете кратковременные поездки в Бангкок, Куала-Лумпур или на Бали.',
  },
  {
    id: '45',
    name: 'Безвизовый штамп 45 дней',
    days: 45,
    cost: 'Бесплатно',
    badge: 'Граждане РФ',
    desc: 'Штамп по прилёту или при въезде через наземную границу на 45 дней.',
    details: 'Требуется загранпаспорт со сроком действия от 6 месяцев и обратный билет (или бронь вылета из Вьетнама).',
  },
  {
    id: 'phuquoc30',
    name: 'Фукуок (Островной безвиз 30 дней)',
    days: 30,
    cost: 'Бесплатно',
    badge: 'Только остров',
    desc: 'Специальное разрешение при прямом международном прилете на Фукуок.',
    details: 'Действует только на территории острова Фукуок. Выезд на материк (Сайгон, Дананг) по нему запрещён.',
  },
];

interface BorderRoute {
  id: RouteKey;
  name: string;
  shortCity: string;
  country: string;
  flag: string;
  borderPost: string;
  visaCostUsd: number;
  transferBusUsd: number;
  transferVipUsd: number;
  transferBikeUsd: number;
  flightUsd: number;
  durationHours: string;
  distanceKm: number;
  description: string;
  schedule: { time: string; event: string }[];
  tips: string[];
}

const BORDER_ROUTES: Record<RouteKey, BorderRoute> = {
  danang_laobao: {
    id: 'danang_laobao',
    name: 'Дананг / Хойан → Лао Бао (Лаос)',
    shortCity: '🏖️ Дананг / Хойан',
    borderPost: 'КПП Lao Bảo / Densavan',
    country: 'Лаос 🇱🇦',
    flag: '🚌',
    visaCostUsd: 0,
    transferBusUsd: 25,
    transferVipUsd: 40,
    transferBikeUsd: 12,
    flightUsd: 110,
    durationHours: '1 день (выезд 05:30, возврат ~16:30, в пути 4:30)',
    distanceKm: 250,
    description: 'Главный и самый отлаженный маршрут Центрального Вьетнама. Дорога занимает 4:30 в каждую сторону на VIP-минивэне. Машина ждет 1,5 часа в 100 м от КПП.',
    schedule: [
      { time: '05:30 – 06:00', event: 'Посадка в VIP-минивэн в Дананге (места распределяются по очереди посадки)' },
      { time: '08:00', event: '1-я санитарная остановка (10 мин: туалет и небольшой магазинчик, кафе нет)' },
      { time: '09:30', event: '2-я санитарная остановка (10 мин: туалет и вода перед перевалом)' },
      { time: '10:30', event: 'Прибытие к КПП Лао Бао. Минивэн паркуется в 100 м от границы и ждет 1,5 часа' },
      { time: '10:30 – 11:30', event: 'Прохождение границы (30–60 мин): выезд из Вьетнама → нейтралка → Лаос → въезд во Вьетнам' },
      { time: '11:45', event: 'Сбор у машины, проверка нового штампа на 90 дней, кофе в кофейне BUN' },
      { time: '12:00', event: 'Выезд обратно в Дананг (одна остановка на 10 минут)' },
      { time: '16:30', event: 'Возвращение в Дананг с новым 90-дневным штампом в паспорте!' },
    ],
    tips: [
      'Виза в Лаос гражданам РФ НЕ требуется (безвизовый въезд до 30 дней)! Гражданам стран без безвиза: $45 / 1 200 000 ₫ + 2 фото 3x4.',
      'Сопутствующие сборы на КПП: возьмите около 200 000 – 300 000 VND наличными купюрами по 50k и 20k (выезд 50k, Лаос 20k, въезд 50k). За детей платить не нужно — сказать «Baby».',
      'КРИТИЧНО: на КПП нельзя оплатить штраф за оверстей (просрочку)! При малейшем оверстее вас развернут обратно.',
      'При возвращении во Вьетнам: сразу покажите распечатку новой E-Visa и четко скажите «E-Visa 90 days», иначе по ошибке поставят 45 дней штампа!',
      'Еда и вода: обязательно возьмите воду и перекус на весь день! На 10-минутных остановках полноценных кафе нет.',
      'Таблетки от укачивания: Nautamine или Antivomi (продаются в любой аптеке Вьетнама) — горная дорога укачивает многих.',
      'Одежда: в салоне прохладно из-за кондиционера — возьмите теплую кофту. В горах Лао Бао прохладнее Дананга.',
      'Проверьте штамп: обязательно проверьте дату нового въездного штампа прямо у окошка офицера (ровно 90 дней).',
    ],
  },
  hcm_mokbai: {
    id: 'hcm_mokbai',
    name: 'Хошимин (Сайгон) → Мокбай (Камбоджа)',
    shortCity: '🌆 Хошимин (Сайгон)',
    borderPost: 'КПП Mộc Bài / Bavet',
    country: 'Камбоджа 🇰🇭',
    flag: '🚌',
    visaCostUsd: 35,
    transferBusUsd: 12,
    transferVipUsd: 30,
    transferBikeUsd: 8,
    flightUsd: 95,
    durationHours: '6–7 часов (07:00 — 14:30)',
    distanceKm: 75,
    description: 'Ближайший сухопутный переход для жителей Сайгона. Всего 70 км от города по трассе QL22. Можно доехать на городском автобусе №703 от рынка Бен Тхань.',
    schedule: [
      { time: '07:00', event: 'Выезд от парка 23 Сентября / Бен Тхань на минивэне' },
      { time: '09:15', event: 'Прибытие на КПП Мокбай (провинция Тэйнинь)' },
      { time: '09:45', event: 'Штамп о выезде из Вьетнама' },
      { time: '10:15', event: 'Оформление камбоджийской визы в Бавете ($35 наличными новыми купюрами)' },
      { time: '11:15', event: 'Обратный переход во Вьетнам, активация новой электронной визы' },
      { time: '12:00', event: 'Обед в приграничном кафе' },
      { time: '14:30', event: 'Возвращение в центр Хошимина' },
    ],
    tips: [
      'Виза в Камбоджу оформляется на КПП Bavet: $35 наличными новыми долларами от 2013 года без заломов + 1 фото 4x6.',
      'На мелкие сопутствующие расходы и сборы на КПП возьмите около 250 000 – 300 000 донгов наличными.',
      'Городской автобус №703 стоит всего 40 000 VND (~$1.6), но ходит строго по расписанию.',
      'Опасайтесь навязчивых хелперов на камбоджийской стороне — они просят $10–20 сверху за то, что вы сделаете сами за 5 минут.',
      'При возвращении во Вьетнам четко скажите офицеру «E-Visa 90 days» и покажите бумажную распечатку.',
    ],
  },
  nhatrang_laobao: {
    id: 'nhatrang_laobao',
    name: 'Нячанг → Лао Бао (Лаос)',
    shortCity: '🌊 Нячанг',
    borderPost: 'КПП Lao Bảo (слипер-бас)',
    country: 'Лаос 🇱🇦',
    flag: '🚌',
    visaCostUsd: 0,
    transferBusUsd: 45,
    transferVipUsd: 65,
    transferBikeUsd: 22,
    flightUsd: 120,
    durationHours: '1 день (выезд вечером накануне)',
    distanceKm: 580,
    description: 'Из Нячанга организуются регулярные групповые экспат-басы на Лао Бао с ночным переездом в комфортабельных слипер-басах.',
    schedule: [
      { time: '19:00', event: 'Посадка в слипер-бас в Европейском квартале Нячанга' },
      { time: '08:00', event: 'Прибытие на КПП Лао Бао утром следующего дня' },
      { time: '09:00', event: 'Прохождение границы Вьетнам — Лаос (безвиз для граждан РФ)' },
      { time: '11:00', event: 'Оформление въезда и активация новой 90-дневной вьетнамской визы' },
      { time: '12:00', event: 'Обед и выезд обратно в Нячанг' },
      { time: '22:00', event: 'Возвращение в Нячанг' },
    ],
    tips: [
      'Виза в Лаос для граждан РФ бесплатна (безвиз до 30 дней)!',
      'КПП Лао Бао: держите 300 000 VND на сопутствующие сборы (выезд 50k, Лаос 20k, въезд 50k).',
      'При возвращении во Вьетнам сразу покажите распечатанную E-Visa, чтобы не поставили 45 дней штампа.',
      'В слипер-басе старайтесь бронировать средний ряд снизу — меньше качает на горных участках.',
    ],
  },
  hanoi_cautreo: {
    id: 'hanoi_cautreo',
    name: 'Ханой → Кау Чео (Лаос)',
    shortCity: '🏛️ Ханой',
    borderPost: 'КПП Cầu Treo Landport',
    country: 'Лаос 🇱🇦',
    flag: '🚌',
    visaCostUsd: 0,
    transferBusUsd: 35,
    transferVipUsd: 55,
    transferBikeUsd: 18,
    flightUsd: 85,
    durationHours: '14–16 часов',
    distanceKm: 380,
    description: 'Основной наземный КПП из северного Вьетнама в Лаос. Живописная горная дорога через провинцию Хатинь.',
    schedule: [
      { time: '05:00', event: 'Выезд из Ханоя на минивэне' },
      { time: '10:30', event: 'Прибытие на КПП Кау Чео' },
      { time: '11:15', event: 'Штамп о выезде из Вьетнама и безвизовый въезд в Лаос' },
      { time: '12:30', event: 'Въездной контроль во Вьетнам по новой 90-дневной визе' },
      { time: '19:30', event: 'Возвращение в Ханой' },
    ],
    tips: [
      'Виза в Лаос для граждан РФ не требуется (безвизовый въезд до 30 дней).',
      'Возьмите с собой 300 000 донгов наличными на сборы КПП Кау Чео.',
      'Сразу предупредите пограничника про новую 90-дневную E-Visa на въезде.',
      'Возьмите воду, перекус на 14-часовую дорогу и таблетки от укачивания.',
    ],
  },
  danang_bkk: {
    id: 'danang_bkk',
    name: 'Авиа-визаран: Дананг / Сайгон → Бангкок',
    shortCity: '✈️ Авиа в Бангкок',
    borderPost: 'Аэропорты DAD / SGN → DMK / BKK',
    country: 'Таиланд 🇹🇭',
    flag: '✈️',
    visaCostUsd: 0,
    transferBusUsd: 85,
    transferVipUsd: 110,
    transferBikeUsd: 0,
    flightUsd: 105,
    durationHours: '1 ч 35 мин полета в одну сторону',
    distanceKm: 850,
    description: 'Самый комфортный вариант без тряски в автобусе. Прямые рейсы AirAsia / VietJet, безвиз 60 дней для граждан РФ в Таиланде, отличный шопинг и отдых.',
    schedule: [
      { time: '07:30', event: 'Прибытие в международный терминал аэропорта' },
      { time: '09:20', event: 'Вылет в Бангкок (1ч 35м в небе)' },
      { time: '11:00', event: 'Прибытие в Донмыанг (DMK), бесплатный штамп Таиланда' },
      { time: '12:30', event: 'Обед том-ямом в городе, массаж или шопинг' },
      { time: '17:40', event: 'Обратный вылет во Вьетнам' },
      { time: '19:25', event: 'Прилет во Вьетнам, активация новой E-Visa в окне паспортного контроля' },
    ],
    tips: [
      'В анкете e-visa обязательно укажите именно аэропорт прибытия (Danang Airport или Tan Son Nhat Airport)!',
      'Для граждан РФ въезд в Таиланд безвизовый до 60 дней.',
    ],
  },
};

interface OverstayBracket {
  range: string;
  minDays: number;
  maxDays: number;
  minVnd: number;
  maxVnd: number;
  minUsd: number;
  maxUsd: number;
  risk: 'low' | 'moderate' | 'high' | 'critical';
  riskLabel: string;
  riskColor: string;
  protocol: string;
  action: string;
  blacklist: string;
}

const OVERSTAY_RULES: OverstayBracket[] = [
  {
    range: '1–2 дня',
    minDays: 1,
    maxDays: 2,
    minVnd: 500000,
    maxVnd: 1000000,
    minUsd: 20,
    maxUsd: 40,
    risk: 'low',
    riskLabel: 'Минимальный (Штраф на границе)',
    riskColor: '#1fd1c1',
    protocol: 'Оплата квитанции в кассу КПП / аэропорта при выезде',
    action: 'Приезжайте в аэропорт или на сухопутный КПП заранее (за 3.5–4 часа). Офицер миграции оформляет протокол Biên bản vi phạm hành chính, вы оплачиваете официальный штраф в кассу наличными донгами и вылетаете.',
    blacklist: 'Без депортации и без занесения в черный список. Сразу можно оформлять новую E-visa.',
  },
  {
    range: '3–15 дней',
    minDays: 3,
    maxDays: 15,
    minVnd: 1250000,
    maxVnd: 4000000,
    minUsd: 50,
    maxUsd: 160,
    risk: 'moderate',
    riskLabel: 'Умеренный риск',
    riskColor: '#f59e0b',
    protocol: 'Штраф на границе или в департаменте иммиграции',
    action: 'В большинстве случаев при вылете через международные аэропорты вопрос решается на месте, но процедура занимает до 3 часов. Наземные КПП могут отказать и направить в городское управление.',
    blacklist: 'Черный список не ставится, однако нарушение сохраняется в единой системе погранслужбы Вьетнама.',
  },
  {
    range: '16–29 дней',
    minDays: 16,
    maxDays: 29,
    minVnd: 3000000,
    maxVnd: 5000000,
    minUsd: 120,
    maxUsd: 200,
    risk: 'high',
    riskLabel: 'Повышенный риск',
    riskColor: '#f97316',
    protocol: 'Обязательное обращение в Cục Quản lý xuất nhập cảnh',
    action: 'Не приезжайте прямо на границу — есть риск не успеть на рейс. Нужно лично явиться в миграционный департамент в Ханое, Дананге или Сайгоне с паспортом и объяснительной (Đơn giải trình), оплатить штраф и получить официальный выездной штамп.',
    blacklist: 'Возможен временный запрет на въезд (Black List 6–12 месяцев) при отягчающих обстоятельствах.',
  },
  {
    range: '30–59 дней (1–2 мес)',
    minDays: 30,
    maxDays: 59,
    minVnd: 5000000,
    maxVnd: 10000000,
    minUsd: 200,
    maxUsd: 400,
    risk: 'critical',
    riskLabel: 'Высокий риск (Exit Visa)',
    riskColor: '#ef4444',
    protocol: 'Официальная выездная виза (Exit Visa) через миграционную службу',
    action: 'Обязательно обращение через проверенного экспатского визового юриста. Выдается выездная виза на 7–10 дней, дающая право легально покинуть страну.',
    blacklist: 'Высокий риск попадания в Black List на срок от 1 до 3 лет.',
  },
  {
    range: '60–89 дней (2–3 мес)',
    minDays: 60,
    maxDays: 89,
    minVnd: 10000000,
    maxVnd: 15000000,
    minUsd: 400,
    maxUsd: 600,
    risk: 'critical',
    riskLabel: 'Критический уровень',
    riskColor: '#dc2626',
    protocol: 'Административное производство и допрос',
    action: 'Требуется профессиональное сопровождение. Самостоятельный выезд через границу невозможен без предварительно закрытого дела в центральном управлении полиции.',
    blacklist: 'Запрет на въезд во Вьетнам на срок 3 года с биометрической отметкой.',
  },
  {
    range: '90+ дней (от 3 месяцев)',
    minDays: 90,
    maxDays: 9999,
    minVnd: 15000000,
    maxVnd: 20000000,
    minUsd: 600,
    maxUsd: 800,
    risk: 'critical',
    riskLabel: 'Экстремальный риск (Депортация)',
    riskColor: '#991b1b',
    protocol: 'Принудительная депортация (Trục xuất)',
    action: 'Выносится официальное решение о депортации за счет иностранного гражданина. Оплата штрафа до 20 млн донгов, покупка прямого билета и сопровождение конвоем офицеров до трапа самолета.',
    blacklist: 'Гарантированный Black List на срок от 3 до 5 лет (или бессрочный запрет).',
  },
];

interface TimelineStep {
  minutesFromStart: number;
  label: string;
  location: string;
  icon: string;
  tip: string;
  critical?: boolean;
}

const ROUTE_TIMELINES: Record<string, { durationMinutes: number; returnDurationMinutes: number; steps: TimelineStep[] }> = {
  danang_laobao: {
    durationMinutes: 270,
    returnDurationMinutes: 270,
    steps: [
      { minutesFromStart: 0, label: 'Выезд из Дананга', location: 'Сбор у дома / отеля в An Thuong или Son Tra', icon: '🚐', tip: 'Проверьте паспорт, распечатки e-visa и 300 000 ₫ наличными в кармане.' },
      { minutesFromStart: 150, label: '1-я остановка (10 мин)', location: 'Трасса QL1A перед перевалом', icon: '☕', tip: 'Санитарная зона: туалет, кофе, покупка воды. Кафе нет.' },
      { minutesFromStart: 250, label: '2-я остановка (10 мин)', location: 'Подъем в горы Lao Bao', icon: '🚻', tip: 'Размяться, принять таблетку от укачивания (Nautamine) при необходимости.' },
      { minutesFromStart: 270, label: 'Прибытие на КПП Лао Бао', location: 'Парковка в 100 м от границы', icon: '🚩', tip: 'Минивэн ждет 1.5–2 часа. Если выехали в 03:00 — очередей туристических автобусов нет!' },
      { minutesFromStart: 285, label: 'Выездной штамп Вьетнама', location: 'Главное здание КПП Лао Бао', icon: '🇻🇳', tip: 'Пройти рамки, развернуться на 180° к окнам офицеров. Сбор 50 000 ₫ наличными.', critical: true },
      { minutesFromStart: 310, label: 'Переход нейтральной полосы', location: 'Пешеходная дорога (~200 метров)', icon: '🚶', tip: 'Идти прямо в сторону арки Лаоса, показать паспорт пограничникам на выходе.' },
      { minutesFromStart: 330, label: 'Штамп въезда/выезда Лаоса', location: 'КПП Den Savanh (Лаос)', icon: '🇱🇦', tip: 'Гражданам РФ виза не нужна (бесплатный безвиз 30 дней!). Сбор 20 000 ₫ в окне.' },
      { minutesFromStart: 370, label: 'Активация новой E-Visa 90 дней', location: 'КПП Вьетнам (Окно Entry)', icon: '🛂', tip: 'КРИТИЧНО: четко сказать «E-Visa 90 days» и отдать распечатку визы! Проверить дату в паспорте.', critical: true },
      { minutesFromStart: 410, label: 'Сбор у машины и кофе', location: 'Кофейня BUN у границы', icon: '☕', tip: 'Проверка паспорта всеми пассажирами, перекус, выезд обратно.' },
      { minutesFromStart: 680, label: 'Возвращение в Дананг', location: 'Доставка до вашего кондо/отеля', icon: '🏠', tip: 'Поздравляем! Ваш легальный статус во Вьетнаме обновлен ровно на 90 дней.' },
    ],
  },
  hcm_mokbai: {
    durationMinutes: 135,
    returnDurationMinutes: 135,
    steps: [
      { minutesFromStart: 0, label: 'Выезд из Хошимина', location: 'Парк 23 Сентября / Бен Тхань', icon: '🚐', tip: 'Минивэн или автобус №703 по трассе QL22.' },
      { minutesFromStart: 135, label: 'Прибытие на КПП Мокбай', location: 'Провинция Тэйнинь (70 км от Сайгона)', icon: '🚩', tip: 'Оставить вещи в машине, взять только сумочку с документами и долларами.' },
      { minutesFromStart: 155, label: 'Штамп о выезде из Вьетнама', location: 'Паспортный контроль Мокбай', icon: '🇻🇳', tip: 'Очередь выезда. Проверьте отсутствие оверстея!', critical: true },
      { minutesFromStart: 180, label: 'Виза в Камбоджу (Бавет)', location: 'КПП Bavet (Камбоджа)', icon: '🇰🇭', tip: 'Виза по прибытии: ровно $35 НОВЫМИ долларами без заломов + фото 3x4.', critical: true },
      { minutesFromStart: 230, label: 'Въезд во Вьетнам по новой E-Visa', location: 'Вьетнамский терминал прибытия', icon: '🛂', tip: 'Отдать распечатку E-Visa 90 дней офицеру, проверить дату штампа.' },
      { minutesFromStart: 270, label: 'Обед и выезд в Сайгон', location: 'Приграничное кафе', icon: '🍜', tip: 'Фо-бо, холодный кофе со льдом и посадка в обратный минивэн.' },
      { minutesFromStart: 410, label: 'Прибытие в центр Хошимина', location: 'Район 1 / Район 2 (Тао Диен)', icon: '🏠', tip: 'Новый 90-дневный штамп готов без лишних перелетов.' },
    ],
  },
  nhatrang_laobao: {
    durationMinutes: 780,
    returnDurationMinutes: 720,
    steps: [
      { minutesFromStart: 0, label: 'Посадка в слипер-бас', location: 'Европейский квартал Нячанга (19:00 накануне)', icon: '🛏️', tip: 'Займите нижнюю полку в середине салона — меньше укачивает в горах.' },
      { minutesFromStart: 720, label: 'Прибытие на КПП Лао Бао', location: 'Утренний приезд в 07:00–08:00', icon: '🚩', tip: 'Умыться, выпить крепкий кофе и идти к границе до автобусов из Хюэ.' },
      { minutesFromStart: 750, label: 'Выезд из Вьетнама', location: 'Окно Biên phòng КПП Лао Бао', icon: '🇻🇳', tip: 'Паспорт + 50 000 ₫ пограничнику в кассу.' },
      { minutesFromStart: 790, label: 'Штамп Лаоса (Den Savanh)', location: 'Лаосская будка нейтралки', icon: '🇱🇦', tip: 'Бесплатный штамп для граждан РФ + 20 000 ₫ сервисный сбор.' },
      { minutesFromStart: 840, label: 'Въезд во Вьетнам по E-Visa', location: 'Окно Entry Лао Бао', icon: '🛂', tip: 'Активация 90-дневной электронной визы. Проверьте дату штампа!', critical: true },
      { minutesFromStart: 900, label: 'Обед и выезд в Нячанг', location: 'Кафе у стоянки слипер-баса', icon: '🍜', tip: 'Посадка на дневной рейс обратно.' },
      { minutesFromStart: 1560, label: 'Возвращение в Нячанг', location: 'Европейский квартал Нячанга', icon: '🏠', tip: 'Успешное завершение визарана!' },
    ],
  },
};

/* ─── Вспомогательные функции дат ─── */

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatShortDate(d: Date): string {
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
}

function toIsoDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDaysLeft(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatOffsetTime(baseTime: string, addedMinutes: number): string {
  const [hh, mm] = baseTime.split(':').map(Number);
  const totalM = (isNaN(hh) ? 3 : hh) * 60 + (isNaN(mm) ? 0 : mm) + addedMinutes;
  const daysOver = Math.floor(totalM / 1440);
  const remM = totalM % 1440;
  const rH = Math.floor(remM / 60);
  const rM = remM % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  const timeStr = `${pad(rH)}:${pad(rM)}`;
  return daysOver > 0 ? `${timeStr} (+1д)` : timeStr;
}

export default function VisaToolScreen() {
  const { c } = useTheme();

  // Режим калькулятора: по дате въезда или дате выезда
  const [calcMode, setCalcMode] = useState<CalcMode>('entry');
  const [entryDate, setEntryDate] = useState(() => toIsoDate(new Date()));
  const [exitDate, setExitDate] = useState('');
  const [visaType, setVisaType] = useState<VisaType>('evisa90_single');

  // Расчет
  const selectedVisaObj = VISA_TYPES.find(v => v.id === visaType)!;
  const maxDays = selectedVisaObj.days;

  const result = useMemo(() => {
    if (calcMode === 'entry') {
      if (!entryDate) return null;
      const entry = new Date(entryDate);
      if (isNaN(entry.getTime())) return null;
      const deadline = addDays(entry, selectedVisaObj.days - 1);
      const applyDate = addDays(deadline, -10);
      const recommendedBorderDate = addDays(deadline, -3);
      return {
        entry,
        deadline,
        daysLeft: getDaysLeft(deadline),
        applyDate,
        recommendedBorderDate,
      };
    } else {
      if (!exitDate) return null;
      const deadline = new Date(exitDate);
      if (isNaN(deadline.getTime())) return null;
      const entry = addDays(deadline, -(selectedVisaObj.days - 1));
      const applyDate = addDays(deadline, -10);
      const recommendedBorderDate = addDays(deadline, -3);
      return {
        entry,
        deadline,
        daysLeft: getDaysLeft(deadline),
        applyDate,
        recommendedBorderDate,
      };
    }
  }, [calcMode, entryDate, exitDate, selectedVisaObj.days]);

  // Стейт бюджета и маршрутов
  const [selectedRouteKey, setSelectedRouteKey] = useState<RouteKey>('danang_laobao');
  const [departureTime, setDepartureTime] = useState<string>('03:00');
  const [timelineCopied, setTimelineCopied] = useState<boolean>(false);
  const [copiedDeadline, setCopiedDeadline] = useState<boolean>(false);
  const [remindersScheduled, setRemindersScheduled] = useState<boolean>(false);

  const handleToggleReminders = async () => {
    tap();
    if (!result) return;
    try {
      await scheduleVisaReminder(result.deadline, selectedVisaObj.name);
      setRemindersScheduled(true);
    } catch (e) {
      console.warn('Failed to schedule reminders:', e);
      setRemindersScheduled(true);
    }
  };
  const [transportType, setTransportType] = useState<'vip' | 'bus' | 'flight' | 'bike'>('vip');
  const [nextVisaType, setNextVisaType] = useState<'standard' | 'multi' | 'stamp'>('standard');
  const [needHelper, setNeedHelper] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'VND' | 'RUB'>('USD');

  // Чеклист документов
  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    passport: true,
    evisa: true,
    cash_border: true,
    water_snack: false,
    warm_clothes: true,
    pills: false,
    powerbank: true,
    trip_fee: true,
    pen: true,
  });

  const toggleDoc = (k: string) => {
    tap();
    setCheckedDocs(prev => ({ ...prev, [k]: !prev[k] }));
  };

  // Оверстей калькулятор
  const [overstayDaysInput, setOverstayDaysInput] = useState<number>(3);

  // Конверсия валют
  const USD_TO_VND = 25450;
  const USD_TO_RUB = 94.5;
  const currentRoute = BORDER_ROUTES[selectedRouteKey];

  let transportCost = currentRoute.transferVipUsd;
  if (transportType === 'bus') transportCost = currentRoute.transferBusUsd;
  if (transportType === 'flight') transportCost = currentRoute.flightUsd;
  if (transportType === 'bike') transportCost = currentRoute.transferBikeUsd;

  let evisaCost = 25;
  if (nextVisaType === 'multi') evisaCost = 50;
  if (nextVisaType === 'stamp') evisaCost = 0;

  const borderVisaCost = (transportType === 'flight' || currentRoute.id === 'danang_bkk' || currentRoute.visaCostUsd === 0) ? 0 : currentRoute.visaCostUsd;
  const borderFeesUsd = 12; // ~300k VND
  const helperCost = needHelper ? 15 : 0;
  const foodCost = 5;

  const totalUsd = transportCost + evisaCost + borderVisaCost + borderFeesUsd + helperCost + foodCost;
  const totalVnd = Math.round(totalUsd * USD_TO_VND);
  const totalRub = Math.round(totalUsd * USD_TO_RUB);

  const formatPrice = (usd: number) => {
    if (currency === 'VND') return (usd * USD_TO_VND).toLocaleString('ru-RU') + ' ₫';
    if (currency === 'RUB') return Math.round(usd * USD_TO_RUB).toLocaleString('ru-RU') + ' ₽';
    return '$' + usd;
  };

  const statusColor = !result
    ? c.textMuted
    : result.daysLeft > 14
    ? c.accent
    : result.daysLeft > 5
    ? '#f59e0b'
    : '#ef4444';

  const statusLabel = !result
    ? ''
    : result.daysLeft > 14
    ? '✅ Документы в порядке'
    : result.daysLeft > 5
    ? '⚠️ Пора подавать на новую визу'
    : result.daysLeft <= 0
    ? '🚨 ПРОСРОЧЕНО (ОВЕРСТЕЙ)!'
    : '🔴 Срочно планируйте визаран!';

  const pct = result ? Math.max(0, Math.min(100, (result.daysLeft / maxDays) * 100)) : 0;

  const copyDeadlineText = () => {
    if (!result) return;
    tap();
    Clipboard.setStringAsync(`🚨 Дедлайн визы во Вьетнаме: ${formatDate(result.deadline)} (выезд до 23:59). Подать на E-Visa: до ${formatShortDate(result.applyDate)}.`);
    setCopiedDeadline(true);
    setTimeout(() => setCopiedDeadline(false), 2000);
  };

  const copyTimeline = () => {
    tap();
    const activeT = ROUTE_TIMELINES[selectedRouteKey] || ROUTE_TIMELINES.danang_laobao;
    const text = activeT.steps.map(s => `${formatOffsetTime(departureTime, s.minutesFromStart)} — ${s.label} (${s.location})`).join('\n');
    Clipboard.setStringAsync(text);
    setTimelineCopied(true);
    setTimeout(() => setTimelineCopied(false), 2000);
  };

  const openGovPortal = () => {
    WebBrowser.openBrowserAsync('https://evisa.xuatnhapcanh.gov.vn/', {
      toolbarColor: c.bgPrimary,
      controlsColor: c.accent,
    });
  };

  // Быстрый сдвиг даты
  const shiftDate = (days: number) => {
    tap();
    if (calcMode === 'entry') {
      const current = entryDate ? new Date(entryDate) : new Date();
      current.setDate(current.getDate() + days);
      setEntryDate(toIsoDate(current));
    } else {
      const current = exitDate ? new Date(exitDate) : new Date();
      current.setDate(current.getDate() + days);
      setExitDate(toIsoDate(current));
    }
  };

  return (
    <Screen padTop={false}>
      {/* ─── Header & Title ─── */}
      <View style={{ alignItems: 'center', marginVertical: space.sm, gap: 10 }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center', gap: 6,
          backgroundColor: c.accentGlow, borderWidth: 1, borderColor: c.borderAccent,
          borderRadius: radius.pill, paddingVertical: 5, paddingHorizontal: 16,
        }}>
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: c.accent }}>
            🇻🇳 Визовый трекер & Калькулятор визарана под ключ · 2026
          </Text>
        </View>

        <T v="h1" style={{ textAlign: 'center', fontSize: 24 }}>
          🚌 Визаран и визовый калькулятор
        </T>

        <T v="body" style={{ textAlign: 'center', fontSize: 13.5, lineHeight: 20 }}>
          Отслеживайте дедлайн по дате въезда или дате из штампа (UNTIL), рассчитывайте рекомендуемый день выезда и бюджет поездки под ключ (Лаос, Камбоджа, Таиланд).
        </T>
      </View>

      {/* ─── БЛОК 1: ПАРАМЕТРЫ ВЪЕЗДА & РЕЗУЛЬТАТ ─── */}
      <Card style={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ fontSize: 18 }}>🛂</Text>
          <T v="h2" style={{ fontSize: 17 }}>1. Параметры вашего въезда</T>
        </View>

        {/* Переключатель: По дате въезда vs По дате выезда */}
        <View style={{
          flexDirection: 'row', backgroundColor: c.bgPrimary, padding: 4,
          borderRadius: radius.md, borderWidth: 1, borderColor: c.border, gap: 4,
        }}>
          <Pressable
            onPress={() => {
              tap();
              setCalcMode('entry');
              if (result && !entryDate) setEntryDate(toIsoDate(result.entry));
            }}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: radius.sm,
              backgroundColor: calcMode === 'entry' ? c.accent : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              fontFamily: fonts.bodyBold, fontSize: 12,
              color: calcMode === 'entry' ? '#fff' : c.textSecondary,
            }}>
              📥 По дате въезда
            </Text>
          </Pressable>

          <Pressable
            onPress={() => {
              tap();
              setCalcMode('exit');
              if (result && !exitDate) setExitDate(toIsoDate(result.deadline));
            }}
            style={{
              flex: 1, paddingVertical: 10, borderRadius: radius.sm,
              backgroundColor: calcMode === 'exit' ? c.accent : 'transparent',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            <Text style={{
              fontFamily: fonts.bodyBold, fontSize: 12,
              color: calcMode === 'exit' ? '#fff' : c.textSecondary,
            }}>
              📤 По дате выезда (UNTIL)
            </Text>
          </Pressable>
        </View>

        {/* Поле ввода даты и быстрые кнопки */}
        <View style={{ gap: 8 }}>
          <T v="label">
            {calcMode === 'entry' ? 'Дата въездного штампа (DATE OF ENTRY):' : 'Дата выезда из штампа (UNTIL / HẠN ĐẾN):'}
          </T>

          <View style={{
            flexDirection: 'row', alignItems: 'center', gap: 8,
            backgroundColor: c.bgSecondary, borderWidth: 1.5, borderColor: c.borderAccent,
            borderRadius: radius.md, paddingHorizontal: 14, paddingVertical: 10,
          }}>
            <Calendar size={18} color={c.accent} />
            <TextInput
              value={calcMode === 'entry' ? entryDate : exitDate}
              onChangeText={val => calcMode === 'entry' ? setEntryDate(val) : setExitDate(val)}
              placeholder="ГГГГ-ММ-ДД (напр. 2026-10-04)"
              placeholderTextColor={c.textMuted}
              style={{
                flex: 1, color: c.textPrimary, fontFamily: fonts.bodyHeavy,
                fontSize: 15, padding: 0,
              }}
            />
          </View>

          {/* Быстрые кнопки сдвига даты */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            <Pressable
              onPress={() => {
                tap();
                const today = toIsoDate(new Date());
                calcMode === 'entry' ? setEntryDate(today) : setExitDate(today);
              }}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.accent }}>Сегодня</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftDate(-1)}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.textSecondary }}>-1 день</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftDate(1)}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.textSecondary }}>+1 день</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftDate(-30)}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.textSecondary }}>-30 дн</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftDate(45)}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.textSecondary }}>+45 дн</Text>
            </Pressable>
            <Pressable
              onPress={() => shiftDate(90)}
              style={{ paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8, backgroundColor: c.bgCardHover, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodySemi, fontSize: 11, color: c.textSecondary }}>+90 дн</Text>
            </Pressable>
          </View>
        </View>

        {/* Выбор типа визы */}
        <View style={{ gap: 8 }}>
          <T v="label">Тип визы / основание въезда:</T>
          <View style={{ gap: 8 }}>
            {VISA_TYPES.map(v => {
              const active = visaType === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => { tap(); setVisaType(v.id); }}
                  style={{
                    padding: 12, borderRadius: radius.md, borderWidth: 1.5,
                    borderColor: active ? c.accent : c.border,
                    backgroundColor: active ? c.accentGlow : c.bgSecondary,
                    gap: 4,
                  }}
                >
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={{
                      fontFamily: fonts.bodyHeavy, fontSize: 13.5,
                      color: active ? c.accent : c.textPrimary,
                    }}>
                      {v.name}
                    </Text>
                    <View style={{
                      backgroundColor: c.bgPrimary, paddingHorizontal: 8, paddingVertical: 2,
                      borderRadius: 6, borderWidth: 1, borderColor: c.border,
                    }}>
                      <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.accent }}>
                        {v.cost}
                      </Text>
                    </View>
                  </View>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textSecondary, lineHeight: 16 }}>
                    {v.desc}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      </Card>

      {/* ─── КАРТОЧКА РЕЗУЛЬТАТА (БОЛЬШОЙ СЧЕТЧИК И ТАЙМЛАЙН) ─── */}
      {result && (
        <Card accent style={{ padding: space.lg, gap: space.md }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill,
              borderWidth: 1, borderColor: statusColor, backgroundColor: `${statusColor}20`,
            }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11.5, color: statusColor }}>
                {statusLabel}
              </Text>
            </View>
            <T v="muted">Всего: {maxDays} дней</T>
          </View>

          {/* Крупные цифры */}
          <View style={{ alignItems: 'center', paddingVertical: 8 }}>
            <Text style={{
              fontFamily: fonts.display, fontSize: 72, lineHeight: 76,
              color: result.daysLeft <= 5 ? '#ef4444' : result.daysLeft <= 14 ? '#f59e0b' : c.accent,
            }}>
              {Math.max(0, result.daysLeft)}
            </Text>
            <Text style={{ fontFamily: fonts.bodyBold, fontSize: 14, color: c.textMuted, marginTop: 4 }}>
              {result.daysLeft === 1 ? 'день остался' : result.daysLeft >= 2 && result.daysLeft <= 4 ? 'дня осталось' : 'дней осталось'}
            </Text>
          </View>

          {/* Индикатор-прогресс */}
          <View style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10.5, color: result.daysLeft <= 5 ? '#ef4444' : c.textMuted }}>
                🚨 0 дн (дедлайн)
              </Text>
              <View style={{ paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11, color: c.textPrimary }}>
                  {result.daysLeft > 0 ? `${result.daysLeft} из ${maxDays} дн (${Math.round(pct)}%)` : '0 дн (оверстей)'}
                </Text>
              </View>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10.5, color: c.accent }}>
                🏁 {maxDays} дн (макс)
              </Text>
            </View>

            <View style={{
              height: 12, backgroundColor: c.bgSecondary, borderRadius: radius.pill,
              borderWidth: 1, borderColor: c.border, overflow: 'hidden', padding: 2,
            }}>
              <View style={{
                height: '100%', width: `${pct}%`, minWidth: pct > 0 ? 8 : 0,
                borderRadius: radius.pill,
                backgroundColor: result.daysLeft <= 5 ? '#ef4444' : result.daysLeft <= 14 ? '#f59e0b' : c.accent,
              }} />
            </View>
          </View>

          {/* График контрольных дат */}
          <View style={{
            backgroundColor: c.bgSecondary, borderRadius: radius.md, padding: 14,
            borderWidth: 1, borderColor: c.border, gap: 12,
          }}>
            <T v="label">🗓️ График рекомендуемых действий</T>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ fontSize: 16 }}>🟡</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.textPrimary }}>
                  {formatShortDate(result.applyDate)} — Подать на новую E-Visa
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textMuted }}>
                  Рассмотрение занимает 3–5 рабочих дней на оф. сайте
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ fontSize: 16 }}>🟠</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: '#f59e0b' }}>
                  {formatShortDate(result.recommendedBorderDate)} — Рекомендуемый день визарана
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textMuted }}>
                  За 3 дня до дедлайна, чтобы избежать форс-мажоров и очередей
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
              <Text style={{ fontSize: 16 }}>🔴</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13.5, color: c.accent }}>
                  {formatDate(result.deadline)} — КРАЙНИЙ СРОК (Дедлайн)
                </Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textMuted }}>
                  В этот день вы обязаны пересечь границу до 23:59
                </Text>
              </View>
            </View>
          </View>

          {/* Кнопки действий */}
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Pressable
              onPress={handleToggleReminders}
              style={{
                width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 8, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md,
                backgroundColor: remindersScheduled ? 'rgba(34, 197, 94, 0.15)' : c.bgCard,
                borderWidth: 1, borderColor: remindersScheduled ? '#22c55e' : c.borderAccent,
              }}
            >
              <Bell size={16} color={remindersScheduled ? '#22c55e' : c.accent} />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: remindersScheduled ? '#22c55e' : c.accent }}>
                {remindersScheduled ? '✓ Напоминания включены (за 7, 3 и 1 день)' : '🔔 Включить напоминания за 7, 3 и 1 день'}
              </Text>
            </Pressable>

            <Pressable
              onPress={copyDeadlineText}
              style={{
                flex: 1, minWidth: 140, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                gap: 6, paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md,
                backgroundColor: c.accent,
              }}
            >
              <Copy size={16} color="#fff" />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: '#fff' }}>
                {copiedDeadline ? '✓ Скопировано' : 'Скопировать дедлайн'}
              </Text>
            </Pressable>

            <Pressable
              onPress={openGovPortal}
              style={{
                flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
                paddingVertical: 12, paddingHorizontal: 16, borderRadius: radius.md,
                backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border,
              }}
            >
              <ExternalLink size={16} color={c.accent} />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 13, color: c.textPrimary }}>
                Госпортал E-Visa
              </Text>
            </Pressable>
          </View>
        </Card>
      )}

      {/* ─── БЛОК 2: КАЛЬКУЛЯТОР БЮДЖЕТА ВИЗАРАНА «ПОД КЛЮЧ» ─── */}
      <Card style={{ padding: space.lg, gap: space.md }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
          <View style={{ gap: 2 }}>
            <T v="h2" style={{ fontSize: 17 }}>💰 2. Калькулятор бюджета «под ключ»</T>
            <T v="muted">
              {currentRoute.name} ({currentRoute.distanceKm} км в одну сторону)
            </T>
          </View>

          {/* Валюта */}
          <View style={{ flexDirection: 'row', backgroundColor: c.bgSecondary, padding: 3, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
            {(['USD', 'VND', 'RUB'] as const).map(cur => (
              <Pressable
                key={cur}
                onPress={() => { tap(); setCurrency(cur); }}
                style={{
                  paddingVertical: 4, paddingHorizontal: 10, borderRadius: 6,
                  backgroundColor: currency === cur ? c.accent : 'transparent',
                }}
              >
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: currency === cur ? '#fff' : c.textMuted }}>
                  {cur}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {/* Табы маршрутов */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingVertical: 2 }}>
          {Object.entries(BORDER_ROUTES).map(([key, r]) => {
            const active = selectedRouteKey === key;
            return (
              <Chip
                key={key}
                label={r.shortCity}
                active={active}
                onPress={() => setSelectedRouteKey(key as RouteKey)}
              />
            );
          })}
        </ScrollView>

        {/* ─── ИНТЕРАКТИВНЫЙ ТАЙМЛАЙН РАСПИСАНИЯ ─── */}
        <View style={{
          backgroundColor: c.bgSecondary, borderRadius: radius.lg, padding: 16,
          borderWidth: 1.5, borderColor: c.borderAccent, gap: 12,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
            <View>
              <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.textPrimary }}>
                Расписание по часам: {currentRoute.shortCity}
              </Text>
              <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textMuted }}>
                КПП: {currentRoute.borderPost}
              </Text>
            </View>

            {/* Выбор времени выезда */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: c.bgCard, padding: 6, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
              <Clock size={14} color={c.accent} />
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>Выезд:</Text>
              <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.accent }}>{departureTime}</Text>
            </View>
          </View>

          {/* Быстрые пресеты времени выезда */}
          <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
            {[
              { time: '03:00', label: '🌙 03:00 (Без очередей)' },
              { time: '04:30', label: '🌅 04:30 (Стандарт)' },
              { time: '06:00', label: '☀️ 06:00 (Поздний)' },
            ].map(p => (
              <Pressable
                key={p.time}
                onPress={() => { tap(); setDepartureTime(p.time); }}
                style={{
                  paddingVertical: 5, paddingHorizontal: 10, borderRadius: 8,
                  borderWidth: 1,
                  borderColor: departureTime === p.time ? c.accent : c.border,
                  backgroundColor: departureTime === p.time ? c.accentGlow : 'transparent',
                }}
              >
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: departureTime === p.time ? c.accent : c.textSecondary }}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>

          {/* Статус загрузки границы */}
          <View style={{
            padding: 10, borderRadius: 8,
            backgroundColor: departureTime <= '04:00' ? 'rgba(31,209,193,0.12)' : departureTime <= '05:00' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
            borderWidth: 1,
            borderColor: departureTime <= '04:00' ? 'rgba(31,209,193,0.4)' : departureTime <= '05:00' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)',
            flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8,
          }}>
            <Text style={{
              flex: 1, fontFamily: fonts.bodyBold, fontSize: 11.5,
              color: departureTime <= '04:00' ? c.accent : departureTime <= '05:00' ? '#f59e0b' : '#ef4444',
            }}>
              {departureTime <= '04:00'
                ? '🟢 Без очередей: прохождение КПП за 25–40 минут!'
                : departureTime <= '05:00'
                ? '🟡 Умеренно: на КПП 3–4 других туристических минивэна'
                : '🔴 Высокая загрузка: ожидание в очереди до 2 часов'}
            </Text>

            <Pressable
              onPress={copyTimeline}
              style={{ paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, backgroundColor: c.bgPrimary, borderWidth: 1, borderColor: c.border }}
            >
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10.5, color: c.textPrimary }}>
                {timelineCopied ? '✓ Скопировано' : '📋 Скопировать'}
              </Text>
            </Pressable>
          </View>

          {/* Список шагов таймлайна */}
          <View style={{ gap: 8 }}>
            {(ROUTE_TIMELINES[selectedRouteKey] || ROUTE_TIMELINES.danang_laobao).steps.map((st, i) => {
              const stepTime = formatOffsetTime(departureTime, st.minutesFromStart);
              return (
                <View
                  key={i}
                  style={{
                    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
                    padding: 10, borderRadius: 10,
                    backgroundColor: st.critical ? 'rgba(31,209,193,0.06)' : c.bgCard,
                    borderWidth: 1, borderColor: st.critical ? c.borderAccent : c.border,
                  }}
                >
                  <View style={{
                    minWidth: 64, paddingVertical: 3, paddingHorizontal: 6, borderRadius: 6,
                    backgroundColor: st.critical ? c.accent : c.bgSecondary,
                    alignItems: 'center', justifyContent: 'center',
                  }}>
                    <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: st.critical ? '#fff' : c.accent }}>
                      {stepTime}
                    </Text>
                  </View>

                  <Text style={{ fontSize: 18 }}>{st.icon}</Text>

                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: c.textPrimary }}>
                        {st.label}
                      </Text>
                      {st.critical && (
                        <View style={{ backgroundColor: '#ef4444', paddingHorizontal: 5, paddingVertical: 1, borderRadius: 4 }}>
                          <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 9, color: '#fff' }}>ВАЖНО</Text>
                        </View>
                      )}
                    </View>
                    <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textSecondary, lineHeight: 15 }}>
                      {st.tip}
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        </View>

        {/* Выбор транспорта */}
        <View style={{ gap: 8 }}>
          <T v="label">🚍 Способ передвижения:</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {[
              { id: 'vip', label: '🚐 VIP-Минивэн', cost: currentRoute.transferVipUsd },
              { id: 'bus', label: '🚌 Рейсовый автобус', cost: currentRoute.transferBusUsd },
              { id: 'flight', label: '✈️ Самолет (Air-run)', cost: currentRoute.flightUsd },
              { id: 'bike', label: '🛵 На своем байке', cost: currentRoute.transferBikeUsd },
            ].map(t => {
              const active = transportType === t.id;
              return (
                <Pressable
                  key={t.id}
                  onPress={() => { tap(); setTransportType(t.id as any); }}
                  style={{
                    flex: 1, minWidth: '45%', padding: 10, borderRadius: radius.md,
                    borderWidth: 1.5, borderColor: active ? c.accent : c.border,
                    backgroundColor: active ? c.accentGlow : c.bgSecondary,
                    gap: 2,
                  }}
                >
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12, color: active ? c.accent : c.textPrimary }}>
                    {t.label}
                  </Text>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: c.textMuted }}>
                    {formatPrice(t.cost)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Виза для следующего въезда */}
        <View style={{ gap: 8 }}>
          <T v="label">📄 Виза для следующего въезда во Вьетнам:</T>
          <View style={{ gap: 6 }}>
            {[
              { id: 'standard', title: 'E-Visa 90 дней (Single Entry)', cost: 25, sub: 'Самый популярный выбор зимовщиков' },
              { id: 'multi', title: 'E-Visa 90 дней (Multiple Entry)', cost: 50, sub: 'Свободный выезд без потери визы' },
              { id: 'stamp', title: 'Штамп 45 дней (для граждан РФ)', cost: 0, sub: 'Бесплатный штамп в паспорт без визы' },
            ].map(v => {
              const active = nextVisaType === v.id;
              return (
                <Pressable
                  key={v.id}
                  onPress={() => { tap(); setNextVisaType(v.id as any); }}
                  style={{
                    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                    padding: 10, borderRadius: radius.md, borderWidth: 1,
                    borderColor: active ? c.accent : c.border,
                    backgroundColor: active ? c.accentGlow : c.bgSecondary,
                  }}
                >
                  <View style={{ gap: 2 }}>
                    <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: active ? c.accent : c.textPrimary }}>
                      {v.title}
                    </Text>
                    <Text style={{ fontFamily: fonts.body, fontSize: 10.5, color: c.textMuted }}>
                      {v.sub}
                    </Text>
                  </View>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 12.5, color: c.textPrimary }}>
                    {formatPrice(v.cost)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>

        {/* Опция хелпера */}
        <Pressable
          onPress={() => { tap(); setNeedHelper(!needHelper); }}
          style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 4 }}
        >
          <View style={{
            width: 20, height: 20, borderRadius: 5, borderWidth: 1.5,
            borderColor: needHelper ? c.accent : c.border,
            backgroundColor: needHelper ? c.accent : 'transparent',
            alignItems: 'center', justifyContent: 'center',
          }}>
            {needHelper && <Check size={14} color="#fff" />}
          </View>
          <Text style={{ fontFamily: fonts.bodySemi, fontSize: 12.5, color: c.textSecondary }}>
            Помощник на границе (Fast-Track без очереди, +$15)
          </Text>
        </Pressable>

        {/* Итоговая карточка расчета */}
        <View style={{
          backgroundColor: c.bgSecondary, borderRadius: radius.lg, padding: 18,
          borderWidth: 1, borderColor: c.border, gap: 10,
        }}>
          <T v="label" style={{ color: c.accent }}>Итоговый расчет бюджета поездки</T>

          <Text style={{ fontFamily: fonts.display, fontSize: 32, color: c.textPrimary }}>
            {currency === 'USD' && '$' + totalUsd}
            {currency === 'VND' && totalVnd.toLocaleString('ru-RU') + ' ₫'}
            {currency === 'RUB' && totalRub.toLocaleString('ru-RU') + ' ₽'}
          </Text>

          <T v="muted">
            ≈ {totalUsd} USD · {totalVnd.toLocaleString('ru-RU')} VND · {totalRub.toLocaleString('ru-RU')} RUB
          </T>

          {/* Детализация расходов */}
          <View style={{ borderTopWidth: 1, borderColor: c.border, paddingTop: 10, gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Транспорт ({transportType.toUpperCase()}):</T>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>{formatPrice(transportCost)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Виза ({currentRoute.country}):</T>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: borderVisaCost === 0 ? c.accent : c.textPrimary }}>
                {borderVisaCost === 0 ? '0 ₫ (Безвиз РФ)' : formatPrice(borderVisaCost)}
              </Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Сборы на КПП (~300k VND):</T>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>{formatPrice(borderFeesUsd)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Вьетнамская E-Visa:</T>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>{formatPrice(evisaCost)}</Text>
            </View>
            {needHelper && (
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="muted">Хелпер на КПП:</T>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>{formatPrice(helperCost)}</Text>
              </View>
            )}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="muted">Питание и напитки:</T>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textPrimary }}>{formatPrice(foodCost)}</Text>
            </View>
          </View>
        </View>
      </Card>

      {/* ─── БЛОК 3: ПОШАГОВАЯ ИНСТРУКЦИЯ КПП ЛАО БАО (ШАГИ 1–8) ─── */}
      {(selectedRouteKey === 'danang_laobao' || selectedRouteKey === 'nhatrang_laobao') && (
        <Card accent style={{ padding: space.lg, gap: space.md }}>
          <View style={{ gap: 4 }}>
            <View style={{
              flexDirection: 'row', alignItems: 'center', gap: 6,
              alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
              borderRadius: radius.pill, backgroundColor: c.accentGlow,
            }}>
              <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: c.accent, textTransform: 'uppercase' }}>
                Инструкция Visabus · Время 30–60 минут
              </Text>
            </View>
            <T v="h2" style={{ fontSize: 17 }}>🚶‍♂️ 3. Пошаговый план КПП Лао Бао</T>
            <T v="muted">
              Минивэн паркуется в 100 м от границы и ждёт 1,5 часа. Все этапы простые, ждать друг друга не нужно:
            </T>
          </View>

          <View style={{ gap: 8 }}>
            {[
              { step: 'ШАГ 1', title: 'Проверка паспорта на КПП', badge: '🇻🇳 Вьетнам вход', desc: 'На входе проверяют паспорт. Критично: не должно быть оверстея! Оплатить штраф на КПП невозможно — сразу развернут.' },
              { step: 'ШАГ 2', title: 'Штамп о выезде из Вьетнама', badge: '🇻🇳 Вьетнам выезд', desc: 'Через 200 м главное здание. Пройдите до конца мимо рамок. Развернитесь на 180° к окнам. Отдайте паспорт + 50 000 ₫ (дети бесплатно).' },
              { step: 'ШАГ 3', title: 'Переход нейтральной полосы', badge: '🚶 Нейтралка', desc: 'Выходите из здания и идете пешком в сторону Лаоса (~200 метров). На выходе сотрудники еще раз проверят паспорт.' },
              { step: 'ШАГ 4', title: 'Вход на территорию Лаоса', badge: '🇱🇦 Лаос ворота', desc: 'После уличных ворот держитесь правее и наверх к КПП. Гражданам РФ виза в Лаос НЕ нужна (безвиз) — сразу к будке въезда!' },
              { step: 'ШАГ 5', title: 'Штамп о въезде в Лаос', badge: '🇱🇦 Лаос въезд', desc: 'Будка посередине (между дорогами). Отдаете паспорт, ставят печать въезда в Лаос (проверьте её!). Просят сбор 20 000 ₫.' },
              { step: 'ШАГ 6', title: 'Разворот и штамп выезда', badge: '🇱🇦 Лаос выезд', desc: 'Слева лестница: поднимитесь и сразу спуститесь на другую сторону. В темно-коричневых будках получаете штамп выезда из Лаоса.' },
              { step: 'ШАГ 7 (ГЛАВНЫЙ)', title: 'Въезд во Вьетнам по новой E-Visa', badge: '🇻🇳 Вьетнам Entry', desc: 'Возвращаетесь в терминал Вьетнама, окошко Entry. Сразу четко скажите: «E-Visa 90 days» и отдайте распечатку! Сбор 50 000 ₫.' },
              { step: 'ШАГ 8', title: 'Проверка и сбор у машины', badge: '☕ Финал', desc: 'Проверьте дату нового въездного штампа (+90 дней). Идите к минивэну. Рядом кофейня BUN, где можно выпить кофе перед дорогой!' },
            ].map((s, idx) => (
              <View
                key={idx}
                style={{
                  padding: 12, borderRadius: radius.md, backgroundColor: c.bgSecondary,
                  borderWidth: 1, borderColor: s.step.includes('ГЛАВНЫЙ') ? c.accent : c.border,
                  gap: 4,
                }}
              >
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11, color: c.accent }}>{s.step}</Text>
                  <View style={{ backgroundColor: c.bgPrimary, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
                    <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: c.textMuted }}>{s.badge}</Text>
                  </View>
                </View>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.textPrimary }}>{s.title}</Text>
                <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textSecondary, lineHeight: 16 }}>{s.desc}</Text>
              </View>
            ))}
          </View>
        </Card>
      )}

      {/* ─── БЛОК 4: ЧЕКЛИСТ ДОКУМЕНТОВ В ДОРОГУ & ЛАЙФХАКИ ─── */}
      <Card style={{ padding: space.lg, gap: space.md }}>
        <T v="h2" style={{ fontSize: 17 }}>📋 4. Чеклист документов с собой</T>

        <View style={{ gap: 8 }}>
          {[
            { id: 'passport', text: 'Загранпаспорт (срок действия строго >6 месяцев, 2+ чистые страницы)' },
            { id: 'evisa', text: 'Распечатка новой E-Visa (минимум 2 бумажные копии A4! С телефона не примут)' },
            { id: 'cash_border', text: 'Наличные донги: 200 000 – 300 000 VND (по 50k и 20k) на сборы КПП' },
            { id: 'water_snack', text: 'Бутылка воды и перекус на весь день (на остановках кафе нет)' },
            { id: 'warm_clothes', text: 'Тёплая кофта в салон (в минивэне прохладно из-за кондиционера)' },
            { id: 'pills', text: 'Таблетки от укачивания (Nautamine / Antivomi) — перевал и серпантин' },
            { id: 'powerbank', text: 'Повербанк и провод зарядки' },
            { id: 'trip_fee', text: 'Оплата проезда минивэна (наличные VND / USD)' },
            { id: 'pen', text: 'Шариковая ручка с синей пастой для заполнения бланков' },
          ].map(doc => {
            const checked = !!checkedDocs[doc.id];
            return (
              <Pressable
                key={doc.id}
                onPress={() => toggleDoc(doc.id)}
                style={{
                  flexDirection: 'row', alignItems: 'flex-start', gap: 10,
                  padding: 10, borderRadius: radius.md,
                  backgroundColor: checked ? c.accentGlow : c.bgSecondary,
                  borderWidth: 1, borderColor: checked ? c.accent : c.border,
                }}
              >
                <View style={{
                  width: 18, height: 18, borderRadius: 4, borderWidth: 1.5,
                  borderColor: checked ? c.accent : c.border,
                  backgroundColor: checked ? c.accent : 'transparent',
                  alignItems: 'center', justifyContent: 'center', marginTop: 2,
                }}>
                  {checked && <Check size={13} color="#fff" />}
                </View>
                <Text style={{
                  flex: 1, fontFamily: fonts.bodySemi, fontSize: 12, lineHeight: 17,
                  color: checked ? c.accent : c.textSecondary,
                }}>
                  {doc.text}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Лайфхаки маршрута */}
        <View style={{ borderTopWidth: 1, borderColor: c.border, paddingTop: 12, gap: 8 }}>
          <T v="h3" style={{ fontSize: 14 }}>💡 Лайфхаки для {currentRoute.name}</T>
          {currentRoute.tips.map((tip, idx) => (
            <View key={idx} style={{ padding: 10, borderRadius: 8, backgroundColor: c.bgSecondary, borderWidth: 1, borderColor: c.border }}>
              <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textSecondary, lineHeight: 16 }}>{tip}</Text>
            </View>
          ))}
          <View style={{ padding: 10, borderRadius: 8, backgroundColor: 'rgba(239, 68, 68, 0.08)', borderWidth: 1, borderColor: 'rgba(239, 68, 68, 0.25)' }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: '#ef4444', lineHeight: 16 }}>
              ⚠️ Пункт въезда в E-Visa: Убедитесь, что в анкете визы указан именно КПП {currentRoute.borderPost}, иначе офицеры откажут во въезде!
            </Text>
          </View>
        </View>
      </Card>

      {/* ─── БЛОК 5: ОФИЦИАЛЬНЫЙ ГОСПОРТАЛ E-VISA ─── */}
      <View style={{
        padding: 18, borderRadius: radius.lg,
        backgroundColor: c.accentGlow, borderWidth: 1.5, borderColor: c.borderAccent,
        gap: 10,
      }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Text style={{ fontSize: 18 }}>🌐</Text>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 14, color: c.textPrimary }}>
              Официальный госпортал E-Visa
            </Text>
          </View>
          <View style={{ backgroundColor: c.accent, paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 }}>
            <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 10, color: '#fff' }}>Без комиссий</Text>
          </View>
        </View>

        <Text style={{ fontFamily: fonts.body, fontSize: 12, color: c.textSecondary, lineHeight: 17 }}>
          Остерегайтесь фишинговых сайтов-посредников. Государственный портал иммиграционной службы Вьетнама принимает оплату зарубежными картами на официальном домене .gov.vn.
        </Text>

        <Pressable
          onPress={openGovPortal}
          style={{
            flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
            paddingVertical: 10, paddingHorizontal: 16, borderRadius: radius.md,
            backgroundColor: c.accent, alignSelf: 'flex-start',
          }}
        >
          <ExternalLink size={14} color="#fff" />
          <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12.5, color: '#fff' }}>
            evisa.xuatnhapcanh.gov.vn ↗
          </Text>
        </Pressable>
      </View>

      {/* ─── БЛОК 6: КАЛЬКУЛЯТОР ОВЕРСТЕЯ ВО ВЬЕТНАМЕ ─── */}
      {(() => {
        const currentDays = Math.max(1, overstayDaysInput || 1);
        const activeRule = OVERSTAY_RULES.find(r => currentDays >= r.minDays && currentDays <= r.maxDays) || OVERSTAY_RULES[OVERSTAY_RULES.length - 1];
        const minRub = Math.round(activeRule.minUsd * USD_TO_RUB);
        const maxRub = Math.round(activeRule.maxUsd * USD_TO_RUB);

        return (
          <Card style={{ padding: space.lg, gap: space.md }}>
            <View style={{ gap: 4 }}>
              <View style={{
                flexDirection: 'row', alignItems: 'center', gap: 6,
                alignSelf: 'flex-start', paddingHorizontal: 8, paddingVertical: 3,
                borderRadius: radius.pill, backgroundColor: 'rgba(239,68,68,0.15)',
                borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)',
              }}>
                <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: '#ef4444', textTransform: 'uppercase' }}>
                  ⚖️ Nghị định 144/2021/NĐ-CP · Сетка штрафов
                </Text>
              </View>
              <T v="h2" style={{ fontSize: 17 }}>Калькулятор оверстея во Вьетнаме</T>
              <T v="muted">
                Рассчитайте официальный штраф иммиграционной службы, уровень риска депортации и план действий при просрочке.
              </T>
            </View>

            {/* Ввод дней просрочки */}
            <View style={{
              backgroundColor: c.bgSecondary, borderRadius: radius.md, padding: 14,
              borderWidth: 1, borderColor: c.border, gap: 10,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.textPrimary }}>
                  Сколько дней просрочки?
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <TextInput
                    value={String(overstayDaysInput)}
                    onChangeText={v => setOverstayDaysInput(Math.max(1, parseInt(v) || 1))}
                    keyboardType="number-pad"
                    style={{
                      width: 50, paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6,
                      backgroundColor: c.bgPrimary, borderWidth: 1, borderColor: c.borderAccent,
                      color: c.textPrimary, fontFamily: fonts.bodyHeavy, fontSize: 14, textAlign: 'center',
                    }}
                  />
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 12, color: c.textSecondary }}>дней</Text>
                </View>
              </View>

              {/* Кнопки-пресеты */}
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                {[1, 2, 5, 10, 15, 25, 45, 90].map(d => (
                  <Pressable
                    key={d}
                    onPress={() => { tap(); setOverstayDaysInput(d); }}
                    style={{
                      paddingVertical: 4, paddingHorizontal: 8, borderRadius: 6, borderWidth: 1,
                      borderColor: overstayDaysInput === d ? c.accent : c.border,
                      backgroundColor: overstayDaysInput === d ? c.accentGlow : 'transparent',
                    }}
                  >
                    <Text style={{ fontFamily: fonts.bodyBold, fontSize: 11, color: overstayDaysInput === d ? c.accent : c.textSecondary }}>
                      {d} {d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Карточка вердикта */}
            <View style={{
              borderRadius: radius.lg, padding: 16,
              backgroundColor: c.bgSecondary, borderWidth: 1.5, borderColor: activeRule.riskColor,
              gap: 12,
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{
                  paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.pill,
                  backgroundColor: `${activeRule.riskColor}20`, borderWidth: 1, borderColor: activeRule.riskColor,
                }}>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: activeRule.riskColor }}>
                    {activeRule.riskLabel}
                  </Text>
                </View>
                <T v="muted">Диапазон: {activeRule.range}</T>
              </View>

              {/* Штрафы в 3 валютах */}
              <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
                <View style={{ flex: 1, minWidth: 100, backgroundColor: c.bgPrimary, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: c.textMuted, textTransform: 'uppercase' }}>В донгах (VND)</Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.accent, marginTop: 2 }}>
                    {(activeRule.minVnd / 1000000).toFixed(1)} – {(activeRule.maxVnd / 1000000).toFixed(1)} млн ₫
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: c.bgPrimary, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: c.textMuted, textTransform: 'uppercase' }}>В долларах (USD)</Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: '#f59e0b', marginTop: 2 }}>
                    ${activeRule.minUsd} – ${activeRule.maxUsd}
                  </Text>
                </View>
                <View style={{ flex: 1, minWidth: 90, backgroundColor: c.bgPrimary, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyBold, fontSize: 10, color: c.textMuted, textTransform: 'uppercase' }}>В рублях (RUB)</Text>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 13, color: c.textPrimary, marginTop: 2 }}>
                    {minRub.toLocaleString('ru-RU')} – {maxRub.toLocaleString('ru-RU')} ₽
                  </Text>
                </View>
              </View>

              {/* Регламент и риск блэклиста */}
              <View style={{ gap: 8 }}>
                <View style={{ backgroundColor: c.bgCard, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: c.textPrimary, marginBottom: 2 }}>
                    📋 Регламент: {activeRule.protocol}
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>
                    {activeRule.action}
                  </Text>
                </View>

                <View style={{ backgroundColor: c.bgCard, padding: 10, borderRadius: 8, borderWidth: 1, borderColor: c.border }}>
                  <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: activeRule.riskColor, marginBottom: 2 }}>
                    🚫 Риск Black List:
                  </Text>
                  <Text style={{ fontFamily: fonts.body, fontSize: 11, color: c.textSecondary, lineHeight: 16 }}>
                    {activeRule.blacklist}
                  </Text>
                </View>
              </View>
            </View>

            {/* 4 золотых правила при оверстее */}
            <View style={{ backgroundColor: c.bgSecondary, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, gap: 8 }}>
              <T v="h3" style={{ fontSize: 13.5 }}>💡 4 правила при оверстее:</T>
              <Text style={{ fontFamily: fonts.body, fontSize: 11.5, color: c.textSecondary, lineHeight: 16 }}>
                1. <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>Никаких взяток:</Text> за взятку офицеру КПП грозит уголовная ответственность (ст. 364 УК Вьетнама). Требуйте официальный протокол.{'\n'}
                2. <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>Оплата только в кассу:</Text> штраф оплачивается по фискальной квитанции в кассу погранслужбы.{'\n'}
                3. <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>Приезжайте заранее:</Text> если просрочка 1–15 дней, в аэропорт нужно явиться за 4 часа до вылета.{'\n'}
                4. <Text style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>Не прячьтесь:</Text> чем дольше скрываться, тем выше риск депортации с пожизненным запретом.
              </Text>
            </View>

            {/* Адреса департаментов */}
            <View style={{ backgroundColor: c.bgSecondary, padding: 14, borderRadius: radius.md, borderWidth: 1, borderColor: c.border, gap: 8 }}>
              <T v="h3" style={{ fontSize: 13.5 }}>🏢 Адреса иммиграционных управлений:</T>
              <View style={{ gap: 4 }}>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: c.textPrimary }}>
                  🏛️ Дананг: <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>7 Trần Quý Cáp, Hải Châu (Пн–Пт 08:00–16:30)</Text>
                </Text>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: c.textPrimary }}>
                  🏛️ Сайгон: <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>333-337 Nguyễn Trãi, Quận 1, TP. HCM</Text>
                </Text>
                <Text style={{ fontFamily: fonts.bodyHeavy, fontSize: 11.5, color: c.textPrimary }}>
                  🏛️ Ханой: <Text style={{ fontFamily: fonts.body, color: c.textMuted }}>44-46 Trần Phú, Ba Đình, Hà Nội</Text>
                </Text>
              </View>
            </View>
          </Card>
        );
      })()}
    </Screen>
  );
}
