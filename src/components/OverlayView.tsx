import Loader from 'google-maps-js-api-loader';
import React, {
  ComponentPropsWithRef,
  forwardRef,
  ReactPortal,
  ElementType,
  ReactElement,
  useCallback,
  RefCallback,
} from 'react';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useGoogleMap from '../hooks/useGoogleMap';
import noop from '../utils/noop';
import setRef from '../utils/setRef';

type CoordsDeps = [lat: number, lng: number];

type Callbacks = [
  onAdd?: () => void,
  onDraw?: (x: number, y: number) => void,
  onRemove?: () => void
];

let _OverlayView: ReturnType<typeof getClass>;

const getClass = () =>
  class extends google.maps.OverlayView {
    private readonly _style: CSSStyleDeclaration;

    private _latLng: google.maps.LatLng;

    private _onDraw: (x: number, y: number) => void;

    constructor(
      style: CSSStyleDeclaration,
      coords: CoordsDeps,
      callbacks: Callbacks
    ) {
      super();

      this._style = style;
      this._latLng = new google.maps.LatLng(coords[0], coords[1]);

      this.setCallbacks(callbacks);
    }

    setCallbacks(callbacks: Callbacks) {
      this.onAdd = callbacks[0] || noop;

      this._onDraw = callbacks[1] || noop;

      this.onRemove = callbacks[2] || noop;
    }

    setCoords(coords: CoordsDeps) {
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

Loader.completion.then(() => {
  _OverlayView = getClass();
});

export type OverlayViewProps<C extends ElementType<any> = 'div'> =
  ComponentPropsWithRef<C> & {
    /**
     * for details see this [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
     * @default 'overlayMouseTarget'
     */
    mapPaneLayer?: keyof google.maps.MapPanes;
    onAdd?: () => void;
    onDraw?: (x: number, y: number) => void;
    onRemove?: () => void;
    component?: C;
    preventMapDragging?: boolean;
  } & google.maps.LatLngLiteral;

const OverlayView = forwardRef<HTMLElement, OverlayViewProps>(
  (
    {
      lat,
      lng,
      onAdd,
      onDraw,
      onRemove,
      component: Component = 'div',
      mapPaneLayer = 'overlayMouseTarget',
      preventMapDragging,
      ...rest
    },
    outerRef
  ) => {
    const map = useGoogleMap();

    const dataRef = useRef<{
      overlay?: InstanceType<typeof _OverlayView>;
      el?: HTMLElement;
      isNotFirstRender?: boolean;
    }>({});

    const coords: CoordsDeps = [lat, lng];

    const callbacks: Callbacks = [onAdd, onDraw, onRemove];

    const ref = useCallback<RefCallback<HTMLElement>>(
      (el) => {
        const data = dataRef.current;

        if (el) {
          if (data.el !== el) {
            data.overlay?.setMap(null);

            data.el = el;

            if (preventMapDragging) {
              google.maps.OverlayView.preventMapHitsAndGesturesFrom(el);
            }

            const style = el.style;

            style.position = 'absolute';

            const overlay = new _OverlayView(style, coords, callbacks);

            data.overlay = overlay;

            overlay.setMap(map);
          }
        } else if (data.overlay) {
          data.overlay.setMap(null);

          delete data.el;

          delete data.overlay;
        }

        setRef(outerRef, el);
      },
      [outerRef]
    );

    useEffect(() => {
      const { overlay, isNotFirstRender } = dataRef.current;

      if (isNotFirstRender && overlay) {
        overlay.setCallbacks(callbacks);
      }
    }, callbacks);

    useEffect(() => {
      const data = dataRef.current;

      if (data.isNotFirstRender) {
        data.overlay?.setCoords(coords);
      } else {
        data.isNotFirstRender = true;
      }
    }, coords);

    return createPortal(
      <Component ref={ref} {...rest} />,
      ((map as any).__gm.panes as google.maps.MapPanes)[mapPaneLayer]
    ) as ReactElement;
  }
) as unknown as <C extends ElementType = 'div'>(
  props: OverlayViewProps<C>
) => ReactPortal;

export default OverlayView;
