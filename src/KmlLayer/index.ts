'use client';

import type { ComponentProps } from 'react';
import createMapChildComponent from '../utils/createMapChildComponent';
import { MAPS } from '../utils/constants';

export type KmlLayerProps = ComponentProps<typeof KmlLayer>;

/** @deprecated */
const KmlLayer = createMapChildComponent<
  google.maps.KmlLayer,
  {
    onClick: [event: google.maps.KmlMouseEvent];
    onDefaultviewportChanged: [];
    onStatusChanged: [];
  },
  'preserveViewport' | 'screenOverlays' | 'suppressInfoWindows'
>([MAPS, 'KmlLayer']);

export default KmlLayer;