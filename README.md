# google-maps-js-api-react

> Note: This library requires React v16.8 or later.

Library for convenient work of Google Maps JavaScript API with React

## Example

```tsx
import {
  useGoogleMapLoader,
  createGoogleMapComponent,
  createMarkerComponent,
  OverlayView,
  LoaderStatus,
  Loader,
} from 'google-maps-js-api-react';

Loader.setOptions({ apiKey: API_KEY, defer: true });

const GoogleMap = createGoogleMapComponent([], []);

const Marker = createMarkerComponent(['onClick'], ['position']);

const Map = () => {
  const status = useGoogleMapLoader();

  if (status === LoaderStatus.LOADED)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{
          center: { lat: -31.56391, lng: 147.154312 },
          zoom: 6,
        }}
      >
        <Marker
          position={{ lat: -31.56391, lng: 147.154312 }}
          onClick={() => console.log('clicked')}
        />
        <OverlayView lat={-37.75} lng={145.116667} preventMapHits>
          <div
            style={{ background: 'red' }}
            onClick={() => console.log('clicked')}
          >
            dot
          </div>
        </OverlayView>
      </GoogleMap>
    );

  return null;
};
```

## API

- [createComponent](#createcomponent)
  - [GoogleMap](#googlemap)
  - [Marker](#marker)
  - [Polygon](#polygon)
  - [Polyline](#polyline)
  - [Circle](#circle)
  - [Rectangle](#rectangle)
  - [DrawingManager](#drawingmanager)
  - [HeatmapLayer](#heatmaplayer)
- [Components](#components)
  - [OverlayView](#overlayview)
- [Hooks](#hooks)
  - [useGoogleMap](#usegooglemap)
  - [useGoogleMapLoader](#usegooglemaploader)
  - [useMarkerCluster](#usemarkercluster)
  - [useService](#useservice)
    - [useAutocompleteService](#useautocompleteservice)
    - [useDirectionService](#usedirectionservice)
    - [useDistanceMatrixService](#usedistancematrixservice)
    - [useElevationService](#useelevationservice)
    - [useGeocoder](#usegeocoder)
    - [useMaxZoomService](#usemaxzoomservice)
    - [usePlacesService](#useplacesservice)
    - [useStreetViewService](#usestreetviewservice)

### createComponents

- **Q**: Why I should create components?

- **A**: Because Google maps has a lot of events and properties that can depend on each other (e.g. `zoom` and `onZoomChanged`) and it can be costly (or impossible) to make them controllable/uncontrollable, much easier to define handlers and properties that you need, and process only those.

- **Q**: How it works?

- **A**: Each `createComponent` takes 2 parameters: an array with the names of the handlers and an array with the names of the properties, the specified handler will be executed when the corresponding event is fired, the specified property will trigger corresponding value change if `prevProp !== currentProp`

- **Q**: I just want to pass default values, is it possible?

- **A**: Yes, just use `defaultOptions` prop

- **Q**: Can I get access to the instance?

- **A**: Yes, just pass `ref` to the component

> Note: if you use createGoogleMapComponent([], ['zoom']), it not means that `map zoom` can be only the value which will be provided by `zoom` prop (like `value` prop in `input` component), it means that if `zoom` prop was changed, `map zoom` will be changed to

---

### GoogleMap

```ts
type Handlers = {
  onBoundsChanged(
    this: google.maps.Map,
    bounds: google.maps.LatLngBounds
  ): void;
  onCenterChanged(this: google.maps.Map, center: google.maps.LatLng): void;
  onDrag(this: google.maps.Map): void;
  onDragEnd(this: google.maps.Map): void;
  onDragStart(this: google.maps.Map): void;
  onHeadingChanged(this: google.maps.Map, heading: number): void;
  onIdle(this: google.maps.Map): void;
  onMapTypeIdChanged(this: google.maps.Map, mapTypeId: string): void;
  onProjectionChanged(
    this: google.maps.Map,
    projection: google.maps.Projection
  ): void;
  onResize(this: google.maps.Map): void;
  onTilesLoaded(this: google.maps.Map): void;
  onTiltChanged(this: google.maps.Map, tilt: number): void;
  onZoomChanged(this: google.maps.Map, zoom: number): void;
  onClick(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onContextMenu(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onDoubleClick(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseDown(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseUp(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseMove(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onRightClick(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
};

type Props = {
  center: google.maps.LatLng | google.maps.LatLngLiteral;
  clickableIcons: boolean;
  heading: number;
  mapTypeId: string;
  streetView: google.maps.StreetViewPanorama;
  zoom: number;
};

type BaseProps = {
  className?: string;
  style?: CSSProperties;
  children?: React.ReactNode;
};

const createGoogleMapComponent: <
  H extends keyof Handlers,
  P extends keyof Props
>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  BaseProps & {
    defaultOptions?: google.maps.MapOptions;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Map>
>;
```

---

### Marker

```ts
type Handlers = {
  onAnimationChanged(
    this: google.maps.Marker,
    animation: google.maps.Animation
  ): void;
  onClickableChanged(this: google.maps.Marker, clickable: boolean): void;
  onCursorChanged(this: google.maps.Marker, cursor: string): void;
  onDraggableChanged(this: google.maps.Marker, draggable: boolean): void;
  onFlatChanged(this: google.maps.Marker): void;
  onIconChanged(
    this: google.maps.Marker,
    icon: string | google.maps.Icon | google.maps.Symbol
  ): void;
  onPositionChanged(
    this: google.maps.Marker,
    position: google.maps.LatLng
  ): void;
  onShapeChanged(
    this: google.maps.Marker,
    shape: google.maps.MarkerShape
  ): void;
  onTitleChanged(this: google.maps.Marker, title: string): void;
  onVisibleChanged(this: google.maps.Marker, visible: boolean): void;
  onZIndexChanged(this: google.maps.Marker, zIndex: number): void;
  onClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onContextMenu(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDoubleClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDrag(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDragStart(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseDown(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseMove(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseUp(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onRightClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
};

type Props = {
  animation: google.maps.Animation;
  clickable: boolean;
  cursor: string;
  draggable: boolean;
  icon: string | google.maps.Icon | google.maps.Symbol;
  label: string | google.maps.MarkerLabel;
  opacity: number;
  position: google.maps.LatLngLiteral | google.maps.LatLng;
  shape: google.maps.MarkerShape;
  title: string;
  visible: boolean;
  zIndex: number;
};

const createMarkerComponent: <H extends keyof Handlers, P extends keyof Props>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.MarkerOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Marker>
>;
```

---

### Polygon

```ts
type Handlers = {
  onClick(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onContextMenu(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onDoubleClick(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseDown(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseMove(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseOut(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseOver(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onMouseUp(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onRightClick(this: google.maps.Polygon, e: google.maps.PolyMouseEvent): void;
  onDrag(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
  onDragStart(this: google.maps.Polygon, e: google.maps.MapMouseEvent): void;
};

type Props = {
  draggable: boolean;
  editable: boolean;
  paths: any[] | google.maps.MVCArray<any>;
  visible: boolean;
};

const createPolygonComponent: <H extends keyof Handlers, P extends keyof Props>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.PolygonOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Polygon>
>;
```

---

### Polyline

```ts
type Handlers = {
  onClick(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onContextMenu(
    this: google.maps.Polyline,
    e: google.maps.PolyMouseEvent
  ): void;
  onDoubleClick(
    this: google.maps.Polyline,
    e: google.maps.PolyMouseEvent
  ): void;
  onMouseDown(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseMove(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseOut(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseOver(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onMouseUp(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onRightClick(this: google.maps.Polyline, e: google.maps.PolyMouseEvent): void;
  onDrag(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
  onDragStart(this: google.maps.Polyline, e: google.maps.MapMouseEvent): void;
};

type Props = {
  draggable: boolean;
  editable: boolean;
  path:
    | google.maps.MVCArray<google.maps.LatLng>
    | Array<google.maps.LatLngLiteral | google.maps.LatLng>;
  visible: boolean;
};

const createPolylineComponent: <
  H extends keyof Handlers,
  P extends keyof Props
>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.PolylineOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Polyline>
>;
```

---

### Circle

```ts
type Handlers = {
  onCenterChange(this: google.maps.Circle, center: google.maps.LatLng): void;
  onRadiusChange(this: google.maps.Circle, radius: number): void;
  onClick(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onContextMenu(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDoubleClick(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDrag(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onDragStart(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseDown(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseMove(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onMouseUp(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
  onRightClick(this: google.maps.Circle, e: google.maps.MapMouseEvent): void;
};

type Props = {
  center: google.maps.LatLngLiteral | google.maps.LatLng;
  draggable: boolean;
  editable: boolean;
  radius: number;
  visible: boolean;
};

const createCircleComponent: <H extends keyof Handlers, P extends keyof Props>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.CircleOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Circle>
>;
```

---

### Rectangle

```ts
type Handlers = {
  onBoundsChange(
    this: google.maps.Rectangle,
    bounds: google.maps.LatLngBounds
  ): void;
  onClick(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onContextMenu(
    this: google.maps.Rectangle,
    e: google.maps.MapMouseEvent
  ): void;
  onDoubleClick(
    this: google.maps.Rectangle,
    e: google.maps.MapMouseEvent
  ): void;
  onDrag(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onDragStart(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseDown(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseMove(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onMouseUp(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
  onRightClick(this: google.maps.Rectangle, e: google.maps.MapMouseEvent): void;
};

type Props = {
  bounds: google.maps.LatLngBounds | google.maps.LatLngBoundsLiteral;
  draggable: boolean;
  editable: boolean;
  visible: boolean;
};

const createRectangleComponent: <
  H extends keyof Handlers,
  P extends keyof Props
>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.RectangleOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.Rectangle>
>;
```

---

### DrawingManager

```ts
type Handlers = {
  onCircleComplete(
    this: google.maps.drawing.DrawingManager,
    circle: google.maps.Circle
  ): void;
  onMarkerComplete(
    this: google.maps.drawing.DrawingManager,
    marker: google.maps.Marker
  ): void;
  onOverlayComplete(
    this: google.maps.drawing.DrawingManager,
    event: google.maps.drawing.OverlayCompleteEvent
  ): void;
  onPolygonComplete(
    this: google.maps.drawing.DrawingManager,
    polygon: google.maps.Polygon
  ): void;
  onPolylineComplete(
    this: google.maps.drawing.DrawingManager,
    polyline: google.maps.Polyline
  ): void;
  onRectangleComplete(
    this: google.maps.drawing.DrawingManager,
    rectangle: google.maps.Rectangle
  ): void;
};

type Props = {
  drawingMode: google.maps.drawing.OverlayType;
};

const createDrawingManagerComponent: <
  H extends keyof Handlers,
  P extends keyof Props
>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.drawing.DrawingManagerOptions, 'map'>;
  } & Partial<Pick<Handlers, H>> &
    Pick<Props, P> &
    React.RefAttributes<google.maps.drawing.DrawingManager>
>;
```

### HeatmapLayer

```ts
type Props = {
  data:
    | google.maps.MVCArray<
        google.maps.LatLng | google.maps.visualization.WeightedLocation
      >
    | Array<google.maps.LatLng | google.maps.visualization.WeightedLocation>;
};

const createHeatmapLayerComponent: <H extends never, P extends keyof Props>(
  handlerNamesList: H[],
  propNamesList: P[]
) => React.ForwardRefExoticComponent<
  {
    defaultOptions?: Omit<google.maps.visualization.HeatmapLayerOptions, 'map'>;
  } & Pick<Props, P> &
    React.RefAttributes<google.maps.visualization.HeatmapLayer>
>;
```

---

### Components

### OverlayView

```ts
type OverlayViewProps = {
  mapPaneLayer?: keyof google.maps.MapPanes;
  onAdd?(): void;
  onDraw?(x: number, y: number): void;
  onRemove?(): void;
  preventMapHitsAndGestures?: boolean;
  preventMapHits?: boolean;
  children: ReactElement;
  lat: number;
  lng: number;
};

const OverlayView(props: OverlayViewProps) => React.ReactPortal | null;
```

[OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view) implementation

| Name                         | Description                                                                                                                                                        | Default                |
| :--------------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------- |
| `mapPaneLayer?`              | [see](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)                                                                 | `'overlayMouseTarget'` |
| `preventMapHits?`            | stops click or tap on the element from bubbling up to the map. Use this to prevent the map from triggering `"click"` events                                        | `false`                |
| `preventMapHitsAndGestures?` | stops click, tap, drag, and wheel events on the element from bubbling up to the map. Use this to prevent map dragging and zooming, as well as map `"click"` events | `false`                |
| `children`                   | a single child content element. **Needs to be able to hold a ref**                                                                                                 |                        |

```jsx
const SomeComponent = forwardRef(({ children }, ref) => (
  <div ref={ref}>{children}</div>
));

const AnotherComponent = () => {
  return (
    <OverlayView lat={0} lng={0} ref={ref}>
      <SomeComponent>hi</SomeComponent>
    </OverlayView>
  );
};
```

---

### Hooks

### useGoogleMap

```ts
const useGoogleMap: () => google.maps.Map;
```

Context of [GoogleMap](#googlemap) component

---

### useGoogleMapLoader

```ts
type Options = {
  onLoaded?(): void;
  onError?(err: ErrorEvent | Error): void;
};

const useGoogleMapLoader: {
  (
    options?: Options & {
      silent?: false;
    }
  ): LoaderStatus;
  (
    options: Options & {
      silent: true;
    }
  ): void;
};
```

Hook for google maps script loading

| Name      | Description                                                                   | Default |
| :-------- | :---------------------------------------------------------------------------- | :------ |
| `silent?` | if `true` - loading will be silently (not triggers rerender on loading/error) | `false` |

> Note: don't forgot to set options to `Loader`, like in [example](#example)

> This library use [google-maps-js-api-loader](https://github.com/Krombik/google-map-loader) for Google Maps JavaScript API loading, you can import `Loader` if you need to start loading outside of react.

---

### useMarkerCluster

```ts
const useMarkerCluster: <T>(
  points: T[],
  getLngLat(point: T) => [lng: number, lat: number],
  options?: UseMarkerClusterOptions
) => {
  getPoints<M, C>(
    markerMapper: MarkerMapper<T, M>,
    clusterMapper: ClusterMapper<C>,
    extend?: number
  )(M | C)[];
  onBoundsChange(this: google.maps.Map): void;
  markerCluster: MarkerCluster<T>;
};
```

| Name        | Description                                                                                                                                                                                                                                                                                          |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `points`    | pints to clustering                                                                                                                                                                                                                                                                                  |
| `getLngLat` | same to `getLngLat` param of [marker-cluster constructor](https://github.com/Krombik/marker-cluster#constructor)                                                                                                                                                                                     |
| `options?`  | same to `options` param of [marker-cluster constructor](https://github.com/Krombik/marker-cluster#constructor), but also includes `asyncMode`, it detects which method to use: [load](https://github.com/Krombik/marker-cluster#load) or [load](https://github.com/Krombik/marker-cluster#loadasync) |

returns

| Name             | Description                                                                                                                                                                                                           |
| :--------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `onBoundsChange` | method which should be passed to [GoogleMap](#googlemap) `onBoundsChanged` prop, by default not wrapped in any method, but better to wrap it in `throttle` method, to avoid a lot of rerenders during bounds changing |
| `getPoints`      | method to get points in current zoom and bounds                                                                                                                                                                       |
| `markerCluster`  | [marker-cluster](https://github.com/Krombik/marker-cluster) instance                                                                                                                                                  |

---

### useService

all hooks below implement google maps services, hooks can be called even if `google.maps` is not loaded yet, but methods themselves cannot be import until `google.maps` is loaded

```ts
const { geocode } = useGeocoder(); // throws error if google.maps not loaded yet

const geocoder = useGeocoder(); // no error will be throw

const fn = async () => {
  await Loader.completion;

  const res = await geocoder.geocode(someArg);
};
```

### useAutocompleteService

```ts
const useAutocompleteService: () => google.maps.places.AutocompleteService;
```

---

### useDirectionService

```ts
const useDirectionService: () => google.maps.places.DirectionsService;
```

---

### useDistanceMatrixService

```ts
const useDistanceMatrixService: () => google.maps.places.DistanceMatrixService;
```

---

### useElevationService

```ts
const useElevationService: () => google.maps.ElevationService;
```

---

### useGeocoder

```ts
const useGeocoder: () => google.maps.Geocoder;
```

---

### useMaxZoomService

```ts
const useMaxZoomService: () => google.maps.MaxZoomService;
```

---

### usePlacesService

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

```ts
const useStreetViewService: () => google.maps.StreetViewService;
```

---

## License

MIT © [Krombik](https://github.com/Krombik)
