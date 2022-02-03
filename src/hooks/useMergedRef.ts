import { MutableRefObject, Ref, useCallback } from 'react';

const useMergedRef = <T>(...refs: Ref<T>[]) =>
  useCallback((el: T) => {
    for (let i = refs.length; i--; ) {
      const ref = refs[i];

      if (ref) {
        if (typeof ref === 'object') {
          (ref as MutableRefObject<T>).current = el;
        } else if (typeof ref === 'function') {
          ref(el);
        }
      }
    }
  }, refs);

export default useMergedRef;
