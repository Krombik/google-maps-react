import { createContext } from 'react';

/** @internal */
const MapContext = createContext<google.maps.Map>(null as any);

/** @internal */
export default MapContext;
