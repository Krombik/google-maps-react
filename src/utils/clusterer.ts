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
   * Cluster radius in pixels
   */
  radius?: number;
  getLatLng: (item: T) => [lat: number, lng: number];
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

const addDot = (
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

const addDots = (queueItems: QueueItems, map: any, arr: number[]) => {
  // const clusters = [];

  for (let j = 2; j < queueItems.length; j += 3) {
    const items = queueItems[j] as QueueItems[2];

    if (items.length > 3) {
      const yx = items.splice(0, 2);

      const l = items.length;

      const y = yx[0] / l;
      const x = yx[1] / l;

      addDot(map, arr, y, x, {
        items,
        lat: yToLat(y),
        lng: xToLng(x),
        key: pair(x, y),
      });
    } else {
      addDot(map, arr, items[0], items[1], items[2]);
    }
  }
};

const pair = (a: number, b: number) => {
  const sum = a + b;

  return (sum * (sum + 1)) / 2 + b;
};

const getBounds = (
  arr: any[],
  tree: { map: Map<number, [x: number, p: any]>; arrY: Float64Array },
  minX: number,
  minY: number,
  maxX: number,
  maxY: number
) => {
  const { map, arrY } = tree;

  let start = 0;
  let end = arrY.length - 1;

  while (arrY[start] < minY) {
    const middle = Math.floor((start + end) / 2);

    if (minY < arrY[middle]) {
      end = middle - 1;
    } else {
      start = middle + 1;
    }
  }

  end = arrY.length - 1;

  const first = start;

  while (arrY[end] > maxY) {
    const middle = Math.floor((start + end) / 2);

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

const clusteringQueueItems = (
  queueItems: QueueItems,
  y: number,
  x: number,
  p: any
) => {
  let clustered = false;

  for (let i = 0; i < queueItems.length; i += 3) {
    if (x >= queueItems[i] && x <= queueItems[i + 1]) {
      const items = queueItems[i + 2] as QueueItems[2];

      items[0] += y;
      items[1] += x;
      items.push(p);

      clustered = true;
    }
  }

  return clustered;
};

const clusteringQueue = (
  queue: Queue,
  startIndex: number,
  y: number,
  x: number,
  p: any
) => {
  for (let j = startIndex; j < queue.length; j += 2) {
    if (clusteringQueueItems(queue[j] as QueueItems, y, x, p)) return true;
  }

  return false;
};

const mutateQueue = (
  queue: Queue,
  data: Map<'i' | 'c', number | boolean>,
  y: number,
  arrX: [x: number, p: any],
  r: number
) => {
  let i = data.get('i') as number;

  while (y > queue[i]) {
    i += 2;
  }

  data.set('i', i);

  let notPushed = true;

  for (let j = 0; j < arrX.length; j += 2) {
    const x = arrX[j];
    const p = arrX[j + 1];

    if (!clusteringQueue(queue, i + 1, y, x, p)) {
      if (notPushed) {
        queue.push(y + 2 * r, [x - r, x + r, [y, x, p]]);

        notPushed = false;
      } else {
        (queue[queue.length - 1] as QueueItems).push(x - r, x + r, [y, x, p]);
      }
    } else {
      data.set('c', true);
    }
  }
};

class Clusterer<T> {
  private _options: Required<ClustererOptions<T>>;
  private _store = new Map<
    number,
    { map: Map<number, [x: number, p: any]>; arrY: Float64Array }
  >();

  constructor(options: ClustererOptions<T>) {
    this._options = {
      minZoom: 0,
      maxZoom: 16,
      radius: 40,
      ...options,
    };
  }

  load(points: T[]) {
    const { minZoom, maxZoom, getLatLng, radius } = this._options;

    const map = new Map<number, [x: number, p: any]>();

    const arr: number[] = [];

    for (let i = points.length; i--; ) {
      const p = points[i];

      const latLng = getLatLng(p);

      addDot(map, arr, latToY(latLng[0]), lngToX(latLng[1]), p);
    }

    const store = this._store;
    store.set(maxZoom + 1, { map, arrY: new Float64Array(arr).sort() });

    const fn = (z: number) => {
      const r = radius / (256 * Math.pow(2, z));

      const tree = store.get(z + 1)!;

      const { map, arrY } = tree;

      const l = arrY.length;

      const queue: Queue = [] as any;

      const data = new Map();
      data.set('i', 0);
      for (let i = 0; i < l; i++) {
        const y = arrY[i];

        mutateQueue(queue, data, y, map.get(y)!, r);
      }

      // console.log(queue, map);
      if (data.has('c')) {
        const currMap = new Map<number, [x: number, p: any]>();
        const currArrY: number[] = [];
        for (let i = 1; i < queue.length; i += 2) {
          addDots(queue[i] as QueueItems, currMap, currArrY);
        }
        store.set(z, {
          map: currMap,
          arrY: new Float64Array(currArrY).sort(),
        });
      } else {
        store.set(z, tree);
      }
    };

    for (let z = maxZoom; z >= minZoom; z--) {
      fn(z);
    }
  }

  getClusters([zoom, westLng, southLat, eastLng, northLat]: GetClustersArg) {
    const tree = this._store.get(this._limitZoom(zoom))!;

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
        return arr;
      }
    }

    getBounds(arr, tree, minX, minY, maxX, maxY);
    // console.log(arr);
    return arr;

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
}

export default Clusterer;
