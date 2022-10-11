import { MutableRefObject, Ref } from 'react';
import isFunction from './isFunction';

const setRef = <T>(ref: Ref<T> | undefined, instance: T | null) => {
  if (ref) {
    if (isFunction(ref)) {
      ref(instance);
    } else {
      (ref as MutableRefObject<T | null>).current = instance;
    }
  }
};

export default setRef;
