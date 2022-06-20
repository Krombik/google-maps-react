import handleService from '../utils/handleService';

import useConst from './useConst';

const useGeocoder = () =>
  useConst(() => handleService(() => new google.maps.Geocoder(), ['geocode']));

export default useGeocoder;
