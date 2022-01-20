import React, { memo, useEffect, useState, VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
  createMarkerComponent,
  useClusterer,
  OverlayView,
  useGoogleMap,
} from 'google-maps-react';
import points from './kek.json';

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

// console.log(getKek(locations, (v) => v));

const randomLocations = Array.from({ length: 100000 }, (_, index) => ({
  id: index,
  ...getRandomLocation(),
}));

const c1 = 10000;

(window as any).kek1 = () => {
  const t1 = performance.now();
  // for (let i = 0; i < c1; i++) {

  // }

  // const a2 = new Float64Array([...(a1 as any)]);
  // a2.sort();
  // console.log(performance.now() - t1);
};

// console.log(fn());

(window as any).kek2 = () => {
  const t1 = performance.now();
  // for (let i = 0; i < c1; i++) {
  //   const a64 = new Float64Array(10000);
  //   for (let i = 0; i < a64.length; i++) {
  //     a64[i] = Math.random();
  //   }
  // }
  console.log(performance.now() - t1);
};

const kek = {
  padding: '5px',
  background: 'white',
  borderRadius: '50%',
  cursor: 'pointer',
  transform: 'translate(-50%,-50%)',
};

export const pair = (a: number, b: number) => {
  const sum = a + b;

  return (sum * (sum + 1)) / 2 + b;
};

const M = (props: any) => {
  const map = useGoogleMap();
  return (
    <OverlayView {...props} mapPaneLayer='floatPane'>
      <div onClick={props.onClick} style={kek}>
        {props.count}
      </div>
    </OverlayView>
  );
};

const pkek = [
  { lat: -33.718234, lng: 150.363187, id: 1 },
  // { lat: -33.718234, lng: 150.363115, id: 4 },
  { lat: -33.718234, lng: 120.363183, id: 3 },
  { lat: -33.718234, lng: 150.363181, id: 2 },
];

const kser = { color: 'red' };

const CGoogleMap = () => {
  const status = useGoogleMapStatus();
  const { getPoints, handleBoundsChange, markerCluster } = useClusterer(
    randomLocations,
    {
      getLatLng: (v) => [v.lng, v.lat],
      radius: 60,
    }
  );
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
        {getPoints &&
          getPoints(
            (_, lng, lat) => {
              return (
                <OverlayView key={pair(lat, lng)} lat={lat} lng={lng}>
                  <span style={kser}>6</span>
                </OverlayView>
              );
            },
            (lng, lat, count, key) => {
              return (
                <M
                  count={count}
                  key={key}
                  lat={lat}
                  lng={lng}
                  onClick={() => {
                    const t1 = performance.now();
                    console.log(markerCluster.getChildren(key));

                    console.log(performance.now() - t1);
                  }}
                />
              );
            },
            10
          )}
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
  const [points, setPoints] = useState([]);

  useEffect(() => {});
  return (
    <GoogleMapLoader options={options}>
      <CGoogleMap />
      <Lll />
    </GoogleMapLoader>
  );
});

export default Home;
