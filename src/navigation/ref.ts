import { createNavigationContainerRef } from '@react-navigation/native';

import type { RootStackParamList } from './types';

/** Global navigation ref so non-screen UI (e.g. the Quick-Add sheet) can navigate. */
export const navigationRef = createNavigationContainerRef<RootStackParamList>();

export function navigate<T extends keyof RootStackParamList>(
  name: T,
  params?: RootStackParamList[T]
): void {
  if (navigationRef.isReady()) {
    // @ts-expect-error param spread is sound for our route map
    navigationRef.navigate(name, params);
  }
}
