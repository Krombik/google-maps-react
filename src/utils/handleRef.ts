import { type RefCallback } from 'react';

const handleRef = <T>(effect: (el: T) => () => void): RefCallback<T> => {
  let cleanup: () => void;

  return (el) => {
    if (el) {
      cleanup = effect(el);
    } else if (cleanup) {
      cleanup();
    }
  };
};

export default handleRef;
