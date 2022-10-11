import handleUseService from '../../utils/handleUseService';

const useDistanceMatrixService = handleUseService(
  ['DistanceMatrixService'] as const,
  ['getDistanceMatrix']
);

export default useDistanceMatrixService;
