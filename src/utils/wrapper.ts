import { FC } from 'react';
import { GetState, HandlerName, SetLiteral, UnSet } from '../types';
import createUseStateAndHandlers, {
  UseStateAndHandlers,
} from './createUseStateAndHandlers';

function wrapper<
  Instance extends Record<SetLiteral<string>, (value: any) => void> | {},
  Props extends Record<string, unknown>,
  Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
  StateKeys extends UnSet<keyof Instance>
>(
  createRender: <H extends keyof Handlers & HandlerName, S extends StateKeys>(
    useStateAndHandlers: UseStateAndHandlers
  ) => FC<
    Props & {
      onMount?(instance: Instance): void;
      onUnmount?(): void;
    } & Partial<Pick<Handlers, H>> &
      Pick<GetState<Instance, StateKeys>, S>
  >,
  connectedHandlersAndState: Partial<
    Record<keyof Handlers & HandlerName, UnSet<keyof Instance>>
  > = {}
) {
  return <H extends keyof Handlers & HandlerName, S extends StateKeys>(
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
}

export default wrapper;
