import { MutableRefObject, useEffect, useRef } from 'react';
import { HandlerName } from '../types';
import { eventMap } from './constants';

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

  const handlerNamesListLength = handlerNamesList.length;

  type _UseStateAndHandlers = UseStateAndHandlers<A, S>;

  type _P = { value: _UseStateAndHandlers };

  const _ = {
    get useState(): _UseStateAndHandlers {
      Object.defineProperty(this, 'useState', {
        value: (instanceRef, props) => {
          const isNotFirstRenderRef = useRef<boolean>();

          for (let i = stateNamesListLength; i--; ) {
            const stateName = stateNamesList[i];

            const state: unknown = props[stateName];

            useEffect(() => {
              if (isNotFirstRenderRef.current) {
                instanceRef.current?.set(stateName, state);
              } else if (!i) {
                isNotFirstRenderRef.current = true;
              }
            }, [state]);
          }
        },
      } as _P);

      return this.useState;
    },

    get useHandlers(): _UseStateAndHandlers {
      Object.defineProperty(this, 'useHandlers', {
        value: (instanceRef, props) => {
          for (let i = handlerNamesListLength; i--; ) {
            const handlerName = handlerNamesList[i];

            const handler = props[handlerName];

            useEffect(
              () =>
                handler &&
                instanceRef.current?.addListener(eventMap[handlerName], handler)
                  .remove,
              [handler]
            );
          }
        },
      } as _P);

      return this.useHandlers;
    },
  };

  if (handlerNamesListLength === 0) {
    return _.useState;
  }

  if (stateNamesListLength === 0) {
    return _.useHandlers;
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
    const { useHandlers, useState } = _;

    return (instanceRef, props) => {
      useHandlers(instanceRef, props);

      useState(instanceRef, props);
    };
  }

  const connectedState: S[] = Object.values(connectedPairs);

  const connectedStateLength = connectedState.length;

  const unconnectedHandlers = handlerNamesList.filter(
    (item) => !connectedHandlers.includes(item)
  );

  const unconnectedHandlersLength = unconnectedHandlers.length;

  const unconnectedState = stateNamesList.filter(
    (item) => !connectedState.includes(item)
  );

  const unconnectedStateLength = unconnectedState.length;

  return (instanceRef, props) => {
    const dataRef = useRef<{
      isTriggeredBySetStateObj: Record<string, boolean>;
      isNotFirstRender?: boolean;
    }>({ isTriggeredBySetStateObj: {} });

    for (let i = unconnectedHandlersLength; i--; ) {
      const handlerName = unconnectedHandlers[i];

      const handler = props[handlerName];

      useEffect(
        () =>
          handler &&
          instanceRef.current?.addListener(eventMap[handlerName], handler)
            .remove,
        [handler]
      );
    }

    for (let i = connectedHandlersLength; i--; ) {
      const handlerName = connectedHandlers[i];

      const handler = props[handlerName];

      useEffect(() => {
        if (!handler) return;

        const dependBy = connectedPairs[handlerName]!;

        const { isTriggeredBySetStateObj } = dataRef.current;

        return instanceRef.current?.addListener(
          eventMap[handlerName],
          function (this: ThisParameterType<typeof handler>) {
            if (!isTriggeredBySetStateObj[dependBy]) {
              handler.apply(this, arguments);
            } else {
              isTriggeredBySetStateObj[dependBy] = false;
            }
          }
        ).remove;
      }, [handler]);
    }

    for (let i = unconnectedStateLength; i--; ) {
      const stateName = unconnectedState[i];

      const state: unknown = props[stateName];

      useEffect(() => {
        if (dataRef.current.isNotFirstRender)
          instanceRef.current?.set(stateName, state);
      }, [state]);
    }

    for (let i = connectedStateLength; i--; ) {
      const stateName = connectedState[i];

      const state: unknown = props[stateName];

      useEffect(() => {
        const data = dataRef.current;

        if (data.isNotFirstRender) {
          data.isTriggeredBySetStateObj[stateName] = true;

          instanceRef.current?.set(stateName, state);
        } else if (!i) {
          data.isNotFirstRender = true;
        }
      }, [state]);
    }
  };
};

export default createUseStateAndHandlers;
