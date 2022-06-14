import { useEffect, useRef, useState } from 'react';
import useConst from './useConst';
import { GoogleMapsHandlers } from '../createComponents/createGoogleMap';
import MarkerCluster, {
  ClusterMapper,
  MarkerClusterOptions,
  MarkerMapper,
} from 'marker-cluster';

type State<T> = [
  getPoints: <M, C>(
    markerMapper: MarkerMapper<T, M>,
    clusterMapper: ClusterMapper<C>,
    /** @see [extend](https://github.com/Krombik/marker-cluster#getpoints)  */
    extend?: number
  ) => (M | C)[]
];

export type UseMarkerClusterOptions = MarkerClusterOptions & {
  asyncMode?: boolean;
};

type Args = readonly [number, number, number, number, number];

const useMarkerCluster = <T>(
  points: T[],
  getLngLat: (point: T) => [lng: number, lat: number],
  options?: UseMarkerClusterOptions
) => {
  const markerCluster = useConst(() => new MarkerCluster(getLngLat, options));

  const [[getPoints], setState] = useState<Partial<State<T>>>([]);

  const argsRef = useRef<Args>();

  useEffect(() => () => markerCluster.cleanUp(), []);

  useEffect(() => {
    const updateState = () => {
      const args = argsRef.current;

      if (args) {
        setState([(...rest) => markerCluster.getPoints(...args, ...rest)]);
      }
    };

    if (options?.asyncMode) {
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
      setState([
        (markerMapper, clusterMapper, extend) =>
          markerCluster.getPoints(...args, markerMapper, clusterMapper, extend),
      ]);
    }
  };

  return {
    handleBoundsChange,
    getPoints,
    markerCluster,
  };
};

export default useMarkerCluster;
