'use client';
import React, { useState, useMemo } from 'react';
import { router } from 'expo-router';

export interface EvnTierBreakdown {
  tier: number;
  name: string;
  range: string;
  rate: number;
  kwhUsed: number;
  costVnd: number;
}

const EVN_TIERS = [
  { tier: 1, name: 'Bậc 1', range: '0 – 50 kWh', max: 50, rate: 1893 },
  { tier: 2, name: 'Bậc 2', range: '51 – 100 kWh', max: 50, rate: 1956 },
  { tier: 3, name: 'Bậc 3', range: '101 – 200 kWh', max: 100, rate: 2271 },
  { tier: 4, name: 'Bậc 4', range: '201 – 300 kWh', max: 100, rate: 2860 },
  { tier: 5, name: 'Bậc 5', range: '301 – 400 kWh', max: 100, rate: 3197 },
  { tier: 6, name: 'Bậc 6', range: 'от 401 kWh и выше', max: Infinity, rate: 3302 },
];

const PRESET_LANDLORD_RATES = [3500, 3800, 4000, 4500, 5000];

export default function ElectricityWebScreen() {
  const [prevMeter, setPrevMeter] = useState<string>('1240');
  const [currMeter, setCurrMeter] = useState<string>('1620');
  const [landlordRate, setLandlordRate] = useState<number>(4000);
  const [copied, setCopied] = useState<boolean>(false);
  const [lang, setLang] = useState<'vi' | 'en'>('vi');

  const prev = Math.max(0, parseInt(prevMeter) || 0);
  const curr = Math.max(prev, parseInt(currMeter) || 0);
  const totalKwh = Math.max(0, curr - prev);

  const { tiers, totalEvn, avgEvnRate } = useMemo(() => {
    let rem = totalKwh;
    const tierList: EvnTierBreakdown[] = [];
    let sub = 0;

    for (const t of EVN_TIERS) {
      if (rem <= 0) {
        tierList.push({ ...t, kwhUsed: 0, costVnd: 0 });
        continue;
      }
      const used = Math.min(rem, t.max);
      const cost = used * t.rate;
      sub += cost;
      rem -= used;
      tierList.push({ ...t, kwhUsed: used, costVnd: cost });
    }

    const vat = Math.round(sub * 0.08); // 8% VAT
    const tot = sub + vat;
    const avg = totalKwh > 0 ? Math.round(tot / totalKwh) : 0;
    return { tiers: tierList, totalEvn: tot, avgEvnRate: avg };
  }, [totalKwh]);

  const landlordTotal = Math.round(totalKwh * landlordRate);
  const overpayVnd = landlordTotal - totalEvn;
  const overpayPct = totalEvn > 0 ? Math.round((overpayVnd / totalEvn) * 100) : 0;
  const yearlyOverpayVnd = overpayVnd * 12;

  const landlordMessage = lang === 'vi'
    ? `Chào anh/chị chủ nhà,\nEm xin gửi chỉ số điện tháng này để anh/chị kiểm tra:\n• Chỉ số cũ: ${prev.toLocaleString('vi-VN')} kWh\n• Chỉ số mới: ${curr.toLocaleString('vi-VN')} kWh\n• Tiêu thụ: ${totalKwh.toLocaleString('vi-VN')} kWh\n\nTheo biểu giá điện sinh hoạt 6 bậc chính thức của EVN (đã gồm 8% VAT):\n👉 Tổng tiền điện EVN thực tế: ${totalEvn.toLocaleString('vi-VN')} ₫ (trung bình ~${avgEvnRate.toLocaleString('vi-VN')} ₫/kWh)\n👉 Số tiền theo giá ${landlordRate.toLocaleString('vi-VN')} ₫/kWh: ${landlordTotal.toLocaleString('vi-VN')} ₫\n(Khoản chênh lệch: +${overpayVnd.toLocaleString('vi-VN')} ₫)\n\nTheo Nghị định 134/2013/NĐ-CP của Chính phủ, người thuê trọ được áp dụng đúng biểu giá điện sinh hoạt bậc thang của EVN. Em xin gửi để anh/chị đối chiếu hóa đơn thực tế từ Điện Lực. Em cảm ơn anh/chị!`
    : `Hello! Here is the electricity meter calculation for this month:\n• Previous meter: ${prev.toLocaleString('en-US')} kWh\n• Current meter: ${curr.toLocaleString('en-US')} kWh\n• Total consumption: ${totalKwh.toLocaleString('en-US')} kWh\n\nAccording to the official government EVN progressive 6-tier residential tariff (including 8% VAT):\n👉 Official EVN bill: ${totalEvn.toLocaleString('en-US')} VND (average ~${avgEvnRate.toLocaleString('en-US')} VND/kWh)\n👉 Flat bill at ${landlordRate.toLocaleString('en-US')} VND/kWh: ${landlordTotal.toLocaleString('en-US')} VND\n(Difference: +${overpayVnd.toLocaleString('en-US')} VND)\n\nCould we please align the payment with the actual official EVN invoice as per Vietnamese rental regulations? Thank you!`;

  const copyMessage = () => {
    navigator.clipboard.writeText(landlordMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0c0714',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 80,
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(245,158,11,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
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
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
            epats.io → <span style={{ color: '#f59e0b' }}>Счёт за свет (EVN)</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.35)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 14,
            fontSize: 12, color: '#f59e0b', fontWeight: 700,
          }}>
            ⚡ Официальная сетка тарифов EVN 2026 · Защита прав арендатора
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Калькулятор счёта за электричество
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 660, margin: '0 auto', lineHeight: 1.6 }}>
            Сравните государственный прогрессивный тариф <strong>EVN (6 ступеней)</strong> со счетом от хозяина квартиры. Узнайте реальную переплату.
          </p>
        </div>

        {/* Grid Inputs vs Overpay */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24, marginBottom: 32 }}>
          {/* Card 1: Input Form */}
          <div style={{
            padding: 28, borderRadius: 24,
            background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 18,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>🔢 Показания счётчика</span>
            </h2>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Предыдущие показания (kWh):
              </label>
              <input
                type="number" value={prevMeter}
                onChange={e => setPrevMeter(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                  color: '#fff', fontSize: 18, fontWeight: 700, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 6 }}>
                Текущие показания (kWh):
              </label>
              <input
                type="number" value={currMeter}
                onChange={e => setCurrMeter(e.target.value)}
                style={{
                  width: '100%', padding: '12px 16px', borderRadius: 12,
                  background: 'rgba(255,255,255,0.03)', border: '1.5px solid rgba(31,209,193,0.4)',
                  color: '#1fd1c1', fontSize: 18, fontWeight: 800, outline: 'none', boxSizing: 'border-box',
                }}
              />
            </div>

            {/* Consumption highlight */}
            <div style={{
              background: 'rgba(31,209,193,0.1)', padding: '12px 16px', borderRadius: 12,
              border: '1px solid rgba(31,209,193,0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#cbd5e1' }}>Итого израсходовано:</span>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#1fd1c1' }}>{totalKwh} kWh</span>
            </div>

            {/* Landlord rate selector */}
            <div>
              <label style={{ fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>
                Тариф хозяина квартиры (₫ за 1 kWh):
              </label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {PRESET_LANDLORD_RATES.map(rate => {
                  const active = landlordRate === rate;
                  return (
                    <button
                      key={rate} type="button"
                      onClick={() => setLandlordRate(rate)}
                      style={{
                        padding: '8px 12px', borderRadius: 10, border: '1.5px solid',
                        borderColor: active ? '#f59e0b' : 'rgba(255,255,255,0.08)',
                        background: active ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.02)',
                        color: active ? '#f59e0b' : '#94a3b8',
                        fontWeight: active ? 800 : 600, fontSize: 13, cursor: 'pointer',
                      }}
                    >
                      {rate.toLocaleString('ru-RU')} ₫
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Card 2: Overpayment Comparison */}
          <div style={{
            padding: 28, borderRadius: 24,
            background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.08)', display: 'flex', flexDirection: 'column', gap: 20,
          }}>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span>⚖️ Сравнение счетов</span>
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {/* Official EVN */}
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(31,209,193,0.08)', border: '1px solid rgba(31,209,193,0.25)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#1fd1c1', textTransform: 'uppercase' }}>Гос. тариф EVN</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {totalEvn.toLocaleString('ru-RU')} ₫
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  ~{avgEvnRate.toLocaleString('ru-RU')} ₫/kWh с НДС
                </div>
              </div>

              {/* Landlord Bill */}
              <div style={{ padding: '16px', borderRadius: 14, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.25)' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#f59e0b', textTransform: 'uppercase' }}>Счёт лендлорда</div>
                <div style={{ fontSize: 22, fontWeight: 900, color: '#fff', marginTop: 4 }}>
                  {landlordTotal.toLocaleString('ru-RU')} ₫
                </div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>
                  по {landlordRate.toLocaleString('ru-RU')} ₫/kWh
                </div>
              </div>
            </div>

            {/* Overpay alert box */}
            <div style={{
              padding: '18px', borderRadius: 16,
              background: overpayVnd > 0 ? 'rgba(239,68,68,0.12)' : 'rgba(31,209,193,0.1)',
              border: '1.5px solid ' + (overpayVnd > 0 ? 'rgba(239,68,68,0.3)' : 'rgba(31,209,193,0.3)'),
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 18 }}>{overpayVnd > 0 ? '🚨' : '✅'}</span>
                <span style={{ fontSize: 15, fontWeight: 800, color: overpayVnd > 0 ? '#ef4444' : '#1fd1c1' }}>
                  {overpayVnd > 0 ? `Переплата: +${overpayVnd.toLocaleString('ru-RU')} ₫ (+${overpayPct}%)` : 'Тариф честный! Без наценки.'}
                </span>
              </div>
              {overpayVnd > 0 && (
                <div style={{ fontSize: 12, color: '#cbd5e1', marginTop: 6, lineHeight: 1.5 }}>
                  За год вы переплачиваете лендлорду около <b>{yearlyOverpayVnd.toLocaleString('ru-RU')} ₫</b> (~{Math.round(yearlyOverpayVnd / 310).toLocaleString('ru-RU')} ₽).
                </div>
              )}
            </div>

            {/* Dispute template copy */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#cbd5e1' }}>💬 Шаблон для лендлорда:</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => setLang('vi')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: lang === 'vi' ? '#f59e0b' : 'rgba(255,255,255,0.05)', color: lang === 'vi' ? '#000' : '#94a3b8', border: 'none' }}>Вьетнамский</button>
                  <button onClick={() => setLang('en')} style={{ padding: '3px 8px', borderRadius: 6, fontSize: 10, fontWeight: 700, cursor: 'pointer', background: lang === 'en' ? '#f59e0b' : 'rgba(255,255,255,0.05)', color: lang === 'en' ? '#000' : '#94a3b8', border: 'none' }}>English</button>
                </div>
              </div>
              <button
                onClick={copyMessage}
                style={{
                  width: '100%', padding: '12px', borderRadius: 12,
                  background: copied ? '#1fd1c1' : 'rgba(245,158,11,0.2)',
                  border: '1px solid ' + (copied ? '#1fd1c1' : 'rgba(245,158,11,0.4)'),
                  color: copied ? '#000' : '#f59e0b',
                  fontSize: 13, fontWeight: 800, cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {copied ? '✅ Скопировано в буфер!' : '📋 Скопировать вежливое обращение'}
              </button>
            </div>
          </div>
        </div>

        {/* EVN 6 Tiers Breakdown Table */}
        <div style={{
          padding: 28, borderRadius: 24,
          background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', margin: '0 0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>📋 Государственная шкала тарифов EVN (6 ступеней)</span>
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 10 }}>
            {tiers.map(t => (
              <div key={t.tier} style={{
                padding: '12px 14px', borderRadius: 12,
                background: t.kwhUsed > 0 ? 'rgba(31,209,193,0.08)' : 'rgba(255,255,255,0.02)',
                border: '1px solid ' + (t.kwhUsed > 0 ? 'rgba(31,209,193,0.25)' : 'rgba(255,255,255,0.05)'),
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: t.kwhUsed > 0 ? '#1fd1c1' : '#94a3b8' }}>
                    {t.name} ({t.range})
                  </div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>{t.rate} ₫/kWh без НДС</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>{t.costVnd.toLocaleString('ru-RU')} ₫</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{t.kwhUsed} kWh</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
