import React from 'react';
import { View } from 'react-native';

import { Surface, Text } from '@/components/ui';
import { getDb } from '@/db';
import { useTheme } from '@/theme';
import type { Note } from '@/types';

export interface GraphHintProps {
  notes: Note[];
}

/**
 * Lightweight "knowledge graph" hint — a decorative constellation of nodes
 * arranged around a hub, sized to the vault. Not an interactive graph (kept
 * intentionally cheap); the real graph view is a future enhancement.
 */
export function GraphHint({ notes }: GraphHintProps) {
  const t = useTheme();
  const linkCount =
    getDb().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM note_links')?.n ?? 0;

  const SIZE = 150;
  const center = SIZE / 2;
  const radius = 54;
  const count = Math.min(notes.length, 8);
  const nodes = Array.from({ length: count }, (_, i) => {
    const angle = (i / count) * Math.PI * 2;
    return {
      x: center + radius * Math.cos(angle),
      y: center + radius * Math.sin(angle),
    };
  });

  return (
    <Surface elevated padded style={{ flexDirection: 'row', alignItems: 'center', gap: t.spacing.lg }}>
      <View style={{ width: SIZE, height: SIZE }}>
        {/* connector lines from hub to each node */}
        {nodes.map((n, i) => {
          const dx = n.x - center;
          const dy = n.y - center;
          const len = Math.hypot(dx, dy);
          const angle = (Math.atan2(dy, dx) * 180) / Math.PI;
          return (
            <View
              key={`l${i}`}
              style={{
                position: 'absolute',
                left: center,
                top: center,
                width: len,
                height: 1.5,
                backgroundColor: t.colors.border,
                transform: [{ translateX: 0 }, { rotateZ: `${angle}deg` }],
                transformOrigin: 'left center',
              }}
            />
          );
        })}
        {/* nodes */}
        {nodes.map((n, i) => (
          <View
            key={`n${i}`}
            style={{
              position: 'absolute',
              left: n.x - 5,
              top: n.y - 5,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: t.colors.accentSoft,
              borderWidth: 1.5,
              borderColor: t.colors.accent,
            }}
          />
        ))}
        {/* hub */}
        <View
          style={{
            position: 'absolute',
            left: center - 9,
            top: center - 9,
            width: 18,
            height: 18,
            borderRadius: 9,
            backgroundColor: t.colors.accent,
          }}
        />
      </View>

      <View style={{ flex: 1, gap: 4 }}>
        <Text variant="h2" weight="semibold">
          Knowledge graph
        </Text>
        <Text tone="muted" variant="caption">
          {notes.length} notes · {linkCount} links
        </Text>
        <Text tone="faint" variant="small">
          Connect notes with [[links]] to grow your web of ideas.
        </Text>
      </View>
    </Surface>
  );
}
