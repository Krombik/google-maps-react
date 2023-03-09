import handleUseService from '../../../utils/handleUseService';

const useElevationService = handleUseService<google.maps.ElevationService>(
  ['ElevationService'],
  ['getElevationAlongPath', 'getElevationForLocations']
);

export default useElevationService;
