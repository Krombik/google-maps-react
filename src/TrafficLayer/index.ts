'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type TrafficLayerProps = ComponentProps<typeof TrafficLayer>;

const TrafficLayer = createMapChildComponent<google.maps.TrafficLayer, {}>([
  MAPS,
  'TrafficLayer',
]);

export default TrafficLayer;