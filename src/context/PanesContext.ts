import { createContext } from 'react';

const PanesContext = createContext<google.maps.MapPanes | undefined>(
  null as any
);

export default PanesContext;
