import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { WEB_BASE } from './api';

export interface ToolDef {
  href: string;
  name: string;
  emoji: string;
  desc: string;
  native: boolean;
}

export const TOOLS: ToolDef[] = [
  { href: '/tools/converter', name: 'Конвертер VND', emoji: '💱', desc: 'Донг, рубль, доллар, USDT + P2P-курс', native: true },
  { href: '/tools/calculator', name: 'Калькулятор бюджета', emoji: '🧮', desc: 'Сколько нужно на жизнь в месяц', native: true },
  { href: '/tools/electricity', name: 'Счёт за свет', emoji: '⚡', desc: 'Проверка тарифа EVN и переплаты', native: true },
  { href: '/tools/checklist', name: 'Чеклист переезда', emoji: '📋', desc: 'Пошаговый план подготовки', native: true },
  { href: '/tools/cities', name: 'Сравнение городов', emoji: '🏙️', desc: 'Дананг, Нячанг, Хошимин…', native: true },
  { href: '/tools/telegram', name: 'Чаты экспатов', emoji: '💬', desc: 'Проверенные Telegram-сообщества', native: true },
  { href: '/tools/visa', name: 'Визаран', emoji: '🚌', desc: 'Сроки, маршруты и таймлайн', native: true },
  { href: '/tools/weather', name: 'Погода & Радар', emoji: '🌦️', desc: 'Тайфуны, волны, воздух', native: true },
  { href: '/tools/neighborhoods', name: 'Карта жилья', emoji: '🏡', desc: 'Районы и цены аренды', native: true },
];

export function openTool(href: string) {
  const tool = TOOLS.find(t => t.href === href);
  if (tool?.native) router.push(href as never);
  else WebBrowser.openBrowserAsync(`${WEB_BASE}${href}`, { toolbarColor: '#120b1e', controlsColor: '#1fd1c1' });
}
