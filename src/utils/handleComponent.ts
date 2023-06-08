import { forwardRef, useLayoutEffect } from 'react';
import {
  ClassType,
  CombineProps,
  PathTo,
  TypicalInstance,
  PossibleHandlers,
  PossibleProps,
  UnGet,
} from '../types';
import useGoogleMap from '../useGoogleMap';
import getFromGoogleMap from './getFromGoogleMap';
import useHandlersAndProps from './useHandlersAndProps';
import getConnectedEventsAndProps from './getConnectedEventsAndProps';
import useConst from 'react-helpful-utils/useConst';
import setRef from 'react-helpful-utils/setRef';

type MapChild = TypicalInstance & {
  setMap(map: google.maps.Map | null): void;
};

/** @internal */
const handleComponent = <
  Instance extends MapChild,
  H extends PossibleHandlers,
  P extends PossibleProps<Instance>
>(
  instancePath: PathTo<Instance>,
  connectedProps?: Array<UnGet<keyof Instance>>
) => {
  const connectedEventsAndProps = getConnectedEventsAndProps(connectedProps);

  return forwardRef<Instance, CombineProps<Instance, H, P>>((props, ref) => {
    const map = useGoogleMap();

    let remove: () => void;

    useLayoutEffect(() => remove, []);

    useHandlersAndProps(
      useConst(() => {
        const instance: Instance = new (getFromGoogleMap(
          instancePath
        ) as ClassType<Instance>)({
          map,
          ...props.defaultOptions,
          ...props,
        });

        setRef(ref, instance);

        remove = () => {
          instance.setMap(null);

          setRef(ref, null);
        };

        return instance;
      }),
      props,
      connectedEventsAndProps,
      ['defaultOptions']
    );

    return null;
  });
};

/** @internal */
export default handleComponent;
