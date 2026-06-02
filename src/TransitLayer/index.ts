'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type TransitLayerProps = ComponentProps<typeof TransitLayer>;

const TransitLayer = createMapChildComponent<google.maps.TransitLayer, {}>(
  [MAPS, 'TransitLayer'],
  undefined,
  true
);

export default TransitLayer;