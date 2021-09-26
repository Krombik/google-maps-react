import { LoaderOptions } from '@googlemaps/js-api-loader';
import React, { FC, createContext, useContext } from 'react';
import { GoogleMapLoaderStatus } from '../enums';
import useGoogleMapLoader, {
  GoogleMapLoaderCallbacks,
} from '../hooks/useGoogleMapLoader';

export type GoogleMapLoaderProps = {
  options: LoaderOptions;
} & GoogleMapLoaderCallbacks;

const LoaderContext = createContext<GoogleMapLoaderStatus>(
  GoogleMapLoaderStatus.LOADING
);

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
