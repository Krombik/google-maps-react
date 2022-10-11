import { Expand, GetValue, HandlersMap, PropsMap } from '../types';
import handleBaseCreator from '../utils/handleBaseCreator';
import { MouseHandlers } from './types';

type Handlers = HandlersMap<
  google.maps.Circle,
  {
    onCenterChange: [center: GetValue<google.maps.Circle, 'center'>];
    onRadiusChange: [radius: GetValue<google.maps.Circle, 'radius'>];
  } & MouseHandlers
>;

type Props = PropsMap<
  google.maps.Circle,
  {
    /**
     * The center of the Circle.
     */
    center: true;
    /**
     * If set to `true`, the user can drag this circle over the map.
     */
    draggable: true;
    /**
     * If set to `true`, the user can edit this circle by dragging the control points shown at the center and around the circumference of the circle.
     */
    editable: true;
    /**
     * The radius in meters on the Earth's surface.
     */
    radius: true;
    /**
     * Whether this circle is visible on the map.
     */
    visible: true;
  }
>;

export type CircleProps = Expand<Handlers & Props>;

const createCircleComponent = handleBaseCreator<
  ['Circle'],
  google.maps.CircleOptions,
  Handlers,
  Props
>(['Circle'], { onCenterChange: 'center', onRadiusChange: 'radius' });

export default createCircleComponent;
