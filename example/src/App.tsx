import { VFC } from 'react';
import {
  GoogleMapLoader,
  useGoogleMapStatus,
  createGoogleMapComponent,
  useMarkerCluster,
  OverlayView,
  LoaderStatus,
} from 'google-maps-react';
import { LoaderOptions } from 'google-maps-js-api-loader';

const options: LoaderOptions = {
  apiKey: '',
  libraries: ['places', 'geometry'],
};

const GoogleMap = createGoogleMapComponent(['onBoundsChanged'], []);

const style = { height: '100vh', width: '100vw' };

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

const randomLocations = Array.from({ length: 10000 }, (_, index) => ({
  id: index,
  ...getRandomLocation(),
}));

randomLocations.push(
  { lat: -42.735258, lng: 147.438, id: randomLocations.length },
  { lat: -42.735258, lng: 147.438, id: randomLocations.length + 1 }
);

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
  return (
    <OverlayView {...props} mapPaneLayer='floatPane'>
      <div onClick={props.onClick} style={kek}>
        {props.count}
      </div>
    </OverlayView>
  );
};

const CGoogleMap = ({
  points,
}: {
  points: { lat: number; lng: number; id: number }[];
}) => {
  const status = useGoogleMapStatus();

  const { getPoints, handleBoundsChange, markerCluster } = useMarkerCluster(
    points,
    (v) => [v.lng, v.lat],
    {
      radius: 75,
      asyncMode: true,
    }
  );

  if (status === LoaderStatus.LOADED)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ center: locations[0], zoom: 5 }}
        onBoundsChanged={handleBoundsChange}
      >
        {(map) =>
          getPoints &&
          getPoints(
            (_, lng, lat) => {
              return (
                <OverlayView key={pair(lat, lng)} lat={lat} lng={lng}>
                  <span>dot</span>
                </OverlayView>
              );
            },
            (lng, lat, count, id) => {
              return (
                <M
                  count={count}
                  key={id}
                  lat={lat}
                  lng={lng}
                  onClick={() => {
                    console.log(markerCluster.getChildren(id));
                    map.panTo({ lat, lng });
                    map.setZoom(markerCluster.getZoom(id));
                  }}
                />
              );
            },
            10
          )
        }
      </GoogleMap>
    );

  return null;
};

const Home: VFC = () => {
  return (
    <GoogleMapLoader options={options}>
      <CGoogleMap points={randomLocations} />
    </GoogleMapLoader>
  );
};

export default Home;
