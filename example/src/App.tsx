import React, { memo, useState, VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
} from 'google-maps-react';

const options = { apiKey: '' };

const GoogleMap = createGoogleMapComponent(
  ['onBoundsChanged', 'onCenterChanged', 'onZoomChanged'],
  ['center', 'zoom']
);

const style = { height: '100vh', width: '100vw' };

const c = { lat: 0, lng: 0 };

const CGoogleMap = () => {
  const status = useGoogleMapStatus();
  const [zoom, setZoom] = useState(0);
  if (status === 1)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ zoom: 5 }}
        onBoundsChanged={function () {
          console.log(this);
        }}
        onZoomChanged={function () {
          console.log(this.getZoom());
          setZoom(this.getZoom()!);
        }}
        center={{ lat: 0, lng: 0 }}
        zoom={zoom}
      />
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
