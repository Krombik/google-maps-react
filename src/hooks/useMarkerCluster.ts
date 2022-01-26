import { useEffect, useRef, useState } from 'react';
import useConst from './useConst';
import { GoogleMapsHandlers } from '../createComponents/createGoogleMap';
import MarkerCluster, { MarkerClusterOptions } from 'marker-cluster';

type State<T> = [
  getPoints: <M, C>(
    getMarker: (point: T, lng: number, lat: number) => M,
    getCluster: (lng: number, lat: number, count: number, id: number) => C,
    extend?: number
  ) => (M | C)[]
];

export type UseMarkerClusterOptions<T> = MarkerClusterOptions & {
  getLngLat: (point: T) => [lng: number, lat: number];
  asyncMode?: boolean;
};

type Args = [number, number, number, number, number];

const useMarkerCluster = <T>(
  points: T[],
  { getLngLat, asyncMode, ...options }: UseMarkerClusterOptions<T>
) => {
  const markerCluster = useConst(() => new MarkerCluster(getLngLat, options));

  const [[getPoints], setState] = useState<Partial<State<T>>>([]);

  const argsRef = useRef<Args>();

  useEffect(() => () => markerCluster.worker?.terminate(), []);

  //@ts-expect-error
  useEffect(() => {
    const updateState = () => {
      const args = argsRef.current;

      if (args) {
        setState([(...rest) => markerCluster.getPoints(...args, ...rest)]);
      }
    };

    if (asyncMode) {
      markerCluster.loadAsync(points).then(updateState);

      return () => {
        if (points !== markerCluster.points) {
          markerCluster.worker?.terminate();

          markerCluster.worker = undefined;
        }
      };
    }

    markerCluster.load(points);

    updateState();
  }, [points]);

  const handleBoundsChange: GoogleMapsHandlers['onBoundsChanged'] = (
    bounds,
    map
  ) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const args: Args = [map.getZoom()!, sw.lng(), sw.lat(), ne.lng(), ne.lat()];

    argsRef.current = args;

    if (markerCluster.points) {
      setState([(...rest) => markerCluster.getPoints(...args, ...rest)]);
    }
  };

  return {
    handleBoundsChange,
    getPoints,
    markerCluster,
  };
};

export default useMarkerCluster;