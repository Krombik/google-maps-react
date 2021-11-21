import { useEffect, useRef, useState } from 'react';
import Clusterer, {
  ClustererOptions,
  GetClustersArg,
} from '../utils/clusterer';
import useConst from './useConst';
import throttle from 'lodash.throttle';

export type UseClustererOptions<T> = ClustererOptions<T> & {
  delay?: number;
  expand?: number;
};

type GetPointsO<T> = {
  getPoints<M, C>(
    renderMarker: (props: T) => M,
    renderCluster: (
      props: google.maps.LatLngLiteral & { count: number; key: number }
    ) => C
  ): (M | C)[];
};

const getPointsO = <T>(
  t: ReturnType<Clusterer<T>['getClusters']>
): GetPointsO<T> => ({
  getPoints(renderMarker, renderCluster) {
    const clusters = [];

    for (let j = t.length; j--; ) {
      const { ids, points } = t[j];

      for (let i = ids.length; i--; ) {
        const p = points[ids[i]];

        clusters.push(
          p.cluster ? renderCluster(p.props) : renderMarker(p.props)
        );
      }
    }

    return clusters;
  },
});

const useClusterer = <T>(points: T[], options: UseClustererOptions<T>) => {
  const clusterer = useConst(() => new Clusterer<T>(options));

  const dataRef = useRef<GetClustersArg>();

  const [{ getPoints }, setO] = useState<Partial<GetPointsO<T>>>({});

  useEffect(() => {
    const t1 = performance.now();
    clusterer.load(points);

    console.log(performance.now() - t1);

    const data = dataRef.current;

    if (data) {
      setO(getPointsO(clusterer.getClusters(data)));
    }
  }, [points]);

  const handleBoundsChange = useConst(() => {
    const { delay = 16, expand = 0 } = options;

    const updateData: (args: GetClustersArg) => GetClustersArg = expand
      ? ([zoom, westLng, southLat, eastLng, northLat]) => {
          const lngAdj = (eastLng - westLng) * expand;
          const latAdj = (northLat - southLat) * expand;

          return (dataRef.current = [
            zoom,
            westLng - lngAdj,
            southLat - latAdj,
            eastLng + lngAdj,
            northLat + latAdj,
          ]);
        }
      : (args) => (dataRef.current = args);

    return throttle(function (
      this: google.maps.Map,
      bounds: google.maps.LatLngBounds
    ) {
      const sw = bounds.getSouthWest();
      const ne = bounds.getNorthEast();

      setO(
        getPointsO(
          clusterer.getClusters(
            updateData([
              this.getZoom()!,
              sw.lng(),
              sw.lat(),
              ne.lng(),
              ne.lat(),
            ])
          )
        )
      );
    },
    delay);
  });

  return { handleBoundsChange, getPoints };
};

export default useClusterer;
