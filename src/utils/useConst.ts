import { useRef } from 'react';

/** @internal */
const useConst = <T>(getConst: () => T) => {
  const r = useRef<T>();

  return r.current || (r.current = getConst());
};

/** @internal */
export default useConst;
