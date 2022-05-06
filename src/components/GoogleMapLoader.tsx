import React, { FC, createContext, useContext, PropsWithChildren } from 'react';
import useGoogleMapLoader, {
  GoogleMapLoaderCallbacks,
} from '../hooks/useGoogleMapLoader';
import Loader, { LoaderStatus } from 'google-maps-js-api-loader';

const LoaderContext = createContext<LoaderStatus>(Loader.status);

export const useGoogleMapStatus = () => useContext(LoaderContext);

const GoogleMapLoader: FC<PropsWithChildren<GoogleMapLoaderCallbacks>> = ({
  children,
  ...callbacks
}) => {
  const status = useGoogleMapLoader(callbacks);

  if (!children) return null;

  return (
    <LoaderContext.Provider value={status}>{children}</LoaderContext.Provider>
  );
};

export default GoogleMapLoader;
