import { useEffect, useRef, useState } from 'react';

/** Returns a debounced copy of `value` that updates `delay` ms after it settles. */
export function useDebounce<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handle = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handle);
  }, [value, delay]);

  return debounced;
}

/** Returns a stable debounced callback. */
export function useDebouncedCallback<A extends unknown[]>(
  fn: (...args: A) => void,
  delay = 500
): (...args: A) => void {
  const handleRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fnRef = useRef(fn);
  fnRef.current = fn;

  useEffect(
    () => () => {
      if (handleRef.current) clearTimeout(handleRef.current);
    },
    []
  );

  return (...args: A) => {
    if (handleRef.current) clearTimeout(handleRef.current);
    handleRef.current = setTimeout(() => fnRef.current(...args), delay);
  };
}
