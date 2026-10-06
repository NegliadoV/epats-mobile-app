import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { WEB_BASE } from './api';
import type { TropicIconName } from './tropicIconMap';

export interface ToolDef {
  href: string;
  name: string;
  emoji: string;
  icon: TropicIconName;
  desc: string;
  native: boolean;
}

export const TOOLS: ToolDef[] = [
  { href: '/tools/converter', name: 'Конвертер VND', emoji: '💱', icon: 'converter', desc: 'Донг, рубль, доллар + P2P-курс', native: true },
  { href: '/tools/calculator', name: 'Калькулятор бюджета', emoji: '🧮', icon: 'calculator', desc: 'Сколько нужно на жизнь в месяц', native: true },
  { href: '/tools/visa', name: 'Визаран', emoji: '🚌', icon: 'visa', desc: 'Сроки, маршруты и таймлайн', native: true },
  { href: '/tools/gyms', name: 'Тренажерные залы', emoji: '🏋️', icon: 'health', desc: '12 залов Дананга: кондиционеры, цены, бассейны', native: true },
  { href: '/tools/kids', name: 'Детский Дананг', emoji: '🛝', icon: 'life', desc: '17 локаций: площадки у моря, машинки, пагоды', native: true },
  { href: '/tools/electricity', name: 'Счёт за свет', emoji: '⚡', icon: 'electricity', desc: 'Проверка тарифа EVN и переплаты', native: true },
  { href: '/tools/neighborhoods', name: 'Карта жилья', emoji: '🏡', icon: 'house', desc: 'Районы и цены аренды', native: true },
  { href: '/tools/weather', name: 'Погода & Радар', emoji: '🌦️', icon: 'weather', desc: 'Тайфуны, волны, воздух', native: true },
  { href: '/tools/checklist', name: 'Чеклист переезда', emoji: '📋', icon: 'checklist', desc: 'Пошаговый план подготовки', native: true },
  { href: '/tools/cities', name: 'Сравнение городов', emoji: '🏙️', icon: 'cities', desc: 'Дананг, Нячанг, Хошимин…', native: true },
  { href: '/tools/telegram', name: 'Чаты экспатов', emoji: '💬', icon: 'chat', desc: 'Проверенные Telegram-сообщества', native: true },
];

export function openTool(href: string) {
  const tool = TOOLS.find(t => t.href === href);
  if (tool?.native) router.push(href as never);
  else WebBrowser.openBrowserAsync(`${WEB_BASE}${href}`, { toolbarColor: '#120b1e', controlsColor: '#1fd1c1' });
}
