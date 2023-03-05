import Loader from 'google-maps-js-api-loader';
import {
  useCallback,
  RefCallback,
  ReactElement,
  RefAttributes,
  useContext,
  FC,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import PanesContext from '../context/PanesContext';
import useGoogleMap from '../hook/useGoogleMap';
import noop from '../utils/noop';
import setRef from '../utils/setRef';

type CoordsDeps = [lat: number, lng: number];

type Callbacks = [
  onAdd?: () => void,
  onDraw?: (x: number, y: number) => void,
  onRemove?: () => void
];

declare class __OverlayView extends google.maps.OverlayView {
  constructor(
    style: CSSStyleDeclaration,
    coords: CoordsDeps,
    callbacks: Callbacks,
    map: google.maps.Map
  );

  _setCallbacks(callbacks: Callbacks): void;

  _setCoords(coords: CoordsDeps): void;
}

let _OverlayView: typeof __OverlayView;

Loader.completion.then(() => {
  _OverlayView = class extends google.maps.OverlayView {
    private readonly _style: CSSStyleDeclaration;

    private _latLng: google.maps.LatLng;

    private _onDraw: (x: number, y: number) => void;

    constructor(
      style: CSSStyleDeclaration,
      coords: CoordsDeps,
      callbacks: Callbacks,
      map: google.maps.Map
    ) {
      super();

      style.position = 'absolute';

      this._style = style;

      this._latLng = new google.maps.LatLng(coords[0], coords[1]);

      this._setCallbacks(callbacks);

      this.setMap(map);
    }

    _setCallbacks(callbacks: Callbacks) {
      this.onAdd = callbacks[0] || noop;

      this._onDraw = callbacks[1] || noop;

      this.onRemove = callbacks[2] || noop;
    }

    _setCoords(coords: CoordsDeps) {
      this._latLng = new google.maps.LatLng(coords[0], coords[1]);

      this.draw();
    }

    draw() {
      const pos = this.getProjection().fromLatLngToDivPixel(this._latLng);

      if (pos) {
        const { x, y } = pos;

        const style = this._style;

        style.left = x + 'px';
        style.top = y + 'px';

        this._onDraw(x, y);
      }
    }
  };
});

export type OverlayViewProps = {
  /**
   * @see [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
   * @default 'overlayMouseTarget'
   */
  mapPaneLayer?: keyof google.maps.MapPanes;
  onAdd?(): void;
  onDraw?(x: number, y: number): void;
  onRemove?(): void;
  /**
   * stops click, tap, drag, and wheel events on the element from bubbling up to the map. Use this to prevent map dragging and zooming, as well as map `"click"` events
   */
  preventMapHitsAndGestures?: boolean;
  /**
   * stops click or tap on the element from bubbling up to the map. Use this to prevent the map from triggering `"click"` events
   */
  preventMapHits?: boolean;
  children: ReactElement & RefAttributes<HTMLElement>;
  lat: number;
  lng: number;
};

const OverlayView: FC<OverlayViewProps> = (props) => {
  const map = useGoogleMap();

  const data = useRef<{
    _overlay?: __OverlayView;
    _el?: HTMLElement;
    _isNotFirstRender?: boolean;
  }>({}).current;

  const coords: CoordsDeps = [props.lat, props.lng];

  const callbacks: Callbacks = [props.onAdd, props.onDraw, props.onRemove];

  const { children } = props;

  const outerRef = children.ref;

  const panes = useContext(PanesContext);

  useEffect(() => {
    if (data._isNotFirstRender && data._overlay) {
      data._overlay._setCallbacks(callbacks);
    }
  }, callbacks);

  useEffect(() => {
    if (data._overlay) {
      if (data._isNotFirstRender) {
        data._overlay._setCoords(coords);
      } else {
        data._isNotFirstRender = true;
      }
    }
  }, coords);

  const ref = useCallback<RefCallback<HTMLElement>>(
    (el) => {
      if (data._overlay) {
        data._overlay.setMap(null);
      }

      if (el) {
        if (data._el !== el) {
          if (props.preventMapHitsAndGestures) {
            google.maps.OverlayView.preventMapHitsAndGesturesFrom(el);
          } else if (props.preventMapHits) {
            google.maps.OverlayView.preventMapHitsFrom(el);
          }

          data._el = el;

          data._overlay = new _OverlayView(el.style, coords, callbacks, map);
        }
      } else {
        data._el = data._overlay = undefined;
      }

      setRef(outerRef, el);
    },
    [outerRef]
  );

  return panes
    ? createPortal(
        {
          ...children,
          ref,
        } as ReactElement,
        panes[props.mapPaneLayer || 'overlayMouseTarget']
      )
    : null;
};

export default OverlayView;
