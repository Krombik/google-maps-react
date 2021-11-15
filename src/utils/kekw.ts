import KDBush from 'kdbush';
import { XOR } from '../types';

type Options = {
  minZoom: number; // min zoom level to cluster the points on
  maxZoom: number; // max zoom level to cluster the points on
  minPoints: number; // minimum points to form a cluster
  radius: number; // cluster radius in pixels
  extent: number; // tile extent (radius is calculated relative to it)
  nodeSize: number; // size of the KD-tree leaf node, affects performance
};

const fround =
  Math.fround ||
  ((tmp) => (x: number) => {
    tmp[0] = +x;
    return tmp[0];
  })(new Float32Array(1));

type Kek<T> = XOR<[{ props: T }, { cluster: true }]> & {
  zoom: number;
  parentId: number;
  x: number;
  y: number;
  numPoints?: number;
  id: number;
};

const getX = <T>(v: Kek<T>) => v.x;
const getY = <T>(v: Kek<T>) => v.y;

export default class Supercluster<T> {
  options: Options;
  trees: KDBush<Kek<T>>[];
  points: T[];
  getLatLng: (item: T) => google.maps.LatLngLiteral;

  constructor(
    getLatLng: (item: T) => google.maps.LatLngLiteral,
    options?: Partial<Options>
  ) {
    this.options = {
      minZoom: 0,
      maxZoom: 16,
      minPoints: 2,
      radius: 40,
      extent: 512,
      nodeSize: 64,
      ...options,
    };

    this.getLatLng = getLatLng;

    this.trees = new Array(this.options.maxZoom + 1);
  }

  load(points: T[]) {
    const { minZoom, maxZoom, nodeSize } = this.options;

    const getLatLng = this.getLatLng;

    this.points = points;

    // generate a cluster object for each point and index input points into a KD-tree
    let clusters: Kek<T>[] = [];
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

  getClusters(bbox: [number, number, number, number], zoom: number): Kek<T>[] {
    let minLng = ((((bbox[0] + 180) % 360) + 360) % 360) - 180;
    const minLat = Math.max(-90, Math.min(90, bbox[1]));
    let maxLng =
      bbox[2] === 180 ? 180 : ((((bbox[2] + 180) % 360) + 360) % 360) - 180;
    const maxLat = Math.max(-90, Math.min(90, bbox[3]));

    if (bbox[2] - bbox[0] >= 360) {
      minLng = -180;
      maxLng = 180;
    } else if (minLng > maxLng) {
      const easternHem = this.getClusters([minLng, minLat, 180, maxLat], zoom);
      const westernHem = this.getClusters([-180, minLat, maxLng, maxLat], zoom);
      return easternHem.concat(westernHem);
    }

    const tree = this.trees[this._limitZoom(zoom)];
    const ids = tree.range(
      lngX(minLng),
      latY(maxLat),
      lngX(maxLng),
      latY(minLat)
    );
    const clusters: Kek<T>[] = [];

    for (let i = ids.length; i--; ) {
      clusters.push(tree.points[ids[i]]);
    }

    return clusters;
  }

  getChildren(clusterId: number): Kek<T>[] {
    const originId = this._getOriginId(clusterId);
    const originZoom = this._getOriginZoom(clusterId);
    const errorMsg = 'No cluster with the specified id.';

    const index = this.trees[originZoom];
    if (!index) throw new Error(errorMsg);

    const origin = index.points[originId];
    if (!origin) throw new Error(errorMsg);

    const r =
      this.options.radius / (this.options.extent * Math.pow(2, originZoom - 1));
    const ids = index.within(origin.x, origin.y, r);
    const children: Kek<T>[] = [];

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

  private _cluster(points: Kek<T>[], zoom: number): Kek<T>[] {
    const clusters: Kek<T>[] = [];
    const { radius, extent, minPoints } = this.options;
    const r = radius / (extent * Math.pow(2, zoom));

    // loop through each point
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      // if we've already visited the point at this zoom level, skip it
      if (p.zoom <= zoom) continue;
      p.zoom = zoom;

      // find all nearby points
      const tree = this.trees[zoom + 1];
      const neighborIds = tree.within(p.x, p.y, r);

      const numPointsOrigin = p.numPoints || 1;
      let numPoints = numPointsOrigin;

      // count the number of points in a potential cluster
      for (const neighborId of neighborIds) {
        const b = tree.points[neighborId];
        // filter out neighbors that are already processed
        if (b.zoom > zoom) numPoints += b.numPoints || 1;
      }

      // if there were neighbors to merge, and there are enough points to form a cluster
      if (numPoints > numPointsOrigin && numPoints >= minPoints) {
        let wx = p.x * numPointsOrigin;
        let wy = p.y * numPointsOrigin;

        // encode both zoom and point index on which the cluster originated -- offset by total length of features
        const id = (i << 5) + (zoom + 1) + this.points.length;

        for (const neighborId of neighborIds) {
          const b = tree.points[neighborId];

          if (b.zoom <= zoom) continue;
          b.zoom = zoom; // save the zoom (so it doesn't get processed twice)

          const numPoints2 = b.numPoints || 1;
          wx += b.x * numPoints2; // accumulate coordinates for calculating weighted center
          wy += b.y * numPoints2;

          b.parentId = id;
        }

        p.parentId = id;
        clusters.push(
          createCluster(wx / numPoints, wy / numPoints, id, numPoints)
        );
      } else {
        // left points as unclustered
        clusters.push(p);

        if (numPoints > 1) {
          for (const neighborId of neighborIds) {
            const b = tree.points[neighborId];
            if (b.zoom <= zoom) continue;
            b.zoom = zoom;
            clusters.push(b);
          }
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
  return {
    x: fround(x), // weighted cluster center; round for consistency with Float32Array index
    y: fround(y),
    zoom: Infinity, // the last zoom the cluster was processed at
    id, // encodes index of the first child of the cluster and its zoom level
    parentId: -1, // parent cluster id
    numPoints,
    cluster: true as const,
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
// function xLng(x: number) {
//   return (x - 0.5) * 360;
// }
// function yLat(y: number) {
//   const y2 = ((180 - y * 360) * Math.PI) / 180;
//   return (360 * Math.atan(Math.exp(y2))) / Math.PI - 90;
// }
