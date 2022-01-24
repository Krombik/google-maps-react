import { useEffect, useRef, useState } from 'react';
import useConst from './useConst';
import { GoogleMapsHandlers } from '../createComponents/createGoogleMap';
import MarkerCluster, { MarkerClusterOptions } from 'marker-cluster';

export type UseClustererOptions<T> = MarkerClusterOptions<T> & {
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
    getMarker: (point: T, lng: number, lat: number) => M,
    getCluster: (lng: number, lat: number, count: number, id: number) => C,
    extend?: number
  ): (M | C)[];
};

const useClusterer = <T>(points: T[], options: MarkerClusterOptions<T>) => {
  const markerCluster = useConst(() => new MarkerCluster<T>(options));

  const [{ getPoints }, setState] = useState<Partial<State<T>>>({});

  const argsRef = useRef<[number, number, number, number, number]>();

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const t1 = performance.now();
    // markerCluster.load(points);
    const args = argsRef.current;
    markerCluster.loadAsync(points).then(() => {
      console.log(performance.now() - t1);

      setLoaded(true);

      if (args) {
        setState({
          getPoints: (...kek) => markerCluster.getPoints(...args, ...kek),
        });
      }
    });
  }, [points]);

  const handleBoundsChange: GoogleMapsHandlers['onBoundsChanged'] = (
    bounds,
    map
  ) => {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    const args = [
      map.getZoom()!,
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

  return {
    handleBoundsChange,
    getPoints: loaded && getPoints,
    markerCluster,
  };
};

export default useClusterer;
