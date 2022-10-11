import { Expand, HandlersMap, PropsMap } from '../types';
import handleBaseCreator from '../utils/handleBaseCreator';
import { PolyHandlers } from './types';

type Handlers = HandlersMap<google.maps.Polygon, PolyHandlers>;

type Props = PropsMap<
  google.maps.Polygon,
  {
    /**
     * If set to `true`, the user can drag this shape over the map. The {@link google.maps.PolygonOptions.geodesic geodesic} property defines the mode of dragging.
     */
    draggable: true;
    /**
     * If set to `true`, the user can edit this shape by dragging the control points shown at the vertices and on each segment.
     */
    editable: true;
    /**
     * The ordered sequence of coordinates that designates a closed loop. Unlike polylines, a polygon may consist of one or more paths. As a result, the paths property may specify one or more arrays of LatLng coordinates. Paths are closed automatically; do not repeat the first vertex of the path as the last vertex. Simple polygons may be defined using a single array of LatLngs. More complex polygons may specify an array of arrays. Any simple arrays are converted into MVCArrays. Inserting or removing LatLngs from the MVCArray will automatically update the polygon on the map.
     */
    paths: true;
    /**
     * Whether this polygon is visible on the map.
     */
    visible: true;
  }
>;

export type PolygonProps = Expand<Handlers & Props>;

const createPolygonComponent = handleBaseCreator<
  ['Polygon'],
  google.maps.PolygonOptions,
  Handlers,
  Props
>(['Polygon']);

export default createPolygonComponent;
