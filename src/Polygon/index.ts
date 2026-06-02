'use client';

import type { ComponentProps } from 'react';
import type { PolyHandlers } from '../types';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type PolygonProps = ComponentProps<typeof Polygon>;

const Polygon = createMapChildComponent<google.maps.Polygon, PolyHandlers>([
  MAPS,
  'Polygon',
]);

export default Polygon;