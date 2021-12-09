import React, { memo, useEffect, useRef, useState, VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
  createMarkerComponent,
  createClusterMarkerComponent,
  MarkerClusterer,
  useClusterer,
  OverlayView,
  useGoogleMap,
} from 'google-maps-react';
import { sort, inPlaceSort } from 'fast-sort';

const options = { apiKey: '' };

const GoogleMap = createGoogleMapComponent(['onBoundsChanged'], []);

const Marker = createMarkerComponent(['onClick'], ['position']);

const style = { height: '100vh', width: '100vw' };

const c = { lat: 0, lng: 0 };

const getRandomLocation = () => ({
  lat: Math.random() * (85 * 2) - 85,
  lng: Math.random() * (180 * 2) - 180,
});

const locations = [
  { lat: -31.56391, lng: 147.154312 },
  { lat: -33.718234, lng: 150.363181 },
  { lat: -33.727111, lng: 150.371124 },
  { lat: -33.848588, lng: 151.209834 },
  { lat: -33.851702, lng: 151.216968 },
  { lat: -34.671264, lng: 150.863657 },
  { lat: -35.304724, lng: 148.662905 },
  { lat: -36.817685, lng: 175.699196 },
  { lat: -36.828611, lng: 175.790222 },
  { lat: -37.75, lng: 145.116667 },
  { lat: -37.759859, lng: 145.128708 },
  { lat: -37.765015, lng: 145.133858 },
  { lat: -37.770104, lng: 145.143299 },
  { lat: -37.7737, lng: 145.145187 },
  { lat: -37.774785, lng: 145.137978 },
  { lat: -37.819616, lng: 144.968119 },
  { lat: -38.330766, lng: 144.695692 },
  { lat: -39.927193, lng: 175.053218 },
  { lat: -41.330162, lng: 174.865694 },
  { lat: -42.734358, lng: 147.439506 },
  { lat: -42.734358, lng: 147.501315 },
  { lat: -42.735258, lng: 147.438 },
  { lat: -43.999792, lng: 170.463352 },
];

const lngToX = (lng: number) => lng / 360 + 0.5;

const latToY = (lat: number) => {
  const sin = Math.sin((lat * Math.PI) / 180);

  const y = 0.5 - (0.25 * Math.log((1 + sin) / (1 - sin))) / Math.PI;

  return y < 0 ? 0 : y > 1 ? 1 : y;
};

// console.log(getKek(locations, (v) => v));

const randomLocations = Array.from({ length: 10000 }, (_, index) => ({
  id: index,
  ...getRandomLocation(),
}));

const c1 = 1000;

const sortFn = (a: number, b: number) => a - b;

const isNotArraysEqual = (arr1: unknown[], arr2: unknown[]) => {
  if (arr1.length !== arr2.length) return true;

  for (let i = arr1.length; i--; ) {
    if (arr1[i] !== arr2[i]) return true;
  }

  return false;
};

const xToLng = (x: number) => (x - 0.5) * 360;

const yToLat = (y: number) =>
  (360 * Math.atan(Math.exp((1 - y * 2) * Math.PI))) / Math.PI - 90;

const pair = (a: number, b: number) => {
  const sum = a + b;
  return (sum * (sum + 1)) / 2 + b;
};

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
  for (let j = 2; j < queueItems.length; j += 3) {
    const items = queueItems[j] as QueueItems[2];

    if (items.length > 3) {
      const yx = items.splice(0, 2);

      const l = items.length;

      const y = yx[0] / l;
      const x = yx[1] / l;

      addToMap(map, arr, Math.fround(y), Math.fround(x), {
        items,
        lat: yToLat(y),
        lng: xToLng(x),
      });
    } else {
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

(window as any).kek1 = () => {
  const t1 = performance.now();
  // for (let i = 0; i < c1; i++) {
  const map = new Map<number, [x: number, p: any]>();

  const arr: number[] = [];

  for (let i = randomLocations.length; i--; ) {
    const p = randomLocations[i];

    addToMap(
      map,
      arr,
      Math.fround(latToY(p.lat)),
      Math.fround(lngToX(p.lng)),
      p
    );
  }

  const trees = new Map<number, { map: typeof map; arrY: Float32Array }>();

  trees.set(17, { map, arrY: new Float32Array(arr).sort(sortFn) });

  for (let z = 16; z >= 0; z--) {
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
        addDotsToMap(queue[lastQueueIndex + 1] as QueueItems, newMap, newArrY);

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
            arrY: new Float32Array(newArrY).sort(),
          }
        : trees.get(z + 1)!
    );
  }
  // }
  // console.log((performance.now() - t1) / c1);

  console.log(trees);

  return performance.now() - t1;
};

