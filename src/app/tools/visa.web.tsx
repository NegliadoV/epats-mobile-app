import React, { useState, useEffect } from 'react';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth';

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
    description: 'Главный и самый отлаженный маршрут Центрального Вьетнама. Дорога занимает 4:30 в каждую сторону на VIP-минивэне (две остановки по 10 мин по пути туда, одна обратно). Машина ждет 1,5 часа в 100 м от КПП.',
    schedule: [
      { time: '05:30 – 06:00', event: 'Посадка в VIP-минивэн в Дананге (места распределяются по очереди посадки)' },
      { time: '08:00', event: '1-я санитарная остановка (10 мин: туалет и небольшой магазинчик, кафе нет)' },
      { time: '09:30', event: '2-я санитарная остановка (10 мин: туалет и вода перед перевалом)' },
      { time: '10:30', event: 'Прибытие к КПП Лао Бао. Минивэн паркуется в 100 м от границы и ждет 1,5 часа (рядом кофейня BUN)' },
      { time: '10:30 – 11:30', event: 'Прохождение границы (занимает 30–60 мин): выезд из Вьетнама → нейтралка → штамп въезда/выезда Лаоса → въезд во Вьетнам по новой E-Visa' },
      { time: '11:45', event: 'Сбор у машины, проверка нового штампа на 90 дней, кофе в кофейне BUN' },
      { time: '12:00', event: 'Выезд обратно в Дананг (одна остановка на 10 минут по дороге)' },
      { time: '16:30', event: 'Возвращение в Дананг с новым 90-дневным штампом в паспорте!' },
    ],
    tips: [
      'Виза в Лаос гражданам РФ НЕ требуется (безвизовый въезд до 30 дней)! Гражданам стран без безвиза: $45 / 1 200 000 ₫ + 2 фото 3x4.',
      'Сопутствующие сборы на КПП: возьмите около 200 000 – 300 000 VND наличными купюрами по 50k и 20k (выезд 50k, Лаос 20k, въезд 50k). За маленьких детей платить не нужно — сказать «Baby».',
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
      { time: '07:00', event: 'Выезд от парка 23 Сентября / Бен Тхань на комфортабельном минивэне' },
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
      'КПП Лао Бао: держите 300 000 VND на сопутствующие сборы (выезд 50k, Лаос 20k, въезд 50k; за детей платить не нужно).',
      'При возвращении во Вьетнам сразу покажите распечатанную E-Visa, чтобы не поставили 45 дней штампа.',
      'В слипер-басе старайтесь бронировать средний ряд снизу — меньше качает на горных участках.',
      'Также популярен прямой авиаперелет из аэропорта Камрань (CXR) в Куала-Лумпур (KUL) авиакомпанией AirAsia.',
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
      { time: '11:15', event: 'Штамп о выезде из Вьетнама и безвизовый въезд в Лаос (для граждан РФ)' },
      { time: '12:30', event: 'Въездной контроль во Вьетнам по новой 90-дневной визе' },
      { time: '19:30', event: 'Возвращение в Ханой' },
    ],
    tips: [
      'Виза в Лаос для граждан РФ не требуется (безвизовый въезд до 30 дней).',
      'Возьмите с собой 300 000 донгов наличными на сопутствующие сборы на КПП Кау Чео (не доллары).',
      'Сразу предупредите пограничника про новую 90-дневную E-Visa на въезде во Вьетнам.',
      'Возьмите воду, перекус на 14-часовую дорогу и таблетки от укачивания (Nautamine).',
      'Многие экспаты из Ханоя предпочитают однодневный авиа-визаран в Бангкок (DMK) авиакомпаниями AirAsia / VietJet — часто быстрее и комфортнее.',
    ],
  },
  danang_bkk: {
    id: 'danang_bkk',
    name: 'Авиа-визаран: Дананг / Сайгон → Бангкок',
    shortCity: '✈️ Авиа в Бангкок (Таиланд)',
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
      { time: '07:30', event: 'Прибытие в международный терминал аэропорта Дананга / Сайгона' },
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
    action: 'В большинстве случаев при вылете через международные аэропорты (Таншоннят, Нойбай, Дананг) вопрос решается на месте, но процедура составления акта занимает до 3 часов. Наземные КПП могут отказать и направить в городское управление.',
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
    riskLabel: 'Высокий риск (Оформление Exit Visa)',
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
    riskLabel: 'Экстремальный риск (Депортация trục xuất)',
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

function toInputDateFormat(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return year + '-' + month + '-' + day;
}

function getDaysLeft(target: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function generateIcsCalendar(deadline: Date, visaName: string): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const dStart = `${deadline.getFullYear()}${pad(deadline.getMonth() + 1)}${pad(deadline.getDate())}`;
  const nextDay = new Date(deadline);
  nextDay.setDate(nextDay.getDate() + 1);
  const dEnd = `${nextDay.getFullYear()}${pad(nextDay.getMonth() + 1)}${pad(nextDay.getDate())}`;
  const now = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//epats.wiki//Vietnam Visa Tracker//RU',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Дедлайн визы во Вьетнаме (epats.wiki)',
    'BEGIN:VEVENT',
    `UID:visa-${dStart}-${Date.now()}@epats.wiki`,
    `DTSTAMP:${now}Z`,
    `DTSTART;VALUE=DATE:${dStart}`,
    `DTEND;VALUE=DATE:${dEnd}`,
    `SUMMARY:🚨 Дедлайн визы во Вьетнаме (${visaName})`,
    'DESCRIPTION:Крайний день легального нахождения во Вьетнаме. До 23:59 необходимо пересечь границу или вылететь из страны.\\nПодробнее: https://epats.wiki/tools/visa',
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:🔔 epats.wiki: До окончания визы осталось 7 дней! Пора подавать на новую E-visa или бронировать визаран.',
    'TRIGGER:-P7D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:⚠️ Внимание: до дедлайна визы осталось 3 дня! Рекомендуемый день для выезда во избежание оверстея.',
    'TRIGGER:-P3D',
    'END:VALARM',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    'DESCRIPTION:🔴 Срочно: Завтра последний день визы во Вьетнаме! Пересеките границу до 23:59.',
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n');
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

export default function VisaRunUnifiedPage() {
  const [overstayDaysInput, setOverstayDaysInput] = useState<number>(3);
  const [pushStatus, setPushStatus] = useState<string>('idle');

  const { settings, saveSettings } = useAuth();
  const [calcMode, setCalcMode] = useState<CalcMode>('entry');
  const [entryDate, setEntryDate] = useState(() => settings?.entry_date || toInputDateFormat(new Date()));
  const [exitDate, setExitDate] = useState('');
  const [visaType, setVisaType] = useState<VisaType>((settings?.visa_type as VisaType) || 'evisa90_single');

  useEffect(() => {
    if (settings?.entry_date) setEntryDate(settings.entry_date);
    if (settings?.visa_type) setVisaType(settings.visa_type as VisaType);
    if (settings?.city === 'hcm') setSelectedRouteKey('hcm_mokbai');
    else if (settings?.city === 'hanoi') setSelectedRouteKey('hanoi_cautreo');
    else if (settings?.city === 'nhatrang') setSelectedRouteKey('nhatrang_laobao');
  }, [settings?.entry_date, settings?.visa_type, settings?.city]);

  const [result, setResult] = useState<{
    entry: Date;
    deadline: Date;
    daysLeft: number;
    applyDate: Date;
    recommendedBorderDate: Date;
  } | null>(null);

  const [selectedRouteKey, setSelectedRouteKey] = useState<RouteKey>('danang_laobao');
  const [departureTime, setDepartureTime] = useState<string>('03:00');
  const [timelineCopied, setTimelineCopied] = useState<boolean>(false);
  const [transportType, setTransportType] = useState<'vip' | 'bus' | 'flight' | 'bike'>('vip');
  const [nextVisaType, setNextVisaType] = useState<'standard' | 'multi' | 'stamp'>('standard');
  const [needHelper, setNeedHelper] = useState<boolean>(false);
  const [currency, setCurrency] = useState<'USD' | 'VND' | 'RUB'>('USD');

  const [checkedDocs, setCheckedDocs] = useState<Record<string, boolean>>({
    passport: true,
    evisa: true,
    dollars: false,
    photo: false,
    pen: true,
    cash_border: true,
    water_snack: false,
    warm_clothes: true,
    pills: false,
    powerbank: true,
    trip_fee: true,
  });

  const toggleDoc = (k: string) => {
    setCheckedDocs(prev => ({ ...prev, [k]: !prev[k] }));
  };

  const selectedVisaObj = VISA_TYPES.find(v => v.id === visaType)!;
  const maxDays = selectedVisaObj.days;

  useEffect(() => {
    const vt = VISA_TYPES.find(v => v.id === visaType)!;

    if (calcMode === 'entry') {
      if (!entryDate) { setResult(null); return; }
      const entry = new Date(entryDate);
      if (isNaN(entry.getTime())) { setResult(null); return; }
      const deadline = addDays(entry, vt.days - 1);
      const applyDate = addDays(deadline, -10);
      const recommendedBorderDate = addDays(deadline, -3);
      setResult({
        entry,
        deadline,
        daysLeft: getDaysLeft(deadline),
        applyDate,
        recommendedBorderDate,
      });
    } else {
      if (!exitDate) { setResult(null); return; }
      const deadline = new Date(exitDate);
      if (isNaN(deadline.getTime())) { setResult(null); return; }
      const entry = addDays(deadline, -(vt.days - 1));
      const applyDate = addDays(deadline, -10);
      const recommendedBorderDate = addDays(deadline, -3);
      setResult({
        entry,
        deadline,
        daysLeft: getDaysLeft(deadline),
        applyDate,
        recommendedBorderDate,
      });
    }
  }, [calcMode, entryDate, exitDate, visaType]);

  const handleModeChange = (newMode: CalcMode) => {
    setCalcMode(newMode);
    if (newMode === 'exit' && result && !exitDate) {
      setExitDate(toInputDateFormat(result.deadline));
    } else if (newMode === 'entry' && result && !entryDate) {
      setEntryDate(toInputDateFormat(result.entry));
    }
  };

  const handleDownloadIcs = () => {
    if (!result) return;
    const ics = generateIcsCalendar(result.deadline, selectedVisaObj.name);
    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vietnam-visa-deadline-${calDateStr}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRequestPush = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      alert('Ваш браузер не поддерживает Web Notifications. Рекомендуем скачать .ics для календаря.');
      return;
    }
    const perm = await Notification.requestPermission();
    setPushStatus(perm);
    if (perm === 'granted') {
      new Notification('🔔 epats.wiki: Напоминания активированы!', {
        body: `Дедлайн ${formatDate(result!.deadline)}. Напоминания сработают за 7 и 3 дня до даты выезда.`,
      });
    } else {
      alert('Уведомления отклонены в настройках браузера. Скачайте .ics файл для системного календаря.');
    }
  };

  const statusColor = !result
    ? 'var(--text-muted)'
    : result.daysLeft > 14
    ? 'var(--accent)'
    : result.daysLeft > 5
    ? '#f59e0b'
    : '#ef4444';

  const statusLabel = !result
    ? ''
    : result.daysLeft > 14
    ? '✅ Документы в порядке'
    : result.daysLeft > 5
    ? '⚠️ Внимание: пора подавать на новую визу'
    : result.daysLeft <= 0
    ? '🚨 ПРОСРОЧЕНО (ОВЕРСТЕЙ)!'
    : '🔴 Срочно планируйте визаран!';

  const calDateStr = result ? result.deadline.toISOString().replace(/[-:]/g, '').slice(0, 8) : '';
  const gcal = result
    ? 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=Дедлайн+визы+во+Вьетнаме&dates=' +
      calDateStr + '/' + calDateStr +
      '&details=Крайний+день+нахождения+во+Вьетнаме+по+визе.+Необходимо+выехать+на+визаран.'
    : '';

  const pct = result ? Math.max(0, Math.min(100, (result.daysLeft / maxDays) * 100)) : 0;

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
  const borderFeesUsd = 12;
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

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      overflowY: 'auto',
      overflowX: 'hidden',
      WebkitOverflowScrolling: 'touch',
      boxSizing: 'border-box',
      backgroundColor: '#120b1e',
      backgroundImage: `
        radial-gradient(ellipse 70% 45% at 85% -10%, rgba(255,154,60,0.22) 0%, transparent 60%),
        radial-gradient(ellipse 60% 40% at 0% 0%, rgba(255,107,74,0.16) 0%, transparent 55%),
        radial-gradient(ellipse 50% 40% at 50% 110%, rgba(31,209,193,0.12) 0%, transparent 60%),
        radial-gradient(ellipse 40% 30% at 100% 60%, rgba(180,107,255,0.10) 0%, transparent 60%)
      `,
      backgroundAttachment: 'fixed',
      color: '#fbf4ff',
      fontFamily: `'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`,
    }}>
      <style>{`
        :root {
          --bg-primary: #120b1e;
          --bg-secondary: #1a1030;
          --bg-card: #1c1233;
          --bg-card-hover: #241843;
          --border: rgba(255,255,255,0.08);
          --border-accent: rgba(31,209,193,0.45);
          --accent: #1fd1c1;
          --accent-light: #5eead4;
          --accent-glow: rgba(31,209,193,0.14);
          --gold: #ffb547;
          --coral: #ff6b4a;
          --pink: #ff9a3c;
          --orchid: #b46bff;
          --text-primary: #fbf4ff;
          --text-secondary: #c4b5d9;
          --text-muted: #7c6c96;
        }

        .glass {
          background: linear-gradient(160deg, rgba(40,26,70,0.72) 0%, rgba(24,15,44,0.78) 100%) !important;
          backdrop-filter: blur(18px) saturate(140%) !important;
          -webkit-backdrop-filter: blur(18px) saturate(140%) !important;
          border: 1px solid rgba(255,255,255,0.08) !important;
          border-radius: 20px !important;
          box-shadow: 0 10px 40px -12px rgba(0,0,0,0.6) !important;
        }

        .glass:hover {
          border-color: rgba(31,209,193,0.45) !important;
        }

        input[type="date"]::-webkit-calendar-picker-indicator {
          filter: invert(0.8) sepia(1) saturate(5) hue-rotate(130deg);
          cursor: pointer;
        }
      `}</style>

      <main style={{ paddingTop: 10, paddingBottom: 60 }}>
        <div style={{ maxWidth: 1040, margin: '0 auto', padding: '20px 20px 80px' }}>
          {/* Breadcrumbs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, fontSize: 13 }}>
            <BrandLogo size={20} />
            <a href="/" style={{ color: '#fff', fontWeight: 800, textDecoration: 'none' }}>epats.wiki</a>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <a href="/tools" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Инструменты</a>
            <span style={{ color: 'var(--text-muted)' }}>→</span>
            <span style={{ color: 'var(--accent)' }}>🚌 Визаран</span>
          </nav>

          {/* Title */}
          <div style={{ textAlign: 'center', marginBottom: 36 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
              borderRadius: 999, padding: '5px 18px', marginBottom: 14,
              fontSize: 12, color: 'var(--accent)', fontWeight: 600,
            }}>
              🇻🇳 Визовый трекер & Калькулятор визарана под ключ · 2026
            </div>
            <h1 style={{ fontSize: 'clamp(1.9rem, 4vw, 2.7rem)', fontWeight: 800, letterSpacing: '-1px', marginBottom: 12 }}>
              🚌 Визаран и визовый калькулятор
            </h1>
            <p style={{ fontSize: 15, color: 'var(--text-secondary)', maxWidth: 660, margin: '0 auto', lineHeight: 1.7 }}>
              Отслеживайте дедлайн по дате въезда или дате из штампа (UNTIL), рассчитывайте рекомендуемый день выезда и бюджет поездки под ключ (Лаос, Камбоджа, Таиланд).
            </p>
          </div>

          {/* BLOCK 1: VISA DEADLINE & STATUS TRACKER */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
            {/* Left: Input controls */}
            <div className="glass" style={{ padding: 28 }}>
              <h2 style={{ fontSize: 17, fontWeight: 800, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span>🛂 1. Параметры вашего въезда</span>
              </h2>

              {/* Mode switch */}
              <div style={{
                display: 'flex', gap: 6, marginBottom: 18,
                background: 'var(--bg-primary)', padding: 4, borderRadius: 12,
                border: '1px solid var(--border)',
              }}>
                <button
                  type="button"
                  onClick={() => handleModeChange('entry')}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none',
                    background: calcMode === 'entry' ? 'var(--accent)' : 'transparent',
                    color: calcMode === 'entry' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span>📥 По дате въезда</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleModeChange('exit')}
                  style={{
                    flex: 1, padding: '9px 12px', borderRadius: 9, border: 'none',
                    background: calcMode === 'exit' ? 'var(--accent)' : 'transparent',
                    color: calcMode === 'exit' ? '#fff' : 'var(--text-secondary)',
                    fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}
                >
                  <span>📤 По дате выезда (UNTIL)</span>
                </button>
              </div>

              {/* Date input */}
              {calcMode === 'entry' ? (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Дата въездного штампа (DATE OF ENTRY):
                  </label>
                  <input
                    type="date"
                    value={entryDate}
                    onChange={e => setEntryDate(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid var(--border-accent)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    День въезда считается 1-м днём. Дедлайн будет рассчитан по выбранному типу визы.
                  </span>
                  {result && (
                    <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                      👉 Крайний день нахождения: <b>{formatDate(result.deadline)}</b>
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: 20 }}>
                  <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Дата выезда из штампа (UNTIL / HẠN ĐẾN):
                  </label>
                  <input
                    type="date"
                    value={exitDate}
                    onChange={e => setExitDate(e.target.value)}
                    style={{
                      width: '100%', padding: '12px 16px', borderRadius: 12,
                      border: '1.5px solid var(--border-accent)', background: 'var(--bg-secondary)',
                      color: 'var(--text-primary)', fontSize: 15, fontWeight: 600, outline: 'none',
                    }}
                  />
                  <span style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4, display: 'block' }}>
                    Посмотрите в паспорте штамп со словами <b>UNTIL</b> или строку <b>Valid until</b> в визе.
                  </span>
                  {result && (
                    <div style={{ marginTop: 8, padding: '6px 12px', borderRadius: 8, background: 'var(--bg-primary)', border: '1px solid var(--border)', fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>
                      👉 Расчетная дата въезда: <b>{formatDate(result.entry)}</b> ({maxDays} дней)
                    </div>
                  )}
                </div>
              )}

              {/* Visa type selector */}
              <div>
                <label style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', display: 'block', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  Тип визы / основание въезда:
                </label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {VISA_TYPES.map(v => {
                    const isSelected = visaType === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setVisaType(v.id)}
                        style={{
                          padding: '12px 14px', borderRadius: 12, border: '1.5px solid',
                          borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                          background: isSelected ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                          cursor: 'pointer', transition: 'all 0.15s ease',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                          <span style={{ fontWeight: 800, fontSize: 13, color: isSelected ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {v.name}
                          </span>
                          <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--bg-primary)', color: 'var(--accent)', border: '1px solid var(--border)' }}>
                            {v.cost}
                          </span>
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.45 }}>
                          {v.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Results & Countdown Card */}
            <div className="glass" style={{ padding: 28, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {!result ? (
                <div style={{ textAlign: 'center', margin: 'auto', padding: '30px 10px' }}>
                  <div style={{ fontSize: 58, marginBottom: 16 }}>🗓️</div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>
                    {calcMode === 'entry' ? 'Укажите дату въезда' : 'Укажите дату выезда из штампа'}
                  </h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: 13, maxWidth: 300, margin: '0 auto', lineHeight: 1.6 }}>
                    Калькулятор рассчитает точный дедлайн, обратный отсчет дней и персональный график подготовки к выезду.
                  </p>
                </div>
              ) : (
                <>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                      <span style={{
                        fontSize: 12, fontWeight: 700, color: statusColor,
                        padding: '4px 12px', borderRadius: 999, border: '1px solid ' + statusColor,
                        background: statusColor + '18',
                      }}>
                        {statusLabel}
                      </span>
                      <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Всего: {maxDays} дней
                      </span>
                    </div>

                    <div style={{ textAlign: 'center', padding: '14px 0 8px' }}>
                      <div style={{
                        fontSize: 84, fontWeight: 900, lineHeight: 1, letterSpacing: '-2px',
                        background: result.daysLeft <= 5
                          ? 'linear-gradient(135deg, #ef4444 0%, #f97316 100%)'
                          : result.daysLeft <= 14
                          ? 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)'
                          : 'linear-gradient(135deg, #1fd1c1 0%, #10b981 50%, #06b6d4 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        filter: 'drop-shadow(0 4px 14px rgba(0,0,0,0.15))',
                      }}>
                        {Math.max(0, result.daysLeft)}
                      </div>
                      <div style={{ fontSize: 14, color: 'var(--text-muted)', fontWeight: 600, marginTop: 6 }}>
                        {result.daysLeft === 1 ? 'день остался' : result.daysLeft >= 2 && result.daysLeft <= 4 ? 'дня осталось' : 'дней осталось'}
                      </div>
                    </div>

                    {/* Dynamic gradient bar */}
                    <div style={{ marginTop: 8, marginBottom: 22 }}>
                      <div style={{
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', marginBottom: 6,
                      }}>
                        <span style={{ color: result.daysLeft <= 5 ? '#ef4444' : 'var(--text-muted)' }}>
                          🚨 0 дн (дедлайн)
                        </span>
                        <span style={{
                          padding: '2px 8px', borderRadius: 6, background: 'var(--bg-secondary)',
                          border: '1px solid var(--border)', color: 'var(--text-primary)',
                          fontWeight: 800, fontSize: 11,
                        }}>
                          {result.daysLeft > 0 ? `${result.daysLeft} из ${maxDays} дн (${Math.round(pct)}%)` : '0 дн (оверстей)'}
                        </span>
                        <span style={{ color: 'var(--accent)' }}>
                          🏁 {maxDays} дн (макс)
                        </span>
                      </div>

                      <div style={{
                        width: '100%', height: 14, borderRadius: 99, background: 'var(--bg-secondary)',
                        border: '1px solid var(--border)', padding: 2, overflow: 'hidden',
                        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.25)',
                      }}>
                        <div style={{
                          height: '100%', width: `${pct}%`, minWidth: pct > 0 ? 10 : 0,
                          background: result.daysLeft <= 5
                            ? 'linear-gradient(90deg, #b91c1c 0%, #ef4444 60%, #f97316 100%)'
                            : result.daysLeft <= 14
                            ? 'linear-gradient(90deg, #ef4444 0%, #f59e0b 50%, #fbbf24 100%)'
                            : 'linear-gradient(90deg, #f59e0b 0%, #10b981 35%, #1fd1c1 70%, #06b6d4 100%)',
                          borderRadius: 99, transition: 'width 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          boxShadow: result.daysLeft <= 5
                            ? '0 0 12px rgba(239, 68, 68, 0.65)'
                            : result.daysLeft <= 14
                            ? '0 0 12px rgba(245, 158, 11, 0.55)'
                            : '0 0 14px rgba(31, 209, 193, 0.6)',
                        }} />
                      </div>
                    </div>

                    {/* Action Timeline */}
                    <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: '16px', border: '1px solid var(--border)', marginBottom: 18 }}>
                      <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 12, letterSpacing: 0.6 }}>
                        🗓️ График рекомендуемых действий
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 14 }}>🟡</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-primary)' }}>
                              {formatShortDate(result.applyDate)} — Подать на новую E-Visa
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              Рассмотрение занимает 3–5 рабочих дней на оф. сайте
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 14 }}>🟠</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: '#f59e0b' }}>
                              {formatShortDate(result.recommendedBorderDate)} — Рекомендуемый день визарана
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              За 3 дня до дедлайна, чтобы избежать форс-мажоров и очередей
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                          <span style={{ fontSize: 14 }}>🔴</span>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--accent)' }}>
                              {formatDate(result.deadline)} — КРАЙНИЙ СРОК (Дедлайн)
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                              В этот день вы обязаны пересечь границу до 23:59
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                    <a
                      href={gcal}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        flex: 1, minWidth: 140, textAlign: 'center', padding: '10px 14px', borderRadius: 10,
                        background: 'var(--accent)', color: 'white', fontWeight: 700, fontSize: 13,
                        textDecoration: 'none', boxShadow: '0 4px 14px rgba(31,209,193,0.3)',
                      }}
                    >
                      📅 Google Календарь
                    </a>
                    <button
                      type="button"
                      onClick={handleDownloadIcs}
                      style={{
                        flex: 1, minWidth: 160, textAlign: 'center', padding: '10px 14px', borderRadius: 10,
                        background: 'linear-gradient(135deg, rgba(31,209,193,0.2) 0%, rgba(59,130,246,0.2) 100%)',
                        border: '1px solid var(--border-accent)',
                        color: 'var(--text-primary)', fontWeight: 700, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      📥 Скачать .ics
                    </button>
                    <a
                      href="https://evisa.xuatnhapcanh.gov.vn/"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        padding: '10px 14px', borderRadius: 10,
                        background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                        color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, textDecoration: 'none',
                      }}
                    >
                      Госпортал e-visa ↗
                    </a>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* BLOCK 2: INTERACTIVE BUDGET CALCULATOR */}
          <div className="glass" style={{ padding: 32, marginBottom: 32 }}>
            {result && (
              <div style={{
                padding: '12px 18px', borderRadius: 12,
                background: 'linear-gradient(135deg, rgba(31,209,193,0.12) 0%, rgba(59,130,246,0.08) 100%)',
                border: '1px solid var(--border-accent)', marginBottom: 24,
                display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
              }}>
                <span style={{ fontSize: 22 }}>🎯</span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
                    Ваш дедлайн: <b>{formatDate(result.deadline)}</b>. Рекомендуем выезд <b>до {formatShortDate(result.recommendedBorderDate)}</b>.
                  </span>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
              <div>
                <h2 style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  💰 2. Калькулятор бюджета визарана «под ключ»
                </h2>
                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  Маршрут: {currentRoute.name} ({currentRoute.distanceKm} км в одну сторону)
                </span>
              </div>

              {/* Currency toggle */}
              <div style={{ display: 'flex', gap: 6, background: 'var(--bg-secondary)', padding: 4, borderRadius: 10, border: '1px solid var(--border)' }}>
                {(['USD', 'VND', 'RUB'] as const).map(cur => (
                  <button
                    key={cur}
                    onClick={() => setCurrency(cur)}
                    style={{
                      padding: '5px 12px', borderRadius: 8, border: 'none',
                      background: currency === cur ? 'var(--accent)' : 'transparent',
                      color: currency === cur ? '#fff' : 'var(--text-muted)',
                      fontWeight: 700, fontSize: 12, cursor: 'pointer',
                    }}
                  >
                    {cur}
                  </button>
                ))}
              </div>
            </div>

            {/* Route tabs */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {Object.entries(BORDER_ROUTES).map(([key, r]) => {
                const active = selectedRouteKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedRouteKey(key as RouteKey)}
                    style={{
                      padding: '10px 16px', borderRadius: 12, border: '1.5px solid',
                      borderColor: active ? 'var(--accent)' : 'var(--border)',
                      background: active ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      color: active ? 'var(--accent)' : 'var(--text-secondary)',
                      fontWeight: active ? 800 : 600, fontSize: 13, cursor: 'pointer',
                    }}
                  >
                    {r.shortCity}
                  </button>
                );
              })}
            </div>

            {/* ROUTE TIMELINE GENERATOR */}
            <div style={{
              background: 'var(--bg-secondary)', borderRadius: 16, padding: '22px 24px',
              border: '1.5px solid var(--border-accent)', marginBottom: 28,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 14, marginBottom: 16 }}>
                <div>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    padding: '3px 10px', borderRadius: 999,
                    background: 'var(--accent-glow)', border: '1px solid var(--border-accent)',
                    color: 'var(--accent)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', marginBottom: 6,
                  }}>
                    ⏱️ Интерактивный генератор таймлайна
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Расписание визарана по часам: {currentRoute.name}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--bg-card)', padding: '6px 12px', borderRadius: 12, border: '1px solid var(--border)' }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}>Выезд:</span>
                  <input
                    type="time"
                    value={departureTime}
                    onChange={e => setDepartureTime(e.target.value)}
                    style={{
                      background: 'var(--bg-secondary)', border: '1px solid var(--border-accent)',
                      color: 'var(--accent)', fontWeight: 800, fontSize: 15, padding: '4px 8px', borderRadius: 8,
                    }}
                  />
                </div>
              </div>

              {/* Quick Presets */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
                {[
                  { time: '03:00', label: '🌙 03:00 — Без очередей (Топ выбор)' },
                  { time: '04:30', label: '🌅 04:30 — Стандартный тур' },
                  { time: '06:00', label: '☀️ 06:00 — Поздний выезд' },
                ].map(p => (
                  <button
                    key={p.time}
                    type="button"
                    onClick={() => setDepartureTime(p.time)}
                    style={{
                      padding: '8px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      border: '1px solid',
                      borderColor: departureTime === p.time ? 'var(--accent)' : 'var(--border)',
                      background: departureTime === p.time ? 'var(--accent-glow)' : 'transparent',
                      color: departureTime === p.time ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Traffic load pill */}
              <div style={{
                padding: '10px 16px', borderRadius: 10, marginBottom: 22,
                background: departureTime <= '04:00' ? 'rgba(31,209,193,0.12)' : departureTime <= '05:00' ? 'rgba(245,158,11,0.12)' : 'rgba(239,68,68,0.12)',
                border: '1px solid',
                borderColor: departureTime <= '04:00' ? 'rgba(31,209,193,0.4)' : departureTime <= '05:00' ? 'rgba(245,158,11,0.4)' : 'rgba(239,68,68,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
              }}>
                <span style={{
                  fontSize: 12, fontWeight: 700,
                  color: departureTime <= '04:00' ? 'var(--accent)' : departureTime <= '05:00' ? '#f59e0b' : '#ef4444',
                }}>
                  {departureTime <= '04:00'
                    ? '🟢 Идеальный тайминг: прибытие к открытию границы, прохождение за 25–40 минут!'
                    : departureTime <= '05:00'
                    ? '🟡 Умеренная загрузка: на границе будут 3–4 других туристических минивэна.'
                    : '🔴 Высокая загрузка: прибытие в пик рейсовых автобусов, ожидание в очереди до 2 часов.'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const activeT = ROUTE_TIMELINES[selectedRouteKey] || ROUTE_TIMELINES.danang_laobao;
                    const text = activeT.steps.map(s => `${formatOffsetTime(departureTime, s.minutesFromStart)} — ${s.label} (${s.location})`).join('\n');
                    navigator.clipboard.writeText(text);
                    setTimelineCopied(true);
                    setTimeout(() => setTimelineCopied(false), 2000);
                  }}
                  style={{
                    padding: '5px 12px', borderRadius: 8, fontSize: 11, fontWeight: 700, cursor: 'pointer',
                    background: 'var(--bg-secondary)', border: '1px solid var(--border)', color: 'var(--text-primary)',
                  }}
                >
                  {timelineCopied ? '✓ Скопировано' : '📋 Скопировать таймлайн'}
                </button>
              </div>

              {/* Visual Timeline Grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
                {(ROUTE_TIMELINES[selectedRouteKey] || ROUTE_TIMELINES.danang_laobao).steps.map((st, i) => {
                  const stepTime = formatOffsetTime(departureTime, st.minutesFromStart);
                  return (
                    <div
                      key={i}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 14,
                        padding: '12px 16px', borderRadius: 12,
                        background: st.critical ? 'rgba(31,209,193,0.06)' : 'rgba(255,255,255,0.02)',
                        border: st.critical ? '1.5px solid var(--border-accent)' : '1px solid var(--border)',
                      }}
                    >
                      <div style={{
                        minWidth: 80, padding: '4px 8px', borderRadius: 8,
                        background: st.critical ? 'var(--accent)' : 'var(--bg-card)',
                        color: st.critical ? '#fff' : 'var(--accent)',
                        fontWeight: 800, fontSize: 13, textAlign: 'center',
                      }}>
                        {stepTime}
                      </div>

                      <div style={{ fontSize: 20, flexShrink: 0 }}>{st.icon}</div>

                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                          <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>{st.label}</strong>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>({st.location})</span>
                          {st.critical && (
                            <span style={{ fontSize: 10, fontWeight: 800, padding: '2px 6px', borderRadius: 4, background: '#ef4444', color: '#fff' }}>
                              ВАЖНО
                            </span>
                          )}
                        </div>
                        <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          {st.tip}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transport & Cost Breakdown */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, alignItems: 'start' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                    🚍 Способ передвижения:
                  </label>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                    {[
                      { id: 'vip', label: '🚐 VIP-Минивэн (Тур)', cost: currentRoute.transferVipUsd },
                      { id: 'bus', label: '🚌 Рейсовый автобус', cost: currentRoute.transferBusUsd },
                      { id: 'flight', label: '✈️ Самолет (Air-run)', cost: currentRoute.flightUsd },
                      { id: 'bike', label: '🛵 На своем байке', cost: currentRoute.transferBikeUsd },
                    ].map(t => (
                      <button
                        key={t.id}
                        onClick={() => setTransportType(t.id as any)}
                        style={{
                          padding: '10px 12px', borderRadius: 10, border: '1.5px solid',
                          borderColor: transportType === t.id ? 'var(--accent)' : 'var(--border)',
                          background: transportType === t.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                          color: transportType === t.id ? 'var(--accent)' : 'var(--text-secondary)',
                          cursor: 'pointer', textAlign: 'left', fontSize: 12, fontWeight: 600,
                        }}
                      >
                        <div>{t.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{formatPrice(t.cost)}</div>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', display: 'block', marginBottom: 8 }}>
                    📄 Виза для следующего въезда во Вьетнам:
                  </label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {[
                      { id: 'standard', title: 'E-Visa 90 дней (Single Entry)', cost: 25, sub: 'Самый популярный выбор зимовщиков' },
                      { id: 'multi', title: 'E-Visa 90 дней (Multiple Entry)', cost: 50, sub: 'Свободный выезд без потери визы' },
                      { id: 'stamp', title: 'Штамп 45 дней (для граждан РФ)', cost: 0, sub: 'Бесплатный штамп в паспорт без визы' },
                    ].map(v => (
                      <div
                        key={v.id}
                        onClick={() => setNextVisaType(v.id as any)}
                        style={{
                          padding: '10px 14px', borderRadius: 10, border: '1px solid',
                          borderColor: nextVisaType === v.id ? 'var(--accent)' : 'var(--border)',
                          background: nextVisaType === v.id ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                          cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: nextVisaType === v.id ? 'var(--accent)' : 'var(--text-primary)' }}>
                            {v.title}
                          </div>
                          <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{v.sub}</div>
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {formatPrice(v.cost)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, color: 'var(--text-secondary)' }}>
                  <input
                    type="checkbox"
                    checked={needHelper}
                    onChange={e => setNeedHelper(e.target.checked)}
                    style={{ width: 18, height: 18, accentColor: 'var(--accent)' }}
                  />
                  <span>Помощник на границе (Fast-Track без очереди, +$15)</span>
                </label>
              </div>

              {/* Total Budget Card */}
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: 16,
                padding: '24px 22px', border: '1px solid var(--border)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}>
                  Итоговый расчет бюджета поездки
                </div>

                <div style={{ fontSize: 40, fontWeight: 900, color: 'var(--text-primary)', lineHeight: 1.1, marginBottom: 6 }}>
                  {currency === 'USD' && '$' + totalUsd}
                  {currency === 'VND' && totalVnd.toLocaleString('ru-RU') + ' ₫'}
                  {currency === 'RUB' && totalRub.toLocaleString('ru-RU') + ' ₽'}
                </div>

                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20 }}>
                  ≈ {totalUsd} USD · {totalVnd.toLocaleString('ru-RU')} VND · {totalRub.toLocaleString('ru-RU')} RUB
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Транспорт ({transportType.toUpperCase()}):</span>
                    <b>{formatPrice(transportCost)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Виза ({currentRoute.country}):</span>
                    <b style={{ color: borderVisaCost === 0 ? 'var(--accent)' : 'inherit' }}>
                      {borderVisaCost === 0 ? '0 ₫ (Безвиз РФ)' : formatPrice(borderVisaCost)}
                    </b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Сборы на КПП (~300k VND):</span>
                    <b>{formatPrice(borderFeesUsd)}</b>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Вьетнамская E-Visa:</span>
                    <b>{formatPrice(evisaCost)}</b>
                  </div>
                  {needHelper && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                      <span>Хелпер на КПП:</span>
                      <b>{formatPrice(helperCost)}</b>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                    <span>Питание и напитки:</span>
                    <b>{formatPrice(foodCost)}</b>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 3: LAO BAO STEP-BY-STEP (DANANG / NHATRANG) */}
          {(selectedRouteKey === 'danang_laobao' || selectedRouteKey === 'nhatrang_laobao') && (
            <div className="glass" style={{ padding: '30px 26px', marginBottom: 32, border: '1.5px solid var(--border-accent)' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 12 }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--accent)', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                    Инструкция Visabus · Время на границе 30–60 минут
                  </span>
                  <h2 style={{ fontSize: 'clamp(18px, 3vw, 22px)', fontWeight: 800, color: 'var(--text-primary)', marginTop: 4 }}>
                    🚶‍♂️ 3. Пошаговый план прохождения КПП Лао Бао (Шаги 1–8)
                  </h2>
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: 'rgba(34, 197, 94, 0.12)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', fontWeight: 700 }}>
                    🇷🇺 РФ: Виза в Лаос 0$ (Безвиз 30 дней)
                  </span>
                  <span style={{ fontSize: 12, padding: '5px 12px', borderRadius: 999, background: 'var(--accent-glow)', color: 'var(--accent)', border: '1px solid var(--border-accent)', fontWeight: 700 }}>
                    💵 Сборы: 200k–300k VND
                  </span>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: 16 }}>
                {[
                  { step: 'ШАГ 1', badge: '🇻🇳 Вьетнам вход', title: 'Проверка паспорта на КПП', desc: 'Подходите к границе, на входе проверяют паспорт. Критично: не должно быть оверстея! Оплатить штраф на КПП невозможно — сразу развернут в город.' },
                  { step: 'ШАГ 2', badge: '🇻🇳 Вьетнам выезд', title: 'Штамп о выезде из Вьетнама', desc: 'Метров через 200 главное здание. За последним рядом комнаток развернитесь на 180° к окнам. Отдайте паспорт + 50 000 ₫ (дети бесплатно).' },
                  { step: 'ШАГ 3', badge: '🚶 Нейтралка', title: 'Переход нейтральной полосы', desc: 'Выходите из вьетнамского здания и идете пешком в сторону Лаоса (~200 м). На выходе сотрудники еще раз проверят паспорт.' },
                  { step: 'ШАГ 4', badge: '🇱🇦 Лаос ворота', title: 'Вход на территорию Лаоса', desc: 'После уличных ворот держитесь правее и наверх к КПП. Гражданам РФ виза в Лаос НЕ нужна (безвиз) — сразу к будке въезда!' },
                  { step: 'ШАГ 5', badge: '🇱🇦 Лаос въезд', title: 'Штамп о въезде в Лаос', desc: 'Будка посередине (между дорогами). Отдаете паспорт, ставят печать въезда в Лаос (проверьте её!). Просят сбор 20 000 ₫.' },
                  { step: 'ШАГ 6', badge: '🇱🇦 Лаос выезд', title: 'Разворот и штамп выезда', desc: 'Слева лестница: поднимитесь и сразу спуститесь на другую сторону. В темно-коричневых будках получаете штамп выезда из Лаоса.' },
                  { step: 'ШАГ 7 (ГЛАВНЫЙ)', badge: '🇻🇳 Вьетнам Entry', title: 'Въезд во Вьетнам по новой E-Visa', desc: 'Возвращаетесь во вьетнамское КПП, окно Entry. Сразу четко скажите: «E-Visa 90 days» и отдайте распечатку! Сбор 50 000 ₫.' },
                  { step: 'ШАГ 8', badge: '☕ Финал', title: 'Проверка и сбор у машины', desc: 'Проверьте дату нового штампа (+90 дней). На последних воротах покажите паспорт и идите к минивэну. Рядом кофейня BUN!' },
                ].map((s, idx) => (
                  <div key={idx} style={{ padding: 18, borderRadius: 14, background: 'var(--bg-secondary)', border: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--accent)' }}>{s.step}</span>
                      <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 6, background: 'var(--accent-glow)', color: 'var(--accent)', fontWeight: 700 }}>{s.badge}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)' }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.55 }}>{s.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BLOCK 4: CHECKLIST & LIFEHACKS */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(310px, 1fr))', gap: 20, marginBottom: 32 }}>
            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                📋 4. Чеклист документов в дорогу
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { id: 'passport', text: 'Загранпаспорт (срок действия строго >6 месяцев, минимум 2 чистые страницы)' },
                  { id: 'evisa', text: 'Распечатка новой E-Visa (минимум 2 бумажные копии A4! С телефона не принимают)' },
                  { id: 'cash_border', text: 'Наличные донги: 200 000 – 300 000 VND (по 50k и 20k) на сборы КПП' },
                  { id: 'water_snack', text: 'Бутылка воды и перекус на весь день (на 10-мин остановках кафе нет)' },
                  { id: 'warm_clothes', text: 'Тёплая кофта в салон (в машине прохладно из-за кондиционера)' },
                  { id: 'pills', text: 'Таблетки от укачивания (Nautamine или Antivomi) — перевал и серпантин' },
                  { id: 'powerbank', text: 'Повербанк и провод для зарядки смартфона' },
                  { id: 'trip_fee', text: 'Оплата проезда минивэна (наличные VND / USD)' },
                  { id: 'pen', text: 'Шариковая ручка для заполнения карточек' },
                ].map(doc => (
                  <label
                    key={doc.id}
                    onClick={() => toggleDoc(doc.id)}
                    style={{
                      display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 10px',
                      borderRadius: 8, background: checkedDocs[doc.id] ? 'var(--accent-glow)' : 'var(--bg-secondary)',
                      cursor: 'pointer', fontSize: 13, color: checkedDocs[doc.id] ? 'var(--accent)' : 'var(--text-secondary)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={!!checkedDocs[doc.id]}
                      onChange={() => {}}
                      style={{ marginTop: 2, width: 16, height: 16, accentColor: 'var(--accent)' }}
                    />
                    <span style={{ lineHeight: 1.45 }}>{doc.text}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="glass" style={{ padding: 28 }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 14 }}>
                💡 Главные лайфхаки для {currentRoute.name}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
                {currentRoute.tips.map((tip, idx) => (
                  <div key={idx} style={{ padding: '10px 12px', borderRadius: 10, background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                    {tip}
                  </div>
                ))}
                <div style={{ padding: '10px 12px', borderRadius: 10, background: 'rgba(239, 68, 68, 0.08)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#ef4444' }}>
                  <b>⚠️ Пункт въезда в E-Visa:</b> Убедитесь, что в анкете визы указан именно КПП <u>{currentRoute.borderPost}</u>, иначе пограничники откажут во въезде!
                </div>
              </div>
            </div>
          </div>

          {/* BLOCK 5: OFFICIAL EVISA BANNER */}
          <div style={{
            marginBottom: 32, padding: '20px 24px', borderRadius: 14,
            background: 'linear-gradient(135deg, rgba(31,209,193,0.1) 0%, rgba(59,130,246,0.08) 100%)',
            border: '1.5px solid var(--border-accent)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16,
          }}>
            <div style={{ maxWidth: 650 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 20 }}>🌐</span>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                  Официальный госпортал E-Visa Вьетнама
                </h3>
                <span style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6, background: 'var(--accent)', color: '#fff' }}>
                  Без комиссий
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-secondary)', margin: 0, lineHeight: 1.6 }}>
                Остерегайтесь фишинговых сайтов-посредников. Государственный портал иммиграционной службы Вьетнама принимает оплату ($25 однократная, $50 многократная) зарубежными картами на официальном домене <b>.gov.vn</b>.
              </p>
            </div>
            <a
              href="https://evisa.xuatnhapcanh.gov.vn/"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: '10px 18px', borderRadius: 10, background: 'var(--accent)',
                color: 'white', fontWeight: 800, fontSize: 13, textDecoration: 'none',
                boxShadow: '0 4px 16px rgba(31,209,193,0.25)', whiteSpace: 'nowrap',
              }}
            >
              evisa.xuatnhapcanh.gov.vn ↗
            </a>
          </div>

          {/* BLOCK 6: OVERSTAY CALCULATOR */}
          <div className="glass" style={{ padding: '32px 28px' }}>
            {(() => {
              const currentDays = Math.max(1, overstayDaysInput || 1);
              const activeRule = OVERSTAY_RULES.find(r => currentDays >= r.minDays && currentDays <= r.maxDays) || OVERSTAY_RULES[OVERSTAY_RULES.length - 1];
              const minRub = Math.round(activeRule.minUsd * USD_TO_RUB);
              const maxRub = Math.round(activeRule.maxUsd * USD_TO_RUB);

              return (
                <div>
                  <div style={{ marginBottom: 20 }}>
                    <div style={{
                      display: 'inline-flex', alignItems: 'center', gap: 6,
                      background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: 999, padding: '4px 12px', marginBottom: 8,
                      fontSize: 11, color: '#ef4444', fontWeight: 700, textTransform: 'uppercase',
                    }}>
                      ⚖️ Nghị định 144/2021/NĐ-CP · Официальная сетка штрафов
                    </div>
                    <h2 style={{ fontSize: 22, fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                      Калькулятор оверстея во Вьетнаме
                    </h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', margin: '6px 0 0' }}>
                      Рассчитайте официальный штраф иммиграционной службы, уровень риска депортации и пошаговый регламент действий.
                    </p>
                  </div>

                  <div style={{
                    background: 'var(--bg-secondary)', borderRadius: 16, padding: '20px',
                    border: '1px solid var(--border)', marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
                      <label style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                        Сколько дней просрочки (оверстея)?
                      </label>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <input
                          type="number"
                          min="1"
                          max="365"
                          value={overstayDaysInput}
                          onChange={e => setOverstayDaysInput(Math.max(1, parseInt(e.target.value) || 1))}
                          style={{
                            width: 84, padding: '8px 12px', borderRadius: 8,
                            background: 'var(--bg-card)', border: '1px solid var(--border-accent)',
                            color: 'var(--text-primary)', fontSize: 16, fontWeight: 800, textAlign: 'center',
                          }}
                        />
                        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-secondary)' }}>дней</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 18 }}>
                      {[1, 2, 5, 10, 15, 25, 45, 90].map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => setOverstayDaysInput(d)}
                          style={{
                            padding: '6px 14px', borderRadius: 8, fontSize: 12, fontWeight: 700,
                            cursor: 'pointer', border: '1px solid',
                            borderColor: overstayDaysInput === d ? 'var(--accent)' : 'var(--border)',
                            background: overstayDaysInput === d ? 'var(--accent-glow)' : 'transparent',
                            color: overstayDaysInput === d ? 'var(--accent)' : 'var(--text-secondary)',
                          }}
                        >
                          {d} {d === 1 ? 'день' : d < 5 ? 'дня' : 'дней'}
                        </button>
                      ))}
                    </div>

                    <input
                      type="range"
                      min="1"
                      max="90"
                      value={Math.min(90, overstayDaysInput)}
                      onChange={e => setOverstayDaysInput(parseInt(e.target.value))}
                      style={{ width: '100%', accentColor: activeRule.riskColor, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Verdict Card */}
                  <div style={{
                    borderRadius: 16, padding: '24px',
                    background: `linear-gradient(135deg, rgba(18,11,30,0.95) 0%, rgba(28,18,48,0.95) 100%)`,
                    border: `1.5px solid ${activeRule.riskColor}`,
                    boxShadow: `0 8px 32px rgba(0,0,0,0.3)`,
                    marginBottom: 24,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 16 }}>
                      <div style={{
                        display: 'inline-flex', alignItems: 'center', gap: 8,
                        padding: '6px 14px', borderRadius: 999,
                        background: `${activeRule.riskColor}22`,
                        border: `1px solid ${activeRule.riskColor}`,
                        color: activeRule.riskColor, fontWeight: 800, fontSize: 13,
                      }}>
                        Уровень риска: {activeRule.riskLabel}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Диапазон: <strong>{activeRule.range}</strong>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 20 }}>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                          Штраф в донгах (VND)
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--accent)' }}>
                          {activeRule.minVnd.toLocaleString('ru-RU')} – {activeRule.maxVnd.toLocaleString('ru-RU')} ₫
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                          В долларах (USD)
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: '#f59e0b' }}>
                          ${activeRule.minUsd} – ${activeRule.maxUsd}
                        </div>
                      </div>
                      <div style={{ background: 'rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 11, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>
                          В рублях (RUB)
                        </div>
                        <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)' }}>
                          {minRub.toLocaleString('ru-RU')} – {maxRub.toLocaleString('ru-RU')} ₽
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
                      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 6 }}>
                          📋 Регламент: {activeRule.protocol}
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {activeRule.action}
                        </p>
                      </div>
                      <div style={{ background: 'var(--bg-secondary)', padding: '16px', borderRadius: 12, border: '1px solid var(--border)' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: activeRule.riskColor, marginBottom: 6 }}>
                          🚫 Риск Black List:
                        </div>
                        <p style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6, margin: 0 }}>
                          {activeRule.blacklist}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 14, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                        💡 4 золотых правила при оверстее
                      </h3>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                        <li><strong>Никаких взяток:</strong> за попытку взятки офицеру грозит ст. 364 УК Вьетнама. Требуйте официальный протокол Biên bản.</li>
                        <li><strong>Оплата в кассу:</strong> штраф оплачивается по квитанции в кассу погранслужбы.</li>
                        <li><strong>Приезжайте заранее:</strong> в аэропорт необходимо прибыть за 4 часа до вылета.</li>
                        <li><strong>Не прячьтесь:</strong> чем дольше скрываться, тем выше риск депортации.</li>
                      </ul>
                    </div>

                    <div style={{ background: 'var(--bg-secondary)', padding: '20px', borderRadius: 14, border: '1px solid var(--border)' }}>
                      <h3 style={{ fontSize: 14, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 12 }}>
                        🏢 Адреса департаментов иммиграции
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 12, color: 'var(--text-secondary)' }}>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>🏛️ Дананг:</strong>
                          <div style={{ color: 'var(--text-muted)' }}>7 Trần Quý Cáp, Hải Châu, Đà Nẵng · Пн–Пт 08:00–16:30</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>🏛️ Сайгон:</strong>
                          <div style={{ color: 'var(--text-muted)' }}>333-337 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Q.1, TP. HCM</div>
                        </div>
                        <div>
                          <strong style={{ color: 'var(--text-primary)' }}>🏛️ Ханой:</strong>
                          <div style={{ color: 'var(--text-muted)' }}>44-46 Trần Phú, Ba Đình, Hà Nội · Пн–Пт 08:00–16:30</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </main>
    </div>
  );
}
