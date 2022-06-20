import handleService from '../utils/handleService';

import useConst from './useConst';

const useAutocompleteService = () =>
  useConst(() =>
    handleService(
      () => new google.maps.places.AutocompleteService(),
      ['getPlacePredictions', 'getQueryPredictions']
    )
  );

export default useAutocompleteService;
