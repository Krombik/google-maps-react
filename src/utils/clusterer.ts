import KDBush from 'kdbush';
import { XOR } from '../types';

const fround =
  Math.fround ||
  ((tmp) => (x: number) => {
    tmp[0] = +x;
    return tmp[0];
  })(new Float32Array(1));

type Point<T> = XOR<
  [
    { props: T },
    {
      cluster: true;
      numPoints: number;
      props: { key: number; count: number; lat: number; lng: number };
    }
  ]
> & {
  zoom: number;
  parentId: number;
  x: number;
  y: number;
  id: number;
};

const getX = <T>(v: Point<T>) => v.x;
const getY = <T>(v: Point<T>) => v.y;

const pair = (a: number, b: number) => {
  const sum = a + b;
  return (sum * (sum + 1)) / 2 + b;
};

export type ClustererOptions<T> = {
  minZoom?: number; // min zoom level to cluster the points on
  maxZoom?: number; // max zoom level to cluster the points on
  minPoints?: number; // minimum points to form a cluster
  radius?: number; // cluster radius in pixels
  nodeSize?: number; // size of the KD-tree leaf node, affects performance
  getLatLng: (item: T) => google.maps.LatLngLiteral;
};

export type GetClustersArg = [
  zoom: number,
  westLng: number,
  southLat: number,
  eastLng: number,
  northLat: number
];

export default class Clusterer<T> {
  private options: Required<ClustererOptions<T>>;
  private trees: Record<number, KDBush<Point<T>>> = {};
  private points: T[];

  constructor(options: ClustererOptions<T>) {
    this.options = {
      minZoom: 0,
      maxZoom: 16,
      minPoints: 2,
      radius: 40,
      nodeSize: 64,
      ...options,
    };
  }

  load(points: T[]) {
    const { minZoom, maxZoom, nodeSize } = this.options;

    const getLatLng = this.options.getLatLng;

    this.points = points;

    // generate a cluster object for each point and index input points into a KD-tree
    let clusters: Point<T>[] = [];
    for (let i = 0; i < points.length; i++) {
      const props = points[i];
      const { lng, lat } = getLatLng(props);
      clusters.push({
        x: fround(lngX(lng)), // projected point coordinates
        y: fround(latY(lat)),
        zoom: Infinity, // the last zoom the point was processed at
        parentId: -1, // parent cluster id
        props,
        id: i,
      });
    }
    this.trees[maxZoom + 1] = new KDBush(
      clusters,
      getX,
      getY,
      nodeSize,
      Float32Array
    );

    // cluster points on max zoom, then cluster the results on previous zoom, etc.;
    // results in a cluster hierarchy across zoom levels
    for (let z = maxZoom; z >= minZoom; z--) {
      // create a new set of clusters for the zoom and index them with a KD-tree
      clusters = this._cluster(clusters, z);
      this.trees[z] = new KDBush(clusters, getX, getY, nodeSize, Float32Array);
    }
  }

  getClusters([zoom, westLng, southLat, eastLng, northLat]: GetClustersArg) {
    let minLng = ((((westLng + 180) % 360) + 360) % 360) - 180;
    const minLat = Math.max(-90, Math.min(90, southLat));
    let maxLng =
      eastLng === 180 ? 180 : ((((eastLng + 180) % 360) + 360) % 360) - 180;
    const maxLat = Math.max(-90, Math.min(90, northLat));

    const tree = this.trees[this._limitZoom(zoom)];

    if (eastLng - westLng >= 360) {
      minLng = -180;
      maxLng = 180;
    } else if (minLng > maxLng) {
      return [
        this._getClusters(tree, minLng, minLat, 180, maxLat),
        this._getClusters(tree, -180, minLat, maxLng, maxLat),
      ];
    }

    return [this._getClusters(tree, minLng, minLat, maxLng, maxLat)];
  }

  private _getClusters(
    tree: KDBush<Point<T>>,
    minLng: number,
    minLat: number,
    maxLng: number,
    maxLat: number
  ) {
    return {
      ids: tree.range(lngX(minLng), latY(maxLat), lngX(maxLng), latY(minLat)),
      points: tree.points,
    };
  }

  getChildren(clusterId: number): Point<T>[] {
    const originId = this._getOriginId(clusterId);
    const originZoom = this._getOriginZoom(clusterId);
    const errorMsg = 'No cluster with the specified id.';

    const index = this.trees[originZoom];
    if (!index) throw new Error(errorMsg);

    const origin = index.points[originId];
    if (!origin) throw new Error(errorMsg);

    const r = this.options.radius / (256 * Math.pow(2, originZoom - 1));
    const ids = index.within(origin.x, origin.y, r);
    const children: Point<T>[] = [];

    for (let i = ids.length; i--; ) {
      children.push(index.points[ids[i]]);
    }

    if (children.length === 0) throw new Error(errorMsg);

    return children;
  }

