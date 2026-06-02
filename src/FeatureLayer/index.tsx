'use client';

import { forwardRef, useContext, useEffect, useLayoutEffect } from 'react';
import setRef from 'react-helpful-utils/setRef';
import MapContext from '../utils/MapContext';

export type FeatureLayerProps = {
  featureType: google.maps.FeatureType;
  /**
   * Style applied to the layer's features. A {@link
   * google.maps.FeatureStyleFunction} styles per-feature; a {@link
   * google.maps.FeatureStyleOptions} styles all features the same. Requires a
   * Map ID with data-driven styling enabled for this feature type.
   */
  style?:
    | google.maps.FeatureStyleOptions
    | google.maps.FeatureStyleFunction
    | null;
  onClick?(event: google.maps.FeatureMouseEvent): void;
};

const FeatureLayer = forwardRef<google.maps.FeatureLayer, FeatureLayerProps>(
  (props, ref) => {
    const layer = useContext(MapContext).getFeatureLayer(props.featureType);

    useLayoutEffect(() => {
      setRef(ref, layer);

      return () => setRef(ref, null);
    }, [layer]);

    useLayoutEffect(() => {
      layer.style = props.style || null;

      return () => {
        layer.style = null;
      };
    }, [layer, props.style]);

    useEffect(() => {
      const handler = props.onClick;

      if (handler) {
        const listener = layer.addListener('click', handler);

        return () => listener.remove();
      }
    }, [layer, props.onClick]);

    return null;
  }
);

export default FeatureLayer;
