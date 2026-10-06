'use client';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { useAuth } from '@/lib/auth';
import { API_BASE } from '@/lib/api';

const CURRENCY_META = [
  { id: 'VND', flag: '🇻🇳', name: 'Донг', symbol: '₫' },
  { id: 'RUB', flag: '🇷🇺', name: 'Рубль', symbol: '₽' },
  { id: 'USD', flag: '🇺🇸', name: 'Доллар', symbol: 'USD' },
] as const;

type CurId = 'VND' | 'RUB' | 'USD';
type PairId = 'USD_RUB' | 'VND1000_RUB' | 'USD_VND' | 'RUB_VND';
type RateMode = 'official' | 'bybit_p2p';

interface RatesPayload {
  usdRub: number;
  usdVnd: number;
  usdtRub: number;
  vndRub: number;
  vnd1000Rub: number;
  updatedAt: string;
  p2pUsdtRub?: number;
  p2pUsdtVnd?: number;
  p2pVndRub?: number;
  p2pSpreadPct?: number;
}

interface HistoryPayload {
  labels: string[];
  series: {
    usdRub: number[];
    usdtRub: number[];
    vnd1000Rub: number[];
    usdVnd: number[];
    usdtVnd: number[];
    rubVnd: number[];
  };
}

const NOTES = [
  { value: 500000, color: '#3b82f6', label: '500k — синяя! Осторожно — похожа на 20k' },
  { value: 200000, color: '#f59e0b', label: '200k — жёлтая' },
  { value: 100000, color: '#1fd1c1', label: '100k — зелёная! Осторожно — похожа на 10k' },
  { value: 50000, color: '#a855f7', label: '50k — розовая' },
  { value: 20000, color: '#3b82f6', label: '20k — синяя! Осторожно — похожа на 500k' },
  { value: 10000, color: '#8b5cf6', label: '10k — фиолетовая! Осторожно — похожа на 100k' },
];

function fmt(n: number, decimals = 0) {
  if (n >= 1000000) return (n / 1000000).toFixed(decimals > 0 ? decimals : 2).replace(/\.?0+$/, '') + 'M';
  return n.toLocaleString('ru-RU', { maximumFractionDigits: decimals });
}

