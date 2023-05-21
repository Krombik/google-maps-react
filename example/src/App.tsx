import { GoogleMap, Marker, OverlayView } from 'google-maps-js-api-react';

import { useRef, VFC } from 'react';

import { useState } from 'react';
import useGoogleMapsLoader, {
  GoogleMapsLoader,
  GoogleMapsLoaderStatus,
} from 'use-google-maps-loader';
import useMarkerCluster from 'use-marker-cluster';

GoogleMapsLoader({
  key: '',
  libraries: ['places', 'geometry'],
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
  const status = useGoogleMapsLoader();

  const [points, setPoints] = useState(randomLocations);

  const markerCluster = useMarkerCluster(points, (v) => [v.lng, v.lat], {
    asyncMode: true,
  });

  const [zoom, setZoom] = useState(5);

  const mapRef = useRef<google.maps.Map>(null);

  if (status === GoogleMapsLoaderStatus.LOADED)
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

            setZoom(10);
          }}
        >
          kek
        </button>
        <GoogleMap
          style={mapStyle}
          defaultOptions={{ scrollwheel: true }}
          onBoundsChanged={function (bounds) {
            const sw = bounds.getSouthWest();
            const ne = bounds.getNorthEast();

            markerCluster
              .setZoom(this.getZoom()!)
              .setBounds(sw.lng(), sw.lat(), ne.lng(), ne.lat())
              .callback();
          }}
          center={locations[0]}
          zoom={zoom}
          ref={mapRef}
        >
          {markerCluster.getPoints(
            ({ lat, lng, id }, key) => (
              <OverlayView
                lat={lat}
                lng={lng}
                key={key}
                preventMapHitsAndGestures
              >
                <div style={markerStyle}>m{id}</div>
              </OverlayView>
            ),
            (lng, lat, count, expandZoom, key) => (
              <OverlayView
                lat={lat}
                lng={lng}
                key={key}
                preventMapHitsAndGestures
              >
                <div
                  style={markerStyle}
                  onClick={() => {
                    const map = mapRef.current!;

                    map.panTo({ lat, lng });

                    map.setZoom(expandZoom);
                  }}
                >
                  {count}
                </div>
              </OverlayView>
            )
          )}
        </GoogleMap>
      </>
    );

  return null;
};

// const GoogleMap = createGoogleMapComponent([], []);

const Map = () => {
  const status = useGoogleMapsLoader();

  if (status === GoogleMapsLoaderStatus.LOADED)
    return (
      <GoogleMap
        style={mapStyle}
        zoom={6}
        defaultOptions={{
          center: { lat: -31.56391, lng: 147.154312 },
          zoom: 6,
        }}
        onZoomChanged={function () {
          this.setZoom(6);
        }}
      >
        <Marker
          position={{ lat: -31.56391, lng: 147.154312 }}
          onClick={() => console.log('clicked')}
        />
        <OverlayView lat={-37.75} lng={145.116667}>
          <div style={{ background: 'red' }}>dot</div>
        </OverlayView>
      </GoogleMap>
    );

  return null;
};

const Home: VFC = () => {
  return <CGoogleMap points={randomLocations} />;
};

export default Home;
