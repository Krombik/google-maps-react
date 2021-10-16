import { MutableRefObject, useEffect, useRef } from 'react';
import { HandlerName } from '../types';
import { handlersMap } from './constants';
import isNotEqual from './isNotEqual';

export type UseStateAndHandlers<
  A extends HandlerName = HandlerName,
  S extends string = string
> = (
  instanceRef: MutableRefObject<
    Pick<google.maps.Map, 'addListener' | 'set'> | undefined
  >,
  props: Partial<Record<A, (...args: any) => void>> & Record<S, unknown>
) => void;

const createUseStateAndHandlers = <A extends HandlerName, S extends string>(
  handlerNamesList: readonly A[],
  stateNamesList: readonly S[],
  connectedHandlersAndState: Partial<Record<A, S>>
): UseStateAndHandlers<A, S> => {
  if (stateNamesList.length === 0 && handlerNamesList.length === 0)
    return () => void 0;

  handlerNamesList = Array.from(new Set(handlerNamesList)).reverse();

  stateNamesList = Array.from(new Set(stateNamesList)).reverse();

  const stateNamesListLength = stateNamesList.length;

  type _P = Parameters<UseStateAndHandlers<A, S>>;

  const stateEffect = (
    prevStateArr: unknown[],
    instance: NonNullable<_P[0]['current']>,
    props: _P[1]
  ) => {
    if (prevStateArr.length) {
      for (let i = stateNamesListLength; i--; ) {
        const stateName = stateNamesList[i];

        const state: unknown = props[stateName];

        if (isNotEqual(state, prevStateArr[i])) {
          instance.set(stateName, state);

          prevStateArr[i] = state;
        }
      }
    } else {
      for (let i = stateNamesListLength; i--; ) {
        prevStateArr[i] = props[stateNamesList[i]];
      }
    }
  };

  let handlersEffect = (
    listeners: google.maps.MapsEventListener[],
    handlerNamesList: readonly A[],
    instance: NonNullable<_P[0]['current']>,
    props: _P[1]
  ) => {
    for (let i = handlerNamesList.length; i--; ) {
      const handlerName = handlerNamesList[i];

      const handler = props[handlerName];

      if (handler) {
        listeners.push(instance.addListener(handlersMap[handlerName], handler));
      }
    }
  };

  if (handlerNamesList.length === 0) {
    return (instanceRef, props) => {
      const prevStateArrRef = useRef<unknown[]>([]);

      useEffect(() => {
        const instance = instanceRef.current;

        if (instance) stateEffect(prevStateArrRef.current, instance, props);
      });
    };
  }

  if (stateNamesListLength === 0) {
    return (instanceRef, props) => {
      useEffect(() => {
        const instance = instanceRef.current;
        const listeners: google.maps.MapsEventListener[] = [];

        if (instance) {
          handlersEffect(listeners, handlerNamesList, instance, props);
        }

        return () => {
          for (let i = listeners.length; i--; ) listeners[i].remove();
        };
      });
    };
  }

  const connectedPairs = handlerNamesList.reduce<Partial<Record<A, S>>>(
    (acc, handlerName) => {
      const stateName: S | undefined = connectedHandlersAndState[handlerName];

      return stateName && stateNamesList.includes(stateName)
        ? { ...acc, [handlerName]: stateName }
        : acc;
    },
    {}
  );

  const connectedHandlers = Object.keys(connectedPairs) as A[];

  const connectedHandlersLength = connectedHandlers.length;

  if (connectedHandlersLength === 0) {
    return (instanceRef, props) => {
      const prevStateArrRef = useRef<unknown[]>([]);

      useEffect(() => {
        const instance = instanceRef.current;
        const listeners: google.maps.MapsEventListener[] = [];

        if (instance) {
          handlersEffect(listeners, handlerNamesList, instance, props);

          stateEffect(prevStateArrRef.current, instance, props);
        }

        return () => {
          for (let i = listeners.length; i--; ) listeners[i].remove();
        };
      });
    };
  }

  handlerNamesList = handlerNamesList.filter(
    (item) => !connectedHandlers.includes(item)
  );

  if (!handlerNamesList.length) handlersEffect = () => void 0;

  return (instanceRef, props) => {
    const dataRef = useRef<{
      isTriggeredBySetStateObj: Record<string, boolean>;
      prevStateArr: unknown[];
    }>({
      isTriggeredBySetStateObj: {},
      prevStateArr: [],
    });

    useEffect(() => {
      const instance = instanceRef.current;
      const listeners: google.maps.MapsEventListener[] = [];

      if (instance) {
        handlersEffect(listeners, handlerNamesList, instance, props);

        const { isTriggeredBySetStateObj, prevStateArr } = dataRef.current;

        for (let i = connectedHandlersLength; i--; ) {
          const handlerName = connectedHandlers[i];

          const handler = props[handlerName];

          const dependBy = connectedPairs[handlerName]!;

          if (handler) {
            listeners.push(
              instance.addListener(
                handlersMap[handlerName],
                function (this: ThisParameterType<typeof handler>) {
                  if (!isTriggeredBySetStateObj[dependBy]) {
                    handler.apply(this, arguments);
                  } else {
                    isTriggeredBySetStateObj[dependBy] = false;
                  }
                }
              )
            );
          }
        }

        if (prevStateArr.length) {
          for (let i = stateNamesListLength; i--; ) {
            const stateName = stateNamesList[i];

            const state: unknown = props[stateName];

            if (isNotEqual(state, prevStateArr[i])) {
              isTriggeredBySetStateObj[stateName] = true;

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

      return () => {
        for (let i = listeners.length; i--; ) listeners[i].remove();
      };
    });
  };
};

export default createUseStateAndHandlers;
