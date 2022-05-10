import Loader, { LoaderStatus } from 'google-maps-js-api-loader';
import { useEffect, useState } from 'react';

const handleAutocompleteService = () => {
  if (Loader.options.libraries?.includes('places'))
    return new google.maps.places.AutocompleteService();

  throw Error('Places library not loaded');
};

/**
 * @param startLoading - if `true`, starts loading if {@link google.maps} not loaded yet, overwise just waited for loading if it not done yet
 * @throws error if `places` not included to libraries in loader {@link Loader.options options}
 */
const useAutocompleteService = (startLoading?: boolean) => {
  const [autocompleteService, setAutocompleteService] = useState(() =>
    Loader.status === LoaderStatus.LOADED
      ? handleAutocompleteService()
      : undefined
  );

  useEffect(() => {
    if (!autocompleteService) {
      (startLoading ? Loader.load() : Loader.completion).then(() =>
        setAutocompleteService(handleAutocompleteService())
      );
    }
  }, []);

  return autocompleteService;
};

export default useAutocompleteService;
