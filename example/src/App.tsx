import { GoogleMap, OverlayView } from 'google-maps-js-api-react';

import { useRef, VFC } from 'react';

import { useState } from 'react';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import useMarkerCluster from 'use-marker-cluster';

GoogleMapsLoader({
  key: '',
});

const mapStyle = { height: '100vh', width: '100vw' };

const round = (a: number, b: number) => {
  const c = 10 ** b;

  return Math.round(a * c) / c;
};

const getRandomLocation = () => ({
  lat: round(Math.random() * (85 * 2) - 85, 6),
  lng: round(Math.random() * (180 * 2) - 180, 6),
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

const randomLocations = Array.from({ length: 100000 }, (_, index) => ({
  id: index,
  ...getRandomLocation(),
}));

// randomLocations.push(
//   { lat: -42.735258, lng: 147.438, id: randomLocations.length },
//   { lat: -42.735258, lng: 147.438, id: randomLocations.length + 1 }
// );

const markerStyle = {
  padding: '5px',
  background: 'white',
  borderRadius: '50%',
  cursor: 'pointer',
  transform: 'translate(-50%,-50%)',
};

const CGoogleMap = (p: {
  points: { lat: number; lng: number; id: number }[];
}) => {
  const [points, setPoints] = useState(randomLocations);

  const markerCluster = useMarkerCluster(points, (v) => [v.lng, v.lat], {
    asyncMode: true,
  });

  const [zoom, setZoom] = useState(5);

  const [center, setCenter] = useState(locations[0]);

  const [toggler, setToggler] = useState(true);

  const mapRef = useRef<google.maps.Map>(null);

  return (
    <>
      <button
        onClick={() => {
          // setPoints(
          //   Array.from({ length: 10000 }, (_, index) => ({
          //     id: index,
          //     ...getRandomLocation(),
          //   }))
          // );

          // setZoom(10);

          // setCenter(locations[3]);

          setToggler((prev) => !prev);

          // mapRef.current?.setCenter(locations[3]);
        }}
      >
        kek
      </button>
      <button
        onClick={() => {
          // setCenter({ lat: 25, lng: 25 });
          mapRef.current?.setCenter({ lat: 25, lng: 25 });
        }}
      >
        trr
      </button>
      {toggler && (
        <GoogleMap
          style={mapStyle}
          defaultOptions={{ scrollwheel: true, zoom, center }}
          fallback={
            <div style={{ color: 'red', width: '100%', height: '100%' }}>
              zlupa
            </div>
          }
          onClick={() => {
            console.log('wad');
          }}
          onBoundsChanged={function (bounds) {
            if (bounds) {
              const sw = bounds.getSouthWest();
              const ne = bounds.getNorthEast();

              markerCluster
                .setZoom(this.getZoom()!)
                .setBounds(sw.lng(), sw.lat(), ne.lng(), ne.lat())
                .callback();
            }
          }}
          center={center}
          ref={mapRef}
        >
          {markerCluster.getPoints(
            ({ lat, lng, id }, key) => (
              <OverlayView
                lat={lat}
                lng={lng}
                key={key}
                preventMapHitsAndGestures
                render={(ref) => (
                  <div style={markerStyle} ref={ref}>
                    m{id}
                  </div>
                )}
              ></OverlayView>
            ),
            (lng, lat, count, expandZoom, key) => (
              <OverlayView
                lat={lat}
                lng={lng}
                key={key}
                preventMapHitsAndGestures
                render={(ref) => (
                  <div
                    style={markerStyle}
                    onClick={() => {
                      const map = mapRef.current!;

                      map.panTo({ lat, lng });

                      map.setZoom(expandZoom);
                    }}
                    ref={ref}
                  >
                    {count}
                  </div>
                )}
              ></OverlayView>
            )
          )}
        </GoogleMap>
      )}
    </>
  );
};

const Home: VFC = () => {
  return <CGoogleMap points={randomLocations} />;
};

export default Home;
