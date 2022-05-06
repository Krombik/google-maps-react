import { MutableRefObject, Ref } from 'react';

const setRef = <T>(ref: Ref<T>, instance: T | null) => {
  if (ref) {
    if (typeof ref === 'object') {
      (ref as MutableRefObject<T | null>).current = instance;
    } else {
      ref(instance);
    }
  }
};

export default setRef;
