import { useEffect, useRef, useState } from 'react';
import useConst from './useConst';
import throttle from 'lodash.throttle';
import { GoogleMapsHandlers } from '../createComponents/createGoogleMap';
import MarkerCluster, { ClustererOptions } from 'marker-cluster';

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
    getMarker: (point: T, key: number, lat: number, lng: number) => M,
    getCluster: (count: number, id: number, lat: number, lng: number) => C,
    extend?: number
  ): (M | C)[];
};

// const createState = <T>(
//   points: ReturnType<Clusterer<T>['getClusters']>
// ): State<T> => ({
//   getPoints(getMarker, getCluster) {
//     const clusters = [];

//     for (let i = points.length; i--; ) {
//       const p = points[i];

//       const children = p.items;

//       clusters.push(
//         children ? getCluster(p, p.coords, p.count, children) : getMarker(p)
//       );
//     }

//     return clusters;
//   },
// });

const useClusterer = <T>(points: T[], options: ClustererOptions<T>) => {
  const markerCluster = useConst(() => new MarkerCluster<T>(options));

  const [{ getPoints }, setState] = useState<Partial<State<T>>>({});

  const argsRef = useRef<[number, number, number, number, number]>();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const t1 = performance.now();
    markerCluster.load(points);
    const args = argsRef.current;
    // markerCluster.loadAsync(points, () => {
    console.log(performance.now() - t1);

    setLoaded(true);

    if (args) {
      setState({
        getPoints: (...kek) => markerCluster.getPoints(...args, ...kek),
      });
    }
  }, [points]);

  const handleBoundsChange: GoogleMapsHandlers['onBoundsChanged'] = function (
    bounds
  ) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const args = [
      this.getZoom()!,
      sw.lng(),
      sw.lat(),
      ne.lng(),
      ne.lat(),
    ] as const;

    argsRef.current = args as any;

    setState({
      getPoints: (...kek) => markerCluster.getPoints(...args, ...kek),
    });
  };

  return { handleBoundsChange, getPoints: loaded ? getPoints : undefined };
};

export default useClusterer;
