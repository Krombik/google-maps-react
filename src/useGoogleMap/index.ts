import { useContext } from 'react';
import MapContext from '../utils/MapContext';

const useGoogleMap = () => useContext(MapContext);

export default useGoogleMap;
