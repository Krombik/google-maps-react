import React, { memo, useCallback, useState, VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
} from 'google-maps-react';

const options = { apiKey: '' };

const GoogleMap = createGoogleMapComponent(
  ['onBoundsChanged', 'onCenterChanged', 'onZoomChanged'],
  ['zoom']
);

const style = { height: '100vh', width: '100vw' };

const CGoogleMap = () => {
  const status = useGoogleMapStatus();
  const [zoom, setZoom] = useState(0);
  const k = useCallback(function (this: any) {
    console.log(this.getZoom());
    setZoom(this.getZoom()!);
  }, []);
  if (status === 1)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ center: { lat: 0, lng: 0 } }}
        onBoundsChanged={function () {
          console.log(this);
        }}
        onZoomChanged={k}
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
