import { useRef, useEffect, forwardRef } from 'react';
import { createPortal } from 'react-dom';
import useConst from '../hooks/useConst';
import useGoogleMap from '../hooks/useGoogleMap';
import setRef from '../utils/setRef';

type CoordsDeps = [lat: number, lng: number];

type Callbacks = [
  onAdd?: () => void,
  onDraw?: (x: number, y: number) => void,
  onRemove?: () => void
];

const _ = Object.freeze({
  getOverlayViewClass: () =>
    class extends google.maps.OverlayView {
      private readonly _div: HTMLElement;

      private readonly _mapPaneLayer: keyof google.maps.MapPanes;

      private _latLng: google.maps.LatLng;

      private _onAdd?: () => void;
      private _onDraw?: (x: number, y: number) => void;
      private _onRemove?: () => void;

      constructor(
        div: HTMLElement,
        mapPaneLayer: keyof google.maps.MapPanes,
        coords: CoordsDeps,
        callbacks: Callbacks
      ) {
        super();

        this._div = div;
        this._mapPaneLayer = mapPaneLayer;
        this._latLng = new google.maps.LatLng(coords[0], coords[1]);

        this.setCallbacks(callbacks);
      }

      setCallbacks(callbacks: Callbacks) {
        this._onAdd = callbacks[0];
        this._onDraw = callbacks[1];
        this._onRemove = callbacks[2];
      }

      setCoords(coords: CoordsDeps) {
        this._latLng = new google.maps.LatLng(coords[0], coords[1]);
      }

      onAdd() {
        this._div.style.position = 'absolute';

        this.getPanes()![this._mapPaneLayer].appendChild(this._div);

        this._onAdd?.();
      }

      draw() {
        const pos = this.getProjection().fromLatLngToDivPixel(this._latLng);

        if (pos) {
          const { x, y } = pos;

          this._div.style.left = `${x}px`;
          this._div.style.top = `${y}px`;

          this._onDraw?.(x, y);
        }
      }

      onRemove() {
        this._div.parentNode?.removeChild(this._div);

        this._onRemove?.();
      }
    },

  get OverlayView(): ReturnType<typeof this.getOverlayViewClass> {
    Object.defineProperty(this, 'OverlayView', {
      value: this.getOverlayViewClass(),
    });

    // delete this.getOverlayViewClass;

    return this.OverlayView;
  },
});

declare class _OverlayView extends _.OverlayView {}

export type OverlayViewProps = {
  readonly mapPaneLayer?: keyof google.maps.MapPanes;
  onAdd?: () => void;
  onDraw?: (x: number, y: number) => void;
  onRemove?: () => void;
} & google.maps.LatLngLiteral;

const OverlayView = forwardRef<HTMLDivElement, OverlayViewProps>(
  (
    {
      lat,
      lng,
      children,
      mapPaneLayer = 'overlayLayer',
      onAdd,
      onDraw,
      onRemove,
    },
    ref
  ) => {
    const map = useGoogleMap();

    const div = useConst(() => document.createElement('div'));

    const overlayRef = useRef<_OverlayView>();

    const coords: CoordsDeps = [lat, lng];

    const callbacks: Callbacks = [onAdd, onDraw, onRemove];

    useEffect(() => {
      const overlay = new _.OverlayView(div, mapPaneLayer, coords, callbacks);

      overlayRef.current = overlay;

      if (ref) setRef(ref, div);

      overlay.setMap(map);

      return () => {
        overlay.setMap(null);

        if (ref) setRef(ref, null);
      };
    }, []);

    const isNotFirstRenderRef = useRef<boolean>();

    useEffect(() => {
      const overlay = overlayRef.current;

      if (isNotFirstRenderRef.current && overlay) {
        overlay.setCallbacks(callbacks);
      }
    }, callbacks);

    useEffect(() => {
      if (isNotFirstRenderRef.current) {
        const overlay = overlayRef.current;

        if (overlay) {
          overlay.setCoords(coords);
          overlay.draw();
        }
      } else {
        isNotFirstRenderRef.current = true;
      }
    }, coords);

    return createPortal(children, div);
  }
);

export default OverlayView;
