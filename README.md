# google-maps-js-api-react

> This library requires React v16.8 or later.

This package provides a simple and efficient way to work with the Google Maps API, enabling map-based applications to be built with ease. With minimal setup, Google Maps functionality can be integrated into React applications using the components and hooks provided by this package. The package is designed to be fast, lightweight, and tree-shakeable, providing a performant solution for integrating Google Maps into React applications.

## Installation

using npm:

```
npm install --save google-maps-js-api-react && npm install --save-dev @types/google.maps
```

or yarn:

```
yarn add google-maps-js-api-react && yarn add @types/google.maps --dev
```

---

## Example

```tsx
import {
  useGoogleMapLoader,
  GoogleMap,
  Marker,
  OverlayView,
  GoogleMapsLoaderStatus,
  GoogleMapsLoader,
} from 'google-maps-js-api-react';
import { useCallback } from 'react';

GoogleMapsLoader.setOptions({ apiKey: API_KEY, defer: true });

const Map = () => {
  const status = useGoogleMapLoader();

  const handleClick = useCallback(() => console.log('clicked'), []);

  if (status === GoogleMapsLoaderStatus.LOADED) {
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
        <OverlayView lat={-37.75} lng={145.116667} preventMapHits>
          <div style={{ background: 'red' }} onClick={handleClick}>
            dot
          </div>
        </OverlayView>
      </GoogleMap>
    );
  }

  return null;
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
  - [useGoogleMapLoader](#usegooglemaploader)
  - [useMarkerCluster](#usemarkercluster)
  - [Service hooks](#service-hooks)
    - [useAutocompleteService](#useautocompleteservice)
    - [useDirectionService](#usedirectionservice)
    - [useDistanceMatrixService](#usedistancematrixservice)
    - [useElevationService](#useelevationservice)
    - [useGeocoder](#usegeocoder)
    - [useMaxZoomService](#usemaxzoomservice)
    - [usePlacesService](#useplacesservice)
    - [useStreetViewService](#usestreetviewservice)

## Components

### GoogleMap

[Map](https://developers.google.com/maps/documentation/javascript/reference/map#Map) implementation

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
  children: React.ReactElement;
  lat: number;
  lng: number;
};

const OverlayView: FC<OverlayViewProps>;
```

[OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#OverlayView) implementation

| Name                         | Description                                                                                                                                                        | Default                |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `mapPaneLayer?`              | see [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)                                                            | `'overlayMouseTarget'` |
| `preventMapHits?`            | stops click or tap on the element from bubbling up to the map. Use this to prevent the map from triggering `"click"` events                                        | `false`                |
| `preventMapHitsAndGestures?` | stops click, tap, drag, and wheel events on the element from bubbling up to the map. Use this to prevent map dragging and zooming, as well as map `"click"` events | `false`                |
| `children`                   | a single child content element. **Needs to be able to hold a ref**                                                                                                 |                        |

```jsx
const SomeComponent = forwardRef(({ children }, ref) => (
  <div ref={ref}>{children}</div>
));

const AnotherComponent = () => {
  return (
    <OverlayView lat={0} lng={0}>
      <SomeComponent>hi</SomeComponent>
    </OverlayView>
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
  onCenterChange?(this: google.maps.Circle, center: google.maps.LatLng): void;
  onRadiusChange?(this: google.maps.Circle, radius: number): void;
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
  onBoundsChange?(
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

### useGoogleMapLoader

```ts
enum GoogleMapsLoaderStatus {
  NONE = 0,
  LOADING = 1,
  LOADED = 2,
  ERROR = 3,
}

type Options = {
  onLoaded?(): void;
  onError?(err: ErrorEvent | Error): void;
};

const useGoogleMapsLoader: (options?: Options) => GoogleMapsLoaderStatus;
```

[google-maps-js-api-loader](https://github.com/Krombik/google-map-loader) implementation

Hook for google maps script loading

> Don't forgot to set options to `GoogleMapsLoader`, like in [example](#example)

> You can import `GoogleMapsLoader` if you need "silent" loading or loading outside of react.

---

### useMarkerCluster

This hook has been moved to [use-marker-cluster](https://www.npmjs.com/package/use-marker-cluster) library

---

## Service hooks

All hooks below implement google maps services, hooks can be called even if `google.maps` is not loaded yet, but methods themselves cannot be import until `google.maps` is loaded

```ts
const { geocode } = useGeocoder(); // throws error if google.maps not loaded yet

const geocoder = useGeocoder(); // no error will be throw

const fn = async () => {
  await Loader.completion;

  const res = await geocoder.geocode(someArg);
};
```

### useAutocompleteService

[AutocompleteService](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompleteService) implementation

```ts
const useAutocompleteService: () => google.maps.places.AutocompleteService;
```

---

### useDirectionService

[DirectionService](https://developers.google.com/maps/documentation/javascript/reference/directions#DirectionsService) implementation

```ts
const useDirectionService: () => google.maps.places.DirectionsService;
```

---

### useDistanceMatrixService

[DistanceMatrixService](https://developers.google.com/maps/documentation/javascript/reference/distance-matrix#DistanceMatrixService) implementation

```ts
const useDistanceMatrixService: () => google.maps.places.DistanceMatrixService;
```

---

### useElevationService

[ElevationService](https://developers.google.com/maps/documentation/javascript/reference/elevation#ElevationService) implementation

```ts
const useElevationService: () => google.maps.ElevationService;
```

---

### useGeocoder

[Geocoder](https://developers.google.com/maps/documentation/javascript/reference/geocoder#Geocoder) implementation

```ts
const useGeocoder: () => google.maps.Geocoder;
```

---

### useMaxZoomService

[MaxZoomService](https://developers.google.com/maps/documentation/javascript/reference/max-zoom#MaxZoomService) implementation

```ts
const useMaxZoomService: () => google.maps.MaxZoomService;
```

---

### usePlacesService

[PlacesService](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlacesService) implementation

```ts
const usePlacesService: (
  container?: null | HTMLElement | google.maps.Map | (() => HTMLElement)
) => google.maps.places.PlacesService;
```

| Name         | Description                                                                       | Default |
| :----------- | :-------------------------------------------------------------------------------- | :------ |
| `container?` | container to render the attributions for the results or function which returns it | `null`  |

---

### useStreetViewService

[StreetViewService](https://developers.google.com/maps/documentation/javascript/reference/street-view-service#StreetViewService) implementation

```ts
const useStreetViewService: () => google.maps.StreetViewService;
```

---

## License

MIT © [Krombik](https://github.com/Krombik)
