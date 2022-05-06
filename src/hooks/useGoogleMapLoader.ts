import Loader, { LoaderOptions, LoaderStatus } from 'google-maps-js-api-loader';
import { useState, useEffect } from 'react';
import noop from '../utils/noop';

export type GoogleMapLoaderCallbacks = {
  onLoaded?: () => void;
  onError?: (e: ErrorEvent) => void;
};

const useGoogleMapLoader = (callbacks: GoogleMapLoaderCallbacks = {}) => {
  const [status, setStatus] = useState(Loader.status);

  useEffect(() => {
    if (status !== LoaderStatus.LOADED) {
      Loader.completion.then(
        () => {
          setStatus(LoaderStatus.LOADED);

          (callbacks.onLoaded || noop)();
        },
        (err) => {
          setStatus(LoaderStatus.ERROR);

          (callbacks.onError || noop)(err);
        }
      );
    }
  }, []);

  return status;
};

export { Loader, LoaderOptions, LoaderStatus };

export default useGoogleMapLoader;
