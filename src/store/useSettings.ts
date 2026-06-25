import { create } from 'zustand';

import { settingsQ } from '@/db';
import type { AccentKey, AppSettings, ThemeMode, TypographyScale } from '@/types';

interface SettingsState extends AppSettings {
  hydrated: boolean;
  hydrate: () => void;
  setThemeMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentKey) => void;
  setTypography: (scale: TypographyScale) => void;
  setAppLock: (enabled: boolean) => void;
  setOnboarded: (value: boolean) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  themeMode: 'light',
  accent: 'indigo',
  typography: 'default',
  appLockEnabled: false,
  onboarded: false,
  hydrated: false,

  hydrate: () => {
    const loaded = settingsQ.loadSettings();
    set({ ...loaded, hydrated: true });
  },

  setThemeMode: (themeMode) => {
    settingsQ.saveSetting('themeMode', themeMode);
    set({ themeMode });
  },
  setAccent: (accent) => {
    settingsQ.saveSetting('accent', accent);
    set({ accent });
  },
  setTypography: (typography) => {
    settingsQ.saveSetting('typography', typography);
    set({ typography });
  },
  setAppLock: (appLockEnabled) => {
    settingsQ.saveSetting('appLockEnabled', appLockEnabled);
    set({ appLockEnabled });
  },
  setOnboarded: (onboarded) => {
    settingsQ.saveSetting('onboarded', onboarded);
    set({ onboarded });
  },
}));
