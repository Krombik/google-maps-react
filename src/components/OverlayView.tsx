import { useRef, useEffect, FC } from 'react';
import { createPortal } from 'react-dom';
import useConst from '../hooks/useConst';
import useGoogleMap from '../hooks/useGoogleMap';
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
      private readonly _div: HTMLElement;

      private readonly _mapPaneLayer: keyof google.maps.MapPanes;

      private _latLng: google.maps.LatLng;

      private _onAdd: () => void;
      private _onDraw: (x: number, y: number) => void;
      private _onRemove: () => void;

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
        this._onAdd = callbacks[0] || noop;
        this._onDraw = callbacks[1] || noop;
        this._onRemove = callbacks[2] || noop;
      }

      setCoords(coords: CoordsDeps) {
        this._latLng = new google.maps.LatLng(coords[0], coords[1]);
      }

      onAdd() {
        this._div.style.position = 'absolute';

        this.getPanes()![this._mapPaneLayer].appendChild(this._div);

        this._onAdd();
      }

      draw() {
        const pos = this.getProjection().fromLatLngToDivPixel(this._latLng);

        if (pos) {
          const { x, y } = pos;

          this._div.style.left = x + 'px';
          this._div.style.top = y + 'px';

          this._onDraw(x, y);
        }
      }

      onRemove() {
        this._div.parentNode?.removeChild(this._div);

        this._onRemove();
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

export type OverlayViewProps = {
  /**
   * for details see this [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
   * @default 'overlayLayer'
   */
  mapPaneLayer?: keyof google.maps.MapPanes;
  onAdd?: () => void;
  onDraw?: (x: number, y: number) => void;
  onRemove?: () => void;
} & google.maps.LatLngLiteral;

const OverlayView: FC<OverlayViewProps> = ({
  lat,
  lng,
  children,
  mapPaneLayer,
  onAdd,
  onDraw,
  onRemove,
}) => {
  const map = useGoogleMap();

  const div = useConst(() => document.createElement('div'));

  const dataRef = useRef<{
    overlay?: _OverlayView;
    isNotFirstRender?: boolean;
  }>({});

  const coords: CoordsDeps = [lat, lng];

  const callbacks: Callbacks = [onAdd, onDraw, onRemove];

  useEffect(() => {
    const overlay = new _.OverlayView(
      div,
      mapPaneLayer || 'overlayLayer',
      coords,
      callbacks
    );

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

  return createPortal(children, div);
};

export default OverlayView;
