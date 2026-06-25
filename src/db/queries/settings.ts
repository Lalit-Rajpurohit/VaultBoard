import type { AppSettings } from '@/types';

import { all, run } from '../client';

const DEFAULTS: AppSettings = {
  themeMode: 'light',
  accent: 'indigo',
  typography: 'default',
  appLockEnabled: false,
  onboarded: false,
};

/** Read all settings, falling back to defaults for any missing keys. */
export function loadSettings(): AppSettings {
  const rows = all<{ key: string; value: string }>('SELECT * FROM settings');
  const map = new Map(rows.map((r) => [r.key, r.value]));
  return {
    themeMode: (map.get('themeMode') as AppSettings['themeMode']) ?? DEFAULTS.themeMode,
    accent: (map.get('accent') as AppSettings['accent']) ?? DEFAULTS.accent,
    typography:
      (map.get('typography') as AppSettings['typography']) ?? DEFAULTS.typography,
    appLockEnabled: map.get('appLockEnabled') === '1',
    onboarded: map.get('onboarded') === '1',
  };
}

export function saveSetting(key: keyof AppSettings, value: string | boolean): void {
  const v = typeof value === 'boolean' ? (value ? '1' : '0') : value;
  run('INSERT OR REPLACE INTO settings(key, value) VALUES (?,?)', [key, v]);
}
