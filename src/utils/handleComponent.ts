import { forwardRef, useContext, useLayoutEffect } from 'react';
import type {
  ClassType,
  CombineProps,
  PathTo,
  TypicalInstance,
  PossibleHandlers,
  PossibleProps,
  UnGet,
  CommonProps,
  PreventLoadProps,
} from '../types';
import useHandlersAndProps from './useHandlersAndProps';
import getConnectedEventsAndProps from './getConnectedEventsAndProps';
import setRef from 'react-helpful-utils/setRef';
import handleHas from './handleHas';
import {
  type GoogleMapsLibraries,
  type GoogleMapsLibrary,
  GoogleMapsLoader,
} from 'google-maps-js-api-loader';
import { MAPS } from './constants';
import MapContext from './MapContext';

type MapChild = TypicalInstance & {
  setMap(map: google.maps.Map | null): void;
};

const isKeyOmitted = handleHas<CommonProps<MapChild> & PreventLoadProps>([
  'defaultOptions',
  'preventLoad',
]);

/** @internal */
const handleComponent = <
  Instance extends MapChild,
  H extends PossibleHandlers,
  P extends PossibleProps<Instance>,
>(
  instancePath: PathTo<Instance>,
  connectedProps?: UnGet<keyof Instance>[]
) => {
  const connectedEventsAndProps = getConnectedEventsAndProps(connectedProps);

  const [library, className] = instancePath as [
    GoogleMapsLibrary,
    keyof GoogleMapsLibraries[GoogleMapsLibrary],
  ];

  let isUnsafe = library != MAPS;

  let InstanceClass: ClassType<Instance>;

  return forwardRef<
    Instance,
    CombineProps<Instance, H, P> &
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

      const instance: Instance = new InstanceClass({
        map,
        ...props.defaultOptions,
        ...props,
      });

      setInstance(instance);

      setRef(ref, instance);

      return () => {
        instance.setMap(null);

        setRef(ref, null);
      };
    }, []);

    const setInstance = useHandlersAndProps(
      props,
      connectedEventsAndProps,
      isKeyOmitted as any
    );

    return null;
  });
};

/** @internal */
export default handleComponent;
