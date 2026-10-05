/* Server & client safe icon helpers */

export type TropicIconName =
  | 'calculator' | 'visa' | 'passport' | 'house' | 'pin' | 'weather' | 'converter'
  | 'checklist' | 'cities' | 'chat' | 'book' | 'flights' | 'banking' | 'sim'
  | 'scooter' | 'health' | 'money' | 'food' | 'life' | 'fire' | 'tools' | 'palm'
  | 'sparkle' | 'coffee' | 'compass' | 'heart' | 'handshake' | 'electricity';

const TOOL_ICONS: Record<string, TropicIconName> = {
  '/tools/calculator': 'calculator',
  '/tools/visa': 'visa',
  '/tools/border-run': 'visa',
  '/tools/neighborhoods': 'house',
  '/tools/weather': 'weather',
  '/tools/converter': 'converter',
  '/tools/checklist': 'checklist',
  '/tools/cities': 'cities',
  '/tools/telegram': 'chat',
  '/tools/gyms': 'health',
  '/tools/kids': 'life',
  '/tools/electricity': 'electricity',
};

const CATEGORY_ICONS: Record<string, TropicIconName> = {
  flights: 'flights',
  visa: 'passport',
  housing: 'house',
  banking: 'banking',
  sim: 'sim',
  transport: 'scooter',
  healthcare: 'health',
  money: 'money',
  food: 'food',
  life: 'life',
};

export function iconForTool(href: string): TropicIconName {
  return TOOL_ICONS[href] ?? 'tools';
}

export function iconForCategory(slug: string): TropicIconName {
  return CATEGORY_ICONS[slug] ?? 'book';
}
