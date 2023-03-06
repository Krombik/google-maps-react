import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../../types';
import handleComponent from '../../utils/handleComponent';

export type CircleProps = ComponentProps<typeof Circle>;

const Circle = handleComponent<
  google.maps.Circle,
  {
    onCenterChange: [center: GetValue<google.maps.Circle, 'center'>];
    onRadiusChange: [radius: GetValue<google.maps.Circle, 'radius'>];
  } & MouseHandlers,
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
>(['Circle'], {
  onCenterChange: 'center',
  onRadiusChange: 'radius',
});

export default Circle;
