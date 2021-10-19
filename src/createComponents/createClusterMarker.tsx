import { useEffect, useRef } from 'react';
import wrapper from '../utils/wrapper';
import { MarkerHandlers, MarkerProps, MarkerStateName } from './createMarker';
import { MarkerClusterer } from '@googlemaps/markerclusterer';

const createClusterMarkerComponent = wrapper<
  google.maps.Marker,
  MarkerProps & { markerClusterer: MarkerClusterer },
  MarkerHandlers,
  MarkerStateName,
  false
>(
  (useStateAndHandlers) =>
    ({ defaultOptions, markerClusterer, ...props }) => {
      const markerRef = useRef<google.maps.Marker>();

      useEffect(() => {
        const marker = new google.maps.Marker({
          ...defaultOptions,
          ...props,
        });

        markerRef.current = marker;

        markerClusterer.addMarker(marker, true);

        return () => {
          markerClusterer.removeMarker(marker, true);
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

export default createClusterMarkerComponent;
