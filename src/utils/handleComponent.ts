import { forwardRef, useLayoutEffect } from 'react';
import {
  ClassType,
  CombineProps,
  PathTo,
  TypicalInstance,
  PossibleHandlers,
  PossibleProps,
} from '../types';
import useGoogleMap from '../hooks/useGoogleMap';
import useConst from './useConst';
import setRef from './setRef';
import getFromGoogleMap from './getFromGoogleMap';
import useHandlersAndProps from './useHandlersAndProps';

type MapChild = TypicalInstance & {
  setMap(map: google.maps.Map | null): void;
};

/** @internal */
const handleComponent = <
  Instance extends MapChild,
  H extends PossibleHandlers,
  P extends PossibleProps<Instance>
>(
  classNames: PathTo<Instance>,
  connectedHandlersAndState?: Partial<Record<keyof H, keyof P>>
) =>
  forwardRef<Instance, CombineProps<Instance, H, P>>((props, ref) => {
    const map = useGoogleMap();

    let remove: () => void;

    useLayoutEffect(() => remove, []);

    useHandlersAndProps(
      useConst(() => {
        const instance: Instance = new (getFromGoogleMap(
          classNames
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
      connectedHandlersAndState || ({} as any),
      ['defaultOptions']
    );

    return null;
  });

/** @internal */
export default handleComponent;
