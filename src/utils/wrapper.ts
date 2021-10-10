import { forwardRef, ReactElement, Ref } from 'react';
import { HandlerName } from '../types';
import createUseStateAndHandlers, {
  UseStateAndHandlers,
} from './createUseStateAndHandlers';

type Render<P, T> = (props: P, ref: Ref<T>) => ReactElement | null;

const wrapper =
  <
    Props extends Record<string, unknown>,
    Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
    State extends Record<string, unknown>,
    Instance = unknown
  >(
    createRender: <
      A extends keyof Handlers & HandlerName,
      S extends keyof State & string
    >(
      useStateAndHandlers: UseStateAndHandlers
    ) => Render<Props & Pick<Handlers, A> & Pick<State, S>, Instance>,
    connectedHandlersAndState: Partial<
      Record<keyof Handlers & HandlerName, keyof State & string>
    > = {}
  ) =>
  <A extends keyof Handlers & HandlerName, S extends keyof State & string>(
    handlerNamesList: readonly A[],
    stateNamesList: readonly S[]
  ) =>
    forwardRef(
      createRender<A, S>(
        createUseStateAndHandlers<A, S>(
          handlerNamesList,
          stateNamesList,
          connectedHandlersAndState as Partial<Record<A, S>>
        )
      )
    );

export default wrapper;
