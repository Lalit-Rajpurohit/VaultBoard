import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useRef } from 'react';

/**
 * Re-run a store refresh each time the screen gains focus.
 *
 * Call sites pass an inline arrow, so `refresh` is a new function every render.
 * We stash it in a ref and give useFocusEffect a STABLE (empty-dep) callback —
 * otherwise the effect would re-run on every render, and since each refresh sets
 * a brand-new array in the store, that would loop infinitely ("Maximum update
 * depth exceeded"). With the ref, refresh runs once per actual focus.
 */
export function useRefreshOnFocus(refresh: () => void): void {
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;

  useFocusEffect(
    useCallback(() => {
      refreshRef.current();
    }, [])
  );
}
