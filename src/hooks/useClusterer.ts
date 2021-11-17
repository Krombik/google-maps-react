import { useEffect, useState } from 'react';
import Clusterer, { Bounds, ClustererOptions } from '../utils/clusterer';
import useConst from './useConst';
import useForceUpdate from './useForceUpdate';
import throttle from 'lodash.throttle';

export type UseClustererOptions<T> = ClustererOptions<T> & {
  delay?: number;
  expand?: number;
};

type Data = [zoom: number, ...bounds: Bounds];

const useClusterer = <T>(points: T[], options: UseClustererOptions<T>) => {
  const clusterer = useConst(() => new Clusterer<T>(options));

  const [data, setData] = useState<Data>();

  const forceUpdate = useForceUpdate();

  useEffect(() => {
    clusterer.load(points);

    forceUpdate();
  }, [points]);

  const handleBoundsChange = useConst(() => {
    const { delay = 16, expand = 0 } = options;

    const updateData: (...args: Data) => void = expand
      ? (zoom, westLng, southLat, eastLng, northLat) => {
          const lngAdj = (eastLng - westLng) * expand;
          const latAdj = (northLat - southLat) * expand;

          setData([
            zoom,
            westLng - lngAdj,
            southLat - latAdj,
            eastLng + lngAdj,
            northLat + latAdj,
          ]);
        }
      : (...args) => setData(args);

    return throttle(function (
      this: google.maps.Map,
      bounds: google.maps.LatLngBounds
    ) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      updateData(this.getZoom()!, sw.lng(), sw.lat(), ne.lng(), ne.lat());
    },
    delay);
  });

  const getPoints = (
    renderMarker: (props: T) => JSX.Element,
    renderCluster: (
      props: google.maps.LatLngLiteral & { count: number; id: number }
    ) => JSX.Element
  ) => data && clusterer.getClusters(...data, renderMarker, renderCluster);

  return { handleBoundsChange, getPoints };
};

export default useClusterer;
