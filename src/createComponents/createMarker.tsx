import { useEffect, useRef } from 'react';
import { GetValue } from '../types';
import useGoogleMap from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';
import noop from '../utils/noop';

export type MarkerHandlers = {
  onAnimationChanged(
    animation: GetValue<google.maps.Marker, 'animation'>,
    marker: google.maps.Marker
  ): void;
  onClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onClickableChanged(
    clickable: GetValue<google.maps.Marker, 'clickable'>,
    marker: google.maps.Marker
  ): void;
  onContextMenu(e: google.maps.MapMouseEvent): void;
  onCursorChanged(
    cursor: GetValue<google.maps.Marker, 'cursor'>,
    marker: google.maps.Marker
  ): void;
  onDoubleClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDrag(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDragEnd(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onDraggableChanged(
    draggable: GetValue<google.maps.Marker, 'draggable'>,
    marker: google.maps.Marker
  ): void;
  onDragStart(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onFlatChanged(marker: google.maps.Marker): void;
  onIconChanged(
    icon: GetValue<google.maps.Marker, 'icon'>,
    marker: google.maps.Marker
  ): void;
  onMouseDown(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseOut(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseOver(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onMouseUp(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onPositionChanged(
    position: GetValue<google.maps.Marker, 'position'>,
    marker: google.maps.Marker
  ): void;
  onRightClick(e: google.maps.MapMouseEvent, marker: google.maps.Marker): void;
  onShapeChanged(
    shape: GetValue<google.maps.Marker, 'shape'>,
    marker: google.maps.Marker
  ): void;
  onTitleChanged(
    title: GetValue<google.maps.Marker, 'title'>,
    marker: google.maps.Marker
  ): void;
  onVisibleChanged(
    visible: GetValue<google.maps.Marker, 'visible'>,
    marker: google.maps.Marker
  ): void;
  onZIndexChanged(
    zIndex: GetValue<google.maps.Marker, 'zIndex'>,
    marker: google.maps.Marker
  ): void;
};

export type MarkerProps = {
  defaultOptions?: Readonly<google.maps.MarkerOptions>;
};

export type MarkerStateName =
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
  | 'zIndex';

const createMarkerComponent = wrapper<
  google.maps.Marker,
  MarkerProps,
  MarkerHandlers,
  MarkerStateName
>(
  (useStateAndHandlers) =>
    ({ defaultOptions, onMount, onUnmount, ...props }) => {
      const map = useGoogleMap();

      const markerRef = useRef<google.maps.Marker>();

      useEffect(() => {
        const marker = new google.maps.Marker({
          map,
          ...defaultOptions,
          ...props,
        });

        markerRef.current = marker;

        (onMount || noop)(marker);

        return () => {
          marker.setMap(null);

          (onUnmount || noop)();
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

export default createMarkerComponent;
