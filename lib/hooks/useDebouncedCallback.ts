import { useCallback, useEffect, useRef } from "react";

/**
 * Debounce a callback. Returns { trigger, cancel }.
 * - `trigger(...args)`: schedules the callback to run after `delayMs`. Calling again before the timer fires resets it.
 * - `cancel()`: clears the pending invocation (use when you no longer want the deferred call to fire — e.g. switching context).
 *
 * The callback ref is updated each render, so the latest closure (state, props) is always invoked when the timer fires.
 * The pending timer is cleaned up on unmount.
 */
export function useDebouncedCallback<TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMs: number
) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  });

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const trigger = useCallback((...args: TArgs) => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delayMs);
  }, [delayMs]);

  const cancel = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
  }, []);

  return { trigger, cancel };
}
