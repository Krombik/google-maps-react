import equal from 'fast-deep-equal';
import { MutableRefObject, useEffect, useRef } from 'react';
import { HandlerName } from '../types';
import { handlersMap } from './constants';
import noop from './noop';

export type UseStateAndHandlers<
  A extends HandlerName = HandlerName,
  S extends string = string
> = (
  instanceRef: MutableRefObject<
    Pick<google.maps.Map, 'addListener' | 'set' | 'get'> | undefined
  >,
  props: Partial<Record<A, (...args: any) => void>> & Record<S, unknown>
) => void;

const createUseStateAndHandlers = <A extends HandlerName, S extends string>(
  handlerNamesList: A[],
  stateNamesList: S[],
  connectedPairs: Partial<Record<A, S>>
): UseStateAndHandlers<A, S> => {
  if (stateNamesList.length === 0 && handlerNamesList.length === 0) return noop;

  handlerNamesList = Array.from(new Set(handlerNamesList)).reverse();

  stateNamesList = Array.from(new Set(stateNamesList)).reverse();

  const stateNamesListLength = stateNamesList.length;

  const useStateEffect: UseStateAndHandlers<A, S> = (instanceRef, props) => {
    const prevStateArrRef = useRef<unknown[]>([]);

    useEffect(() => {
      const instance = instanceRef.current;

      if (instance) {
        const prevStateArr = prevStateArrRef.current;

        if (prevStateArr.length) {
          for (let i = stateNamesListLength; i--; ) {
            const stateName = stateNamesList[i];

            const state: unknown = props[stateName];

            if (!equal(state, prevStateArr[i])) {
              instance.set(stateName, state);

              prevStateArr[i] = state;
            }
          }
        } else {
          for (let i = stateNamesListLength; i--; ) {
            prevStateArr[i] = props[stateNamesList[i]];
          }
        }
      }
    });
  };

  if (handlerNamesList.length === 0) {
    return useStateEffect;
  }

  let useHandlersEffect: UseStateAndHandlers<A, S> = (instanceRef, props) => {
    for (let i = handlerNamesList.length; i--; ) {
      const handlerName = handlerNamesList[i];

      const handler = props[handlerName];

      useEffect(() => {
        const instance = instanceRef.current;

        if (instance && handler) {
          const dependBy = connectedPairs[handlerName];

          const listener = instance.addListener(
            handlersMap[handlerName],
            dependBy
              ? function (this: typeof instance, ...args: any[]) {
                  handler(this.get(dependBy), ...args, this);
                }
              : function (this: typeof instance, ...args: any[]) {
                  handler(...args, this);
                }
          );

          return () => listener.remove();
        }

        return;
      }, [handler]);
    }
  };

  if (stateNamesListLength === 0) {
    return useHandlersEffect;
  }

  const connectedHandlers: A[] = [];

  for (let i = handlerNamesList.length; i--; ) {
    const handlerName = handlerNamesList[i];

    const stateName: S | undefined = connectedPairs[handlerName];

    if (stateName && stateNamesList.includes(stateName)) {
      connectedHandlers.push(handlerName);

      handlerNamesList.splice(i, 1);
    }
  }

  const connectedHandlersLength = connectedHandlers.length;

  if (connectedHandlersLength === 0) {
    return (instanceRef, props) => {
      useHandlersEffect(instanceRef, props);

      useStateEffect(instanceRef, props);
    };
  }

  if (handlerNamesList.length === 0) {
    useHandlersEffect = noop;
  }

  return (instanceRef, props) => {
    const dataRef = useRef<{
      isTriggeredBySetStateMap: Map<string, true>;
      prevStateArr: unknown[];
    }>({
      isTriggeredBySetStateMap: new Map(),
      prevStateArr: [],
    });

    useHandlersEffect(instanceRef, props);

    const { isTriggeredBySetStateMap } = dataRef.current;

    for (let i = connectedHandlersLength; i--; ) {
      const handlerName = connectedHandlers[i];

      const handler = props[handlerName];

      useEffect(() => {
        const instance = instanceRef.current;

        if (instance && handler) {
          const dependBy = connectedPairs[handlerName]!;

          const listener = instance.addListener(
            handlersMap[handlerName],
            function (this: typeof instance, ...args: any[]) {
              if (!isTriggeredBySetStateMap.has(dependBy)) {
                handler(this.get(dependBy), ...args, this);
              } else {
                isTriggeredBySetStateMap.delete(dependBy);
              }
            }
          );

          return () => listener.remove();
        }
      }, [handler]);
    }

    useEffect(() => {
      const instance = instanceRef.current;

      if (instance) {
        const { prevStateArr } = dataRef.current;

        if (prevStateArr.length) {
          for (let i = stateNamesListLength; i--; ) {
            const stateName = stateNamesList[i];

            const state: unknown = props[stateName];

            if (!equal(state, prevStateArr[i])) {
              isTriggeredBySetStateMap.set(stateName, true);

              instance.set(stateName, state);

              prevStateArr[i] = state;
            }
          }
        } else {
          for (let i = stateNamesListLength; i--; ) {
            prevStateArr[i] = props[stateNamesList[i]];
          }
        }
      }
    });
  };
};

export default createUseStateAndHandlers;
