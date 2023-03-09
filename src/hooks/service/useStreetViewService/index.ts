import handleUseService from '../../../utils/handleUseService';

const useStreetViewService = handleUseService<google.maps.StreetViewService>(
  ['StreetViewService'],
  ['getPanorama']
);

export default useStreetViewService;
