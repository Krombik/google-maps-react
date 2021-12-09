// import KDBush from 'kdbush';
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

// const getX = <T>(v: ClustererPoint<T>) => v._x;
// const getY = <T>(v: ClustererPoint<T>) => v._y;

type QueueItems = [
  xMin: number,
  xMax: number,
  items: [y: number, x: number, p: any]
];

type Queue = [yMax: number, queueItems: QueueItems];

const addToMap = (
  map: Map<number, [x: number, p: any]>,
  arr: number[],
  y: number,
  x: number,
  p: any
) => {
  if (map.has(y)) {
    map.get(y)!.push(x, p);
  } else {
    map.set(y, [x, p]);
    arr.push(y);
  }
};

const addDotsToMap = (queueItems: QueueItems, map: any, arr: any) => {
  const clusters = [];

  for (let j = 2; j < queueItems.length; j += 3) {
    const items = queueItems[j] as QueueItems[2];

    if (items.length > 3) {
      const yx = items.splice(0, 2);

      const l = items.length;

      const y = yx[0] / l;
      const x = yx[1] / l;

      clusters.push(y, x, items);
    } else {
      const currY = items[0];

      for (let i = 0; i < clusters.length; i += 3) {
        const y = clusters[i] as number;

        if (y < currY) {
          const cluster = clusters.splice(i, 3);
          const x = cluster[1] as number;

          addToMap(map, arr, Math.fround(y), Math.fround(x), {
            items: cluster[2],
            lat: yToLat(y),
            lng: xToLng(x),
            key: pair(x, y),
          });

          break;
        }
      }

      addToMap(map, arr, items[0], items[1], items[2]);
    }
  }
};

const tryToCluster = (queueItems: QueueItems, y: number, x: number, p: any) => {
  for (let i = 0; i < queueItems.length; i += 3) {
    if (x >= queueItems[i] && x <= queueItems[i + 1]) {
      const items = queueItems[i + 2] as QueueItems[2];

      items[0] += y;
      items[1] += x;
      items.push(p);

      return true;
    }
  }

  return false;
};

const getQueueItems = (arrX: any, r: number, y: number) => {
  const x = arrX[0];

  const items: QueueItems = [x - r, x + r, [y, x, arrX[1]]];

  for (let k = 2; k < arrX.length; k += 2) {
    const x = arrX[k];
    const p = arrX[k + 1];

    if (!tryToCluster(items, y, x, p)) items.push(x - r, x + r, [y, x, p]);
  }

  return items;
};

const tryToClusteringQueue = (
  queue: Queue,
  startIndex: number,
  arrX: any,
  y: number
) => {
  for (let j = startIndex; j < queue.length; j += 2) {
    const items = queue[j] as QueueItems;

    for (let k = 0; k < arrX.length; k += 2) {
      if (tryToCluster(items, y, arrX[k], arrX[k + 1])) return true;
    }
  }

  return false;
};

const pair = (a: number, b: number) => {
  const sum = a + b;
  return (sum * (sum + 1)) / 2 + b;
};

const getBounds = (
  arr: any[],
  tree: { map: Map<number, [x: number, p: any]>; arrY: Float32Array },
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) => {
  const { map, arrY } = tree;

  let start = 0;
  let end = arrY.length - 1;

  while (arrY[start] < minY) {
    let middle = Math.floor((start + end) / 2);
    if (minY < arrY[middle]) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  end = arrY.length - 1;

  const first = start;

  while (arrY[end] > maxY) {
    let middle = Math.floor((start + end) / 2);
    if (maxY < arrY[middle]) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  end++;

  for (let i = first; i < end; i++) {
    const aX = map.get(arrY[i])!;
    for (let j = 0; j < aX.length; j += 2) {
      const curr = aX[j];
      if (curr > minX && curr < maxX) {
        arr.push(aX[j + 1]);
      }
    }
  }
};

class Clusterer<T> {
  private _options: Required<ClustererOptions<T>>;
  private _trees = new Map<
    number,
    { map: Map<number, [x: number, p: any]>; arrY: Float32Array }
  >();

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
    const { minZoom, maxZoom } = this._options;

    const getLatLng = this._options.getLatLng;

    const z = maxZoom + 1;

    const map = new Map<number, [x: number, p: any]>();

    const arr: number[] = [];

    for (let i = points.length; i--; ) {
      const p = points[i];

      const g = getLatLng(p);

      addToMap(
        map,
        arr,
        Math.fround(latToY(g.lat)),
        Math.fround(lngToX(g.lng)),
        p
      );
    }

    const trees = this._trees;

    trees.set(z, { map, arrY: new Float32Array(arr).sort() });

    for (let z = maxZoom; z >= minZoom; z--) {
      const r = 60 / (256 * Math.pow(2, z));

      const { map, arrY } = trees.get(z + 1)!;

      const y = arrY[0];

      const arrX = map.get(y)!;

      const queue: Queue = [y + r, getQueueItems(arrX, r, y)];

      const newMap = new Map<number, [x: number, p: any]>();
      const newArrY: number[] = [];

      let lastQueueIndex = 0;

      for (let i = 1; i < arrY.length; i++) {
        const y = arrY[i];

        while (y > queue[lastQueueIndex]) {
          addDotsToMap(
            queue[lastQueueIndex + 1] as QueueItems,
            newMap,
            newArrY
          );

          lastQueueIndex += 2;
        }

        const arrX = map.get(y)!;

        if (!tryToClusteringQueue(queue, lastQueueIndex + 1, arrX, y)) {
          queue.push(y + r, getQueueItems(arrX, r, y));
        }
      }

      for (let i = lastQueueIndex + 1; i < queue.length; i += 2) {
        addDotsToMap(queue[i] as QueueItems, newMap, newArrY);
      }

      trees.set(
        z,
        newArrY.length !== arrY.length
          ? {
              map: newMap,
              arrY: new Float32Array(newArrY),
            }
          : trees.get(z + 1)!
      );

      const trr = trees.get(z)!.arrY;

      for (let i = 1; i < trr.length; i++) {
        if (trr[i] < trr[i - 1]) {
          console.log('huinya');
          console.log(
            trees.get(z)!.map.get(trr[i]),
            trees.get(z)!.map.get(trr[i - 1])
          );
          break;
        }
      }
    }
    // console.log(trees);
  }

  getClusters([zoom, westLng, southLat, eastLng, northLat]: GetClustersArg) {
    const tree = this._trees.get(this._limitZoom(zoom))!;

    const minY = boundedLatToY(northLat);
    const maxY = boundedLatToY(southLat);

    let minX: number;
    let maxX: number;

    const arr: any[] = [];

    if (eastLng - westLng >= 360) {
      minX = 0;
      maxX = 1;
    } else {
      minX = boundedLngToX(westLng);
      maxX = eastLng === 180 ? 1 : boundedLngToX(eastLng);

      if (minX > maxX) {
        getBounds(arr, tree, minX, minY, 1, maxY);
        getBounds(arr, tree, 0, minY, maxX, maxY);
        // console.log(arr);
        return null as any;
        // return {
        //   points,
        //   ranges: [
        //     tree.range(minX, minY, 1, maxY),
        //     tree.range(0, minY, maxX, maxY),
        //   ],
        // };
      }
    }

    getBounds(arr, tree, minX, minY, maxX, maxY);
    // console.log(arr);
    return null as any;

    // return {
    //   points,
    //   ranges: [tree.range(minX, minY, maxX, maxY)],
    // };
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
