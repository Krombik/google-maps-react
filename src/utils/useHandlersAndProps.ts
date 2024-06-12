import { useEffect, useLayoutEffect } from 'react';
import type { UnGet } from '../types';
import useConst from 'react-helpful-utils/useConst';
import { CHANGED } from './constants';

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
) =>
  useConst(() => {
    const isTriggeredBySetStateSet = new Set<string>();

    const handlersList: string[] = [];

    const propsList: string[] = [];

    let isUpdated: boolean;

    let instance: Instance;

    for (const key in props) {
      if (!isKeyOmitted(key)) {
        (key.startsWith('on') ? handlersList : propsList).push(key);
      }
    }

    return (props: Props) => {
      for (let i = propsList.length; i--; ) {
        const key = propsList[i];

        const value: any = props[key];

        useLayoutEffect(() => {
          if (isUpdated) {
            isTriggeredBySetStateSet.add(key);

            instance.setOptions({ [key]: value });
          }
        }, [value]);
      }

      if (propsList.length) {
        useLayoutEffect(() => {
          isUpdated = true;

          return () => {
            isUpdated = false;
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
              const dependBy = connectedPairs.get(eventName)!;

              const boundFn = fn.bind(instance);

              if (dependBy in props) {
                isTriggeredBySetStateSet.delete(dependBy);

                fn = () => {
                  if (!isTriggeredBySetStateSet.delete(dependBy)) {
                    boundFn(instance.get(dependBy));
                  }
                };
              } else if (fn.length) {
                fn = () => {
                  boundFn(instance.get(dependBy));
                };
              }
            }

            const listener = instance.addListener(eventName, fn);

            return () => listener.remove();
          }
        }, [value]);
      }

      return (_instance: Instance) => {
        instance = _instance;
      };
    };
  })(props);

/** @internal */
export default useHandlersAndProps;
