import { useEffect } from 'react';
import { HandlerName, handlersMap } from './constants';
import useConst from './useConst';
import { UnGet } from '../types';

type GetHandler<T> = T extends HandlerName ? T : never;

/** @internal */
const useHandlersAndProps = <
  Props extends {},
  Instance extends google.maps.MVCObject
>(
  instance: Instance,
  props: Props,
  connectedPairs: Partial<
    Record<GetHandler<keyof Props>, UnGet<keyof Instance>>
  >,
  omittedKeys: Array<keyof Props>
) => {
  type Key = keyof Props extends string ? keyof Props : never;

  const data = useConst<{
    _prevProps?: Props;
    _prevListeners: Map<string, google.maps.MapsEventListener>;
    _isTriggeredBySetStateSet: Set<string>;
  }>(() => ({
    _prevListeners: new Map<string, google.maps.MapsEventListener>(),
    _isTriggeredBySetStateSet: new Set<string>(),
  }));

  useEffect(() => {
    const prevListeners = data._prevListeners;

    const prevProps = data._prevProps;

    const isTriggeredBySetStateSet = data._isTriggeredBySetStateSet;

    const keys = Object.keys(props) as Array<Key>;

    for (let i = keys.length; i--; ) {
      const key = keys[i];

      const value: any = props[key];

      if (
        !omittedKeys.includes(key) &&
        (!prevProps || value !== prevProps[key])
      ) {
        if (key in handlersMap) {
          if (prevListeners.has(key)) {
            prevListeners.get(key)!.remove();
          }

          if (value) {
            const dependBy = connectedPairs[key as GetHandler<Key>];

            let fn: () => void = value;

            if (dependBy) {
              const boundFn = value.bind(instance);

              if (dependBy in props) {
                isTriggeredBySetStateSet.delete(dependBy);

                fn = () => {
                  if (!isTriggeredBySetStateSet.delete(dependBy)) {
                    boundFn(instance.get(dependBy));
                  }
                };
              } else if (value.length) {
                fn = () => {
                  boundFn(instance.get(dependBy));
                };
              }
            }

            prevListeners.set(
              key,
              instance.addListener(handlersMap[key as HandlerName], fn)
            );
          } else {
            prevListeners.delete(key);
          }
        } else if (prevProps) {
          isTriggeredBySetStateSet.add(key);

          instance.set(key, value);
        }
      }
    }

    data._prevProps = props;
  });
};

/** @internal */
export default useHandlersAndProps;
