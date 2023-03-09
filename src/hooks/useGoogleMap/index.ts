import { useContext } from 'react';
import MapContext from '../../context/MapContext';

const useGoogleMap = () => useContext(MapContext);

export default useGoogleMap;
