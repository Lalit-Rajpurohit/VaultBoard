import {
  DarkTheme,
  DefaultTheme,
  NavigationContainer,
  type Theme as NavTheme,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import React from 'react';

import { useSettings } from '@/store';
import { useTheme } from '@/theme';
import { BackupRestoreScreen } from '@/screens/settings/BackupRestoreScreen';
import { BoardDetailScreen } from '@/screens/boards/BoardDetailScreen';
import { NoteDetailScreen } from '@/screens/notes/NoteDetailScreen';
import { NoteEditorScreen } from '@/screens/notes/NoteEditorScreen';
import { OnboardingScreen } from '@/screens/onboarding/OnboardingScreen';
import { SearchScreen } from '@/screens/search/SearchScreen';
import { TagsFoldersScreen } from '@/screens/vault/TagsFoldersScreen';
import { TasksScreen } from '@/screens/tasks/TasksScreen';

import { BottomTabs } from './BottomTabs';
import { navigationRef } from './ref';
import type { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const t = useTheme();
  const onboarded = useSettings((s) => s.onboarded);

  const navTheme: NavTheme = {
    ...(t.isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(t.isDark ? DarkTheme : DefaultTheme).colors,
      background: t.colors.bg,
      card: t.colors.surface,
      text: t.colors.text,
      border: t.colors.border,
      primary: t.colors.accent,
    },
  };

  return (
    <NavigationContainer ref={navigationRef} theme={navTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!onboarded ? (
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        ) : null}
        <Stack.Screen name="Tabs" component={BottomTabs} />
        <Stack.Screen
          name="NoteEditor"
          component={NoteEditorScreen}
          options={{ animation: 'slide_from_bottom' }}
        />
        <Stack.Screen name="NoteDetail" component={NoteDetailScreen} />
        <Stack.Screen name="BoardDetail" component={BoardDetailScreen} />
        <Stack.Screen name="Tasks" component={TasksScreen} />
        <Stack.Screen
          name="Search"
          component={SearchScreen}
          options={{ animation: 'fade' }}
        />
        <Stack.Screen name="TagsFolders" component={TagsFoldersScreen} />
        <Stack.Screen name="BackupRestore" component={BackupRestoreScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
