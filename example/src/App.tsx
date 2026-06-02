import {
  GoogleMap,
  OverlayView,
  AdvancedMarker,
  KmlLayer,
  StreetViewPanorama,
  TransitLayer,
} from 'google-maps-js-api-react';

import { Suspense, useRef, useState, type CSSProperties, type FC } from 'react';

import { Dialog, useDialogStore } from '@ariakit/react';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';

GoogleMapsLoader({
  key: '',
});

const center = { lat: -31.56391, lng: 147.154312 };

// Static price-tag markers (like a real listings map). Plain OverlayView, no
// async clustering — this isolates the lib's pooled-map reuse + panes behavior.
const markers = [
  { id: 1, lat: -33.848588, lng: 151.209834, price: '€300' },
  { id: 2, lat: -34.671264, lng: 150.863657, price: '€420' },
  { id: 3, lat: -35.304724, lng: 148.662905, price: '€180' },
  { id: 4, lat: -37.819616, lng: 144.968119, price: '€275' },
  { id: 5, lat: -31.56391, lng: 147.154312, price: '€510' },
];

// AdvancedMarkerElement markers. `children` → custom content; omit → default pin.
const advancedMarkers = [
  { id: 'a', lat: -25.0, lng: 135.0, label: 'A' },
  { id: 'b', lat: -20.0, lng: 145.0, label: 'B' },
];

const plainAdvancedMarkers = [
  { id: 'p', lat: -30.0, lng: 130.0 },
  { id: 'q', lat: -28.0, lng: 140.0 },
];

const advancedContentStyle: CSSProperties = {
  padding: '6px 10px',
  background: '#1a73e8',
  color: '#fff',
  borderRadius: '16px',
  fontSize: '13px',
  fontWeight: 700,
  border: '2px solid #fff',
  boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
  cursor: 'pointer',
};

const markerStyle: CSSProperties = {
  padding: '4px 8px',
  background: 'white',
  borderRadius: '12px',
  border: '1px solid #ccc',
  boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  fontSize: '12px',
  fontWeight: 600,
  cursor: 'pointer',
  transform: 'translate(-50%,-50%)',
};

const mapStyle: CSSProperties = { height: '100%', width: '100%' };

// Map lives inside the modal. Same `defaultOptions` key across opens, so the
// lib reuses the pooled instance — exactly the path that produced grey tiles
// on the second open.
const MapView: FC = () => {
  const mapRef = useRef<google.maps.Map>(null);

  const [showKml, setShowKml] = useState(false);

  // Standalone panorama, linked to the map via the `streetView` prop below.
  // Pegman/clicks in the map drive THIS pano (split-view), and it lives in its
  // own styled container — unlike the in-map `map.getStreetView()` pano.
  const [pano, setPano] = useState<google.maps.StreetViewPanorama | null>(null);

  return (
    <div style={{ display: 'flex', width: '100%', height: '100%' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        <button
          style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 1 }}
          onClick={() => setShowKml((v) => !v)}
        >
          {showKml ? 'Hide KML' : 'Show KML'}
        </button>

        <GoogleMap
          style={mapStyle as any}
          defaultOptions={{ minZoom: 1, mapId: 'DEMO_MAP_ID' }}
          scrollwheel
          zoom={5}
          center={center}
          streetView={pano}
          fallback={
            <div style={{ color: 'red', width: '100%', height: '100%' }}>
              loading…
            </div>
          }
          ref={mapRef}
        >
          {markers.map(({ id, lat, lng, price }) => (
            <OverlayView
              lat={lat}
              lng={lng}
              key={id}
              preventMapHitsAndGestures
              render={(ref) => (
                <div style={markerStyle} ref={ref}>
                  {price}
                </div>
              )}
            />
          ))}

          {/* Own Suspense: AdvancedMarker loads the `marker` library and would
          otherwise suspend (and tear down) the whole map on first open. */}

          {/* AdvancedMarker WITH children → custom content */}
          {advancedMarkers.map(({ id, lat, lng, label }) => (
            <AdvancedMarker
              key={id}
              position={{ lat, lng }}
              gmpClickable
              onClick={() => console.log('advanced marker clicked', id)}
            >
              <div style={advancedContentStyle}>Marker {label}</div>
            </AdvancedMarker>
          ))}

          {/* AdvancedMarker with a customized PinElement via the `pin` prop */}
          {plainAdvancedMarkers.map(({ id, lat, lng }) => (
            <AdvancedMarker
              key={id}
              position={{ lat, lng }}
              title={`Pin ${id}`}
              pin={{
                background: '#34a853',
                borderColor: '#0b6b2e',
                glyphColor: '#ffffff',
                glyph: id.toUpperCase(),
                scale: 1.3,
              }}
            />
          ))}

          {/* setMap-only layer (handleComponent viaSetMap flag) */}
          <TransitLayer />

          {/* KmlLayer — renders a remote KML. preserveViewport=false → map fits it. */}
          {showKml ? (
            <KmlLayer
              url='https://developers.google.com/maps/documentation/javascript/examples/kml/westcampus.kml'
              onStatusChanged={function () {
                console.log('kml status', this.getStatus());
              }}
            />
          ) : null}
        </GoogleMap>
      </div>
    </div>
  );
};

const backdropStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0, 0, 0, 0.5)',
};

const modalContainerStyle: CSSProperties = {
  position: 'absolute',
  left: '50%',
  top: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  height: '90vh',
  background: '#fff',
  borderRadius: '8px',
  overflow: 'hidden',
};

const closeButtonStyle: CSSProperties = {
  position: 'absolute',
  top: '8px',
  right: '8px',
  zIndex: 1,
  width: '32px',
  height: '32px',
  border: 'none',
  borderRadius: '50%',
  background: 'rgba(0, 0, 0, 0.6)',
  color: '#fff',
  fontSize: '18px',
  cursor: 'pointer',
};

const App: FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const close = () => setIsOpen(false);

  // Mirrors CModalContainer: ariakit Dialog, opacity transition via [data-enter],
  // unmountOnHide so the map unmounts on close and the pool is reused on reopen.
  return (
    <div style={{ padding: '24px' }}>
      <h1>GoogleMap in animated ariakit Dialog</h1>

      <p>
        Open → close → open again. Before the fix the second open showed grey
        tiles until you dragged the map.
      </p>

      <button onClick={() => setIsOpen(true)}>Open map</button>

      <h2>StreetViewPanorama</h2>

      <Suspense
        fallback={<div style={{ height: '360px' }}>loading street view…</div>}
      >
        <StreetViewPanorama
          style={{ width: '100%', height: '360px' }}
          position={{ lat: -33.857, lng: 151.215 }}
          pov={{ heading: 34, pitch: 10 }}
          zoom={1}
          visible
          onPositionChanged={function (position) {
            console.log('pano position', position?.toJSON());
          }}
        />
      </Suspense>

      <Dialog
        store={useDialogStore({ open: isOpen, setOpen: setIsOpen })}
        onClose={close}
        modal
        backdrop={false}
        unmountOnHide
        autoFocusOnShow={false}
        className='map-dialog'
      >
        <div style={backdropStyle} onClick={close} />

        <div style={modalContainerStyle}>
          <button style={closeButtonStyle} onClick={close} aria-label='Close'>
            ×
          </button>

          <MapView />
        </div>
      </Dialog>
    </div>
  );
};

export default App;
