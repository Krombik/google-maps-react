'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';

export type StreetViewCoverageLayerProps = ComponentProps<
  typeof StreetViewCoverageLayer
>;

const StreetViewCoverageLayer = createMapChildComponent<
  google.maps.StreetViewCoverageLayer,
  {}
>(['streetView', 'StreetViewCoverageLayer'], undefined, true);

export default StreetViewCoverageLayer;