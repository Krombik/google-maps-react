import handleUseService from '../../utils/handleUseService';

const useElevationService = handleUseService(['ElevationService'] as const, [
  'getElevationAlongPath',
  'getElevationForLocations',
]);

export default useElevationService;
