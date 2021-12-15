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

export type kek = ReturnType<typeof useClusterer>['handleBoundsChange'];

export type UseClustererOptions<T> = ClustererOptions<T> & {
  /**
   * {@link useClusterer handleBoundsChange} throttle delay
   */
  delay?: number;
  /**
   * @param {ReturnType<typeof useClusterer>['handleBoundsChange']} handleBoundsChange expand bounds by percent
   */
  expandBy?: number;
};

type State<T> = {
  getPoints<M, C>(
    getMarker: (props: T) => M,
    getCluster: (
      props: ClusterProps,
      coords: google.maps.LatLngLiteral,
      count: number,
      children: ClustererPoint<T>[]
    ) => C
  ): (M | C)[];
};

const createState = <T>(
  points: ReturnType<Clusterer<T>['getClusters']>
): State<T> => ({
  getPoints(getMarker, getCluster) {
    const clusters = [];

    for (let i = points.length; i--; ) {
      const p = points[i];

      const children = p.items;

      clusters.push(
        children ? getCluster(p, p.coords, p.count, children) : getMarker(p)
      );
    }

    return clusters;
  },
});

const useClusterer = <T>(points: T[], options: UseClustererOptions<T>) => {
  const clusterer = useConst(() => new Clusterer<T>(options));

  const argsRef = useRef<GetClustersArg>();

  const [{ getPoints }, setState] = useState<Partial<State<T>>>({});

  useEffect(() => {
    const t1 = performance.now();
    clusterer.load(points);
    console.log(performance.now() - t1);

    const args = argsRef.current;

    if (args) {
      setState(createState(clusterer.getClusters(args)));
    }
  }, [points]);

  /**
   * {@link useClusterer~handleBoundsChange} throttle delay
   */
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

      clusterer.getClusters(
        updateArgs([this.getZoom()!, sw.lng(), sw.lat(), ne.lng(), ne.lat()])
      );

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
