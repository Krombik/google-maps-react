# google-maps-js-api-react

> This library use [Suspense](https://react.dev/reference/react/Suspense), so it requires React v18 or later.

This package provides a simple and efficient way to work with the Google Maps API, enabling map-based applications to be built with ease. With minimal setup, Google Maps functionality can be integrated into React applications using the components and hooks provided by this package. The package is designed to be fast, lightweight, and tree-shakeable, providing a performant solution for integrating Google Maps into React applications.

## Installation

using npm:

```
npm i --save google-maps-js-api-react google-maps-js-api-loader && npm install --save-dev @types/google.maps
```

or yarn:

```
yarn add i google-maps-js-api-react google-maps-js-api-loader && yarn add -D @types/google.maps
```

or pnpm:

```
pnpm add i google-maps-js-api-react google-maps-js-api-loader && pnpm add -D @types/google.maps
```

---

## Example

```tsx
import { GoogleMap, Marker, OverlayView } from 'google-maps-js-api-react';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import { useCallback } from 'react';

GoogleMapsLoader({ apiKey: API_KEY }, { defer: true });

const Map = () => {
  const handleClick = useCallback(() => console.log('clicked'), []);

  return (
    <GoogleMap
      defaultOptions={{
        center: { lat: -31.56391, lng: 147.154312 },
        zoom: 6,
      }}
    >
      <Marker
        position={{ lat: -31.56391, lng: 147.154312 }}
        onClick={handleClick}
      />
      <OverlayView
        lat={-37.75}
        lng={145.116667}
        preventMapHits
        render={(ref) => (
          <div ref={ref} style={{ background: 'red' }} onClick={handleClick}>
            dot
          </div>
        )}
      />
    </GoogleMap>
  );
};
```

> **All components (except [OverlayView](#overlayview)) is not designed to implement "controlled" React logic.** For instance, consider the following example:
>
> ```jsx
> const Map = () => {
>   const [zoom, setZoom] = useState(5);
>
>   return <GoogleMap zoom={zoom} />;
> };
> ```
>
> Here, the zoom level of the map is not limited to `5` and can be modified by the user. However, if the value of the zoom variable is changed, the zoom level of the map will also be modified accordingly.

## API

- [Components](#components)
  - [GoogleMap](#googlemap)
  - [OverlayView](#overlayview)
  - [Marker](#marker)
  - [Polygon](#polygon)
  - [Polyline](#polyline)
  - [Circle](#circle)
  - [Rectangle](#rectangle)
  - [DrawingManager](#drawingmanager)
  - [HeatmapLayer](#heatmaplayer)
- [Hooks](#hooks)
  - [useGoogleMap](#usegooglemap)
  - [usePane](#usepane)
  - [useGoogleMapsLoad](#usegooglemapsload)
  - [useGoogleMapsCompletion](#usegooglemapscompletion)
  - [useGoogleMapsStatus](#usegooglemapsstatus)
  - [useMarkerCluster](#usemarkercluster)

## Components

### GoogleMap

[Map](https://developers.google.com/maps/documentation/javascript/reference/map#Map) implementation

> It creates instance of [Map](https://developers.google.com/maps/documentation/javascript/reference/map#Map) only once and will reuse this instance whenever possible, avoiding unnecessary reinitialization

```ts
type GoogleMapProps = {
  onBoundsChanged?(
    this: google.maps.Map,
    bounds: google.maps.LatLngBounds
  ): void;
  onCenterChanged?(this: google.maps.Map, center: google.maps.LatLng): void;
  onDrag?(this: google.maps.Map): void;
  onDragEnd?(this: google.maps.Map): void;
  onDragStart?(this: google.maps.Map): void;
  onHeadingChanged?(this: google.maps.Map, heading: number): void;
  onIdle?(this: google.maps.Map): void;
  onMapTypeIdChanged?(this: google.maps.Map, mapTypeId: string): void;
  onProjectionChanged?(
    this: google.maps.Map,
    projection: google.maps.Projection
  ): void;
  onResize?(this: google.maps.Map): void;
  onTilesLoaded?(this: google.maps.Map): void;
  onTiltChanged?(this: google.maps.Map, tilt: number): void;
  onZoomChanged?(this: google.maps.Map, zoom: number): void;
  onClick?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onContextMenu?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onDoubleClick?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseDown?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseUp?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseMove?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOut?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOver?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onRightClick?(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  center?: google.maps.LatLng | google.maps.LatLngLiteral;
  clickableIcons?: boolean;
  heading?: number;
  mapTypeId?: string;
  streetView?: google.maps.StreetViewPanorama;
  zoom?: number;
  defaultOptions?: google.maps.MapOptions;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  preventLoad?: boolean;
};

const GoogleMap: React.ForwardRefExoticComponent<
  GoogleMapProps & React.RefAttributes<google.maps.Map>
>;
```

---

### OverlayView

```ts
type OverlayViewProps = {
  mapPaneLayer?: keyof google.maps.MapPanes;
  preventMapHitsAndGestures?: boolean;
  preventMapHits?: boolean;
  lat: number;
  lng: number;
  render(ref: React.RefCallback<HTMLElement>): React.ReactElement;
};

const OverlayView: FC<OverlayViewProps>;
```

[OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView) implementation

| Name                         | Description                                                                                                                                                                           | Default                |
| :--------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | :--------------------- |
| `mapPaneLayer?`              | see [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)                                                                               | `'overlayMouseTarget'` |
| `preventMapHits?`            | stops click or tap on the element from bubbling up to the map. Use this to prevent the map from triggering `"click"` events                                                           | `false`                |
| `preventMapHitsAndGestures?` | stops click, tap, drag, and wheel events on the element from bubbling up to the map. Use this to prevent map dragging and zooming, as well as map `"click"` events                    | `false`                |
| `render`                     | [render](https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop) prop, a function that returns a React element and provides the ability to attach `ref` to it |                        |

```jsx
const SomeComponent = forwardRef(({ children }, ref) => (
  <div ref={ref}>{children}</div>
));

const AnotherComponent = () => {
  return (
    <OverlayView
      lat={0}
      lng={0}
      render={(ref) => <SomeComponent ref={ref}>hi</SomeComponent>}
    />
  );
};
```

---

### Marker

[Marker](https://developers.google.com/maps/documentation/javascript/reference/marker#Marker) implementation

```ts
type MarkerProps = {
  onAnimationChanged?(
    this: google.maps.Marker,
    animation: google.maps.Animation
  ): void;
  onClickableChanged?(this: google.maps.Marker, clickable: boolean): void;
  onCursorChanged?(this: google.maps.Marker, cursor: string): void;
  onDraggableChanged?(this: google.maps.Marker, draggable: boolean): void;
  onFlatChanged?(this: google.maps.Marker): void;
  onIconChanged?(
    this: google.maps.Marker,
    icon: string | google.maps.Icon | google.maps.Symbol
  ): void;
  onPositionChanged?(
    this: google.maps.Marker,
    position: google.maps.LatLng
  ): void;
  onShapeChanged?(
    this: google.maps.Marker,
    shape: google.maps.MarkerShape
  ): void;
  onTitleChanged?(this: google.maps.Marker, title: string): void;
  onVisibleChanged?(this: google.maps.Marker, visible: boolean): void;
  onZIndexChanged?(this: google.maps.Marker, zIndex: number): void;
  onClick?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onContextMenu?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDoubleClick?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDrag?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDragEnd?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDragStart?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseDown?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseMove?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOut?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOver?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseUp?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onRightClick?(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  animation?: google.maps.Animation;
  clickable?: boolean;
  cursor?: string;
  draggable?: boolean;
  icon?: string | google.maps.Icon | google.maps.Symbol;
  label?: string | google.maps.MarkerLabel;
  opacity?: number;
  position?: google.maps.LatLngLiteral | google.maps.LatLng;
  shape?: google.maps.MarkerShape;
  title?: string;
  visible?: boolean;
  zIndex?: number;
  defaultOptions?: google.maps.MarkerOptions;
};

const Marker: React.ForwardRefExoticComponent<
  MarkerProps & React.RefAttributes<google.maps.Marker>
>;
```

---

### Polygon

[Polygon](https://developers.google.com/maps/documentation/javascript/reference/polygon#Polygon) implementation

```ts
type PolygonProps = {
  onClick?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onContextMenu?(
    this: google.maps.Polygon,
    e: google.maps.PolyMouseEvent
  ): void;
  onDoubleClick?(
    this: google.maps.Polygon,
    e: google.maps.PolyMouseEvent
  ): void;
  onMouseDown?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseMove?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseOut?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseOver?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseUp?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onRightClick?(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onDrag?(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
  onDragEnd?(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
  onDragStart?(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
  draggable?: boolean;
  editable?: boolean;
  paths?: any[] | google.maps.MVCArray<any>;
  visible?: boolean;
  defaultOptions?: google.maps.PolygonOptions;
};

const Polygon: React.ForwardRefExoticComponent<
  PolygonProps & React.RefAttributes<google.maps.Polygon>
>;
```

---

### Polyline

[Polyline](https://developers.google.com/maps/documentation/javascript/reference/polygon#Polyline) implementation

```ts
type PolylineProps = {
  onClick?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onContextMenu?(
    this: google.maps.Polyline,
    e: google.maps.PolyMouseEvent
  ): void;
  onDoubleClick?(
    this: google.maps.Polyline,
    e: google.maps.PolyMouseEvent
  ): void;
  onMouseDown?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseMove?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseOut?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseOver?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseUp?(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onRightClick?(
    this: google.maps.Polyline,
    e: google.maps.PolyMouseEvent
  ): void;
  onDrag?(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
  onDragEnd?(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
  onDragStart?(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
  draggable?: boolean;
  editable?: boolean;
  path?:
    | google.maps.MVCArray<google.maps.LatLng>
    | Array<google.maps.LatLngLiteral | google.maps.LatLng>;
  visible?: boolean;
  defaultOptions?: google.maps.PolylineOptions;
};

const Polyline: React.ForwardRefExoticComponent<
  PolygonProps & React.RefAttributes<google.maps.Polyline>
>;
```

---

### Circle

[Circle](https://developers.google.com/maps/documentation/javascript/reference/polygon#Circle) implementation

```ts
type CircleProps = {
  onCenterChanged?(this: google.maps.Circle, center: google.maps.LatLng): void;
  onRadiusChanged?(this: google.maps.Circle, radius: number): void;
  onClick?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onContextMenu?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDoubleClick?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDrag?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDragEnd?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDragStart?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseDown?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseMove?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseOut?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseOver?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseUp?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onRightClick?(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  center?: google.maps.LatLngLiteral | google.maps.LatLng;
  draggable?: boolean;
  editable?: boolean;
  radius?: number;
  visible?: boolean;
  defaultOptions?: google.maps.CircleOptions;
};

const Circle: React.ForwardRefExoticComponent<
  CircleProps & React.RefAttributes<google.maps.Circle>
>;
```

---

### Rectangle

[Rectangle](https://developers.google.com/maps/documentation/javascript/reference/polygon#Rectangle) implementation

```ts
type RectangleProps = {
  onBoundsChanged?(
    this: google.maps.Rectangle,
    bounds: google.maps.LatLngBounds
  ): void;
  onClick?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onContextMenu?(
    this: google.maps.Rectangle,
    e: google.maps.MapMouseEvent
  ): void;
  onDoubleClick?(
    this: google.maps.Rectangle,
    e: google.maps.MapMouseEvent
  ): void;
  onDrag?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onDragEnd?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onDragStart?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseDown?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseMove?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseOut?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseOver?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseUp?(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onRightClick?(
    this: google.maps.Rectangle,
    e: google.maps.MapMouseEvent
  ): void;
  bounds?: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
  draggable?: boolean;
  editable?: boolean;
  visible?: boolean;
  defaultOptions?: google.maps.RectangleOptions;
};

const Rectangle: React.ForwardRefExoticComponent<
  RectangleProps & React.RefAttributes<google.maps.Rectangle>
>;
```

---

### DrawingManager

[DrawingManager](https://developers.google.com/maps/documentation/javascript/reference/drawing#DrawingManager) implementation

```ts
type DrawingManagerProps = {
  onCircleComplete?(
    this: google.maps.drawing.DrawingManager,
    circle: google.maps.Circle
  ): void;
  onMarkerComplete?(
    this: google.maps.drawing.DrawingManager,
    marker: google.maps.Marker
  ): void;
  onOverlayComplete?(
    this: google.maps.drawing.DrawingManager,
    event: google.maps.drawing.OverlayCompleteEvent
  ): void;
  onPolygonComplete?(
    this: google.maps.drawing.DrawingManager,
    polygon: google.maps.Polygon
  ): void;
  onPolylineComplete?(
    this: google.maps.drawing.DrawingManager,
    polyline: google.maps.Polyline
  ): void;
  onRectangleComplete?(
    this: google.maps.drawing.DrawingManager,
    rectangle: google.maps.Rectangle
  ): void;
  drawingMode?: google.maps.drawing.OverlayType;
  defaultOptions?: google.maps.drawing.DrawingManagerOptions;
  preventLoad?: boolean;
};

const DrawingManager: React.ForwardRefExoticComponent<
  DrawingManagerProps & React.RefAttributes<google.maps.drawing.DrawingManager>
>;
```

### HeatmapLayer

[HeatmapLayer](https://developers.google.com/maps/documentation/javascript/reference/visualization#HeatmapLayer) implementation

```ts
type HeatmapLayerProps = {
  data?:
    | google.maps.MVCArray<
        google.maps.LatLng | google.maps.visualization.WeightedLocation
      >
    | Array<google.maps.LatLng | google.maps.visualization.WeightedLocation>;
  defaultOptions?: google.maps.visualization.HeatmapLayerOptions;
  preventLoad?: boolean;
};

const HeatmapLayer: React.ForwardRefExoticComponent<
  HeatmapLayerProps &
    React.RefAttributes<google.maps.visualization.HeatmapLayer>
>;
```

---

## Hooks

### useGoogleMap

```ts
const useGoogleMap: () => google.maps.Map;
```

Context of [GoogleMap](#googlemap) component

---

### usePane

```ts
const usePane: (pane: keyof google.maps.MapPanes) => Element;
```

Hook to retrieve a specific pane from [GoogleMap](#googlemap), useful to creating portals

```tsx
const ZoomButton = () => {
  const map = useGoogleMap();

  return createPortal(
    usePane('overlayMouseTarget'),
    <button
      onClick={() => {
        map.setZoom(7);
      }}
    >
      zoom
    </button>
  );
};

const Map = () => (
  <GoogleMap>
    <ZoomButton />
  </GoogleMap>
);
```

---

### useGoogleMapsLoad

```ts
const useGoogleMapsLoad: {
  (): void;
  <L extends keyof GoogleMapsLibraries>(library: L): GoogleMapsLibraries[L];
  <const A extends (keyof GoogleMapsLibraries)[]>(
    ...libraries: A
  ): {
    [Index in keyof A]: GoogleMapsLibraries[A[Index]];
  };
};
```

Hook for loading google maps script or specific library/libraries

> Works only for [Suspense](https://react.dev/reference/react/Suspense) wrapped components

---

### useGoogleMapsCompletion

```ts
const useGoogleMapsCompletion: {
  (): void;
  <L extends GoogleMapsLibrary>(library: L): GoogleMapsLibraries[L];
  <const A extends GoogleMapsLibrary[]>(
    ...libraries: A
  ): {
    [Index in keyof A]: GoogleMapsLibraries[A[Index]];
  };
};
```

Hook for awaiting loading of google.maps script or specific library/libraries

> Works only for [Suspense](https://react.dev/reference/react/Suspense) wrapped components

---

### useGoogleMapsStatus

```ts
const useGoogleMapsStatus: (
  library?: GoogleMapsLibrary
) => 'none' | 'loading' | 'loaded' | 'error';
```

Hook for getting status of google.maps script or specific library

> It not provokes loading of script/library

---

### useMarkerCluster

This hook has been moved to [use-marker-cluster](https://www.npmjs.com/package/use-marker-cluster) library

---

## License

MIT © [Krombik](https://github.com/Krombik)
