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
    getMarker: (props: any) => M,
    getCluster: (p: any) => C
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

  useEffect(() => {
    const t1 = performance.now();
    markerCluster.load(points);
    console.log(performance.now() - t1);

    const args = argsRef.current;

    if (args) {
      setState({
        getPoints: (...kek: any) => markerCluster.getPoints(...args, ...kek),
      } as any);
    }
  }, [points]);

  /**
   * {@link useClusterer=>handleBoundsChange} throttle delay
   */
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
      getPoints: (...kek: any) => markerCluster.getPoints(...args, ...kek),
    } as any);
  };

  return { handleBoundsChange, getPoints };
};

export default useClusterer;
