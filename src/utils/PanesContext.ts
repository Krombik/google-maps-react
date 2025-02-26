import { createContext } from 'react';

/** @internal */
export const PanesContext = createContext<google.maps.MapPanes>(null!);

/** @internal */
export default PanesContext;
