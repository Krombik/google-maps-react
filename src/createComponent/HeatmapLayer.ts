import { PropsMap } from '../types';
import handleBaseCreator from '../utils/handleBaseCreator';

export type HeatmapLayerProps = PropsMap<
  google.maps.visualization.HeatmapLayer,
  {
    /**
     * The data points to display.
     */
    data: true;
  }
>;

const createHeatmapLayerComponent = handleBaseCreator<
  ['visualization', 'HeatmapLayer'],
  google.maps.visualization.HeatmapLayerOptions,
  {},
  HeatmapLayerProps
>(['visualization', 'HeatmapLayer']);

export default createHeatmapLayerComponent;
