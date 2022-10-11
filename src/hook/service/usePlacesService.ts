import { useMemo } from 'react';
import handleService from '../../utils/handleService';

const usePlacesService = (
  container: null | HTMLElement | google.maps.Map | (() => HTMLElement) = null
) =>
  useMemo(
    () =>
      handleService(
        ['places', 'PlacesService'] as const,
        [
          'findPlaceFromPhoneNumber',
          'findPlaceFromQuery',
          'getDetails',
          'nearbySearch',
          'textSearch',
        ],
        container
      ),
    [container]
  );

export default usePlacesService;
