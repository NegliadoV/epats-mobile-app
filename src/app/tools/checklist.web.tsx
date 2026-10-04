'use client';
import React, { useState, useEffect } from 'react';
import { router } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';

const STORAGE_KEY = 'epats_relocation_checklist_2026';

interface ChecklistItem {
  id: string;
  title: string;
  detail: string;
  critical: boolean;
  tag?: string;
  link?: string;
  linkText?: string;
}

interface ChecklistStage {
  id: string;
  title: string;
  icon: string;
  color: string;
  subtitle: string;
  items: ChecklistItem[];
}

const CHECKLIST_STAGES: ChecklistStage[] = [
  {
    id: 'before_flight',
    title: 'До вылета из РФ',
    icon: '🧳',
    color: '#6366f1',
    subtitle: 'Документы, финансы, доверенности и сборы',
    items: [
      {
        id: 'passport_validity',
        title: 'Загранпаспорт со сроком действия от 6 месяцев',
        detail: 'Срок действия паспорта должен быть не менее 180 дней на дату въезда во Вьетнам.',
        critical: true,
        tag: 'Документы',
      },
      {
        id: 'visa_decision',
        title: 'Определиться с визой: безвиз 45 дней или E-Visa на 90 дней',
        detail: 'Для безвиза 45 дней нужен обратный билет. Если планируете оставаться дольше — оформите 90-дневную E-Visa ($25–50) заранее.',
        critical: true,
        tag: 'Виза',
      },
      {
        id: 'mvu_license',
        title: 'Оформить МВУ (Международное водительское удостоверение)',
        detail: 'Вьетнам признаёт Венскую конвенцию 1968 года. Серая книжечка МВУ с категорией А защищает от штрафов ГИБДД.',
        critical: true,
        tag: 'Транспорт',
      },
      {
        id: 'poa_notary',
        title: 'Генеральная доверенность на близких в РФ',
        detail: 'Оформите нотариальную доверенность в РФ на распоряжение счетами и получение писем перед вылетом.',
        critical: false,
        tag: 'Юриспруденция',
      },
      {
        id: 'russian_sim_roaming',
        title: 'Сохранить российскую SIM-карту для SMS от банков',
        detail: 'Переведите номер на тариф без абонентской платы или подключите eSIM для получения SMS-кодов.',
        critical: true,
        tag: 'Связь',
      },
      {
        id: 'clean_usd_cash',
        title: 'Купить наличные доллары (новые, 2013+ года)',
        detail: 'Берите купюры по $100 и $50 нового образца с синей лентой, без штампов и надрывов.',
        critical: true,
        tag: 'Финансы',
      },
      {
        id: 'bybit_account',
        title: 'Зарегистрироваться на Bybit и пройти верификацию',
        detail: 'Основной способ вывода рублей во Вьетнаме — покупка USDT с карт РФ и вывод на наличный донг.',
        critical: true,
        tag: 'Крипто P2P',
      },
      {
        id: 'travel_insurance_bike',
        title: 'Оформить страховку с опцией «Управление мотобайком»',
        detail: 'Обычная туристическая страховка не покрывает байк! Добавьте пункт «активный спорт / байк».',
        critical: false,
        tag: 'Здоровье',
      },
    ],
  },
  {
    id: 'airport_arrival',
    title: 'Аэропорт и первые 24 часа',
    icon: '✈️',
    color: '#1fd1c1',
    subtitle: 'Штамп, багаж, такси и первые наличные',
    items: [
      {
        id: 'check_passport_stamp',
        title: 'ПРОВЕРИТЬ ДАТУ ШТАМПА перед пограничной будкой!',
        detail: 'Пограничники иногда ошибаются и ставят 15 дней вместо 45, или 45 вместо 90 по E-Visa. Проверьте дату сразу.',
        critical: true,
        tag: 'Контроль',
      },
      {
        id: 'airport_exchange_minimum',
        title: 'НЕ менять крупные суммы в аэропорту',
        detail: 'В аэропортовых обменниках курс хуже на 10–18%. Поменяйте максимум $20–50 на мелкие расходы.',
        critical: true,
        tag: 'Финансы',
      },
      {
        id: 'grab_xanh_taxi',
        title: 'Заказать такси через приложение Grab или Xanh SM',
        detail: 'Игнорируйте зазывал — вызовите машину через приложение по Wi-Fi аэропорта.',
        critical: true,
        tag: 'Транспорт',
      },
      {
        id: 'esim_or_airport_sim',
        title: 'Вьетнамский интернет: активация eSIM или SIM',
        detail: 'Купите тариф Viettel заранее через приложение eSIM или в официальном салоне.',
        critical: false,
        tag: 'Связь',
      },
    ],
  },
  {
    id: 'first_week',
    title: 'Первая неделя: адаптация',
    icon: '🌅',
    color: '#f59e0b',
    subtitle: 'Связь Viettel, байк, обменники и софт',
    items: [
      {
        id: 'official_viettel_sim',
        title: 'Оформить официальную SIM Viettel на загранпаспорт',
        detail: 'Симки «из ларька» без регистрации блокируются через 30 дней. Оформляйте в Viettel Store.',
        critical: true,
        tag: 'Связь',
      },
      {
        id: 'tiem_vang_exchange',
        title: 'Выгодный обмен долларов в ювелирных магазинах (Tiệm Vàng)',
        detail: 'Максимальный курс обмена наличных дают ювелирные лавки на рынках.',
        critical: true,
        tag: 'Финансы',
      },
      {
        id: 'bike_rental_passport_rule',
        title: 'Аренда скутера: НЕ отдавать загранпаспорт в залог!',
        detail: 'Оставляйте копию паспорта + денежный залог (1–2 млн донгов / $50–100). Снимите видео байка.',
        critical: true,
        tag: 'Транспорт',
      },
      {
        id: 'quality_helmet',
        title: 'Купить качественный шлем 3/4 (Royal, Andes)',
        detail: 'Не ездите в тонких прокатных «кепках». Купите шлем с визором за 400k–800k ₫.',
        critical: true,
        tag: 'Безопасность',
      },
      {
        id: 'install_essential_apps',
        title: 'Установить приложения: Grab, Shopee, Zalo',
        detail: 'Grab (доставка и такси), Shopee (быстрая доставка любых товаров), Zalo (связь с лендлордами).',
        critical: false,
        tag: 'Софт',
      },
    ],
  },
  {
    id: 'first_month',
    title: 'Первый месяц: быт и жильё',
    icon: '🏠',
    color: '#8b5cf6',
    subtitle: 'Аренда жилья, Tạm Trú, вода и банки',
    items: [
      {
        id: 'police_registration_tam_tru',
        title: 'Контроль регистрации в полиции (Tạm Trú / Там Чу)',
        detail: 'Хозяин обязан зарегистрировать вас в течение 24 часов на сайте иммиграционной службы.',
        critical: true,
        tag: 'Закон',
      },
      {
        id: 'apartment_lease_rules',
        title: 'Проверить договор долгосрочной аренды жилья',
        detail: 'Проверьте тариф на электричество (гостариф: 2 700 – 3 500 ₫/кВт⋅ч). Зафиксируйте депозит.',
        critical: true,
        tag: 'Жильё',
      },
      {
        id: 'drinking_water_bottles',
        title: 'Наладить доставку 19-литровой питьевой воды',
        detail: 'Водопроводная вода во Вьетнаме непригодна для питья! Закажите синие бутыли 19л (LaVie, Miru).',
        critical: true,
        tag: 'Быт',
      },
    ],
  },
];

