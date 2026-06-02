import { useEffect, useLayoutEffect, useRef } from 'react';
import type { UnGet } from '../types';
import { CHANGED } from './constants';
import noop from 'lodash.noop';

/** @internal */
const useHandlersAndProps = <
  Props extends Record<string, any>,
  Instance extends google.maps.MVCObject & {
    setOptions(options: Record<string, any>): void;
  },
>(
  props: Props,
  connectedPairs: Map<string, UnGet<keyof Instance>>,
  isKeyOmitted: (key: keyof Props) => boolean
) => {
  const bindRef = useRef<(props: Props) => (instance: Instance) => void>(
    noop as any
  );

  if (bindRef.current == noop) {
    const selfUpdatedKeys = new Set<string>();

    const handlersList: string[] = [];

    const propsList: string[] = [];

    let isMounted = false;

    let instance: Instance;

    for (const key in props) {
      if (!isKeyOmitted(key)) {
        (key.startsWith('on') ? handlersList : propsList).push(key);
      }
    }

    bindRef.current = (props) => {
      for (let i = propsList.length; i--; ) {
        const key = propsList[i];

        const value: any = props[key];

        useLayoutEffect(() => {
          if (isMounted) {
            selfUpdatedKeys.add(key);

            instance.setOptions({ [key]: value });
          }
        }, [value]);
      }

      if (propsList.length) {
        useLayoutEffect(() => {
          isMounted = true;

          return () => {
            isMounted = false;
          };
        }, []);
      }

      for (let i = handlersList.length; i--; ) {
        const key = handlersList[i];

        const value = props[key] as ((...args: any[]) => void) | undefined;

        useEffect(() => {
          if (value) {
            const eventName = (
              key.endsWith('Changed')
                ? key.slice(2, -7) + CHANGED
                : key.slice(2)
            ).toLowerCase();

            let fn = value;

            if (connectedPairs.has(eventName)) {
              const boundProp = connectedPairs.get(eventName)!;

              const boundFn = fn.bind(instance);

              if (boundProp in props) {
                selfUpdatedKeys.delete(boundProp);

                fn = () => {
                  if (!selfUpdatedKeys.delete(boundProp)) {
                    boundFn(instance.get(boundProp));
                  }
                };
              } else if (fn.length) {
                fn = () => {
                  boundFn(instance.get(boundProp));
                };
              }
            }

            const listener = instance.addListener(eventName, fn);

            return () => listener.remove();
          }
        }, [value]);
      }

      return (_instance) => {
        instance = _instance;
      };
    };
  }

  return bindRef.current(props);
};

/** @internal */
export default useHandlersAndProps;
