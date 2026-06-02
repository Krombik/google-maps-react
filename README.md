# google-maps-js-api-react

A fast, lightweight, tree-shakeable set of React components and hooks for the
[Google Maps JavaScript API](https://developers.google.com/maps/documentation/javascript).

- 🧩 Declarative components for the map, markers, overlays, shapes and layers.
- ♻️ The map instance is **pooled and reused** across mounts — no costly re-initialization.
- ⏳ Libraries load on demand via [Suspense](https://react.dev/reference/react/Suspense).
- 🌳 Fully tree-shakeable — you ship only what you import.

> Requires React 18+. Map-rendering components return `null` during SSR and
> mount on the client.

## Installation

using npm:

```sh
npm i --save google-maps-js-api-react google-maps-js-api-loader && npm i --save-dev @types/google.maps
```

or yarn:

```sh
yarn add google-maps-js-api-react google-maps-js-api-loader && yarn add -D @types/google.maps
```

or pnpm:

```sh
pnpm add google-maps-js-api-react google-maps-js-api-loader && pnpm add -D @types/google.maps
```

## Quick start

```tsx
import GoogleMap from 'google-maps-js-api-react/GoogleMap';
import AdvancedMarker from 'google-maps-js-api-react/AdvancedMarker';
import OverlayView from 'google-maps-js-api-react/OverlayView';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';

// Configure the loader once, anywhere before the first render.
GoogleMapsLoader({ key: API_KEY });

const center = { lat: -31.56391, lng: 147.154312 };

const Map = () => (
  <GoogleMap
    style={{ width: '100%', height: '100vh' }}
    defaultOptions={{ mapId: 'YOUR_MAP_ID' }}
    center={center}
    zoom={6}
    onClick={() => console.log('map clicked')}
  >
    {/* a customizable pin */}
    <AdvancedMarker
      position={center}
      pin={{ background: '#34a853', glyph: 'A' }}
    />

    {/* fully custom HTML content */}
    <AdvancedMarker position={{ lat: -37.75, lng: 145.116667 }}>
      <div className='price-tag'>$300</div>
    </AdvancedMarker>

    {/* arbitrary DOM anchored to a coordinate */}
    <OverlayView
      lat={-33.87}
      lng={151.21}
      render={(ref) => <div ref={ref}>dot</div>}
    />
  </GoogleMap>
);
```

## Core concepts

**Loading & Suspense.** Components throw to load the library they need, so render
them under a [`Suspense`](https://react.dev/reference/react/Suspense) boundary
(`GoogleMap` has one built in via its `fallback` prop). Components from secondary
libraries (`AdvancedMarker`, `DrawingManager`, the Street View components…)
accept `preventLoad` to wait for an existing load instead of triggering one.

**Props are uncontrolled by default.** A prop sets the value but doesn't lock
it — the user can still pan, zoom, drag, etc. Changing the prop later _does_
update the instance.

```jsx
// zoom starts at 5 but the user can change it freely; setting `zoom` later re-applies
<GoogleMap zoom={zoom} />
```

(The exception is content: `OverlayView`'s `render`, `AdvancedMarker`'s `children`.)

**`props` vs `defaultOptions`.** Each component exposes the **settable** options of
its underlying `google.maps` class as individual, reactive props, plus
`on*` event handlers (called with the instance as `this`). Options that can only
be set at **construction** (and the map's pool identity keys) are passed together
through **`defaultOptions`** — set once, never reactive.

**Map pooling.** `GoogleMap` creates a `google.maps.Map` once and reuses it across
mounts. The pool is keyed by the `defaultOptions` identity keys
(`backgroundColor`, `controlSize`, `mapId`, `renderingType`, `minZoom`, `maxZoom`,
`restriction`) — maps with different values for those get separate instances.

## Components

| Component                                                                                   | Description                                                  |
| :------------------------------------------------------------------------------------------ | :----------------------------------------------------------- |
| [`GoogleMap`](#googlemap)                                                                   | The map.                                                     |
| [`StreetViewPanorama`](#streetviewpanorama)                                                 | A panorama, standalone or linked to a map.                   |
| [`AdvancedMarker`](#advancedmarker)                                                         | Modern marker (`AdvancedMarkerElement`) with custom content. |
| [`OverlayView`](#overlayview)                                                               | Arbitrary DOM anchored to a coordinate.                      |
| [`Marker`](#marker)                                                                         | ⚠️ Legacy marker (deprecated by Google).                     |
| [`Polygon`](#shapes) · [`Polyline`](#shapes) · [`Circle`](#shapes) · [`Rectangle`](#shapes) | Vector shapes.                                               |
| [`TrafficLayer`](#layers) · [`TransitLayer`](#layers) · [`BicyclingLayer`](#layers)         | Built-in overlay layers.                                     |
| [`StreetViewCoverageLayer`](#layers)                                                        | Street View coverage overlay.                                |
| [`FeatureLayer`](#featurelayer)                                                             | Data-driven styling (needs a Map ID with DDS).               |
| [`KmlLayer`](#layers)                                                                       | ⚠️ Renders KML/GeoRSS (deprecated by Google).                |
| [`DrawingManager`](#drawingmanager)                                                         | Interactive drawing tools.                                   |

All components forward a `ref` to their underlying `google.maps` instance.

### GoogleMap

[`google.maps.Map`](https://developers.google.com/maps/documentation/javascript/reference/map#Map). Pooled and reused across mounts.

- **Reactive props:** every settable [`MapOptions`](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions) field (`center`, `zoom`, `heading`, `tilt`, `mapTypeId`, `clickableIcons`, `streetView`, `gestureHandling`, controls, …) + all map event handlers (`onClick`, `onBoundsChanged`, `onZoomChanged`, `onIdle`, `onTilesLoaded`, …).
- **`defaultOptions`** (creation-only): `backgroundColor`, `controlSize`, `mapId`, `renderingType`, `minZoom`, `maxZoom`, `restriction`.
- **Layout:** `className`, `style`, `id`. **Loading:** `fallback` (Suspense fallback).

```tsx
<GoogleMap
  style={mapStyle}
  defaultOptions={{ mapId: 'DEMO_MAP_ID', minZoom: 3 }}
  center={center}
  zoom={6}
  gestureHandling='greedy'
  fallback={<Spinner />}
  ref={mapRef}
/>
```

### StreetViewPanorama

[`google.maps.StreetViewPanorama`](https://developers.google.com/maps/documentation/javascript/reference/street-view#StreetViewPanorama). Two modes:

- **Standalone** — renders its own viewport. Style it via `className`/`style`/`id`.
- **Connected** — when rendered as a child of `GoogleMap`, it drives the map's
  built-in panorama (the one the pegman opens). It renders no element of its own.

To get a styled, separately-placed panorama that's still linked to a map, render
a standalone one and pass it to the map's `streetView` prop.

- **Reactive props:** `position`, `pov`, `zoom`, `visible`, `pano` + other [`StreetViewPanoramaOptions`](https://developers.google.com/maps/documentation/javascript/reference/street-view#StreetViewPanoramaOptions) + handlers (`onPositionChanged`, `onPovChanged`, `onStatusChanged`, …). **`defaultOptions`:** `controlSize`. **`preventLoad`.**

```tsx
// standalone, linked to a map (split view)
const [pano, setPano] = useState<google.maps.StreetViewPanorama | null>(null);

<GoogleMap streetView={pano} {...othersProps} />
<StreetViewPanorama ref={setPano} style={{ width: 400, height: 300 }} position={p} />
```

### AdvancedMarker

[`google.maps.marker.AdvancedMarkerElement`](https://developers.google.com/maps/documentation/javascript/reference/advanced-markers). The modern marker; requires a map with a **Map ID**.

- **Reactive props:** `position`, `title`, `zIndex`, `gmpClickable`, `gmpDraggable`, `collisionBehavior`.
- **Content:** `children` (any React node) **or** `pin` ([`PinElementOptions`](https://developers.google.com/maps/documentation/javascript/reference/advanced-markers#PinElementOptions): `background`, `borderColor`, `glyph`, `glyphColor`, `scale`). `children` wins; omit both for the default pin.
- **Handlers:** `onClick` (fires only when `gmpClickable`), `onDrag`, `onDragStart`, `onDragEnd`. **`preventLoad`.**

```tsx
<AdvancedMarker position={p} gmpClickable onClick={() => open(p)}>
  <div className="bubble">Hi</div>
</AdvancedMarker>

<AdvancedMarker position={p} pin={{ background: '#1a73e8', glyph: '7' }} />
```

### OverlayView

[`google.maps.OverlayView`](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView). Anchors arbitrary DOM to a coordinate — works on any map (no Map ID required).

| Prop                         | Description                                                                                                               | Default                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------ | :--------------------- |
| `lat`, `lng`                 | Position.                                                                                                                 | —                      |
| `render(ref)`                | Returns the element; attach the given `ref` to it.                                                                        | —                      |
| `mapPaneLayer?`              | Which [pane](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes) to render into. | `'overlayMouseTarget'` |
| `preventMapHits?`            | Stop clicks bubbling to the map.                                                                                          | `false`                |
| `preventMapHitsAndGestures?` | Stop clicks, drags and wheel from reaching the map.                                                                       | `false`                |

```tsx
<OverlayView lat={0} lng={0} render={(ref) => <Pin ref={ref} />} />
```

### Marker

> ⚠️ **Deprecated by Google** — use [`AdvancedMarker`](#advancedmarker).

[`google.maps.Marker`](https://developers.google.com/maps/documentation/javascript/reference/marker#Marker). Settable [`MarkerOptions`](https://developers.google.com/maps/documentation/javascript/reference/marker#MarkerOptions) as props (`position`, `icon`, `label`, `draggable`, …) + handlers. **`defaultOptions`** (creation-only): `anchorPoint`, `collisionBehavior`, `crossOnDrag`, `optimized`.

### Shapes

`Polygon`, `Polyline`, `Circle`, `Rectangle` — settable options of the matching
`google.maps` class as props, plus mouse/drag handlers and the shape's
`on*Changed` events.

| Component   | Key props                                                                | Reference                                                                                            |
| :---------- | :----------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------- |
| `Polygon`   | `paths`, `editable`, `draggable`, …                                      | [Polygon](https://developers.google.com/maps/documentation/javascript/reference/polygon#Polygon)     |
| `Polyline`  | `path`, `editable`, `draggable`, …                                       | [Polyline](https://developers.google.com/maps/documentation/javascript/reference/polygon#Polyline)   |
| `Circle`    | `center`, `radius`, `editable`, … (`onRadiusChanged`, `onCenterChanged`) | [Circle](https://developers.google.com/maps/documentation/javascript/reference/polygon#Circle)       |
| `Rectangle` | `bounds`, `editable`, … (`onBoundsChanged`)                              | [Rectangle](https://developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle) |

### Layers

Toggle layers — render them inside `GoogleMap` to show, unmount to hide.

| Component                 | Notes                                                                                                                                                                                                                                                                                                                  |
| :------------------------ | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `TrafficLayer`            | `autoRefresh?` prop. [ref](https://developers.google.com/maps/documentation/javascript/reference/map#TrafficLayer)                                                                                                                                                                                                     |
| `TransitLayer`            | No props. [ref](https://developers.google.com/maps/documentation/javascript/reference/map#TransitLayer)                                                                                                                                                                                                                |
| `BicyclingLayer`          | No props. [ref](https://developers.google.com/maps/documentation/javascript/reference/map#BicyclingLayer)                                                                                                                                                                                                              |
| `StreetViewCoverageLayer` | No props. `preventLoad`. [ref](https://developers.google.com/maps/documentation/javascript/reference/street-view#StreetViewCoverageLayer)                                                                                                                                                                              |
| `KmlLayer` ⚠️             | `url` + handlers (`onClick`, `onStatusChanged`, `onDefaultviewportChanged`). `defaultOptions`: `preserveViewport`, `screenOverlays`, `suppressInfoWindows`. **Deprecated by Google** — convert KML to GeoJSON and use the [Data layer](https://developers.google.com/maps/documentation/javascript/datalayer) instead. |

### FeatureLayer

[Data-driven styling](https://developers.google.com/maps/documentation/javascript/dds-boundaries/overview). Requires a vector map whose **Map ID** has the feature type enabled.

| Prop          | Description                                                                                                                          |
| :------------ | :----------------------------------------------------------------------------------------------------------------------------------- |
| `featureType` | The [`FeatureType`](https://developers.google.com/maps/documentation/javascript/reference/data-driven-styling#FeatureType) to style. |
| `style?`      | A `FeatureStyleOptions` (same for all) or a `FeatureStyleFunction` (per-feature).                                                    |
| `onClick?`    | Receives a `FeatureMouseEvent`.                                                                                                      |

```tsx
<FeatureLayer
  featureType={google.maps.FeatureType.LOCALITY}
  style={{ strokeColor: '#810FCB', fillColor: '#810FCB', fillOpacity: 0.2 }}
/>
```

### DrawingManager

[`google.maps.drawing.DrawingManager`](https://developers.google.com/maps/documentation/javascript/reference/drawing#DrawingManager). `drawingMode` + [`DrawingManagerOptions`](https://developers.google.com/maps/documentation/javascript/reference/drawing#DrawingManagerOptions) as props, plus the `on*Complete` handlers (`onPolygonComplete`, `onMarkerComplete`, …). **`preventLoad`.**

## Hooks

### useGoogleMap

```ts
const useGoogleMap: () => google.maps.Map;
```

The map instance from the nearest [`GoogleMap`](#googlemap).

### usePane

```ts
const usePane: (pane: keyof google.maps.MapPanes) => Element;
```

A specific [map pane](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes) — handy for portals. Must be used inside a `GoogleMap`.

### useGoogleMapsLoad / useGoogleMapsCompletion

```ts
// load (or await) the script / specific libraries; Suspense-based
function useGoogleMapsLoad<L extends GoogleMapsLibrary>(
  library: L
): GoogleMapsLibraries[L];
function useGoogleMapsLoad<const A extends GoogleMapsLibrary[]>(
  ...libraries: A
): { [I in keyof A]: GoogleMapsLibraries[A[I]] };
```

`useGoogleMapsLoad` triggers loading; `useGoogleMapsCompletion` only awaits an
existing load. Both work only inside a `Suspense` boundary.

### useGoogleMapsStatus

```ts
const useGoogleMapsStatus: (
  library?: GoogleMapsLibrary
) => 'none' | 'loading' | 'loaded' | 'error';
```

The load status of the script or a specific library. Does not trigger loading.

### useMarkerCluster

Moved to [`use-marker-cluster`](https://www.npmjs.com/package/use-marker-cluster).

## License

MIT © [Krombik](https://github.com/Krombik)
