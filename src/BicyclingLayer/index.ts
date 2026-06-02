'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type BicyclingLayerProps = ComponentProps<typeof BicyclingLayer>;

const BicyclingLayer = createMapChildComponent<google.maps.BicyclingLayer, {}>(
  [MAPS, 'BicyclingLayer'],
  undefined,
  true
);

export default BicyclingLayer;