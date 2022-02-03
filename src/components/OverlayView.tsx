import React, {
  ComponentClass,
  ComponentProps,
  ComponentPropsWithRef,
  forwardRef,
  ForwardRefExoticComponent,
  PropsWithChildren,
  ReactPortal,
  useLayoutEffect,
  VFC,
} from 'react';
import { useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import useGoogleMap from '../hooks/useGoogleMap';
import useMergedRef from '../hooks/useMergedRef';
import noop from '../utils/noop';

type CoordsDeps = [lat: number, lng: number];

type Callbacks = [
  onAdd?: () => void,
  onDraw?: (x: number, y: number) => void,
  onRemove?: () => void
];

const _ = {
  _: () =>
    class extends google.maps.OverlayView {
      private readonly _el: HTMLElement;

      private _latLng: google.maps.LatLng;

      private _onDraw: (x: number, y: number) => void;

      constructor(el: HTMLElement, coords: CoordsDeps, callbacks: Callbacks) {
        super();

        this._el = el;
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
      }

      draw() {
        const pos = this.getProjection().fromLatLngToDivPixel(this._latLng);

        if (pos) {
          const { x, y } = pos;

          const style = this._el.style;

          style.left = x + 'px';
          style.top = y + 'px';

          this._onDraw(x, y);
        }
      }
    },

  get OverlayView(): ReturnType<typeof this._> {
    Object.defineProperty(this, 'OverlayView', {
      value: this._(),
    });

    //@ts-ignore
    delete this._;

    return this.OverlayView;
  },
};

declare class _OverlayView extends _.OverlayView {}

export type OverlayViewProps<
  C extends VFC<any> | ComponentClass<any> | keyof JSX.IntrinsicElements = 'div'
> = (C extends keyof JSX.IntrinsicElements
  ? ComponentPropsWithRef<C>
  : C extends ForwardRefExoticComponent<any>
  ? PropsWithChildren<ComponentProps<C>>
  : ComponentProps<C>) & {
  /**
   * for details see this [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
   * @default 'overlayMouseTarget'
   */
  mapPaneLayer?: keyof google.maps.MapPanes;
  onAdd?: () => void;
  onDraw?: (x: number, y: number) => void;
  onRemove?: () => void;
  component?: C;
} & google.maps.LatLngLiteral;

const OverlayView = forwardRef<
  HTMLElement,
  OverlayViewProps<VFC<{}> | ComponentClass<{}> | keyof JSX.IntrinsicElements>
>(
  (
    {
      lat,
      lng,
      onAdd,
      onDraw,
      onRemove,
      component: Component = 'div',
      mapPaneLayer = 'overlayMouseTarget',
      ...rest
    },
    outerRef
  ) => {
    const map = useGoogleMap();

    const innerRef = useRef<HTMLElement>(null);

    const ref = useMergedRef(outerRef, innerRef);

    const dataRef = useRef<{
      overlay?: _OverlayView;
      isNotFirstRender?: boolean;
    }>({});

    const coords: CoordsDeps = [lat, lng];

    const callbacks: Callbacks = [onAdd, onDraw, onRemove];

    useLayoutEffect(() => {
      const el = innerRef.current!;

      el.style.position = 'absolute';

      const overlay = new _.OverlayView(el, coords, callbacks);

      dataRef.current.overlay = overlay;

      overlay.setMap(map);

      return () => overlay.setMap(null);
    }, []);

    useEffect(() => {
      const { overlay, isNotFirstRender } = dataRef.current;

      if (isNotFirstRender && overlay) {
        overlay.setCallbacks(callbacks);
      }
    }, callbacks);

    useEffect(() => {
      const data = dataRef.current;

      if (data.isNotFirstRender) {
        const { overlay } = data;

        if (overlay) {
          overlay.setCoords(coords);

          overlay.draw();
        }
      } else {
        data.isNotFirstRender = true;
      }
    }, coords);

    return createPortal(
      //@ts-expect-error
      <Component ref={ref} {...rest} />,
      ((map as any).__gm.panes as google.maps.MapPanes)[mapPaneLayer]
    );
  }
) as any as <
  C extends VFC<any> | ComponentClass<any> | keyof JSX.IntrinsicElements = 'div'
>(
  props: OverlayViewProps<C>
) => ReactPortal;

export default OverlayView;