  getClusterExpansionZoom(clusterId: number) {
    let expansionZoom = this._getOriginZoom(clusterId) - 1;
    while (expansionZoom <= this.options.maxZoom) {
      const children = this.getChildren(clusterId);
      expansionZoom++;
      if (children.length !== 1) break;
      clusterId = children[0].id;
    }
    return expansionZoom;
  }

  private _limitZoom(z: number) {
    return Math.max(
      this.options.minZoom,
      Math.min(z, this.options.maxZoom + 1)
    );
  }

  private _cluster(points: Point<T>[], zoom: number): Point<T>[] {
    const clusters: Point<T>[] = [];
    const { radius, minPoints } = this.options;
    const r = radius / (256 * Math.pow(2, zoom));

    // loop through each point
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      // if we've already visited the point at this zoom level, skip it
      if (p.zoom > zoom) {
        p.zoom = zoom;

        // find all nearby points
        const tree = this.trees[zoom + 1];
        const neighborIds = tree.within(p.x, p.y, r);

        const numPointsOrigin = p.numPoints || 1;
        let numPoints = numPointsOrigin;

        // count the number of points in a potential cluster
        for (let i = neighborIds.length; i--; ) {
          const b = tree.points[neighborIds[i]];
          // filter out neighbors that are already processed
          if (b.zoom > zoom) numPoints += b.numPoints || 1;
        }

        // if there were neighbors to merge, and there are enough points to form a cluster
        if (numPoints > numPointsOrigin && numPoints >= minPoints) {
          let wx = p.x * numPointsOrigin;
          let wy = p.y * numPointsOrigin;

          // encode both zoom and point index on which the cluster originated -- offset by total length of features
          const id = (i << 5) + (zoom + 1) + this.points.length;

          for (let i = neighborIds.length; i--; ) {
            const b = tree.points[neighborIds[i]];

            if (b.zoom > zoom) {
              b.zoom = zoom; // save the zoom (so it doesn't get processed twice)

              const numPoints2 = b.numPoints || 1;
              wx += b.x * numPoints2; // accumulate coordinates for calculating weighted center
              wy += b.y * numPoints2;

              b.parentId = id;
            }
          }

          p.parentId = id;
          clusters.push(
            createCluster(wx / numPoints, wy / numPoints, id, numPoints)
          );
        } else {
          // left points as unclustered
          clusters.push(p);

          // if (numPoints > 1) {
          //   for (let i = neighborIds.length; i--; ) {
          //     const b = tree.points[neighborIds[i]];
          //     if (b.zoom > zoom) {
          //       console.log(b);
          //       b.zoom = zoom;
          //       clusters.push(b);
          //     }
          //   }
          // }
        }
      }
    }

    return clusters;
  }

  // get index of the point from which the cluster originated
  private _getOriginId(clusterId: number) {
    return (clusterId - this.points.length) >> 5;
  }

  // get zoom of the point from which the cluster originated
  private _getOriginZoom(clusterId: number) {
    return (clusterId - this.points.length) % 32;
  }
}

function createCluster(x: number, y: number, id: number, numPoints: number) {
  x = fround(x);
  y = fround(y);
  return {
    x, // weighted cluster center; round for consistency with Float32Array index
    y,
    zoom: Infinity, // the last zoom the cluster was processed at
    id, // encodes index of the first child of the cluster and its zoom level
    parentId: -1, // parent cluster id
    numPoints,
    cluster: true as const,
    props: {
      key: pair(x, y),
      lng: xLng(x),
      lat: yLat(y),
      count: numPoints,
    },
  };
}

// longitude/latitude to spherical mercator in [0..1] range
function lngX(lng: number) {
  return lng / 360 + 0.5;
}
function latY(lat: number) {
  const sin = Math.sin((lat * Math.PI) / 180);
  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;
  return y < 0 ? 0 : y > 1 ? 1 : y;
}

// spherical mercator to longitude/latitude
function xLng(x: number) {
  return (x - 0.5) * 360;
}
function yLat(y: number) {
  const y2 = ((180 - y * 360) * Math.PI) / 180;
  return (360 * Math.atan(Math.exp(y2))) / Math.PI - 90;
}
