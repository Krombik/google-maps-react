import { useEffect } from 'react';
import { UnGet } from '../types';
import useConst from 'react-helpful-utils/useConst';

/** @internal */
const useHandlersAndProps = <
  Props extends {},
  Instance extends google.maps.MVCObject
>(
  instance: Instance,
  props: Props,
  connectedPairs: Map<string, UnGet<keyof Instance>>,
  omittedKeys: Array<keyof Props>
) => {
  type Key = keyof Props extends string ? keyof Props : never;

  const data = useConst<
    [
      prevListeners: Map<string, google.maps.MapsEventListener>,
      isTriggeredBySetStateSet: Set<string>,
      prevProps: Props | undefined
    ]
  >(
    () =>
      [
        new Map<string, google.maps.MapsEventListener>(),
        new Set<string>(),
      ] as any
  );

  useEffect(() => {
    const prevListeners = data[0];

    const isTriggeredBySetStateSet = data[1];

    const prevProps = data[2];

    const keys = Object.keys(props) as Array<Key>;

    for (let i = keys.length; i--; ) {
      const key = keys[i];

      const value: any = props[key];

      if (
        !omittedKeys.includes(key) &&
        (!prevProps || value !== prevProps[key])
      ) {
        if (key.startsWith('on')) {
          if (prevListeners.has(key)) {
            prevListeners.get(key)!.remove();
          }

          if (value) {
            const eventName = key
              .replace('on', '')
              .replace('Chan', '_chan')
              .toLowerCase();

            let fn: () => void = value;

            if (connectedPairs.has(eventName)) {
              const dependBy = connectedPairs.get(eventName)!;

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

            prevListeners.set(key, instance.addListener(eventName, fn));
          } else {
            prevListeners.delete(key);
          }
        } else if (prevProps) {
          isTriggeredBySetStateSet.add(key);

          instance.set(key, value);
        }
      }
    }

    data[2] = props;
  });
};

/** @internal */
export default useHandlersAndProps;
