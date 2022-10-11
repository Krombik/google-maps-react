import handleUseService from '../../utils/handleUseService';

const useStreetViewService = handleUseService(['StreetViewService'] as const, [
  'getPanorama',
]);

export default useStreetViewService;
