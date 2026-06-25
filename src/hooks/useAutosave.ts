import { useEffect, useRef, useState } from 'react';

import { useDebouncedCallback } from './useDebounce';

export type SaveState = 'idle' | 'saving' | 'saved';

/**
 * Debounced auto-save. Calls `onSave(value)` `delay` ms after `value` stops
 * changing, and flushes a final save on unmount so nothing is lost on navigate.
 */
export function useAutosave<T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  delay = 700
): SaveState {
  const [state, setState] = useState<SaveState>('idle');
  const firstRun = useRef(true);
  const latest = useRef(value);
  latest.current = value;
  const saveRef = useRef(onSave);
  saveRef.current = onSave;

  const run = async (v: T) => {
    setState('saving');
    await saveRef.current(v);
    setState('saved');
  };

  const debouncedSave = useDebouncedCallback((v: T) => void run(v), delay);

  useEffect(() => {
    // Skip the initial mount so opening a note doesn't immediately re-save it.
    if (firstRun.current) {
      firstRun.current = false;
      return;
    }
    debouncedSave(value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Flush on unmount.
  useEffect(
    () => () => {
      void saveRef.current(latest.current);
    },
    []
  );

  return state;
}
