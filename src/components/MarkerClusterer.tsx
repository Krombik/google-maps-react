import {
  MarkerClusterer as GMarkerClusterer,
  MarkerClustererOptions,
} from '@googlemaps/markerclusterer';
import React, { useEffect, Fragment, useState, VFC } from 'react';
import useGoogleMap from '../hooks/useGoogleMap';

export type MarkerClustererProps = Omit<
  MarkerClustererOptions,
  'map' | 'markers'
> & {
  children: (markerClusterer: GMarkerClusterer) => JSX.Element[];
};

const MarkerClusterer: VFC<MarkerClustererProps> = ({
  children,
  ...options
}) => {
  const map = useGoogleMap();

  const [markerClusterer, setMarkerClusterer] =
    useState<GMarkerClusterer | null>(null);

  useEffect(() => {
    const markerClusterer = new GMarkerClusterer({ map, ...options });

    setMarkerClusterer(markerClusterer);

    return () => {
      markerClusterer.clearMarkers();
    };
  }, []);

  useEffect(() => markerClusterer?.render());

  return markerClusterer && <Fragment>{children(markerClusterer)}</Fragment>;
};

export default MarkerClusterer;
