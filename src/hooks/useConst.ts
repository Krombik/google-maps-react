import { useRef } from 'react';

const useConst = <T>(getConst: () => T) => {
  const r = useRef<T>();

  return r.current || (r.current = getConst());
};

export default useConst;
