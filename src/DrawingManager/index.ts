'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';

export type DrawingManagerProps = ComponentProps<typeof DrawingManager>;

const DrawingManager = createMapChildComponent<
  google.maps.drawing.DrawingManager,
  {
    onCircleComplete: [circle: google.maps.Circle];
    onMarkerComplete: [marker: google.maps.Marker];
    onOverlayComplete: [event: google.maps.drawing.OverlayCompleteEvent];
    onPolygonComplete: [polygon: google.maps.Polygon];
    onPolylineComplete: [polyline: google.maps.Polyline];
    onRectangleComplete: [rectangle: google.maps.Rectangle];
  }
>(['drawing', 'DrawingManager']);

export default DrawingManager;