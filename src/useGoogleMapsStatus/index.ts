import {
  type GoogleMapsLibrary,
  GoogleMapsLoader,
} from 'google-maps-js-api-loader';
import { useEffect, useState } from 'react';

/**
 * Hook for getting status of {@link google.maps} script or specific {@link library}
 * > It not provokes loading of script/library
 */
const useGoogleMapsStatus = (library?: GoogleMapsLibrary) => {
  const [status, setStatus] = useState(GoogleMapsLoader.getStatus(library!));

  useEffect(() => {
    const currentStatus = GoogleMapsLoader.getStatus(library!);

    if (currentStatus != status) {
      setStatus(currentStatus);
    }

    if (currentStatus != 'loaded' && currentStatus != 'error') {
      let isAlive = true;

      GoogleMapsLoader.getCompletion(library!).finally(() => {
        if (isAlive) {
          setStatus(GoogleMapsLoader.getStatus(library!));
        }
      });

      return () => {
        isAlive = false;
      };
    }
  }, [library]);

  return status;
};

export default useGoogleMapsStatus;