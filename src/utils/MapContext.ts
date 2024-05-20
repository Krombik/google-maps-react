import { createContext } from 'react';

/** @internal */
const MapContext = createContext<google.maps.Map>(null!);

/** @internal */
export default MapContext;
