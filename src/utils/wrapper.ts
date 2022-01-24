import { VFC, ReactElement } from 'react';
import { GetState, HandlerName, SetLiteral, UnSet } from '../types';
import createUseStateAndHandlers, {
  UseStateAndHandlers,
} from './createUseStateAndHandlers';

const wrapper =
  <
    Instance extends Record<SetLiteral<string>, (value: any) => void> | {},
    Props extends Record<string, unknown>,
    Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
    StateKeys extends UnSet<keyof Instance>,
    WithLifecycle extends boolean = true
  >(
    createRender: <H extends keyof Handlers & HandlerName, S extends StateKeys>(
      useStateAndHandlers: UseStateAndHandlers
    ) => VFC<
      Props &
        (WithLifecycle extends true
          ? {
              onMount?(instance: Instance): void;
              onUnmount?(): void;
            }
          : {}) &
        Partial<Pick<Handlers, H>> &
        Pick<GetState<Instance, StateKeys>, S>
    >,
    connectedHandlersAndState: Partial<
      Record<keyof Handlers & HandlerName, UnSet<keyof Instance>>
    > = {}
  ) =>
  <H extends keyof Handlers & HandlerName, S extends StateKeys>(
    handlerNamesList: H[],
    stateNamesList: S[]
  ) =>
    createRender<H, S>(
      createUseStateAndHandlers<H, UnSet<keyof Instance>>(
        handlerNamesList,
        stateNamesList,
        connectedHandlersAndState as Partial<Record<H, UnSet<keyof Instance>>>
      )
    );

export default wrapper;
