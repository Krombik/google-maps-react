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
} from 'google-maps-js-api-react';

const GoogleMap = createGoogleMapComponent([], []);

const Marker = createMarkerComponent(['onClick'], ['position']);

const Map = () => {
  const status = useGoogleMapLoader({ apiKey: API_KEY });

  if (status === LoaderStatus.LOADED)
    return (
      <GoogleMap
        style={style}
        defaultOptions={{ center: { lat: 0, lng: 0 }, zoom: 3 }}
      >
        <Marker position={{ lat: -31.56391, lng: 147.154312 }} />
        <OverlayView lat={-37.75} lng={145.116667}>
          dot
        </OverlayView>
      </GoogleMap>
    );

  return null;
};
```

#### Why is `createGoogleMapComponent` overwise just `GoogleMap`?

This is because Google maps has a lot of events and properties that can depend on each other (e.g. `zoom` and `onZoomChanged`) and it can be costly (or impossible) to make them controllable/uncontrollable, much easier to define handlers and properties that you need, and process only those.

> Note: if you use createGoogleMapComponent([], ['zoom']), it not means that `map zoom` can be only the value which will be provided by `zoom` prop (like `value` prop in `input` component), it means that if `zoom` prop was changed, `map zoom` will be changed to

## API

### useGoogleMapLoader

```ts
const useGoogleMapLoader: (
  options?: LoaderOptions,
  callbacks: Partial<GoogleMapLoaderCallbacks> = {}
) => LoaderStatus;
```

Hook for google maps script loading

> This library use [google-maps-js-api-loader](https://github.com/Krombik/google-map-loader) for Google Maps JavaScript API loading, you can import `Loader` if you need to start loading outside of react.

| Name         | Type                                                                                | Description                                                                        | Default |
| :----------- | :---------------------------------------------------------------------------------- | :--------------------------------------------------------------------------------- | :------ |
| `options?`   | [LoaderOptions](https://github.com/Krombik/google-maps-js-api-loader#loaderoptions) | loader options, if you already started script loading, you can skip this parameter |         |
| `callbacks?` | `GoogleMapLoaderCallbacks`                                                          | callbacks for successful/unsuccessful script loading                               | {}      |

---

### GoogleMapLoader

```ts
const GoogleMapLoader: FC<
  {
    options: LoaderOptions;
  } & Partial<GoogleMapLoaderCallbacks>
