'use client';

import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../types';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type RectangleProps = ComponentProps<typeof Rectangle>;

const Rectangle = createMapChildComponent<
  google.maps.Rectangle,
  {
    onBoundsChanged: [bounds: GetValue<google.maps.Rectangle, 'bounds'>];
  } & MouseHandlers
>([MAPS, 'Rectangle'], ['bounds']);

export default Rectangle;