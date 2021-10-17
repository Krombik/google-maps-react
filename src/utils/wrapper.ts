import { forwardRef, ReactElement, Ref } from 'react';
import { GetState, HandlerName, SetLiteral, UnSet } from '../types';
import createUseStateAndHandlers, {
  UseStateAndHandlers,
} from './createUseStateAndHandlers';

type Render<P, T> = (props: P, ref: Ref<T>) => ReactElement | null;

const wrapper =
  <
    Instance extends Record<SetLiteral<string>, (value: any) => void> | {},
    Props extends Record<string, unknown>,
    Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
    State extends UnSet<keyof Instance>
  >(
    createRender: <A extends keyof Handlers & HandlerName, S extends State>(
      useStateAndHandlers: UseStateAndHandlers
    ) => Render<
      Props &
        Partial<Pick<Handlers, A> & { onInit(instance: Instance): void }> &
        Pick<GetState<Instance, State>, S>,
      Instance
    >,
    connectedHandlersAndState: Partial<
      Record<keyof Handlers & HandlerName, State>
    > = {}
  ) =>
  <A extends keyof Handlers & HandlerName, S extends State>(
    handlerNamesList: A[],
    stateNamesList: S[]
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
