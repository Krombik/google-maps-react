import React, { FC, createContext, useContext } from 'react';
import useGoogleMapLoader, {
  GoogleMapLoaderCallbacks,
} from '../hooks/useGoogleMapLoader';
import Loader, { LoaderOptions, LoaderStatus } from 'google-maps-js-api-loader';

export type GoogleMapLoaderProps = {
  options: LoaderOptions;
} & Partial<GoogleMapLoaderCallbacks>;

const LoaderContext = createContext<LoaderStatus>(Loader.status);

export const useGoogleMapStatus = () => useContext(LoaderContext);

const GoogleMapLoader: FC<GoogleMapLoaderProps> = ({
  children,
  options,
  ...callbacks
}) => {
  const status = useGoogleMapLoader(options, callbacks);

  if (!children) return null;

  return (
    <LoaderContext.Provider value={status}>{children}</LoaderContext.Provider>
  );
};

export default GoogleMapLoader;
