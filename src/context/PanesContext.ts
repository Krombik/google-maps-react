import { createContext } from 'react';

/** @internal */
const PanesContext = createContext<google.maps.MapPanes | undefined>(
  null as any
);

/** @internal */
export default PanesContext;
