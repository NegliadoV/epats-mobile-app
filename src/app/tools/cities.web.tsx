'use client';
import React from 'react';
import { router } from 'expo-router';

const CITIES = [
  {
    id: 'danang', name: 'Дананг', flag: '🏖️', region: 'Центральный Вьетнам',
    tagline: 'Лучший баланс цены и качества жизни',
    description: 'Чистейший пляж Ми Кхе прямо в городе. Развитая IT-тусовка, десятки коворкингов. Горы Бана Хиллс в 40 минутах. Прохладнее, чем юг — идеально для постоянной жизни.',
    pros: ['Чистый воздух', 'Пляж в черте города', 'IT-комьюнити', 'Невысокие цены', 'Безопасно', 'Хорошая инфраструктура'],
    cons: ['Тайфуны сезон (сент-ноябрь)', 'Меньше ночной жизни', 'Слабее русскоязычная тусовка'],
    rating: { price: 4, sea: 5, internet: 4, vibe: 4, eco: 5, safety: 5, infra: 4 },
    budget: { min: 700, comfort: 1400, premium: 3000 },
    color: '#3b82f6',
    bestFor: ['Семьи', 'Digital nomads', 'ЗОЖ'],
  },
  {
    id: 'nhatrang', name: 'Нячанг', flag: '🌊', region: 'Южный Вьетнам',
    tagline: 'Столица русскоязычных экспатов',
    description: 'Самая большая русскоязычная диаспора. P2P-переводы, борщ в кафе, русскоязычные врачи — всё здесь. Длинная набережная, острова с коралловыми рифами.',
    pros: ['Большая рус. диаспора', 'Развитая p2p-инфраструктура', 'Море в центре', 'Дешевле Дананга', 'Много рус. контента'],
    cons: ['Много туристов (шумно)', 'Ухудшение воды в сезон дождей', 'Интернет местами слабее'],
    rating: { price: 5, sea: 5, internet: 3, vibe: 4, eco: 3, safety: 4, infra: 3 },
    budget: { min: 600, comfort: 1200, premium: 2800 },
    color: '#1fd1c1',
    bestFor: ['Новички', 'Долгосрочники', 'Семьи c детьми'],
  },
  {
    id: 'hcm', name: 'Хошимин', flag: '🌆', region: 'Юг (Сайгон)',
    tagline: 'Бизнес-центр и стартап-хаб',
    description: 'Мегаполис с 10+ млн жителей. Международные школы, финтех-стартапы, крупнейший аэропорт. Здесь открывают компании, нанимают персонал, масштабируют бизнес.',
    pros: ['Всё есть', 'Лучший интернет', 'Международные школы', 'Аэропорт-хаб', 'Ночная жизнь'],
    cons: ['Пробки', 'Смог и жара', 'Дорого', 'Нет пляжа', 'Стресс мегаполиса'],
    rating: { price: 2, sea: 1, internet: 5, vibe: 5, eco: 2, safety: 3, infra: 5 },
    budget: { min: 1000, comfort: 2000, premium: 5000 },
    color: '#f59e0b',
    bestFor: ['Бизнесмены', 'Стартаперы', 'Международные семьи'],
  },
  {
    id: 'hanoi', name: 'Ханой', flag: '🏛️', region: 'Северный Вьетнам',
    tagline: 'Культура, история и особый ритм',
    description: 'Столица Вьетнама с уникальной архитектурой и культурой. Прохладная зима по меркам Вьетнама. Умеренный темп жизни, меньше туризма. Бывает туманно и промозгло.',
    pros: ['Культура и история', 'Уникальная кухня', 'Прохладнее зимой', 'Аутентичная атмосфера'],
    cons: ['Зима холодная и влажная', 'Нет моря', 'Меньше экспат-инфраструктуры', 'Трафик'],
    rating: { price: 3, sea: 1, internet: 5, vibe: 3, eco: 3, safety: 4, infra: 4 },
    budget: { min: 800, comfort: 1500, premium: 3500 },
    color: '#8b5cf6',
    bestFor: ['Культурологи', 'Любители истории', 'Долгосрочники'],
  },
  {
    id: 'phuquoc', name: 'Фукуок', flag: '🏝️', region: 'Остров-юг',
    tagline: 'Райский остров с растущей инфраструктурой',
    description: 'Прозрачное море, тропические закаты, нетронутые пляжи. Туризм активно развивается. Дороже из-за островной логистики. Для тех, кто хочет «выдохнуть».',
    pros: ['Красивейшее море', 'Закаты', 'Спокойный темп', 'Тропическая природа'],
    cons: ['Всё дороже', 'Меньше экспатов', 'Слабее интернет', 'Дождливый сезон (май-окт)'],
    rating: { price: 2, sea: 5, internet: 3, vibe: 3, eco: 5, safety: 5, infra: 3 },
    budget: { min: 900, comfort: 1800, premium: 4000 },
    color: '#a855f7',
    bestFor: ['Отдыхающие', 'Пары', 'Фрилансеры'],
  },
];

