import { Ionicons } from '@expo/vector-icons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import React from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useTheme } from '@/theme';
import { BoardsListScreen } from '@/screens/boards/BoardsListScreen';
import { HomeScreen } from '@/screens/home/HomeScreen';
import { NotesListScreen } from '@/screens/notes/NotesListScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { VaultScreen } from '@/screens/vault/VaultScreen';

import type { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const ICONS: Record<keyof TabParamList, keyof typeof Ionicons.glyphMap> = {
  Home: 'home',
  Notes: 'document-text',
  Boards: 'grid',
  Vault: 'git-network',
  Settings: 'settings',
};

export function BottomTabs() {
  const t = useTheme();
  // Add the device's bottom inset (gesture bar / home indicator) so the tab bar
  // isn't pushed under the system navigation.
  const insets = useSafeAreaInsets();
  const bottomPad = Math.max(insets.bottom, 8);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: t.colors.accent,
        tabBarInactiveTintColor: t.colors.textFaint,
        tabBarStyle: {
          backgroundColor: t.colors.surface,
          borderTopColor: t.colors.border,
          height: 60 + bottomPad,
          paddingBottom: bottomPad,
          paddingTop: 6,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
        tabBarIcon: ({ color, size, focused }) => (
          <Ionicons
            name={focused ? ICONS[route.name] : (`${ICONS[route.name]}-outline` as keyof typeof Ionicons.glyphMap)}
            size={size - 2}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Notes" component={NotesListScreen} />
      <Tab.Screen name="Boards" component={BoardsListScreen} />
      <Tab.Screen name="Vault" component={VaultScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}
