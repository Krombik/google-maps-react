import handleUseService from '../../utils/handleUseService';

const useMaxZoomService = handleUseService(['MaxZoomService'] as const, [
  'getMaxZoomAtLatLng',
]);

export default useMaxZoomService;
