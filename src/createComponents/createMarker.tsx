import { useEffect, useRef } from 'react';
import { GenerateHandlers } from '../types';
import setRef from '../utils/setRef';
import useGoogleMap from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';

type Handlers = GenerateHandlers<
  google.maps.Marker,
  {
    onAnimationChanged: [];
    onClick: [e: google.maps.MapMouseEvent];
    onClickableChanged: [];
    onContextMenu: [e: google.maps.MapMouseEvent];
    onCursorChanged: [];
    onDoubleClick: [e: google.maps.MapMouseEvent];
    onDrag: [e: google.maps.MapMouseEvent];
    onDragEnd: [e: google.maps.MapMouseEvent];
    onDraggableChanged: [];
    onDragStart: [e: google.maps.MapMouseEvent];
    onFlatChanged: [];
    onIconChanged: [];
    onMouseDown: [e: google.maps.MapMouseEvent];
    onMouseOut: [e: google.maps.MapMouseEvent];
    onMouseOver: [e: google.maps.MapMouseEvent];
    onMouseUp: [e: google.maps.MapMouseEvent];
    onPositionChanged: [];
    onRightClick: [e: google.maps.MapMouseEvent];
    onShapeChanged: [];
    onTitleChanged: [];
    onVisibleChanged: [];
    onZIndexChanged: [];
  }
>;

type State = Required<
  Pick<
    google.maps.MarkerOptions,
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
  >
>;

type Props = {
  defaultOptions?: Readonly<google.maps.MarkerOptions>;
};

const creatMarkerComponent = wrapper<
  Props,
  Handlers,
  State,
  google.maps.Marker
>(
  (useStateAndHandlers) =>
    ({ defaultOptions, ...props }, ref) => {
      const map = useGoogleMap();

      const markerRef = useRef<google.maps.Marker>();

      useEffect(() => {
        const marker = new google.maps.Marker({
          map,
          ...defaultOptions,
          ...props,
        });

        markerRef.current = marker;

        if (ref) setRef(ref, marker);

        return () => {
          if (ref) setRef(ref, null);
        };
      }, []);

      useStateAndHandlers(markerRef, props);

      return null;
    },
  {
    onAnimationChanged: 'animation',
    onCursorChanged: 'cursor',
    onDraggableChanged: 'draggable',
    onIconChanged: 'icon',
    onPositionChanged: 'position',
    onShapeChanged: 'shape',
    onTitleChanged: 'title',
    onVisibleChanged: 'visible',
    onZIndexChanged: 'zIndex',
  }
);

export default creatMarkerComponent;
