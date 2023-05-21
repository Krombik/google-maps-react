import {
  RefCallback,
  ReactElement,
  RefAttributes,
  useContext,
  useRef,
  useEffect,
  FC,
} from 'react';
import { createPortal } from 'react-dom';
import PanesContext from '../../context/PanesContext';
import useGoogleMap from '../../hooks/useGoogleMap';
import noop from 'lodash.noop';
import useConst from 'react-helpful-utils/useConst';
import setRef from 'react-helpful-utils/setRef';

export type OverlayViewProps = {
  /**
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
  children: ReactElement & RefAttributes<HTMLElement>;
  lat: number;
  lng: number;
};

const OverlayView: FC<OverlayViewProps> = (props) => {
  const map = useGoogleMap();

  const updateLatLngRef =
    useRef<(latLng: google.maps.LatLngLiteral) => void>(noop);

  const panes = useContext(PanesContext);

  let effected: undefined | true;

  useEffect(() => {
    effected = true;

    updateLatLngRef.current(props);
  }, [props.lat, props.lng]);

  const ref = useConst<RefCallback<HTMLElement>>(() => {
    const outerRef = props.children.ref;

    const overlayView = new google.maps.OverlayView();

    overlayView.onAdd = overlayView.onRemove = noop;

    return (el) => {
      if (el) {
        if (props.preventMapHitsAndGestures) {
          google.maps.OverlayView.preventMapHitsAndGesturesFrom(el);
        } else if (props.preventMapHits) {
          google.maps.OverlayView.preventMapHitsFrom(el);
        }

        const style = el.style;

        let latLng = new google.maps.LatLng(props);

        style.position = 'absolute';

        const draw = () => {
          const pos = overlayView.getProjection().fromLatLngToDivPixel(latLng);

          if (pos) {
            style.left = pos.x + 'px';
            style.top = pos.y + 'px';
          }
        };

        const updateLatLng = (latLngLiteral: google.maps.LatLngLiteral) => {
          latLng = new google.maps.LatLng(latLngLiteral);

          draw();
        };

        overlayView.draw = draw;

        overlayView.setMap(map);

        updateLatLngRef.current = effected
          ? updateLatLng
          : () => {
              updateLatLngRef.current = updateLatLng;
            };
      } else {
        overlayView.setMap(el);
      }

      setRef(outerRef, el);
    };
  });

  return (
    panes &&
    createPortal(
      {
        ...props.children,
        ref,
      } as ReactElement,
      panes[props.mapPaneLayer || 'overlayMouseTarget']
    )
  );
};

export default OverlayView;
