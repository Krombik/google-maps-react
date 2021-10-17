import { useEffect, useRef } from 'react';
import { GetValue } from '../types';
import setRef from '../utils/setRef';
import useGoogleMap from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';

type Handlers = {
  onAnimationChanged(
    this: google.maps.Marker,
    animation: GetValue<google.maps.Marker, 'animation'>
  ): void;
  onClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onClickableChanged(
    this: google.maps.Marker,
    clickable: GetValue<google.maps.Marker, 'clickable'>
  ): void;
  onContextMenu(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onCursorChanged(
    this: google.maps.Marker,
    cursor: GetValue<google.maps.Marker, 'cursor'>
  ): void;
  onDoubleClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDrag(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDragEnd(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onDraggableChanged(
    this: google.maps.Marker,
    draggable: GetValue<google.maps.Marker, 'draggable'>
  ): void;
  onDragStart(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onFlatChanged(this: google.maps.Marker): void;
  onIconChanged(
    this: google.maps.Marker,
    icon: GetValue<google.maps.Marker, 'icon'>
  ): void;
  onMouseDown(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onMouseUp(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onPositionChanged(
    this: google.maps.Marker,
    position: GetValue<google.maps.Marker, 'position'>
  ): void;
  onRightClick(this: google.maps.Marker, e: google.maps.MapMouseEvent): void;
  onShapeChanged(
    this: google.maps.Marker,
    shape: GetValue<google.maps.Marker, 'shape'>
  ): void;
  onTitleChanged(
    this: google.maps.Marker,
    title: GetValue<google.maps.Marker, 'title'>
  ): void;
  onVisibleChanged(
    this: google.maps.Marker,
    visible: GetValue<google.maps.Marker, 'visible'>
  ): void;
  onZIndexChanged(
    this: google.maps.Marker,
    zIndex: GetValue<google.maps.Marker, 'zIndex'>
  ): void;
};

type Props = {
  defaultOptions?: Readonly<google.maps.MarkerOptions>;
};

const creatMarkerComponent = wrapper<
  google.maps.Marker,
  Props,
  Handlers,
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
>(
  (useStateAndHandlers) =>
    ({ defaultOptions, onInit, ...props }, ref) => {
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

        onInit?.(marker);

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
