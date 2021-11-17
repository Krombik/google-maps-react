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
} from 'google-maps-react';

const options = { apiKey: '' };

const GoogleMap = createGoogleMapComponent(['onBoundsChanged'], []);

const Marker = createMarkerComponent(['onClick'], ['position']);

const style = { height: '100vh', width: '100vw' };

const c = { lat: 0, lng: 0 };

const Kek = createClusterMarkerComponent([], ['position']);

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

const randomLocations = Array.from({ length: 10000 }, (_, index) => ({
  id: index,
  ...getRandomLocation(),
}));

const CGoogleMap = () => {
  const status = useGoogleMapStatus();
  const { getPoints, handleBoundsChange } = useClusterer(randomLocations, {
    getLatLng: (v) => v,
    expand: 0.03,
    delay: 30,
    radius: 60,
  });
  if (status === 1)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ center: { lat: 0, lng: 0 }, zoom: 1 }}
        onBoundsChanged={handleBoundsChange}
      >
        {getPoints(
          (props) => {
            return (
              <OverlayView {...props} key={props.id}>
                d
              </OverlayView>
            );
          },
          (props) => {
            return (
              <OverlayView {...props} key={props.id}>
                {props.count}
              </OverlayView>
            );
          }
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
  return (
    <GoogleMapLoader options={options}>
      <CGoogleMap />
      <Lll />
    </GoogleMapLoader>
  );
});

export default Home;
