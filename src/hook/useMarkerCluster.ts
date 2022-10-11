import { useEffect, useRef, useState } from 'react';
import useConst from './utils/useConst';
import MarkerCluster, {
  ClusterMapper,
  MarkerClusterOptions,
  MarkerMapper,
} from 'marker-cluster';

type GetPoints<T> = <M, C>(
  markerMapper: MarkerMapper<T, M>,
  clusterMapper: ClusterMapper<C>,
  /** @see [extend](https://github.com/Krombik/marker-cluster#getpoints)  */
  extend?: number
) => (M | C)[];

type State<T> = [getPoints: GetPoints<T>];

export type UseMarkerClusterOptions = MarkerClusterOptions & {
  asyncMode?: boolean;
};

type Args = readonly [number, number, number, number, number];

const useMarkerCluster = <T>(
  points: T[],
  getLngLat: (point: T) => [lng: number, lat: number],
  options?: UseMarkerClusterOptions
): {
  getPoints: GetPoints<T>;
  onBoundsChange(this: google.maps.Map): void;
  markerCluster: MarkerCluster<T>;
} => {
  const markerCluster = useConst(() => new MarkerCluster(getLngLat, options));

  const [[getPoints], setState] = useState<State<T>>([() => []]);

  const argsRef = useRef<Args>();

  useEffect(() => markerCluster.cleanUp.bind(markerCluster), []);

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

  return {
    onBoundsChange() {
      const bounds = this.getBounds()!;

      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      const args: Args = [
        this.getZoom()!,
        sw.lng(),
        sw.lat(),
        ne.lng(),
        ne.lat(),
      ];

      argsRef.current = args;

      if (markerCluster.points) {
        setState([
          (markerMapper, clusterMapper, extend) =>
            markerCluster.getPoints(
              ...args,
              markerMapper,
              clusterMapper,
              extend
            ),
        ]);
      }
    },
    getPoints,
    markerCluster,
  };
};

export default useMarkerCluster;
