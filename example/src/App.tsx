import React, { memo, VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
} from 'google-maps-react';

const options = { apiKey: '' };

const Kek = createGoogleMapComponent(
  ['onBoundsChanged', 'onCenterChanged'],
  []
);

const style = { height: '100vh', width: '100vw' };

const Bek = () => {
  const status = useGoogleMapStatus();
  if (status === 1)
    return (
      <Kek
        style={style}
        defaultOptions={{ center: { lat: 0, lng: 0 }, zoom: 0 }}
        onBoundsChanged={function () {
          console.log(this);
        }}
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
      <Bek />
      <Lll />
    </GoogleMapLoader>
  );
});

export default Home;
