import type { ComponentProps } from 'react';
import handleComponent from '../../utils/handleComponent';

export type DrawingManagerProps = ComponentProps<typeof DrawingManager>;

const DrawingManager = handleComponent<
  google.maps.drawing.DrawingManager,
  {
    onCircleComplete: [circle: google.maps.Circle];
    onMarkerComplete: [marker: google.maps.Marker];
    onOverlayComplete: [event: google.maps.drawing.OverlayCompleteEvent];
    onPolygonComplete: [polygon: google.maps.Polygon];
    onPolylineComplete: [polyline: google.maps.Polyline];
    onRectangleComplete: [rectangle: google.maps.Rectangle];
  },
  {
    /**
     * The DrawingManager's drawing mode, which defines the type of overlay to be added on the map. Accepted values are `'marker'`, `'polygon'`, `'polyline'`, `'rectangle'`, `'circle'`.
     */
    drawingMode: true;
  }
>(['drawing', 'DrawingManager']);

export default DrawingManager;
