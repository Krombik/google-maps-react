import {
  type RefCallback,
  type ReactElement,
  useContext,
  forwardRef,
  useLayoutEffect,
} from 'react';
import { createPortal } from 'react-dom';
import noop from 'lodash.noop';
import useConst from 'react-helpful-utils/useConst';
import PanesContext from '../utils/PanesContext';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import { MAPS } from '../utils/constants';
import setRef from 'react-helpful-utils/setRef';
import handleRef from '../utils/handleRef';
import MapContext from '../utils/MapContext';

export type OverlayViewProps = {
  /**
   * Specifies which map pane to use for this overlay.
   * @see [link](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
   * @default 'overlayMouseTarget'
   */
  mapPaneLayer?: keyof google.maps.MapPanes;
  /**
   * stops click, tap, drag, and wheel events on the element from bubbling up to the map. Use this to prevent map dragging and zooming, as well as map `"click"` events
   */
  preventMapHitsAndGestures?: boolean;
  /**
   * stops click or tap on the element from bubbling up to the map. Use this to prevent the map from triggering `"click"` events
   */
  preventMapHits?: boolean;
  /**
   * [render](https://react.dev/reference/react/cloneElement#passing-data-with-a-render-prop) prop, a function that returns a React element and provides the ability to attach {@link ref} to it
   */
  render(ref: RefCallback<HTMLElement>): ReactElement;
  lat: number;
  lng: number;
};

let _OverlayView: typeof google.maps.OverlayView;

const OverlayView = forwardRef<HTMLElement, OverlayViewProps>(
  (props, outerRef) =>
    useConst(() => {
      let draw = noop;

      let lat: number;

      let lng: number;

      let map: google.maps.Map;

      const { preventMapHits, preventMapHitsAndGestures } = props;

      const ref = handleRef<HTMLElement>((el) => {
        if (!_OverlayView) {
          _OverlayView = GoogleMapsLoader.get(MAPS)!.OverlayView;
        }

        if (preventMapHitsAndGestures) {
          _OverlayView.preventMapHitsAndGesturesFrom(el);
        } else if (preventMapHits) {
          _OverlayView.preventMapHitsFrom(el);
        }

        const style = el.style;

        const overlayView = new _OverlayView();

        const getProjection = overlayView.getProjection.bind(overlayView);

        overlayView.onAdd = overlayView.onRemove = noop;

        style.position = 'absolute';

        draw = () => {
          const pos = getProjection().fromLatLngToDivPixel({ lat, lng });

          if (pos) {
            style.left = pos.x + 'px';
            style.top = pos.y + 'px';
          }
        };

        overlayView.draw = draw;

        overlayView.setMap(map);

        setRef(outerRef, el);

        return () => {
          overlayView.setMap(null);

          setRef(outerRef, null);

          draw = noop;
        };
      });

      return (props: OverlayViewProps) => {
        map = useContext(MapContext);

        useLayoutEffect(draw, [(lat = props.lat), (lng = props.lng)]);

        return createPortal(
          props.render(ref),
          useContext(PanesContext)[props.mapPaneLayer || 'overlayMouseTarget']
        );
      };
    })(props)
);

export default OverlayView;
