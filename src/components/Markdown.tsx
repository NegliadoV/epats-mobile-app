import { router } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';
import { ReactNode } from 'react';
import { ScrollView, Text, View } from 'react-native';

import { WEB_BASE } from '@/lib/api';
import { openTool } from '@/lib/tools';
import { useTheme } from '@/theme/ThemeProvider';
import { fonts, radius, space } from '@/theme/tokens';

/* Лёгкий нативный рендерер Markdown для статей сайта:
   ## / ###, абзацы, списки, нумерация, > цитаты, ---, таблицы, **жирный**, [ссылки](/…) */

type Block =
  | { t: 'h2' | 'h3' | 'p' | 'quote'; text: string }
  | { t: 'ul' | 'ol'; items: string[] }
  | { t: 'hr' }
  | { t: 'table'; rows: string[][] };

function parse(md: string): Block[] {
  const lines = md.replace(/\r/g, '').split('\n');
  const out: Block[] = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i].trim();
    if (!l) { i++; continue; }
    if (l.startsWith('### ')) { out.push({ t: 'h3', text: l.slice(4) }); i++; continue; }
    if (l.startsWith('## ')) { out.push({ t: 'h2', text: l.slice(3) }); i++; continue; }
    if (l.startsWith('# ')) { out.push({ t: 'h2', text: l.slice(2) }); i++; continue; }
    if (/^-{3,}$/.test(l)) { out.push({ t: 'hr' }); i++; continue; }
    if (l.startsWith('>')) {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) buf.push(lines[i++].trim().replace(/^>\s?/, ''));
      out.push({ t: 'quote', text: buf.join('\n') });
      continue;
    }
    if (l.startsWith('|')) {
      const rows: string[][] = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        const row = lines[i++].trim().replace(/^\||\|$/g, '').split('|').map(s => s.trim());
        if (!row.every(cell => /^:?-{2,}:?$/.test(cell))) rows.push(row);
      }
      out.push({ t: 'table', rows });
      continue;
    }
    if (/^[-*•] /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^[-*•] /.test(lines[i].trim())) items.push(lines[i++].trim().slice(2));
      out.push({ t: 'ul', items });
      continue;
    }
    if (/^\d+[.)] /.test(l)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+[.)] /.test(lines[i].trim())) items.push(lines[i++].trim().replace(/^\d+[.)] /, ''));
      out.push({ t: 'ol', items });
      continue;
    }
    const buf: string[] = [];
    while (i < lines.length && lines[i].trim() && !/^(#|>|\||[-*•] |\d+[.)] |-{3,})/.test(lines[i].trim())) buf.push(lines[i++].trim());
    out.push({ t: 'p', text: buf.join(' ') });
  }
  return out;
}

function openLink(href: string) {
  if (href.startsWith('/article/')) return router.push(`/article/${href.slice(9)}`);
  if (href.startsWith('/tools/')) return openTool(href);
  WebBrowser.openBrowserAsync(href.startsWith('/') ? `${WEB_BASE}${href}` : href);
}

function Inline({ text, color, bold }: { text: string; color: string; bold?: boolean }) {
  const { c } = useTheme();
  const parts: ReactNode[] = [];
  const re = /\*\*\[([^\]]+)\]\(([^)]+)\)\*\*|\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) parts.push(text.slice(last, m.index));
    const label = m[1] ?? m[3];
    const href = m[2] ?? m[4];
    if (label && href) {
      parts.push(
        <Text key={k++} onPress={() => openLink(href)} style={{ color: c.accent, fontFamily: fonts.bodyBold, textDecorationLine: 'underline' }}>
          {label}
        </Text>,
      );
    } else {
      parts.push(<Text key={k++} style={{ fontFamily: fonts.bodyHeavy, color: c.textPrimary }}>{m[5]}</Text>);
    }
    last = re.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return <Text style={{ color, fontFamily: bold ? fonts.bodyBold : fonts.body, fontSize: 15.5, lineHeight: 24 }}>{parts}</Text>;
}

export function Markdown({ source }: { source: string }) {
  const { c } = useTheme();
  return (
    <View style={{ gap: space.md }}>
      {parse(source).map((b, i) => {
        switch (b.t) {
          case 'h2':
            return <Text key={i} style={{ fontFamily: fonts.display, fontSize: 19, lineHeight: 26, color: c.textPrimary, marginTop: space.md }}>{b.text}</Text>;
          case 'h3':
            return <Text key={i} style={{ fontFamily: fonts.bodyHeavy, fontSize: 16.5, lineHeight: 23, color: c.textPrimary, marginTop: space.sm }}>{b.text}</Text>;
          case 'p':
            return <Inline key={i} text={b.text} color={c.textSecondary} />;
          case 'hr':
            return <View key={i} style={{ height: 1, backgroundColor: c.border, marginVertical: space.sm }} />;
          case 'quote':
            return (
              <View key={i} style={{ borderLeftWidth: 3, borderLeftColor: c.coral, backgroundColor: c.bgSecondary, borderRadius: radius.md, padding: space.md }}>
                <Inline text={b.text} color={c.textPrimary} />
              </View>
            );
          case 'ul':
          case 'ol':
            return (
              <View key={i} style={{ gap: 6 }}>
                {b.items.map((it, j) => (
                  <View key={j} style={{ flexDirection: 'row', gap: 8 }}>
                    <Text style={{ color: c.coral, fontFamily: fonts.bodyHeavy, fontSize: 15.5, lineHeight: 24, minWidth: 16 }}>
                      {b.t === 'ol' ? `${j + 1}.` : '•'}
                    </Text>
                    <View style={{ flex: 1 }}><Inline text={it} color={c.textSecondary} /></View>
                  </View>
                ))}
              </View>
            );
          case 'table':
            return (
              <ScrollView key={i} horizontal showsHorizontalScrollIndicator={false}>
                <View style={{ borderWidth: 1, borderColor: c.border, borderRadius: radius.md, overflow: 'hidden' }}>
                  {b.rows.map((row, r) => (
                    <View key={r} style={{ flexDirection: 'row', backgroundColor: r === 0 ? c.bgSecondary : r % 2 ? c.bgCard : c.bgPrimary }}>
                      {row.map((cell, ci) => (
                        <View key={ci} style={{ width: 150, padding: 10, borderRightWidth: ci < row.length - 1 ? 1 : 0, borderColor: c.border }}>
                          <Inline text={cell} color={r === 0 ? c.textPrimary : c.textSecondary} bold={r === 0} />
                        </View>
                      ))}
                    </View>
                  ))}
                </View>
              </ScrollView>
            );
        }
      })}
    </View>
  );
}
