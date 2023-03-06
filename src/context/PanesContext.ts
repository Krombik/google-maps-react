import { createContext } from 'react';

/** @internal */
const PanesContext = createContext<google.maps.MapPanes | null>(null);

/** @internal */
export default PanesContext;
