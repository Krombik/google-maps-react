import { Loader, LoaderOptions } from '@googlemaps/js-api-loader';
import { useState, useEffect } from 'react';
import { GoogleMapLoaderStatus } from '../enums';
import useConst from './useConst';

export type GoogleMapLoaderCallbacks = {
  onLoad?: () => void;
  onError?: (e: ErrorEvent) => void;
};

const useGoogleMapLoader = (
  options: LoaderOptions,
  callbacks?: GoogleMapLoaderCallbacks
) => {
  const loader = useConst(() => new Loader(options));

  const [status, setStatus] = useState<GoogleMapLoaderStatus>(() =>
    (loader as any).failed
      ? GoogleMapLoaderStatus.ERROR
      : (loader as any).done
      ? GoogleMapLoaderStatus.LOADED
      : GoogleMapLoaderStatus.LOADING
  );

  useEffect(() => {
    if (status === GoogleMapLoaderStatus.LOADING) {
      loader.loadCallback((e) => {
        if (e) {
          setStatus(GoogleMapLoaderStatus.ERROR);
          callbacks?.onError?.(e);
        } else {
          setStatus(GoogleMapLoaderStatus.LOADED);
          callbacks?.onLoad?.();
        }
      });
    }
  }, []);

  return status;
};

export default useGoogleMapLoader;
