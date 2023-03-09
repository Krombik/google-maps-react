import handleUseService from '../../../utils/handleUseService';

const useDirectionsService = handleUseService<google.maps.DirectionsService>(
  ['DirectionsService'],
  ['route']
);

export default useDirectionsService;
