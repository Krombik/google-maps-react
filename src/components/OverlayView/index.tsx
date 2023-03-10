import {
  RefCallback,
  ReactElement,
  RefAttributes,
  useContext,
  useRef,
  useEffect,
} from 'react';
import { createPortal } from 'react-dom';
import PanesContext from '../../context/PanesContext';
import useGoogleMap from '../../hooks/useGoogleMap';
import noop from '../../utils/noop';
import setRef from '../../utils/setRef';
import useConst from '../../utils/useConst';

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

const OverlayView = (props: OverlayViewProps) => {
  const map = useGoogleMap();

  const updateLatLngRef =
    useRef<(latLng: google.maps.LatLngLiteral) => void>(noop);

  const panes = useContext(PanesContext);

  useEffect(() => {
    updateLatLngRef.current(props);
  }, [props.lat, props.lng]);

  const ref = useConst<RefCallback<HTMLElement>>(() => {
    const parentRef = props.children.ref;

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

        overlayView.draw = () => {
          const pos = overlayView.getProjection().fromLatLngToDivPixel(latLng);

          if (pos) {
            style.left = pos.x + 'px';
            style.top = pos.y + 'px';
          }
        };

        overlayView.setMap(map);

        updateLatLngRef.current = () => {
          updateLatLngRef.current = (latLngLiteral) => {
            latLng = new google.maps.LatLng(latLngLiteral);

            overlayView.draw();
          };
        };
      } else {
        overlayView.setMap(el);
      }

      setRef(parentRef, el);
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