(window as any).kek2 = () => {
  const t1 = performance.now();
  for (let i = 0; i < c1; i++) {
    const mapY = new Map();

    const arrX = new Set<number>();
    const arrY = [];

    for (let i = randomLocations.length; i--; ) {
      const p = randomLocations[i];

      const x = Math.fround(lngToX(p.lng));
      const y = Math.fround(latToY(p.lat));

      arrX.add(x);

      if (mapY.has(y)) {
        mapY.get(y).set(x, p);
      } else {
        mapY.set(y, new Map().set(x, p));
        arrY.push(y);
      }
    }

    const aX = new Float32Array(arrX).sort(sortFn);
    const aY = new Float32Array(arrY).sort(sortFn);

    // const sortedMapX = new Map();
    // const sortedMapY = new Map();

    // for (let i = aX.length; i--; ) {
    //   const v = aX[i];
    //   sortedMapX.set(v, mapX.get(v));
    // }

    // for (let i = aY.length; i--; ) {
    //   const v = aY[i];
    //   sortedMapY.set(v, mapY.get(v));
    // }
  }
  console.log((performance.now() - t1) / c1);
};

const kek = {
  padding: '5px',
  background: 'white',
  borderRadius: '50%',
  cursor: 'pointer',
  transform: 'translate(-50%,-50%)',
};

const M = (props: any) => {
  const map = useGoogleMap();
  return (
    <OverlayView {...props} mapPaneLayer='floatPane'>
      <div
        onClick={() => {
          map.setZoom(props.zoom + 1);
          map.panTo(props);
          console.log(props.zoom);
        }}
        style={kek}
      >
        {props.count}
      </div>
    </OverlayView>
  );
};

const CGoogleMap = () => {
  const status = useGoogleMapStatus();
  const { getPoints, handleBoundsChange } = useClusterer(randomLocations, {
    getLatLng: (v) => v,
    expandBy: 0.05,
    delay: 16,
    radius: 60,
  });
  // console.log(getPoints());
  if (status === 1)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ center: locations[0], zoom: 5 }}
        onBoundsChanged={handleBoundsChange}
      >
        {/* {d.map(({ coords }, index) => (
          <OverlayView {...coords} key={index}>
            d
          </OverlayView>
        ))} */}
        {/* {getPoints &&
          getPoints(
            (_, key, coords) => {
              return (
                <OverlayView {...coords} key={key}>
                  d
                </OverlayView>
              );
            },
            (props, coords, count) => {
              return <M {...props} {...coords} count={count} />;
            }
          )} */}
        {/* <MarkerClusterer>
          {(markerClusterer) =>
            randomLocations.map((position) => (
              <Kek
                markerClusterer={markerClusterer}
                position={position}
                key={position.id}
              />
            ))
          }
        </MarkerClusterer> */}
      </GoogleMap>
    );

  return null;
};

const Lll = () => {
  console.log(433563);
  return null;
};

const Home: VFC = memo(() => {
  // return null;
  return (
    <GoogleMapLoader options={options}>
      <CGoogleMap />
      <Lll />
    </GoogleMapLoader>
  );
});

export default Home;
