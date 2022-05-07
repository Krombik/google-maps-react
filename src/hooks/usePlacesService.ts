import Loader, { LoaderStatus } from 'google-maps-js-api-loader';
import { useEffect, useState } from 'react';

const handlePlacesService = (
  container: ConstructorParameters<typeof google.maps.places.PlacesService>[0]
) => {
  if (Loader.options.libraries?.includes('places'))
    return new google.maps.places.PlacesService(container);

  throw Error('Places library not loaded');
};

/**
 * @throws error if `places` not included to libraries in loader {@link Loader.options options}
 */
const usePlacesService = (
  container:
    | null
    | (() => HTMLDivElement)
    | HTMLDivElement
    | google.maps.Map = null
) => {
  const [placesService, setPlacesService] = useState(() =>
    typeof container !== 'function' && Loader.status === LoaderStatus.LOADED
      ? handlePlacesService(container)
      : undefined
  );

  useEffect(() => {
    if (!placesService) {
      Loader.completion.then(() =>
        setPlacesService(
          handlePlacesService(
            typeof container !== 'function' ? container : container()
          )
        )
      );
    }
  }, []);

  return placesService;
};

export default usePlacesService;
