import handleUseService from '../../utils/handleUseService';

const useAutocompleteService = handleUseService(
  ['places', 'AutocompleteService'] as const,
  ['getPlacePredictions', 'getQueryPredictions']
);

export default useAutocompleteService;
