import { useEffect, useMemo, useRef, useState } from 'react';
import handleService, { Service } from '../utils/handleService';

type UsePlacesService = {
  (
    container?: null | HTMLElement | google.maps.Map
  ): Service<google.maps.places.PlacesService>;
  (getContainer: () => HTMLElement):
    | Service<google.maps.places.PlacesService>
    | undefined;
};

const usePlacesService = ((container = null) => {
  const getService = () =>
    handleService(
      () => new google.maps.places.PlacesService(container as any),
      [
        'findPlaceFromPhoneNumber',
        'findPlaceFromQuery',
        'getDetails',
        'nearbySearch',
        'textSearch',
      ]
    );

  if (typeof container !== 'function') {
    return useMemo(getService, [container]);
  }

  const [placesService, setPlacesService] =
    useState<ReturnType<typeof getService>>();

  const prevContainerRef = useRef<HTMLElement>();

  useEffect(() => {
    const currContainer = container();

    if (prevContainerRef.current !== currContainer) {
      prevContainerRef.current = currContainer;

      setPlacesService(getService());
    }
  });

  return placesService;
}) as UsePlacesService;

export default usePlacesService;