const RATING_LABELS: Record<string, string> = {
  price: '💰 Цены', sea: '🌊 Море', internet: '📶 Инет',
  vibe: '🎉 Тусовки', eco: '🌿 Экология', safety: '🛡️ Безопасность', infra: '🏗️ Инфра',
};

export default function CitiesWebScreen() {
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
        background: 'radial-gradient(ellipse 90% 60% at 50% -10%, rgba(31,209,193,0.14) 0%, rgba(147,51,234,0.06) 60%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '24px 20px', position: 'relative', zIndex: 1 }}>
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
            epats.io → <span style={{ color: '#1fd1c1' }}>Сравнение городов</span>
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(31,209,193,0.12)', border: '1px solid rgba(31,209,193,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 14,
            fontSize: 12, color: '#1fd1c1', fontWeight: 700,
          }}>
            🏙️ Аналитика хабов Вьетнама · 2026
          </div>
          <h1 style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 900, letterSpacing: '-0.8px', margin: '0 0 12px', color: '#fff' }}>
            Где лучше жить во Вьетнаме?
          </h1>
          <p style={{ fontSize: 15, color: '#94a3b8', maxWidth: 540, margin: '0 auto', lineHeight: 1.6 }}>
            Честное сравнение 5 главных хабов для экспатов — плюсы, минусы, бюджет и для кого подойдёт.
          </p>
        </div>

        {/* City cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {CITIES.map((city, idx) => (
            <div
              key={city.id}
              style={{
                borderRadius: 24,
                background: 'rgba(25, 16, 38, 0.7)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255,255,255,0.08)',
                overflow: 'hidden',
                boxShadow: '0 16px 36px rgba(0,0,0,0.3)',
              }}
            >
              {/* Header */}
              <div style={{
                padding: '24px 28px', borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap',
              }}>
                <div style={{ fontSize: 48 }}>{city.flag}</div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 6 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>{city.name}</h2>
                    <span style={{ fontSize: 12, color: '#94a3b8', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 999, padding: '2px 10px' }}>
                      {city.region}
                    </span>
                    {idx === 0 && (
                      <span style={{ fontSize: 11, fontWeight: 800, background: 'rgba(31,209,193,0.15)', color: '#1fd1c1', border: '1px solid rgba(31,209,193,0.3)', borderRadius: 999, padding: '2px 10px' }}>
                        🏆 Топ выбор
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, color: city.color, fontWeight: 700, margin: '0 0 6px' }}>{city.tagline}</p>
                  <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{city.description}</p>
                </div>

                {/* Budget */}
                <div style={{ minWidth: 170, padding: 14, borderRadius: 14, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.6 }}>Бюджет / мес</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#cbd5e1' }}>🎒 Эконом</span>
                    <span style={{ fontWeight: 800, color: '#1fd1c1' }}>от ${city.budget.min}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                    <span style={{ color: '#cbd5e1' }}>🛋️ Комфорт</span>
                    <span style={{ fontWeight: 800, color: '#38bdf8' }}>~${city.budget.comfort}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                    <span style={{ color: '#cbd5e1' }}>💎 Премиум</span>
                    <span style={{ fontWeight: 800, color: '#f59e0b' }}>${city.budget.premium}+</span>
                  </div>
                </div>
              </div>

              {/* Body */}
              <div style={{ padding: '20px 28px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
                {/* Pros */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#1fd1c1', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>✅ Плюсы</p>
                  {city.pros.map(p => (
                    <div key={p} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#1fd1c1', fontWeight: 800 }}>+</span>
                      <span>{p}</span>
                    </div>
                  ))}
                </div>

                {/* Cons */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#ef4444', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>❌ Минусы</p>
                  {city.cons.map(c => (
                    <div key={c} style={{ fontSize: 12, color: '#cbd5e1', marginBottom: 5, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                      <span style={{ color: '#ef4444', fontWeight: 800 }}>−</span>
                      <span>{c}</span>
                    </div>
                  ))}
                </div>

                {/* Ratings */}
                <div>
                  <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', margin: '0 0 10px', textTransform: 'uppercase', letterSpacing: 0.8 }}>Рейтинг факторов</p>
                  {Object.entries(city.rating).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>{RATING_LABELS[k]}</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                          <div
                            key={s}
                            style={{
                              width: 8, height: 8, borderRadius: '50%',
                              background: s <= v ? city.color : 'rgba(255,255,255,0.1)',
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}

                  <div style={{ marginTop: 12 }}>
                    <p style={{ fontSize: 11, fontWeight: 800, color: '#64748b', margin: '0 0 6px', textTransform: 'uppercase' }}>Для кого:</p>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                      {city.bestFor.map(tag => (
                        <span key={tag} style={{ fontSize: 10, padding: '3px 8px', borderRadius: 999, background: city.color + '18', color: city.color, fontWeight: 700 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
