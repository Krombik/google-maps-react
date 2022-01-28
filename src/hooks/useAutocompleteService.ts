import Loader, { LoaderStatus } from 'google-maps-js-api-loader';
import { useEffect, useState } from 'react';

const handleAutocompleteService = () => {
  if (Loader.libraries.includes('places'))
    return new google.maps.places.AutocompleteService();

  throw Error('Places library not loaded');
};

/**
 * @returns `undefined` if google.maps is loading
 * @throws error if load of google maps is not started yet or if `places` not included to loader options
 */
const useAutocompleteService = () => {
  const [autocompleteService, setAutocompleteService] = useState(() =>
    Loader.status === LoaderStatus.LOADED
      ? handleAutocompleteService()
      : undefined
  );

  useEffect(() => {
    if (Loader.status === LoaderStatus.NONE) {
      throw new Error('start the loading of script first');
    }

    if (Loader.status === LoaderStatus.LOADING) {
      Loader.completion.then(() =>
        setAutocompleteService(handleAutocompleteService())
      );
    }
  }, []);

  return autocompleteService;
};

export default useAutocompleteService;
