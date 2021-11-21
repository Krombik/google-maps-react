import KDBush from 'kdbush';
import { XOR } from '../types';

export type ClusterProps = {
  key: number;
  zoom: number;
};

export type ClustererPoint<T> = XOR<
  [
    { p: T; key: number },
    {
      children: ClustererPoint<T>[];
      p: ClusterProps;
      count: number;
    }
  ]
> & {
  coords: google.maps.LatLngLiteral;
  _x: number;
  _y: number;
  _z: number;
};

export type ClustererOptions<T> = {
  /**
   * Min zoom level to cluster the points on
   */
  minZoom?: number;
  /**
   * Max zoom level to cluster the points on
   */
  maxZoom?: number;
  /**
   * Minimum points to form a cluster
   */
  minPoints?: number;
  /**
   * Cluster radius in pixels
   */
  radius?: number;
  /**
   * Size of the KD-tree leaf node, affects performance
   */
  nodeSize?: number;
  getLatLng: (item: T) => google.maps.LatLngLiteral;
};

export type GetClustersArg = [
  zoom: number,
  westLng: number,
  southLat: number,
  eastLng: number,
  northLat: number
];

const lngToX = (lng: number) => lng / 360 + 0.5;

const latToY = (lat: number) => {
  const sin = Math.sin((lat * Math.PI) / 180);

  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;

  return y < 0 ? 0 : y > 1 ? 1 : y;
};

const boundedLngToX = (lng: number) =>
  lngToX(((((lng + 180) % 360) + 360) % 360) - 180);

const boundedLatToY = (lat: number) => latToY(Math.max(-90, Math.min(90, lat)));

const xToLng = (x: number) => (x - 0.5) * 360;

const yToLat = (y: number) =>
  (360 * Math.atan(Math.exp((1 - y * 2) * Math.PI))) / Math.PI - 90;

const getX = <T>(v: ClustererPoint<T>) => v._x;
const getY = <T>(v: ClustererPoint<T>) => v._y;

const pair = (a: number, b: number) => {
  const sum = a + b;
  return (sum * (sum + 1)) / 2 + b;
};

class Clusterer<T> {
  private _options: Required<ClustererOptions<T>>;
  private _trees: Record<number, KDBush<ClustererPoint<T>>> = {};

  constructor(options: ClustererOptions<T>) {
    this._options = {
      minZoom: 0,
      maxZoom: 16,
      minPoints: 2,
      radius: 40,
      nodeSize: 64,
      ...options,
    };
  }

  load(points: T[]) {
    const { minZoom, maxZoom, nodeSize } = this._options;

    const getLatLng = this._options.getLatLng;

    let clusters: ClustererPoint<T>[] = [];

    const z = maxZoom + 1;

    for (let i = points.length; i--; ) {
      const p = points[i];

      const coords = getLatLng(p);

      const x = lngToX(coords.lng);
      const y = latToY(coords.lat);

      clusters.push({
        _x: Math.fround(x),
        _y: Math.fround(y),
        _z: z,
        p,
        coords,
        key: pair(x, y),
      });
    }

    this._trees[z] = new KDBush(clusters, getX, getY, nodeSize, Float32Array);

    for (let z = maxZoom; z >= minZoom; z--) {
      this._trees[z] = new KDBush(
        this._cluster(z),
        getX,
        getY,
        nodeSize,
        Float32Array
      );
    }
  }

  getClusters([zoom, westLng, southLat, eastLng, northLat]: GetClustersArg) {
    const tree = this._trees[this._limitZoom(zoom)];

    const points = tree.points;

    const minY = boundedLatToY(northLat);
    const maxY = boundedLatToY(southLat);

    let minX: number;
    let maxX: number;

    if (eastLng - westLng >= 360) {
      minX = 0;
      maxX = 1;
    } else {
      minX = boundedLngToX(westLng);
      maxX = eastLng === 180 ? 1 : boundedLngToX(eastLng);

      if (minX > maxX) {
        return {
          points,
          ranges: [
            tree.range(minX, minY, 1, maxY),
            tree.range(0, minY, maxX, maxY),
          ],
        };
      }
    }

    return {
      points,
      ranges: [tree.range(minX, minY, maxX, maxY)],
    };
  }

  private _limitZoom(z: number) {
    return Math.max(
      this._options.minZoom,
      Math.min(z, this._options.maxZoom + 1)
    );
  }

  private _cluster(zoom: number): ClustererPoint<T>[] {
    const clusters: ClustererPoint<T>[] = [];
    const { radius, minPoints } = this._options;
    const r = radius / (256 * Math.pow(2, zoom));

    const optimizedMinPoints = minPoints - 2;

    const tree = this._trees[zoom + 1];

    const points = tree.points;

    for (let i = points.length; i--; ) {
      const point = points[i];

      if (point._z > zoom) {
        point._z = zoom;

        const neighborIds = tree.within(point._x, point._y, r);

        let count = 0;

        const children: ClustererPoint<T>[] = [];

        for (let j = neighborIds.length; j--; ) {
          const nPoint = points[neighborIds[j]];

          if (nPoint._z > zoom) {
            children.push(nPoint);

            count += nPoint.count || 1;
          }
        }

        if (count > optimizedMinPoints) {
          let { _x, _y } = point;

          for (let j = children.length; j--; ) {
            const nPoint = children[j];

            nPoint._z = zoom;

            _x += nPoint._x;
            _y += nPoint._y;
          }

          children.push(point);

          const l = children.length;

          _x /= l;
          _y /= l;

          clusters.push({
            _x: Math.fround(_x),
            _y: Math.fround(_y),
            _z: zoom,
            count: count + (point.count || 1),
            p: {
              key: pair(_x, _y),
              zoom,
            },
            coords: {
              lng: xToLng(_x),
              lat: yToLat(_y),
            },
            children,
          });
        } else {
          clusters.push(point);
        }
      }
    }

    return clusters;
  }
}

export default Clusterer;
