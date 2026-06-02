'use client';

import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../types';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type CircleProps = ComponentProps<typeof Circle>;

const Circle = createMapChildComponent<
  google.maps.Circle,
  {
    onCenterChanged: [center: GetValue<google.maps.Circle, 'center'>];
    onRadiusChanged: [radius: GetValue<google.maps.Circle, 'radius'>];
  } & MouseHandlers
>([MAPS, 'Circle'], ['center', 'radius']);

export default Circle;