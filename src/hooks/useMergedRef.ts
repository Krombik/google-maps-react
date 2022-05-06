import { Ref, RefCallback, useCallback } from 'react';
import setRef from '../utils/setRef';

const useMergedRef = <T>(...refs: Ref<T>[]) =>
  useCallback<RefCallback<T>>((instance) => {
    for (let i = refs.length; i--; ) {
      setRef(refs[i], instance);
    }
  }, refs);

export default useMergedRef;
