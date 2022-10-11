import { createContext } from 'react';

const MapContext = createContext<google.maps.Map>(null as any);

export default MapContext;
