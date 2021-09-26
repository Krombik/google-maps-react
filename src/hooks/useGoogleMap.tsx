import { createContext, useContext } from 'react';

export const MapContext = createContext<google.maps.Map | null>(null);

const useGoogleMap = () => useContext(MapContext)!;

export default useGoogleMap;
