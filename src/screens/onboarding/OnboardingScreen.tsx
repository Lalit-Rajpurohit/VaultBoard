import { Ionicons } from '@expo/vector-icons';
import React, { useRef, useState } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { Button, Screen, Text } from '@/components/ui';
import { useSettings } from '@/store';
import { useTheme } from '@/theme';

const SLIDES = [
  {
    icon: 'sparkles' as const,
    title: 'One calm vault',
    body: 'Notes, tasks, and knowledge together — beautifully organized, fully offline.',
  },
  {
    icon: 'git-network' as const,
    title: 'Linked thinking',
    body: 'Connect notes with [[wiki links]] and explore ideas through backlinks.',
  },
  {
    icon: 'grid' as const,
    title: 'Boards that flow',
    body: 'Plan work on Kanban boards with drag-and-drop cards, checklists and due dates.',
  },
];

export function OnboardingScreen() {
  const t = useTheme();
  const { width } = useWindowDimensions();
  const setOnboarded = useSettings((s) => s.setOnboarded);
  const scrollRef = useRef<ScrollView>(null);
  const [index, setIndex] = useState(0);

  const finish = () => setOnboarded(true);
  const next = () => {
    if (index < SLIDES.length - 1) {
      const ni = index + 1;
      setIndex(ni);
      scrollRef.current?.scrollTo({ x: ni * width, animated: true });
    } else finish();
  };

  return (
    <Screen edges={['top', 'bottom']}>
      <View style={{ alignItems: 'flex-end', padding: t.spacing.lg }}>
        <Pressable onPress={finish} hitSlop={8}>
          <Text tone="muted" weight="medium">
            Skip
          </Text>
        </Pressable>
      </View>

      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => setIndex(Math.round(e.nativeEvent.contentOffset.x / width))}
        style={{ flex: 1 }}
      >
        {SLIDES.map((slide) => (
          <View
            key={slide.title}
            style={{ width, alignItems: 'center', justifyContent: 'center', padding: t.spacing.xxxl, gap: t.spacing.lg }}
          >
            <View
              style={{
                width: 110,
                height: 110,
                borderRadius: t.radii.xl,
                backgroundColor: t.colors.accentSoft,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name={slide.icon} size={52} color={t.colors.accent} />
            </View>
            <Text variant="display" weight="bold" center>
              {slide.title}
            </Text>
            <Text tone="muted" center style={{ maxWidth: 300, lineHeight: t.typography.body * 1.5 }}>
              {slide.body}
            </Text>
          </View>
        ))}
      </ScrollView>

      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: t.spacing.xl }}>
        {SLIDES.map((_, i) => (
          <View
            key={i}
            style={{
              width: i === index ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i === index ? t.colors.accent : t.colors.border,
            }}
          />
        ))}
      </View>

      <View style={{ paddingHorizontal: t.spacing.xl, paddingBottom: t.spacing.xl }}>
        <Button
          title={index === SLIDES.length - 1 ? 'Enter VaultBoard' : 'Continue'}
          onPress={next}
          fullWidth
          size="lg"
        />
      </View>
    </Screen>
  );
}
