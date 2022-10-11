import handleUseService from '../../utils/handleUseService';

const useGeocoder = handleUseService(['Geocoder'] as const, ['geocode']);

export default useGeocoder;
