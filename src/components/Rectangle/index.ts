import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../../types';
import handleComponent from '../../utils/handleComponent';

export type RectangleProps = ComponentProps<typeof Rectangle>;

const Rectangle = handleComponent<
  google.maps.Rectangle,
  {
    onBoundsChange: [bounds: GetValue<google.maps.Rectangle, 'bounds'>];
  } & MouseHandlers,
  {
    bounds: true;
    /**
     * If set to `true`, the user can drag this rectangle over the map.
     */
    draggable: true;
    /**
     * If set to `true`, the user can edit this rectangle by dragging the control points shown at the corners and on each edge.
     */
    editable: true;
    /**
     * Whether this rectangle is visible on the map.
     */
    visible: true;
  }
>(['Rectangle'], { onBoundsChange: 'bounds' });

export default Rectangle;
