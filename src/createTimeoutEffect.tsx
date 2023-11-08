/**
 * Creates a React effect callback for running a function after a delay.
 *
 * Execution gets interrupted if the effect dependencies change or the component gets destructed.
 *
 * @param timeout Delay in milliseconds
 * @param callback Function which should be executed after the delay
 */
export function createTimeoutEffect(callback: () => void, timeout: number) {
  return () => {
    const t = setTimeout(callback, timeout);

    return () => clearTimeout(t);
  };
}
