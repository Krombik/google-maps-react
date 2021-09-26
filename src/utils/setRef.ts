import { MutableRefObject, Ref } from 'react';

const setRef = <T>(ref: NonNullable<Ref<T>>, value: T) => {
  if (typeof ref === 'object') {
    (ref as MutableRefObject<T>).current = value;
  } else {
    ref(value);
  }
};

export default setRef;
