import handleUseService from '../../../utils/handleUseService';

const useDistanceMatrixService =
  handleUseService<google.maps.DistanceMatrixService>(
    ['DistanceMatrixService'],
    ['getDistanceMatrix']
  );

export default useDistanceMatrixService;
