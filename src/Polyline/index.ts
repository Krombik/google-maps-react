'use client';

import type { ComponentProps } from 'react';
import type { PolyHandlers } from '../types';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type PolylineProps = ComponentProps<typeof Polyline>;

const Polyline = createMapChildComponent<google.maps.Polyline, PolyHandlers>([
  MAPS,
  'Polyline',
]);

export default Polyline;