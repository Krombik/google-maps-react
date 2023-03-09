import handleUseService from '../../../utils/handleUseService';

const useGeocoder = handleUseService<google.maps.Geocoder>(
  ['Geocoder'],
  ['geocode']
);

export default useGeocoder;
