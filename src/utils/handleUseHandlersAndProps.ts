import { useEffect, useRef } from 'react';
import { HandlerName, handlersMap } from './constants';
import noop from './noop';

export type UseHandlersAndProps<
  A extends HandlerName = HandlerName,
  S extends string = string
> = (
  instance: google.maps.MVCObject,
  props: Partial<Record<A, (...args: any) => void>> & Record<S, unknown>
) => void;

const handleUseHandlersAndProps = <H extends HandlerName, P extends string>(
  handlerNamesList: H[],
  propsNamesList: P[],
  connectedPairs: Partial<Record<H, P>>
): UseHandlersAndProps<H, P> => {
  if (!propsNamesList.length && !handlerNamesList.length) {
    return noop;
  }

  const usePropsEffect = (
    prevStateArr: unknown[],
    instance: google.maps.MVCObject,
    props: Record<string, any>,
    onStateChange: (stateName: string) => void
  ) => {
    useEffect(() => {
      const fn: (i: number) => void = prevStateArr.length
        ? (i) => {
            const stateName = propsNamesList[i];

            const state = props[stateName];

            if (state !== prevStateArr[i]) {
              onStateChange(stateName);

              instance.set(stateName, state);

              prevStateArr[i] = state;
            }
          }
        : (i) => {
            prevStateArr[i] = props[propsNamesList[i]];
          };

      for (let i = propsNamesList.length; i--; ) {
        fn(i);
      }
    });
  };

  const useProps: UseHandlersAndProps<H, P> = (instance, props) => {
    usePropsEffect(useRef<unknown[]>([]).current, instance, props, noop);
  };

  if (!handlerNamesList.length) {
    return useProps;
  }

  let useHandlers: UseHandlersAndProps<H, P> = (instance, props) => {
    for (let i = handlerNamesList.length; i--; ) {
      const handlerName = handlerNamesList[i];

      let handler = props[handlerName];

      useEffect(() => {
        if (handler) {
          const dependBy = connectedPairs[handlerName];

          let fn;

          if (dependBy && handler.length) {
            handler = handler.bind(instance);

            fn = () => {
              handler!(instance.get(dependBy));
            };
          } else {
            fn = handler;
          }

          const listener = instance.addListener(handlersMap[handlerName], fn);

          return listener.remove.bind(listener);
        }
      }, [handler]);
    }
  };

  if (!propsNamesList.length) {
    return useHandlers;
  }

  const connectedHandlers: H[] = [];

  for (let i = handlerNamesList.length; i--; ) {
    const handlerName = handlerNamesList[i];

    const stateName: P | undefined = connectedPairs[handlerName];

    if (stateName && propsNamesList.includes(stateName)) {
      connectedHandlers.push(handlerName);

      handlerNamesList.splice(i, 1);
    }
  }

  if (!connectedHandlers.length) {
    return (instanceRef, props) => {
      useHandlers(instanceRef, props);

      useProps(instanceRef, props);
    };
  }

  if (!handlerNamesList.length) {
    useHandlers = noop;
  }

  return (instance, props) => {
    const data = useRef<{
      _isTriggeredBySetStateSet: Set<string>;
      _prevStateArr: unknown[];
    }>({
      _isTriggeredBySetStateSet: new Set(),
      _prevStateArr: [],
    }).current;

    useHandlers(instance, props);

    const { _isTriggeredBySetStateSet } = data;

    for (let i = connectedHandlers.length; i--; ) {
      const handlerName = connectedHandlers[i];

      let handler = props[handlerName];

      useEffect(() => {
        if (handler) {
          const dependBy = connectedPairs[handlerName]!;

          handler = handler.bind(instance);

          const listener = instance.addListener(
            handlersMap[handlerName],
            () => {
              if (_isTriggeredBySetStateSet.has(dependBy)) {
                _isTriggeredBySetStateSet.delete(dependBy);
              } else {
                handler!(instance.get(dependBy));
              }
            }
          );

          return listener.remove.bind(listener);
        }
      }, [handler]);
    }

    usePropsEffect(
      data._prevStateArr,
      instance,
      props,
      _isTriggeredBySetStateSet.add.bind(_isTriggeredBySetStateSet)
    );
  };
};

export default handleUseHandlersAndProps;
