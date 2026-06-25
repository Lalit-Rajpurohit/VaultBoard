import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { QuickAddSheet } from '@/components/QuickAddSheet';
import { initDatabase } from '@/db';
import { RootNavigator } from '@/navigation';
import { hydrateStores } from '@/store';
import { ThemeProvider, useTheme } from '@/theme';

function Boot() {
  const t = useTheme();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: t.colors.bg,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <ActivityIndicator color={t.colors.accent} />
    </View>
  );
}

function Root() {
  const t = useTheme();
  return (
    <>
      <RootNavigator />
      <QuickAddSheet />
      <StatusBar style={t.isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Migrations + first-launch seed are synchronous, then hydrate the stores.
    initDatabase();
    hydrateStores();
    setReady(true);
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider>
          <ErrorBoundary>{ready ? <Root /> : <Boot />}</ErrorBoundary>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
