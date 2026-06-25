import React from 'react';
import { ScrollView, Text, View } from 'react-native';

interface State {
  error: Error | null;
  stack: string | null;
}

/**
 * Catches render errors and surfaces the component stack — useful for diagnosing
 * "Cannot read property X of undefined" style crashes that otherwise only show a
 * library frame. Safe to keep in the tree; it renders children when there's no error.
 */
export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null, stack: null };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error('VaultBoard render crash:', error?.message, '\nCOMPONENT STACK:', info?.componentStack);
    this.setState({ stack: info?.componentStack ?? null });
  }

  render() {
    if (this.state.error) {
      return (
        <ScrollView style={{ flex: 1, backgroundColor: '#0E0F13' }} contentContainerStyle={{ padding: 24, paddingTop: 80 }}>
          <Text style={{ color: '#FF6B6B', fontSize: 20, fontWeight: '700', marginBottom: 8 }}>
            Render error
          </Text>
          <Text style={{ color: '#ECEDF1', fontSize: 14, marginBottom: 16 }}>
            {this.state.error.message}
          </Text>
          <Text style={{ color: '#9AA0AE', fontSize: 12 }}>{this.state.stack}</Text>
        </ScrollView>
      );
    }
    return this.props.children;
  }
}
