import { ReactElement } from 'react';
import { GetState, HandlerName, SetLiteral, UnSet } from '../types';
import createUseStateAndHandlers, {
  UseStateAndHandlers,
} from './createUseStateAndHandlers';

type Render<P> = (props: P) => ReactElement | null;

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
    ) => Render<
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
      Record<keyof Handlers & HandlerName, StateKeys>
    > = {}
  ) =>
  <H extends keyof Handlers & HandlerName, S extends StateKeys>(
    handlerNamesList: H[],
    stateNamesList: S[]
  ) =>
    createRender<H, S>(
      createUseStateAndHandlers<H, S>(
        handlerNamesList,
        stateNamesList,
        connectedHandlersAndState as Partial<Record<H, S>>
      )
    );

export default wrapper;
