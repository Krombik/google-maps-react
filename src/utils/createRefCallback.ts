import { type RefCallback, version } from 'react';

// React 19+ callback refs may return a cleanup function: React calls it on
// unmount and never calls the ref with `null`. So the effect can be used as the
// ref callback directly. React 18 ignores the return and calls the ref with
// `null` on unmount, so the cleanup must be stored and invoked manually.
const isReact19 = parseInt(version, 10) >= 19;

const createRefCallback = <T>(
  effect: (el: T) => () => void
): RefCallback<T> => {
  if (isReact19) {
    return effect as unknown as RefCallback<T>;
  }

  let cleanup: () => void;

  return (el) => {
    if (el) {
      cleanup = effect(el);
    } else if (cleanup) {
      cleanup();
    }
  };
};

export default createRefCallback;
