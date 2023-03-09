import handleUseService from '../../../utils/handleUseService';

const useAutocompleteService =
  handleUseService<google.maps.places.AutocompleteService>(
    ['places', 'AutocompleteService'],
    ['getPlacePredictions', 'getQueryPredictions']
  );

export default useAutocompleteService;
