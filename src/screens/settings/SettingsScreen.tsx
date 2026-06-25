import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

import { Header, Screen, Segmented, Surface, Text } from '@/components/ui';
import { exportJson, exportMarkdown } from '@/services';
import { useSettings } from '@/store';
import { accentKeys, accents, useTheme } from '@/theme';
import type { AccentKey, ThemeMode, TypographyScale } from '@/types';

export function SettingsScreen() {
  const t = useTheme();
  const nav = useNavigation();
  const s = useSettings();

  return (
    <Screen>
      <Header large title="Settings" />
      <ScrollView contentContainerStyle={{ padding: t.spacing.xl, gap: t.spacing.xl, paddingBottom: 60 }}>
        {/* Appearance */}
        <Group title="Appearance">
          <Row label="Theme">
            <Segmented<ThemeMode>
              options={[
                { label: 'Light', value: 'light' },
                { label: 'Dark', value: 'dark' },
                { label: 'System', value: 'system' },
              ]}
              value={s.themeMode}
              onChange={s.setThemeMode}
            />
          </Row>

          <Row label="Accent color" column>
            <View style={{ flexDirection: 'row', gap: t.spacing.md, marginTop: 4 }}>
              {accentKeys.map((key: AccentKey) => {
                const selected = s.accent === key;
                return (
                  <Pressable key={key} onPress={() => s.setAccent(key)}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        backgroundColor: accents[key].base,
                        borderWidth: 3,
                        borderColor: selected ? t.colors.text : 'transparent',
                      }}
                    />
                  </Pressable>
                );
              })}
            </View>
          </Row>

          <Row label="Typography">
            <Segmented<TypographyScale>
              options={[
                { label: 'Compact', value: 'compact' },
                { label: 'Default', value: 'default' },
                { label: 'Large', value: 'comfortable' },
              ]}
              value={s.typography}
              onChange={s.setTypography}
            />
          </Row>
        </Group>

        {/* Security */}
        <Group title="Security">
          <Row label="App lock" hint="Require PIN / biometric on open">
            <Switch
              value={s.appLockEnabled}
              onValueChange={(v) => {
                s.setAppLock(v);
                if (v)
                  Alert.alert(
                    'App lock',
                    'Biometric unlock is wired via expo-local-authentication and will prompt on next cold start.'
                  );
              }}
              trackColor={{ true: t.colors.accent, false: t.colors.border }}
            />
          </Row>
        </Group>

        {/* Data */}
        <Group title="Data">
          <LinkRow icon="cloud-upload-outline" label="Backup & restore" onPress={() => nav.navigate('BackupRestore' as never)} />
          <LinkRow icon="code-download-outline" label="Export as JSON" onPress={() => void exportJson()} />
          <LinkRow icon="document-outline" label="Export notes as Markdown" onPress={() => void exportMarkdown()} />
        </Group>

        {/* Organization */}
        <Group title="Organization">
          <LinkRow icon="pricetags-outline" label="Tags & folders" onPress={() => nav.navigate('TagsFolders' as never)} />
          <LinkRow icon="checkmark-done-outline" label="Tasks" onPress={() => nav.navigate('Tasks' as never)} />
        </Group>

        <Text variant="small" tone="faint" center style={{ marginTop: t.spacing.md }}>
          VaultBoard · v1.0.0 · Offline-first
        </Text>
      </ScrollView>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  const t = useTheme();
  return (
    <View style={{ gap: t.spacing.sm }}>
      <Text variant="caption" tone="faint" weight="semibold" style={{ marginLeft: 4 }}>
        {title.toUpperCase()}
      </Text>
      <Surface style={{ overflow: 'hidden' }}>{children}</Surface>
    </View>
  );
}

function Row({
  label,
  hint,
  children,
  column,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
  column?: boolean;
}) {
  const t = useTheme();
  return (
    <View
      style={{
        padding: t.spacing.lg,
        gap: t.spacing.md,
        borderBottomWidth: 1,
        borderColor: t.colors.border,
        flexDirection: column ? 'column' : 'row',
        alignItems: column ? 'flex-start' : 'center',
        justifyContent: 'space-between',
      }}
    >
      <View style={{ flexShrink: 1 }}>
        <Text weight="medium">{label}</Text>
        {hint ? (
          <Text variant="caption" tone="muted">
            {hint}
          </Text>
        ) : null}
      </View>
      <View style={column ? { width: '100%' } : { minWidth: 200 }}>{children}</View>
    </View>
  );
}

function LinkRow({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}) {
  const t = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        gap: t.spacing.md,
        padding: t.spacing.lg,
        borderBottomWidth: 1,
        borderColor: t.colors.border,
        backgroundColor: pressed ? t.colors.overlay : 'transparent',
      })}
    >
      <Ionicons name={icon} size={20} color={t.colors.accent} />
      <Text weight="medium" style={{ flex: 1 }}>
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={18} color={t.colors.textFaint} />
    </Pressable>
  );
}
