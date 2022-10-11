import handleUseService from '../../utils/handleUseService';

const useDirectionsService = handleUseService(['DirectionsService'] as const, [
  'route',
]);

export default useDirectionsService;