>;
```

Context provider which use [useGoogleMapLoader](#usegooglemaploader) under the hood

---

### useGoogleMapStatus

```ts
const useGoogleMapStatus: () => LoaderStatus;
```

returns context of [GoogleMapLoader](#googlemaploader)

---

### createGoogleMapComponent

```ts
const createGoogleMapComponent: (
  handlers: (
    | 'onClick'
    | 'onDoubleClick'
    | 'onDrag'
    | 'onDragEnd'
    | 'onDragStart'
    | 'onContextMenu'
    | 'onMouseMove'
    | 'onMouseOut'
    | 'onMouseOver'
    | 'onRightClick'
    | 'onBoundsChanged'
    | 'onCenterChanged'
    | 'onHeadingChanged'
    | 'onIdle'
    | 'onMapTypeIdChanged'
    | 'onProjectionChanged'
    | 'onResize'
    | 'onTilesLoaded'
    | 'onTiltChanged'
    | 'onZoomChanged'
  )[],
  state: (
    | 'center'
    | 'heading'
    | 'mapTypeId'
    | 'tilt'
    | 'zoom'
    | 'clickableIcons'
    | 'streetView'
  )[]
) => VFC<{
  className?: string;
  style?: CSSProperties;
  defaultOptions?: Readonly<google.maps.MapOptions>;
  children?: ReactNode | ((map: google.maps.Map) => ReactNode);

  center: google.maps.LatLng | google.maps.LatLngLiteral;
  heading: number;
  mapTypeId: string;
  tilt: number;
  zoom: number;
  clickableIcons: boolean;
  streetView: google.maps.StreetViewPanorama;

  onBoundsChanged(bounds: google.maps.LatLngBounds, map: google.maps.Map): void;
  onCenterChanged(center: google.maps.LatLng, map: google.maps.Map): void;
  onClick(
    e: google.maps.MapMouseEvent | google.maps.IconMouseEvent,
    map: google.maps.Map
  ): void;
  onContextMenu(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onDoubleClick(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onDrag(map: google.maps.Map): void;
  onDragEnd(map: google.maps.Map): void;
  onDragStart(map: google.maps.Map): void;
  onHeadingChanged(heading: number, map: google.maps.Map): void;
  onIdle(map: google.maps.Map): void;
  onMapTypeIdChanged(mapTypeId: string, map: google.maps.Map): void;
  onMouseMove(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onMouseOut(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onMouseOver(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onProjectionChanged(
    projection: google.maps.Projection,
    map: google.maps.Map
  ): void;
  onResize(map: google.maps.Map): void;
  onRightClick(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onTilesLoaded(map: google.maps.Map): void;
  onTiltChanged(tilt: number, map: google.maps.Map): void;
  onZoomChanged(zoom: number, map: google.maps.Map): void;
}>;
```

creates GoogleMap component, for details see [example](#example)

---

### useGoogleMap

```ts
const useGoogleMap: () => google.maps.Map;
```

Context of [GoogleMap](#creategooglemapcomponent) component

---

### createMarkerComponent

```ts
const createMarkerComponent: (
  handlers: (
    | 'onClick'
    | 'onDoubleClick'
    | 'onDrag'
    | 'onDragEnd'
    | 'onDragStart'
    | 'onContextMenu'
    | 'onMouseOut'
    | 'onMouseOver'
    | 'onRightClick'
    | 'onAnimationChanged'
    | 'onClickableChanged'
    | 'onCursorChanged'
    | 'onDraggableChanged'
    | 'onFlatChanged'
    | 'onIconChanged'
    | 'onMouseDown'
    | 'onMouseUp'
    | 'onPositionChanged'
    | 'onShapeChanged'
    | 'onTitleChanged'
    | 'onVisibleChanged'
    | 'onZIndexChanged'
  )[],
  state: (
    | 'animation'
    | 'clickable'
    | 'cursor'
    | 'draggable'
    | 'icon'
    | 'label'
    | 'opacity'
    | 'position'
    | 'shape'
    | 'title'
    | 'visible'
    | 'zIndex'
  )[]
) => VFC<{
  defaultOptions?: Readonly<google.maps.MarkerOptions>;

  animation: google.maps.Animation;
  clickable: boolean;
  cursor: string;
  draggable: boolean;
  icon: string | google.maps.Icon | google.maps.Symbol;
  label: string | google.maps.MarkerLabel;
  opacity: number;
  position: google.maps.LatLng | google.maps.LatLngLiteral;
  shape: google.maps.MarkerShape;
  title: string;
  visible: boolean;
  zIndex: number;

  onAnimationChanged(
    animation: google.maps.Animation,
    marker: google.maps.Marker
  ): void;
  onClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onClickableChanged(clickable: boolean, marker: google.maps.Marker): void;
  onContextMenu(e: google.maps.MapMouseEvent): void;
  onCursorChanged(cursor: string, marker: google.maps.Marker): void;
  onDoubleClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDrag(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDragEnd(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDraggableChanged(draggable: boolean, marker: google.maps.Marker): void;
  onDragStart(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onFlatChanged(marker: google.maps.Marker): void;
  onIconChanged(
    icon: string | google.maps.Icon | google.maps.Symbol,
    marker: google.maps.Marker
  ): void;
  onMouseDown(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseOut(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseOver(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseUp(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onPositionChanged(
    position: google.maps.LatLngLiteral,
    marker: google.maps.Marker
  ): void;
  onRightClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onShapeChanged(
    shape: google.maps.MarkerShape,
    marker: google.maps.Marker
  ): void;
  onTitleChanged(title: string, marker: google.maps.Marker): void;
  onVisibleChanged(visible: boolean, marker: google.maps.Marker): void;
  onZIndexChanged(zIndex: number, marker: google.maps.Marker): void;
}>;
```

creates Marker component, for details see [example](#example)

---

### OverlayView

```ts
const OverlayView: FC<{
  mapPaneLayer?: keyof google.maps.MapPanes = 'overlayLayer';
  onAdd?: () => void;
  onDraw?: (x: number, y: number) => void;
  onRemove?: () => void;
  lat: number;
  lng: number;
}>;
```

[OverlayView](https://developers.google.com/maps/documentation/javascript/reference/overlay-view) implementation

---

### useAutocompleteService

```ts
const useAutocompleteService: () =>
  | google.maps.places.AutocompleteService
  | undefined;
```

returns `undefined` if google.maps is not loaded yet, throws error if loading is not started or if `places` not included to libraries in loader options

---

### useMarkerCluster

```ts
const useMarkerCluster: <T>(
  points: T[],
  options: UseMarkerClusterOptions<T>
) => {
  handleBoundsChange: (
    bounds: google.maps.LatLngBounds,
    map: google.maps.Map
  ) => void;
  getPoints:
    | (<M, C>(
        markerMapper: MarkerMapper<T, M>,
        clusterMapper: ClusterMapper<C>,
        extend?: number | undefined
      ) => (M | C)[])
    | undefined;
  markerCluster: MarkerCluster<T>;
};
```

| Name        | Description                                                                                                                                                                                                                                                                                          |
| :---------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `points`    | pints to clustering                                                                                                                                                                                                                                                                                  |
| `getLngLat` | same to `getLngLat` param of [marker-cluster constructor](https://github.com/Krombik/marker-cluster#constructor)                                                                                                                                                                                     |
| `options`   | same to `options` param of [marker-cluster constructor](https://github.com/Krombik/marker-cluster#constructor), but also includes `asyncMode`, it detects which method to use: [load](https://github.com/Krombik/marker-cluster#load) or [load](https://github.com/Krombik/marker-cluster#loadasync) |

#### returns

| Name                 | Description                                                                                                                                                                                                                          |
| :------------------- | :----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `handleBoundsChange` | method which should be passed to [GoogleMap](#creategooglemapcomponent) `onBoundsChanged` prop, by default not wrapped in any method, but better to wrap it in `throttle` method, to avoid a lot of rerenders during bounds changing |
| `getPoints`          | method to get points in current zoom and bounds                                                                                                                                                                                      |
| `markerCluster`      | [marker-cluster](https://github.com/Krombik/marker-cluster) instance                                                                                                                                                                 |

---

## License

MIT © [Krombik](https://github.com/Krombik)