function MiniSparkline({ data, color = '#1fd1c1' }: { data: number[]; color?: string }) {
  if (!data || data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 24;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  return (
    <svg width={w} height={h} style={{ overflow: 'visible' }}>
      <polyline fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" points={pts} />
    </svg>
  );
}

export default function ConverterWebScreen() {
  const [rates, setRates] = useState<RatesPayload>({
    usdRub: 83.5,
    usdVnd: 25940,
    usdtRub: 83.8,
    vndRub: 0.00322,
    vnd1000Rub: 3.22,
    updatedAt: '',
    p2pUsdtRub: 85.35,
    p2pUsdtVnd: 26330,
    p2pVndRub: 308.5,
    p2pSpreadPct: 1.8,
  });
  const [history, setHistory] = useState<HistoryPayload | null>(null);
  const [rateMode, setRateMode] = useState<RateMode>('official');
  const [amount, setAmount] = useState('0');
  const { settings } = useAuth();
  const [from, setFrom] = useState<CurId>('VND');
  const [to, setTo] = useState<CurId>(settings?.currency === 'USD' ? 'USD' : 'RUB');

  useEffect(() => {
    if (settings?.currency === 'USD' || settings?.currency === 'RUB') setTo(settings.currency);
  }, [settings?.currency]);
  const [selectedPair, setSelectedPair] = useState<PairId>('USD_RUB');

  useEffect(() => {
    fetch(`${API_BASE}/api/rates`)
      .then(r => r.json())
      .then(d => { if (d?.usdRub) setRates(d); })
      .catch(() => {});
    fetch(`${API_BASE}/api/history`)
      .then(r => r.json())
      .then(d => { if (d?.series) setHistory(d); })
      .catch(() => {});
  }, []);

  const isP2P = rateMode === 'bybit_p2p';
  const p2pUsdtRub = rates.p2pUsdtRub || +(rates.usdtRub * 1.018).toFixed(2);
  const p2pUsdtVnd = rates.p2pUsdtVnd || Math.round(rates.usdVnd * 1.015);
  const p2pVndRub = rates.p2pVndRub || +(p2pUsdtVnd / p2pUsdtRub).toFixed(2);
  const p2pSpread = rates.p2pSpreadPct || 1.8;

  const CURRENCIES = isP2P
    ? [
        { ...CURRENCY_META[0], perUsd: p2pUsdtVnd },
        { ...CURRENCY_META[1], perUsd: p2pUsdtRub },
        { ...CURRENCY_META[2], perUsd: 1 },
      ]
    : [
        { ...CURRENCY_META[0], perUsd: rates.usdVnd },
        { ...CURRENCY_META[1], perUsd: rates.usdRub },
        { ...CURRENCY_META[2], perUsd: 1 },
      ];

  const fromCur = CURRENCIES.find(c => c.id === from)!;
  const toCur = CURRENCIES.find(c => c.id === to)!;

  const rawAmount = parseFloat(amount.replace(/\s/g, '').replace(/,/g, ''));
  const inUsd = rawAmount / fromCur.perUsd;
  const result = inUsd * toCur.perUsd;
  const isValid = !isNaN(inUsd) && isFinite(result);

  function swap() { setFrom(to); setTo(from); }

  const rubVndRate = isP2P ? Math.round(p2pVndRub) : Math.round(rates.usdVnd / rates.usdRub);

  const ALL_PAIRS = [
    {
      id: 'USD_RUB' as PairId,
      flag: '🇺🇸 🇷🇺',
      label: 'USD / RUB',
      fullName: 'Доллар США к рублю',
      rateDisplay: rates.usdRub.toFixed(2) + ' ₽',
      rateNum: rates.usdRub,
      unit: '₽',
      sub: 'Официальный курс ЦБ / ECB',
      chartData: history?.series?.usdRub ?? [rates.usdRub, rates.usdRub],
    },
    {
      id: 'VND1000_RUB' as PairId,
      flag: '🇻🇳 🇷🇺',
      label: '1 000₫ / RUB',
      fullName: '1 000 донгов к рублю',
      rateDisplay: (isP2P ? (1000 / p2pVndRub) : rates.vnd1000Rub).toFixed(2) + ' ₽',
      rateNum: isP2P ? (1000 / p2pVndRub) : rates.vnd1000Rub,
      unit: '₽',
      sub: isP2P ? 'Реальный курс через P2P' : 'Официальный межбанковский кросс',
      chartData: history?.series?.vnd1000Rub ?? [rates.vnd1000Rub, rates.vnd1000Rub],
    },
    {
      id: 'USD_VND' as PairId,
      flag: '🇺🇸 🇻🇳',
      label: 'USD / VND',
      fullName: 'Доллар США к донгу',
      rateDisplay: Math.round(rates.usdVnd).toLocaleString('ru-RU') + ' ₫',
      rateNum: rates.usdVnd,
      unit: '₫',
      sub: 'Банковский межбанк Вьетнама',
      chartData: history?.series?.usdVnd ?? [rates.usdVnd, rates.usdVnd],
    },
    {
      id: 'RUB_VND' as PairId,
      flag: '🇷🇺 🇻🇳',
      label: 'RUB / VND',
      fullName: 'Рубль к донгу (1 ₽)',
      rateDisplay: rubVndRate.toLocaleString('ru-RU') + ' ₫',
      rateNum: rubVndRate,
      unit: '₫',
      sub: isP2P ? 'Реально при выводе через P2P' : 'Теоретический форекс-курс',
      chartData: history?.series?.rubVnd ?? [rubVndRate, rubVndRate],
    },
  ];

  const getPresets = () => {
    if (from === 'VND') return ['500000', '1000000', '5000000', '10000000', '25000000', '50000000'];
    if (from === 'RUB') return ['10000', '30000', '50000', '100000', '200000', '500000'];
    return ['50', '100', '300', '500', '1000', '2000'];
  };

  const btnStyle = (active: boolean): React.CSSProperties => ({
    padding: '8px 14px', borderRadius: 10, border: '1px solid',
    borderColor: active ? '#1fd1c1' : 'rgba(255,255,255,0.1)',
    background: active ? 'rgba(31,209,193,0.15)' : 'rgba(255,255,255,0.03)',
    color: active ? '#1fd1c1' : '#cbd5e1',
    fontWeight: active ? 700 : 500, fontSize: 13, cursor: 'pointer',
    transition: 'all 0.15s ease', display: 'inline-flex', alignItems: 'center', gap: 5,
  });

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
      backgroundColor: '#0c0714',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 90,
      boxSizing: 'border-box',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
        {/* Navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
          <button
            onClick={() => router.back()}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 12, padding: '8px 16px', color: '#f8fafc',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            ← Назад
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            <BrandLogo size={20} />
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.wiki</span> → <span style={{ color: '#1fd1c1' }}>Конвертер VND</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 14,
            fontSize: 12, color: '#1fd1c1', fontWeight: 700,
          }}>
            💱 Реальные курсы валют · P2P Bybit · ЦБ РФ · Банки Вьетнама
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Конвертер валют и курсы онлайн
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 580, margin: '0 auto', lineHeight: 1.6 }}>
            VND ⇄ RUB ⇄ USD — официальные курсы ЦБ и реальный P2P спред с графиками котировок.
          </p>
        </div>

        {/* Main Converter Card */}
        <div style={{
          padding: 32, marginBottom: 28,
          borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 20px 40px rgba(0,0,0,0.4)',
        }}>
          {/* Rate Mode Switcher */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            gap: 12, flexWrap: 'wrap', marginBottom: 24, paddingBottom: 18,
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', color: '#64748b', letterSpacing: 0.6, marginBottom: 4 }}>
                Режим расчета котировок
              </div>
              <div style={{ fontSize: 13, color: '#cbd5e1' }}>
                {isP2P ? '⚡ Реальный экспатский курс (Bybit P2P связка)' : '🏛️ Официальный форекс / ЦБ (без комиссий)'}
              </div>
            </div>

            <div style={{ display: 'inline-flex', background: 'rgba(255,255,255,0.03)', padding: 4, borderRadius: 12, border: '1px solid rgba(255,255,255,0.08)' }}>
              <button
                type="button"
                onClick={() => setRateMode('official')}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: 'none',
                  background: !isP2P ? '#1fd1c1' : 'transparent',
                  color: !isP2P ? '#0b1f30' : '#94a3b8',
                  transition: 'all 0.2s ease',
                }}
              >
                🏛️ Официальный
              </button>
              <button
                type="button"
                onClick={() => setRateMode('bybit_p2p')}
                style={{
                  padding: '8px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  border: 'none',
                  background: isP2P ? 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)' : 'transparent',
                  color: isP2P ? '#fff' : '#94a3b8',
                  transition: 'all 0.2s ease',
                  display: 'flex', alignItems: 'center', gap: 6,
                }}
              >
                <span>⚡ Bybit P2P</span>
                <span style={{ fontSize: 10, background: 'rgba(0,0,0,0.3)', padding: '2px 6px', borderRadius: 6 }}>
                  Экспат
                </span>
              </button>
            </div>
          </div>

          {/* Grid Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: 16, alignItems: 'center' }}>
            {/* From */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>Из</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CURRENCIES.map(c => <button key={c.id} onClick={() => setFrom(c.id as CurId)} style={btnStyle(from === c.id)}>{c.flag} {c.id}</button>)}
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={amount}
                  onFocus={e => e.target.select()}
                  onChange={e => {
                    let val = e.target.value.replace(/[^0-9.,]/g, '');
                    val = val.replace(/^0+(?=[0-9])/, '');
                    setAmount(val);
                  }}
                  placeholder="0"
                  style={{
                    width: '100%', padding: '14px 50px 14px 18px', borderRadius: 14,
                    border: '1px solid rgba(31,209,193,0.3)', background: 'rgba(255,255,255,0.03)',
                    color: '#fff', fontSize: 20, fontWeight: 800, outline: 'none', boxSizing: 'border-box',
                  }}
                />
                <span style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 22 }}>{fromCur.flag}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{fromCur.name} · {fromCur.symbol}</p>
            </div>

            {/* Swap Button */}
            <button
              onClick={swap}
              style={{
                width: 44, height: 44, borderRadius: 22,
                background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.3)',
                color: '#1fd1c1', fontSize: 18, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 20,
              }}
              title="Поменять местами"
            >
              ⇄
            </button>

            {/* To */}
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.8 }}>В</p>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {CURRENCIES.map(c => <button key={c.id} onClick={() => setTo(c.id as CurId)} style={btnStyle(to === c.id)}>{c.flag} {c.id}</button>)}
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: 14,
                border: '1px solid ' + (isP2P ? 'rgba(245,158,11,0.4)' : 'rgba(31,209,193,0.4)'),
                background: isP2P ? 'rgba(245, 158, 11, 0.12)' : 'rgba(31,209,193,0.12)',
                fontSize: 22, fontWeight: 900,
                color: isP2P ? '#f59e0b' : '#1fd1c1',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 54, boxSizing: 'border-box',
              }}>
                <span>{isValid ? fmt(result, toCur.id === 'VND' ? 0 : 2) : '—'}</span>
                <span style={{ fontSize: 22 }}>{toCur.flag}</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748b', marginTop: 6 }}>{toCur.name} · {toCur.symbol}</p>
            </div>
          </div>

          {/* Bybit P2P Live Spread & Route Breakdown Card */}
          {isP2P && (
            <div style={{
              marginTop: 20, padding: '16px 20px', borderRadius: 14,
              background: 'linear-gradient(135deg, rgba(245,158,11,0.08) 0%, rgba(28,18,48,0.6) 100%)',
              border: '1px solid rgba(245,158,11,0.3)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18 }}>⚡</span>
                  <strong style={{ fontSize: 13, color: '#f59e0b' }}>Маршрут обмена Bybit P2P</strong>
                </div>
                <div style={{ fontSize: 12, color: '#94a3b8' }}>
                  Текущий P2P спред связки: <strong style={{ color: '#f59e0b' }}>~{p2pSpread}%</strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', fontSize: 12, color: '#f8fafc', marginBottom: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8 }}>
                  💳 Карта РФ (Т-Банк, Сбер)
                </div>
                <span style={{ color: '#64748b' }}>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8 }}>
                  1 000 ₫ ≈ <strong>{(1000 / p2pVndRub).toFixed(2)} ₽</strong>
                </div>
                <span style={{ color: '#64748b' }}>➔</span>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 8 }}>
                  🏦 Techcombank/VCB (VietQR)
                </div>
              </div>

              <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', lineHeight: 1.6 }}>
                💡 <strong>Совет экспату:</strong> При обмене рублей на донги через P2P-переводы выбирайте проверенных мерчантов со значком PRO и рейтингом от 99%.
              </p>
            </div>
          )}

          {/* Quick amounts */}
          <div style={{ marginTop: 20 }}>
            <p style={{ fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              Быстрый выбор суммы ({fromCur.id})
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {getPresets().map(v => (
                <button key={v} onClick={() => setAmount(v)} style={btnStyle(amount === v)}>
                  {parseInt(v).toLocaleString('ru-RU')} {fromCur.symbol}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Currency Pairs Grid */}
        <div style={{
          padding: 28, marginBottom: 28,
          borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
            <div>
              <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
                <span>📊 Актуальные котировки и графики</span>
              </h2>
              <p style={{ fontSize: 13, color: '#94a3b8', margin: '4px 0 0' }}>
                {isP2P ? 'Отображаются скорректированные P2P котировки' : 'Официальный межбанковский валютный рынок'}
              </p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
            {ALL_PAIRS.map(pair => {
              const isSelected = selectedPair === pair.id;
              return (
                <div
                  key={pair.id}
                  className="epats-card"
                  onClick={() => setSelectedPair(pair.id)}
                  style={{
                    padding: '16px 18px',
                    borderRadius: 14,
                    background: isSelected ? 'rgba(31,209,193,0.12)' : 'rgba(255,255,255,0.03)',
                    border: '1.5px solid',
                    borderColor: isSelected ? '#1fd1c1' : 'rgba(255,255,255,0.07)',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 0 20px rgba(31,209,193,0.18)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="icon-spring" style={{ fontSize: 16 }}>{pair.flag}</span>
                      <span style={{ fontWeight: 800, fontSize: 14, color: '#fff' }}>{pair.label}</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 8 }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: '#1fd1c1', letterSpacing: '-0.3px' }}>
                      {pair.rateDisplay}
                    </div>
                    <div style={{ width: 64, height: 24 }}>
                      <MiniSparkline data={pair.chartData} />
                    </div>
                  </div>

                  <div style={{ fontSize: 11, color: '#64748b', marginTop: 4 }}>
                    {pair.sub}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Banknotes Cheat Sheet */}
        <div style={{
          padding: 28, borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, margin: '0 0 8px', display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
            <span>💵 Памятка по вьетнамским купюрам</span>
          </h2>
          <p style={{ fontSize: 13, color: '#94a3b8', margin: '0 0 20px' }}>
            Купюры из полимера (пластиковые), не промокают в море, но легко перепутать цвета
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12 }}>
            {NOTES.map(n => {
              const inRub = Math.round((n.value / (isP2P ? p2pVndRub : (rates.usdVnd / rates.usdRub))));
              return (
                <div
                  key={n.value}
                  className="epats-card"
                  style={{
                    padding: '14px 16px', borderRadius: 14, background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 14,
                  }}
                >
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: n.color, flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                      <strong style={{ fontSize: 15, color: '#fff' }}>{n.value.toLocaleString('ru-RU')} ₫</strong>
                      <span style={{ fontSize: 13, color: '#1fd1c1', fontWeight: 700 }}>≈ {inRub} ₽</span>
                    </div>
                    <p style={{ fontSize: 11, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.4 }}>{n.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
