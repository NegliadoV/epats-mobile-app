export const nf = (n: number, digits = 0) =>
  n.toLocaleString('ru-RU', { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** Умное форматирование суммы под валюту */
export function money(n: number, cur: 'VND' | 'RUB' | 'USD' | 'USDT'): string {
  if (!Number.isFinite(n)) return '—';
  switch (cur) {
    case 'VND': return `${nf(Math.round(n / 1000) * 1000)} ₫`;
    case 'RUB': return `${nf(n, n < 100 ? 2 : 0)} ₽`;
    case 'USD': return `$${nf(n, n < 1000 ? 2 : 0)}`;
    case 'USDT': return `${nf(n, n < 1000 ? 2 : 0)} ₮`;
  }
}

/** «500k», «1.5м», «2 000 000» → число */
export function parseInput(s: string): number {
  const t = s.toLowerCase().replace(/\s|\u00a0/g, '').replace(',', '.');
  const m = t.match(/^(\d*\.?\d+)(k|к|m|м|млн)?$/);
  if (!m) return 0;
  const base = parseFloat(m[1]);
  const mult = m[2] === 'k' || m[2] === 'к' ? 1e3 : m[2] ? 1e6 : 1;
  return base * mult;
}

export function timeAgo(ts: number | null): string {
  if (!ts) return 'нет данных';
  const s = Math.round((Date.now() - ts) / 1000);
  if (s < 60) return 'только что';
  if (s < 3600) return `${Math.floor(s / 60)} мин назад`;
  if (s < 86400) return `${Math.floor(s / 3600)} ч назад`;
  return `${Math.floor(s / 86400)} дн назад`;
}
