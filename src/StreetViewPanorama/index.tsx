'use client';

import {
  type ComponentProps,
  type RefCallback,
  forwardRef,
  useContext,
  useLayoutEffect,
  useRef,
} from 'react';
import type { CombineProps, GetValue, PreventLoadProps } from '../types';
import useHandlersAndProps from '../utils/useHandlersAndProps';
import createConnectedEventMap from '../utils/createConnectedEventMap';
import setRef from 'react-helpful-utils/setRef';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import noop from 'lodash.noop';
import createHas from '../utils/createHas';
import createRefCallback from '../utils/createRefCallback';
import MapContext from '../utils/MapContext';
import { IS_SERVER } from '../utils/constants';

type Pano = google.maps.StreetViewPanorama;

type Props = CombineProps<
  Pano,
  {
    onCloseclick: [];
    onLinksChanged: [];
    onPanoChanged: [pano: GetValue<Pano, 'pano'>];
    onPositionChanged: [position: GetValue<Pano, 'position'>];
    onPovChanged: [pov: GetValue<Pano, 'pov'>];
    onResize: [];
    onStatusChanged: [status: GetValue<Pano, 'status'>];
    onVisibleChanged: [visible: GetValue<Pano, 'visible'>];
    onZoomChanged: [zoom: GetValue<Pano, 'zoom'>];
  },
  'controlSize'
> &
  Pick<ComponentProps<'div'>, 'className' | 'style' | 'id'> &
  PreventLoadProps;

export type StreetViewPanoramaProps = ComponentProps<typeof StreetViewPanorama>;

const STREET_VIEW = 'streetView';

const connectedEventsAndProps = createConnectedEventMap<Pano>([
  'pano',
  'position',
  'pov',
  'status',
  'visible',
  'zoom',
]);

const isKeyOmitted = createHas<Props>([
  'className',
  'style',
  'id',
  'defaultOptions',
  'preventLoad',
  'ref',
]);

const toOptions = (props: Props): google.maps.StreetViewPanoramaOptions =>
  props.defaultOptions ? { ...props.defaultOptions, ...props } : props;

let isUnsafe = true;

const StreetViewPanorama = forwardRef<Pano, Props>((props, ref) => {
  if (IS_SERVER) {
    return null;
  }

  const map = useContext(MapContext);

  if (!map && isUnsafe) {
    const status = GoogleMapsLoader.getStatus(STREET_VIEW);

    if (status != 'loaded') {
      throw (
        status != 'error'
          ? props.preventLoad
            ? GoogleMapsLoader.getCompletion
            : GoogleMapsLoader.load
          : GoogleMapsLoader.getError
      )(STREET_VIEW);
    }

    isUnsafe = false;
  }

  const setInstance = useHandlersAndProps<Props, Pano>(
    props,
    connectedEventsAndProps,
    isKeyOmitted
  );

  if (map) {
    useLayoutEffect(() => {
      const pano = map.getStreetView();

      pano.setOptions(toOptions(props));

      setInstance(pano);

      setRef(ref, pano);

      return () => setRef(ref, null);
    }, []);

    return null;
  }

  const divRef = useRef<RefCallback<HTMLDivElement>>(noop as any);

  if (divRef.current == noop) {
    divRef.current = createRefCallback<HTMLDivElement>((el) => {
      const pano = new (GoogleMapsLoader.get(STREET_VIEW)!.StreetViewPanorama)(
        el,
        toOptions(props)
      );

      setInstance(pano);

      setRef(ref, pano);

      return () => setRef(ref, null);
    });
  }

  return (
    <div
      ref={divRef.current}
      className={props.className}
      style={props.style}
      id={props.id}
    />
  );
});

export default StreetViewPanorama;
