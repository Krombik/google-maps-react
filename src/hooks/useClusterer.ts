import { useEffect, useRef, useState } from 'react';
import Clusterer, {
  ClustererOptions,
  ClustererPoint,
  ClusterProps,
  GetClustersArg,
} from '../utils/clusterer';
import useConst from './useConst';
import throttle from 'lodash.throttle';
import { GoogleMapsHandlers } from '../createComponents/createGoogleMap';

export type UseClustererOptions<T> = ClustererOptions<T> & {
  /**
   * @method handleBoundsChange throttle delay
   */
  delay?: number;
  /**
   * @method handleBoundsChange expand bounds by percent
   */
  expandBy?: number;
};

type State<T> = {
  getPoints<M, C>(
    getMarker: (props: T, key: number, coords: google.maps.LatLngLiteral) => M,
    getCluster: (
      props: ClusterProps,
      coords: google.maps.LatLngLiteral,
      count: number,
      children: ClustererPoint<T>[]
    ) => C
  ): (M | C)[];
};

const createState = <T>({
  ranges,
  points,
}: ReturnType<Clusterer<T>['getClusters']>): State<T> => ({
  getPoints(getMarker, getCluster) {
    const clusters = [];

    for (let j = ranges.length; j--; ) {
      const ids = ranges[j];

      for (let i = ids.length; i--; ) {
        const p = points[ids[i]];

        const children = p.children;

        clusters.push(
          children
            ? getCluster(p.p, p.coords, p.count, children)
            : getMarker(p.p, p.key, p.coords)
        );
      }
    }

    return clusters;
  },
});

const useClusterer = <T>(points: T[], options: UseClustererOptions<T>) => {
  const clusterer = useConst(() => new Clusterer<T>(options));

  const argsRef = useRef<GetClustersArg>();

  const [{ getPoints }, setState] = useState<Partial<State<T>>>({});

  useEffect(() => {
    clusterer.load(points);

    const args = argsRef.current;

    if (args) {
      setState(createState(clusterer.getClusters(args)));
    }
  }, [points]);

  const handleBoundsChange = useConst(() => {
    const { delay = 16, expandBy = 0 } = options;

    const updateArgs: (args: GetClustersArg) => GetClustersArg = expandBy
      ? ([zoom, westLng, southLat, eastLng, northLat]) => {
          const lngAdj = (eastLng - westLng) * expandBy;
          const latAdj = (northLat - southLat) * expandBy;

          return (argsRef.current = [
            zoom,
            westLng - lngAdj,
            southLat - latAdj,
            eastLng + lngAdj,
            northLat + latAdj,
          ]);
        }
      : (args) => (argsRef.current = args);

    return throttle<GoogleMapsHandlers['onBoundsChanged']>(function (bounds) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      setState(
        createState(
          clusterer.getClusters(
            updateArgs([
              this.getZoom()!,
              sw.lng(),
              sw.lat(),
              ne.lng(),
              ne.lat(),
            ])
          )
        )
      );
    }, delay);
  });

  return { handleBoundsChange, getPoints };
};

export default useClusterer;
