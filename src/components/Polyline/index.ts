import type { ComponentProps } from 'react';
import type { PolyHandlers } from '../../types';
import handleComponent from '../../utils/handleComponent';

export type PolylineProps = ComponentProps<typeof Polyline>;

const Polyline = handleComponent<
  google.maps.Polyline,
  PolyHandlers,
  {
    /**
     * If set to `true`, the user can drag this shape over the map. The {@link google.maps.PolylineOptions.geodesic geodesic} property defines the mode of dragging.
     */
    draggable: true;
    /**
     * If set to true, the user can edit this shape by dragging the control points shown at the vertices and on each segment.
     */
    editable: true;
    /**
     * The ordered sequence of coordinates of the Polyline. This path may be specified using either a simple array of LatLngs, or an MVCArray of LatLngs. Note that if you pass a simple array, it will be converted to an MVCArray Inserting or removing LatLngs in the MVCArray will automatically update the polyline on the map.
     */
    path: true;
    /**
     * Whether this polyline is visible on the map.
     */
    visible: true;
  }
>(['Polyline']);

export default Polyline;
