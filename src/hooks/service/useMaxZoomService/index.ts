import handleUseService from '../../../utils/handleUseService';

const useMaxZoomService = handleUseService<google.maps.MaxZoomService>(
  ['MaxZoomService'],
  ['getMaxZoomAtLatLng']
);

export default useMaxZoomService;
