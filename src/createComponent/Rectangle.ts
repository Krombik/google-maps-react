import { Expand, GetValue, HandlersMap, PropsMap } from '../types';
import handleBaseCreator from '../utils/handleBaseCreator';
import { MouseHandlers } from './types';

type Handlers = HandlersMap<
  google.maps.Rectangle,
  {
    onBoundsChange: [bounds: GetValue<google.maps.Rectangle, 'bounds'>];
  } & MouseHandlers
>;

type Props = PropsMap<
  google.maps.Rectangle,
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
>;

export type RectangleProps = Expand<Handlers & Props>;

const createRectangleComponent = handleBaseCreator<
  ['Rectangle'],
  google.maps.RectangleOptions,
  Handlers,
  Props
>(['Rectangle'], { onBoundsChange: 'bounds' });

export default createRectangleComponent;
