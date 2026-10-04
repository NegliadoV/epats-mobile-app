'use client';
import React, { useState, useMemo } from 'react';
import { router } from 'expo-router';
import { ARTICLES, CATEGORIES } from '@shared/data/articles';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function ArticlesWebScreen() {
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredArticles = useMemo(() => {
    return ARTICLES.filter(a => {
      const matchCat = !selectedCat || a.categorySlug === selectedCat;
      const matchSearch =
        !searchQuery.trim() ||
        a.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

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
      backgroundColor: '#080711',
      color: '#f8fafc',
      fontFamily: 'Manrope, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      paddingBottom: 110,
      boxSizing: 'border-box',
    }}>
      {/* Background ambient radial glow */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '600px',
        background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(99,102,241,0.14) 0%, rgba(236,72,153,0.06) 50%, transparent 100%)',
        pointerEvents: 'none', zIndex: 0,
      }} />

      {/* Top Navbar */}
      <header style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8, 7, 17, 0.82)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}>
        <div style={{
          maxWidth: 1100, margin: '0 auto', padding: '0 20px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div
            onClick={() => router.push('/' as any)}
            style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}
          >
            <span style={{ fontSize: 24 }}>🌴</span>
            <span style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.5px' }}>
              epats<span style={{ color: '#ff6b4a' }}>.io</span>
            </span>
          </div>
          <nav style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => router.push('/' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc', padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              ← Главная
            </button>
            <button
              onClick={() => router.push('/tools' as any)}
              style={{
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)',
                color: '#f8fafc', padding: '7px 16px', borderRadius: 999, fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              🛠️ Инструменты
            </button>
          </nav>
        </div>
      </header>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '36px 20px', position: 'relative', zIndex: 1 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 28, fontSize: 13, color: '#64748b' }}>
          <span onClick={() => router.push('/' as any)} style={{ cursor: 'pointer', color: '#94a3b8' }}>epats.io</span>
          <span>→</span>
          <span style={{ color: '#1fd1c1', fontWeight: 700 }}>Статьи и база знаний</span>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.3)',
            borderRadius: 999, padding: '5px 16px', marginBottom: 16,
            fontSize: 12.5, color: '#818cf8', fontWeight: 800,
          }}>
            📖 Журнал и гайды по Вьетнаму
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, letterSpacing: '-1px', margin: '0 0 14px', color: '#fff', lineHeight: 1.15 }}>
            База знаний <span style={{ background: 'linear-gradient(135deg, #818cf8, #c084fc, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>для жизни во Вьетнаме</span>
          </h1>
          <p style={{ fontSize: 16, color: '#94a3b8', maxWidth: 620, margin: '0 auto', lineHeight: 1.65 }}>
            Гайды по переезду, визовым правилам 2026, аренде жилья, банковским картам и медицине от русскоязычных резидентов.
          </p>
        </div>

        {/* Search Input Bar */}
        <div style={{ maxWidth: 640, margin: '0 auto 32px' }}>
          <div style={{
            position: 'relative',
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center',
            padding: '4px 14px',
            boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
          }}>
            <span style={{ fontSize: 18, marginRight: 10 }}>🔍</span>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Поиск по статьям: визаран, жильё, карты, байк, медицина..."
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: '#fff',
                fontSize: 14.5,
                fontFamily: 'inherit',
                padding: '10px 0',
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  background: 'rgba(255,255,255,0.1)', border: 'none', borderRadius: '50%',
                  width: 22, height: 22, color: '#94a3b8', cursor: 'pointer', fontSize: 12,
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Category Pills Bar */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 40 }}>
          <button
            onClick={() => setSelectedCat(null)}
            style={{
              padding: '7px 16px',
              borderRadius: 999,
              background: !selectedCat ? 'rgba(31,209,193,0.2)' : 'rgba(255, 255, 255, 0.04)',
              border: !selectedCat ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
              color: !selectedCat ? '#1fd1c1' : '#94a3b8',
              fontSize: 13, fontWeight: 700, cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            Все ({ARTICLES.length})
          </button>
          {CATEGORIES.map(cat => {
            const active = selectedCat === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setSelectedCat(cat.slug)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 999,
                  background: active ? 'rgba(31,209,193,0.2)' : 'rgba(255, 255, 255, 0.04)',
                  border: active ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255, 255, 255, 0.08)',
                  color: active ? '#1fd1c1' : '#94a3b8',
                  fontSize: 13, fontWeight: 700, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cat.emoji}</span>
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Articles Grid */}
        {filteredArticles.length === 0 ? (
          <div style={{
            textAlign: 'center', padding: '60px 20px',
            background: 'rgba(22, 17, 36, 0.5)', borderRadius: 24, border: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
            <h3 style={{ fontSize: 18, color: '#fff', marginBottom: 8 }}>Ничего не найдено</h3>
            <p style={{ fontSize: 14, color: '#64748b' }}>Попробуйте изменить поисковый запрос или выбрать другую категорию</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
            {filteredArticles.map(article => (
              <div
                key={article.slug}
                onClick={() => router.push(`/article/${article.slug}` as any)}
                style={{
                  borderRadius: 22,
                  background: 'rgba(22, 17, 36, 0.75)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  padding: 24,
                  cursor: 'pointer',
                  display: 'flex', flexDirection: 'column',
                  boxShadow: '0 12px 30px rgba(0,0,0,0.35)',
                  transition: 'transform 0.15s ease, border-color 0.15s ease',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                  <span style={{ fontSize: 24 }}>{article.emoji}</span>
                  <span style={{
                    color: '#1fd1c1', fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.04em',
                  }}>
                    {article.category}
                  </span>
                  <span style={{ color: '#64748b', fontSize: 12, marginLeft: 'auto' }}>
                    ⏱ {article.readTime} мин
                  </span>
                </div>

                <h2 style={{ fontSize: 17, fontWeight: 800, color: '#fff', lineHeight: 1.35, margin: '0 0 10px' }}>
                  {article.title}
                </h2>

                <p style={{
                  fontSize: 13.5,
                  color: '#94a3b8',
                  lineHeight: 1.6,
                  margin: '0 0 16px',
                  flex: 1,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {article.excerpt}
                </p>

                <div style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  paddingTop: 12, borderTop: '1px solid rgba(255, 255, 255, 0.06)',
                }}>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {formatDate(article.publishedAt)}
                  </span>
                  <span style={{ fontSize: 13, color: '#ff6b4a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 4 }}>
                    Читать →
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
