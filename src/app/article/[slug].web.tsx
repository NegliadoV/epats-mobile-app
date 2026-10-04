'use client';
import React, { useState, useEffect } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import BrandLogo from '@/components/BrandLogo';
import { getArticleBySlug, ARTICLES, getCategoryBySlug } from '@shared/data/articles';

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

function renderLine(line: string, key: number) {
  return line
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_m, text: string, url: string) => {
      const isInternal = url.startsWith('/');
      return `<a href="${url}" ${isInternal ? '' : 'target="_blank" rel="noopener noreferrer"'} style="color:#1fd1c1;text-decoration:underline;text-underline-offset:3px">${text}</a>`;
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff">$1</strong>')
    .replace(/(^|[^*])\*([^*\s][^*]*?)\*(?!\*)/g, '$1<em>$2</em>');
}

function ArticleContent({ content }: { content: string }) {
  const blocks: React.ReactNode[] = [];
  const lines = content.split('\n');
  let i = 0;
  let tableLines: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (line.trim().startsWith('|')) {
      tableLines.push(line);
      i++;
      continue;
    }

    if (tableLines.length > 0) {
      const rows = tableLines
        .filter(r => !r.match(/^\|[-\s|]+\|$/))
        .map(r => r.split('|').filter((_, idx, a) => idx > 0 && idx < a.length - 1).map(c => c.trim()));
      if (rows.length > 1) {
        const header = rows[0];
        const body = rows.slice(1);
        blocks.push(
          <div key={`t${i}`} style={{ overflowX: 'auto', marginBottom: 24, borderRadius: 14, border: '1px solid rgba(255,255,255,0.08)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5, background: 'rgba(22, 17, 36, 0.6)' }}>
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '2px solid rgba(31,209,193,0.4)' }}>
                  {header.map((h, j) => (
                    <th key={j} style={{ padding: '12px 14px', textAlign: 'left', color: '#1fd1c1', fontWeight: 800 }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    {row.map((c, ci) => (
                      <td key={ci} style={{ padding: '10px 14px', color: '#cbd5e1', lineHeight: 1.5 }}>
                        {c}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
      tableLines = [];
    }

    if (line.startsWith('## ')) {
      blocks.push(
        <h2 key={i} style={{
          fontSize: 22, fontWeight: 900, color: '#fff',
          marginTop: 36, marginBottom: 16, letterSpacing: '-0.4px',
          borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: 10,
        }}>
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('### ')) {
      blocks.push(
        <h3 key={i} style={{ fontSize: 17, fontWeight: 800, color: '#1fd1c1', marginTop: 24, marginBottom: 10 }}>
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('---')) {
      blocks.push(<hr key={i} style={{ border: 'none', borderTop: '1px solid rgba(255,255,255,0.08)', margin: '28px 0' }} />);
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && (lines[j].startsWith('- ') || lines[j].startsWith('* '))) {
        items.push(lines[j].slice(2));
        j++;
      }
      blocks.push(
        <ul key={i} style={{ paddingLeft: 22, marginBottom: 16 }}>
          {items.map((it, k) => (
            <li key={k} style={{ color: '#cbd5e1', marginBottom: 8, lineHeight: 1.7, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: renderLine(it, k) }} />
          ))}
        </ul>
      );
      i = j;
      continue;
    } else if (line.match(/^\d+\. /)) {
      const items: string[] = [];
      let j = i;
      while (j < lines.length && lines[j].match(/^\d+\. /)) {
        items.push(lines[j].replace(/^\d+\. /, ''));
        j++;
      }
      blocks.push(
        <ol key={i} style={{ paddingLeft: 22, marginBottom: 16 }}>
          {items.map((it, k) => (
            <li key={k} style={{ color: '#cbd5e1', marginBottom: 8, lineHeight: 1.7, fontSize: 15 }} dangerouslySetInnerHTML={{ __html: renderLine(it, k) }} />
          ))}
        </ol>
      );
      i = j;
      continue;
    } else if (line.startsWith('> ')) {
      blocks.push(
        <div key={i} style={{
          background: 'rgba(255, 107, 74, 0.08)',
          borderLeft: '4px solid #ff6b4a',
          borderRadius: 12, padding: '14px 18px',
          marginBottom: 18, fontSize: 14.5, color: '#e2e8f0', lineHeight: 1.7,
        }} dangerouslySetInnerHTML={{ __html: renderLine(line.slice(2), i) }} />
      );
    } else if (line.startsWith('⚠️') || line.startsWith('❌') || line.startsWith('✅') || line.startsWith('⏱')) {
      blocks.push(
        <div key={i} style={{
          background: 'rgba(31, 209, 193, 0.08)',
          border: '1px solid rgba(31, 209, 193, 0.25)',
          borderRadius: 12, padding: '12px 16px',
          marginBottom: 16, fontSize: 14, color: '#cbd5e1', lineHeight: 1.6,
        }} dangerouslySetInnerHTML={{ __html: renderLine(line, i) }} />
      );
    } else if (line.trim() !== '') {
      blocks.push(
        <p key={i} style={{ fontSize: 15.5, color: '#94a3b8', lineHeight: 1.85, marginBottom: 16 }} dangerouslySetInnerHTML={{ __html: renderLine(line, i) }} />
      );
    }
    i++;
  }

  return <article>{blocks}</article>;
}

export default function ArticleWebScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);
  const [favorited, setFavorited] = useState(false);

  const article = getArticleBySlug(slug as string);

  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      try {
        const favs = JSON.parse(localStorage.getItem('epats_fav_articles') || '[]');
        setFavorited(favs.includes(slug));
      } catch {}
    }
  }, [slug]);

  const toggleFavorite = () => {
    if (typeof window !== 'undefined' && slug) {
      try {
        const favs = JSON.parse(localStorage.getItem('epats_fav_articles') || '[]');
        const updated = favorited ? favs.filter((s: string) => s !== slug) : [...favs, slug];
        localStorage.setItem('epats_fav_articles', JSON.stringify(updated));
        setFavorited(!favorited);
      } catch {}
    }
  };

  const copyShareLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!article) {
    return (
      <div style={{
        minHeight: '100vh', backgroundColor: '#080711', color: '#fff',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 20, fontFamily: 'sans-serif',
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🏝️</div>
        <h1 style={{ fontSize: 24, marginBottom: 8 }}>Статья не найдена</h1>
        <p style={{ color: '#94a3b8', marginBottom: 20 }}>Возможно, статья была перемещена или ссылка устарела.</p>
        <button
          onClick={() => router.push('/articles' as any)}
          style={{
            background: 'linear-gradient(135deg, #ff6b4a, #ff9a3c)',
            border: 'none', borderRadius: 12, padding: '10px 20px', color: '#fff', fontWeight: 800, cursor: 'pointer',
          }}
        >
          ← Все статьи
        </button>
      </div>
    );
  }

  const category = getCategoryBySlug(article.categorySlug);
  const related = ARTICLES.filter(a => a.categorySlug === article.categorySlug && a.slug !== article.slug).slice(0, 3);

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
        background: 'radial-gradient(ellipse 90% 50% at 50% -10%, rgba(31,209,193,0.12) 0%, rgba(147,51,234,0.06) 50%, transparent 100%)',
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
          maxWidth: 900, margin: '0 auto', padding: '0 20px', height: 60,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <button
            onClick={() => router.push('/articles' as any)}
            style={{
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 999, padding: '7px 16px', color: '#fff', fontSize: 13, fontWeight: 700,
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
            }}
          >
            ← К статьям
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={toggleFavorite}
              style={{
                background: favorited ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.06)',
                border: favorited ? '1px solid rgba(245,158,11,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: favorited ? '#f59e0b' : '#94a3b8',
                borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {favorited ? '★ В избранном' : '☆ В закладки'}
            </button>
            <button
              onClick={copyShareLink}
              style={{
                background: copied ? 'rgba(31,209,193,0.2)' : 'rgba(255,255,255,0.06)',
                border: copied ? '1px solid rgba(31,209,193,0.5)' : '1px solid rgba(255,255,255,0.1)',
                color: copied ? '#1fd1c1' : '#94a3b8',
                borderRadius: 999, padding: '7px 14px', fontSize: 13, fontWeight: 700, cursor: 'pointer',
              }}
            >
              {copied ? '✓ Скопировано' : '🔗 Поделиться'}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main style={{ maxWidth: 860, margin: '0 auto', padding: '36px 20px', position: 'relative', zIndex: 1 }}>

        {/* Breadcrumb */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 13, color: '#64748b' }}>
          <div onClick={() => router.push('/' as any)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer', color: '#fff', fontWeight: 800 }}>
            <BrandLogo size={20} />
            <span>epats.io</span>
          </div>
          <span>→</span>
          <span onClick={() => router.push('/articles' as any)} style={{ cursor: 'pointer', color: '#94a3b8' }}>Статьи</span>
          <span>→</span>
          <span style={{ color: '#1fd1c1', fontWeight: 700 }}>{article.category}</span>
        </div>

        {/* Header Glass Card */}
        <div style={{
          background: 'rgba(22, 17, 36, 0.75)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 24,
          padding: '32px 28px',
          marginBottom: 32,
          boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.5)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 32 }}>{article.emoji}</span>
            <span style={{
              background: 'rgba(31,209,193,0.15)', border: '1px solid rgba(31,209,193,0.3)',
              borderRadius: 999, padding: '4px 12px', fontSize: 12, fontWeight: 800, color: '#1fd1c1',
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {article.category}
            </span>
            <span style={{ color: '#64748b', fontSize: 13 }}>
              ⏱ {article.readTime} мин чтения
            </span>
            <span style={{ color: '#64748b', fontSize: 13 }}>
              · {formatDate(article.publishedAt)}
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(1.8rem, 4vw, 2.4rem)',
            fontWeight: 900,
            lineHeight: 1.25,
            color: '#fff',
            letterSpacing: '-0.8px',
            margin: '0 0 18px',
          }}>
            {article.title}
          </h1>

          <p style={{
            fontSize: 16,
            color: '#cbd5e1',
            lineHeight: 1.7,
            margin: 0,
            paddingTop: 18,
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            {article.excerpt}
          </p>
        </div>

        {/* Article Body */}
        <div style={{
          background: 'rgba(22, 17, 36, 0.5)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(255, 255, 255, 0.06)',
          borderRadius: 24,
          padding: '36px 30px',
          marginBottom: 48,
          lineHeight: 1.8,
        }}>
          <ArticleContent content={article.content} />
        </div>

        {/* Related Articles */}
        {related.length > 0 && (
          <div style={{
            background: 'rgba(22, 17, 36, 0.75)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 24,
            padding: 28,
            marginBottom: 36,
          }}>
            <h3 style={{ fontSize: 18, fontWeight: 900, color: '#fff', margin: '0 0 18px' }}>
              Читать дальше в разделе «{article.category}»
            </h3>
            <div style={{ display: 'grid', gap: 12 }}>
              {related.map(r => (
                <div
                  key={r.slug}
                  onClick={() => router.push(`/article/${r.slug}` as any)}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    borderRadius: 14, padding: '14px 18px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    cursor: 'pointer', transition: 'all 0.15s ease',
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14.5, fontWeight: 800, color: '#fff', marginBottom: 4 }}>
                      {r.emoji} {r.title}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      ⏱ {r.readTime} мин · {formatDate(r.publishedAt)}
                    </div>
                  </div>
                  <span style={{ color: '#1fd1c1', fontWeight: 800, fontSize: 13, flexShrink: 0, marginLeft: 14 }}>
                    Читать →
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}
