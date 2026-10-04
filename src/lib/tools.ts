import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

import { WEB_BASE } from './api';

/* Реестр инструментов. native: true — экран уже перенесён в приложение,
   остальные пока открываются во встроенном браузере (переносим по плану, фаза 3). */

export interface ToolDef {
  href: string;
  name: string;
  emoji: string;
  desc: string;
  native: boolean;
}

export const TOOLS: ToolDef[] = [
  { href: '/tools/converter', name: 'Конвертер VND', emoji: '💱', desc: 'Донг, рубль, доллар, USDT + P2P-курс', native: true },
  { href: '/tools/calculator', name: 'Калькулятор бюджета', emoji: '🧮', desc: 'Сколько нужно на жизнь в месяц', native: false },
  { href: '/tools/visa', name: 'Визаран', emoji: '🚌', desc: 'Сроки, маршруты и таймлайн', native: false },
  { href: '/tools/weather', name: 'Погода & Радар', emoji: '🌦️', desc: 'Тайфуны, волны, воздух', native: false },
  { href: '/tools/neighborhoods', name: 'Карта жилья', emoji: '🏡', desc: 'Районы и цены аренды', native: false },
  { href: '/tools/electricity', name: 'Счёт за свет', emoji: '⚡', desc: 'Проверка тарифа EVN', native: false },
  { href: '/tools/checklist', name: 'Чеклист переезда', emoji: '📋', desc: 'Ничего не забыть', native: false },
  { href: '/tools/cities', name: 'Сравнение городов', emoji: '🏙️', desc: 'Дананг, Нячанг, Хошимин…', native: false },
  { href: '/tools/telegram', name: 'Чаты экспатов', emoji: '💬', desc: 'Проверенные Telegram-сообщества', native: false },
];

export function openTool(href: string) {
  const tool = TOOLS.find(t => t.href === href);
  if (tool?.native) router.push(href as never);
  else WebBrowser.openBrowserAsync(`${WEB_BASE}${href}`, { toolbarColor: '#120b1e', controlsColor: '#1fd1c1' });
}