export default function ChecklistWebScreen() {
  const [checkedIds, setCheckedIds] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'critical' | 'remaining'>('all');

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setCheckedIds(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (id: string) => {
    setCheckedIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const allItems = CHECKLIST_STAGES.flatMap(s => s.items);
  const totalCount = allItems.length;
  const completedCount = allItems.filter(i => checkedIds.includes(i.id)).length;
  const progressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

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
            <span style={{ color: '#fff', fontWeight: 800 }}>epats.io</span> → <span style={{ color: '#1fd1c1' }}>Чеклист переезда</span>
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
            📋 Интерактивный план релокации · 2026
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Пошаговый чеклист переезда во Вьетнам
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 620, margin: '0 auto', lineHeight: 1.6 }}>
            От документов и долларов в РФ до штампа в аэропорту, аренды байка и регистрации в полиции.
          </p>
        </div>

        {/* Progress Bar Card */}
        <div style={{
          padding: 24, marginBottom: 28, borderRadius: 20,
          background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255,255,255,0.08)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <span style={{ fontSize: 14, fontWeight: 800, color: '#fff' }}>
              Готовность к переезду: <b style={{ color: '#1fd1c1' }}>{progressPct}%</b>
            </span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>
              Выполнено {completedCount} из {totalCount} шагов
            </span>
          </div>
          <div style={{ height: 8, borderRadius: 99, background: 'rgba(255,255,255,0.06)', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${progressPct}%`, background: 'linear-gradient(90deg, #1fd1c1, #38bdf8)', borderRadius: 99, transition: 'width 0.3s ease' }} />
          </div>

          {/* Filter Chips */}
          <div style={{ display: 'flex', gap: 8, marginTop: 18, flexWrap: 'wrap' }}>
            {[
              { id: 'all', label: 'Все пункты' },
              { id: 'critical', label: 'Только критические ⚠️' },
              { id: 'remaining', label: 'Осталось сделать' },
            ].map(f => {
              const active = filterMode === f.id;
              return (
                <button
                  key={f.id}
                  onClick={() => setFilterMode(f.id as any)}
                  style={{
                    padding: '6px 14px', borderRadius: 10, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                    border: active ? '1px solid #1fd1c1' : '1px solid rgba(255,255,255,0.08)',
                    background: active ? 'rgba(31,209,193,0.16)' : 'rgba(255,255,255,0.03)',
                    color: active ? '#1fd1c1' : '#94a3b8',
                  }}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Stages list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CHECKLIST_STAGES.map(stage => {
            const filteredItems = stage.items.filter(item => {
              if (filterMode === 'critical') return item.critical;
              if (filterMode === 'remaining') return !checkedIds.includes(item.id);
              return true;
            });

            if (filteredItems.length === 0) return null;

            return (
              <div key={stage.id} style={{
                padding: 24, borderRadius: 20,
                background: 'rgba(25, 16, 38, 0.7)', backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                  <span style={{ fontSize: 24 }}>{stage.icon}</span>
                  <div>
                    <h2 style={{ fontSize: 18, fontWeight: 800, color: '#fff', margin: 0 }}>{stage.title}</h2>
                    <span style={{ fontSize: 12, color: '#64748b' }}>{stage.subtitle}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {filteredItems.map(item => {
                    const checked = checkedIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggle(item.id)}
                        style={{
                          padding: '14px 16px', borderRadius: 14,
                          background: checked ? 'rgba(31,209,193,0.06)' : 'rgba(255,255,255,0.02)',
                          border: '1px solid ' + (checked ? 'rgba(31,209,193,0.3)' : 'rgba(255,255,255,0.06)'),
                          cursor: 'pointer', transition: 'all 0.15s ease',
                          display: 'flex', alignItems: 'flex-start', gap: 14,
                        }}
                      >
                        <div style={{
                          width: 22, height: 22, borderRadius: 7,
                          border: '2px solid ' + (checked ? '#1fd1c1' : 'rgba(255,255,255,0.2)'),
                          background: checked ? '#1fd1c1' : 'transparent',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          marginTop: 2, flexShrink: 0,
                        }}>
                          {checked && <span style={{ color: '#000', fontSize: 13, fontWeight: 900 }}>✓</span>}
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                            <span style={{
                              fontSize: 14, fontWeight: 800,
                              color: checked ? '#64748b' : '#fff',
                              textDecoration: checked ? 'line-through' : 'none',
                            }}>
                              {item.title}
                            </span>
                            {item.critical && (
                              <span style={{ fontSize: 10, fontWeight: 700, color: '#ef4444', background: 'rgba(239,68,68,0.15)', padding: '2px 6px', borderRadius: 6 }}>
                                КРИТИЧНО
                              </span>
                            )}
                            {item.tag && (
                              <span style={{ fontSize: 10, color: '#64748b', background: 'rgba(255,255,255,0.05)', padding: '2px 6px', borderRadius: 6 }}>
                                {item.tag}
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: 12, color: '#94a3b8', margin: '4px 0 0', lineHeight: 1.5 }}>
                            {item.detail}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
