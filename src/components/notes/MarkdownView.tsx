import React from 'react';
import { Text as RNText, View } from 'react-native';

import { Text } from '@/components/ui';
import { useTheme } from '@/theme';

export interface MarkdownViewProps {
  source: string;
  onLinkPress?: (title: string) => void;
}

/**
 * Lightweight markdown renderer — intentionally small (no native dep). Supports
 * headings, bullets, checkboxes, blockquotes, code fences, inline **bold**,
 * `code`, and [[wiki links]]. Good enough for note bodies; extend as needed.
 */
export function MarkdownView({ source, onLinkPress }: MarkdownViewProps) {
  const t = useTheme();
  const lines = source.split('\n');

  return (
    <View style={{ gap: 6 }}>
      {lines.map((line, i) => {
        const key = `${i}`;

        if (/^#{1,3}\s/.test(line)) {
          const level = line.match(/^#+/)![0].length;
          const content = line.replace(/^#+\s*/, '');
          return (
            <Text
              key={key}
              variant={level === 1 ? 'h1' : level === 2 ? 'h2' : 'body'}
              weight="bold"
              style={{ marginTop: i === 0 ? 0 : t.spacing.sm }}
            >
              {content}
            </Text>
          );
        }

        const checkbox = line.match(/^\s*-\s\[( |x|X)\]\s(.*)$/);
        if (checkbox) {
          const done = checkbox[1].toLowerCase() === 'x';
          return (
            <View key={key} style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-start' }}>
              <RNText style={{ color: done ? t.colors.accent : t.colors.textMuted, fontSize: t.typography.body }}>
                {done ? '☑' : '☐'}
              </RNText>
              <Text
                style={{
                  flex: 1,
                  textDecorationLine: done ? 'line-through' : 'none',
                  color: done ? t.colors.textMuted : t.colors.text,
                }}
              >
                {renderInline(checkbox[2], t, onLinkPress)}
              </Text>
            </View>
          );
        }

        if (/^\s*[-*]\s/.test(line)) {
          return (
            <View key={key} style={{ flexDirection: 'row', gap: 8 }}>
              <Text tone="muted">•</Text>
              <Text style={{ flex: 1 }}>{renderInline(line.replace(/^\s*[-*]\s/, ''), t, onLinkPress)}</Text>
            </View>
          );
        }

        if (/^>\s?/.test(line)) {
          return (
            <View
              key={key}
              style={{
                borderLeftWidth: 3,
                borderLeftColor: t.colors.accent,
                paddingLeft: t.spacing.md,
                paddingVertical: 2,
              }}
            >
              <Text tone="muted" style={{ fontStyle: 'italic' }}>
                {renderInline(line.replace(/^>\s?/, ''), t, onLinkPress)}
              </Text>
            </View>
          );
        }

        if (line.trim() === '') return <View key={key} style={{ height: 6 }} />;

        return (
          <Text key={key} style={{ lineHeight: t.typography.body * 1.5 }}>
            {renderInline(line, t, onLinkPress)}
          </Text>
        );
      })}
    </View>
  );
}

/** Inline parser for **bold**, `code`, and [[links]]. */
function renderInline(
  text: string,
  t: ReturnType<typeof useTheme>,
  onLinkPress?: (title: string) => void
): React.ReactNode[] {
  const tokens = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[\[[^\]]+\]\])/g).filter(Boolean);
  return tokens.map((tok, i) => {
    if (tok.startsWith('**') && tok.endsWith('**')) {
      return (
        <RNText key={i} style={{ fontWeight: '700', color: t.colors.text }}>
          {tok.slice(2, -2)}
        </RNText>
      );
    }
    if (tok.startsWith('`') && tok.endsWith('`')) {
      return (
        <RNText
          key={i}
          style={{
            fontFamily: 'monospace',
            color: t.colors.accent,
            backgroundColor: t.colors.overlay,
          }}
        >
          {tok.slice(1, -1)}
        </RNText>
      );
    }
    if (tok.startsWith('[[') && tok.endsWith(']]')) {
      const title = tok.slice(2, -2);
      return (
        <RNText
          key={i}
          onPress={() => onLinkPress?.(title)}
          style={{ color: t.colors.accent, fontWeight: '600' }}
        >
          {title}
        </RNText>
      );
    }
    return (
      <RNText key={i} style={{ color: t.colors.text }}>
        {tok}
      </RNText>
    );
  });
}
