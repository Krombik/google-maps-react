import { Expand, HandlersMap, PropsMap } from '../types';
import handleBaseCreator from '../utils/handleBaseCreator';

type Handlers = HandlersMap<
  google.maps.drawing.DrawingManager,
  {
    onCircleComplete: [circle: google.maps.Circle];
    onMarkerComplete: [marker: google.maps.Marker];
    onOverlayComplete: [event: google.maps.drawing.OverlayCompleteEvent];
    onPolygonComplete: [polygon: google.maps.Polygon];
    onPolylineComplete: [polyline: google.maps.Polyline];
    onRectangleComplete: [rectangle: google.maps.Rectangle];
  }
>;

type Props = PropsMap<
  google.maps.drawing.DrawingManager,
  {
    /**
     * The DrawingManager's drawing mode, which defines the type of overlay to be added on the map. Accepted values are `'marker'`, `'polygon'`, `'polyline'`, `'rectangle'`, `'circle'`.
     */
    drawingMode: true;
  }
>;

export type DrawingManagerProps = Expand<Handlers & Props>;

const createDrawingManagerComponent = handleBaseCreator<
  ['drawing', 'DrawingManager'],
  google.maps.drawing.DrawingManagerOptions,
  Handlers,
  Props
>(['drawing', 'DrawingManager']);

export default createDrawingManagerComponent;
