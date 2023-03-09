import type { ComponentProps } from 'react';
import handleComponent from '../../utils/handleComponent';

export type HeatmapLayerProps = ComponentProps<typeof HeatmapLayer>;

const HeatmapLayer = handleComponent<
  google.maps.visualization.HeatmapLayer,
  {},
  {
    /**
     * The data points to display.
     */
    data: true;
  }
>(['visualization', 'HeatmapLayer']);

export default HeatmapLayer;
