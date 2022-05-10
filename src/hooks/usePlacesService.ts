import Loader, { LoaderStatus } from 'google-maps-js-api-loader';
import { useEffect, useState } from 'react';

const handlePlacesService = (
  container: null | HTMLDivElement | google.maps.Map = null
) => {
  if (Loader.options.libraries?.includes('places'))
    return new google.maps.places.PlacesService(container as any);

  throw Error('Places library not loaded');
};

/**
 * @param startLoading - if `true`, starts loading if {@link google.maps} not loaded yet, overwise just waited for loading if it not done yet
 * @throws error if `places` not included to libraries in loader {@link Loader.options options}
 */
const usePlacesService = (
  startLoading?: boolean,
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
      (startLoading ? Loader.load() : Loader.completion).then(() =>
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
