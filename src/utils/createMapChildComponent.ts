import { forwardRef, useContext, useLayoutEffect } from 'react';
import type {
  ClassType,
  CombineProps,
  PathTo,
  MapsInstance,
  PossibleHandlers,
  UnGet,
  DefaultOptionsProps,
  PreventLoadProps,
  OptionsOf,
} from '../types';
import useHandlersAndProps from './useHandlersAndProps';
import createConnectedEventMap from './createConnectedEventMap';
import setRef from 'react-helpful-utils/setRef';
import createHas from './createHas';
import {
  type GoogleMapsLibraries,
  type GoogleMapsLibrary,
  GoogleMapsLoader,
} from 'google-maps-js-api-loader';
import { MAPS } from './constants';
import MapContext from './MapContext';

type MapChild = MapsInstance & {
  setMap(map: google.maps.Map | null): void;
};

const isKeyOmitted = createHas<DefaultOptionsProps<any> & PreventLoadProps>([
  'defaultOptions',
  'preventLoad',
  'ref',
]);

/** @internal */
const createMapChildComponent = <
  Instance extends MapChild,
  H extends PossibleHandlers,
  ReadonlyKeys extends keyof OptionsOf<Instance> = never,
>(
  instancePath: PathTo<Instance>,
  connectedProps?: UnGet<keyof Instance>[],
  // Some layers (TransitLayer, BicyclingLayer) have no constructor options, so
  // the map can't be passed at construction — attach it with `setMap` instead.
  viaSetMap?: boolean
) => {
  const connectedEventsAndProps = createConnectedEventMap(connectedProps);

  const [library, className] = instancePath as [
    GoogleMapsLibrary,
    keyof GoogleMapsLibraries[GoogleMapsLibrary],
  ];

  let isUnsafe = library != MAPS;

  let InstanceClass: ClassType<Instance>;

  return forwardRef<
    Instance,
    CombineProps<Instance, H, ReadonlyKeys> &
      (PathTo<Instance> extends [typeof MAPS, string] ? {} : PreventLoadProps)
  >((props, ref) => {
    if (isUnsafe) {
      const status = GoogleMapsLoader.getStatus(library);

      if (status != 'loaded') {
        throw (
          status != 'error'
            ? (props as PreventLoadProps).preventLoad
              ? GoogleMapsLoader.getCompletion
              : GoogleMapsLoader.load
            : GoogleMapsLoader.getError
        )(library);
      } else {
        isUnsafe = false;
      }
    }

    const map = useContext(MapContext);

    useLayoutEffect(() => {
      if (!InstanceClass) {
        InstanceClass = GoogleMapsLoader.get(library)![className];
      }

      const defaultOptions = (props as { defaultOptions?: any }).defaultOptions;

      const instance: Instance = new InstanceClass(
        viaSetMap
          ? { ...defaultOptions, ...props }
          : { map, ...defaultOptions, ...props }
      );

      if (viaSetMap) {
        instance.setMap(map);
      }

      setInstance(instance);

      setRef(ref, instance);

      return () => {
        instance.setMap(null);

        setRef(ref, null);
      };
    }, []);

    // `Instance` may lack `setOptions` (setMap-only layers); the cast is safe
    // because such instances have no settable props, so `setOptions` is never
    // called.
    const setInstance = useHandlersAndProps<any, any>(
      props,
      connectedEventsAndProps,
      isKeyOmitted as any
    );

    return null;
  });
};

/** @internal */
export default createMapChildComponent;
