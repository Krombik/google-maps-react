import { forwardRef, ReactElement, Ref } from 'react';
import { ActionName } from '../types';
import createUseStateAndActions, {
  UseStateAndActions,
} from './createUseStateAndActions';

type Render<P, T> = (props: P, ref: Ref<T>) => ReactElement | null;

const wrapper =
  <
    Props extends Record<string, unknown>,
    Actions extends Partial<Record<ActionName, (...args: any[]) => void>>,
    State extends Record<string, unknown>,
    Instance = unknown
  >(
    createRender: <
      A extends keyof Actions & ActionName,
      S extends keyof State & string
    >(
      useStateAndActions: UseStateAndActions
    ) => Render<Props & Pick<Actions, A> & Pick<State, S>, Instance>,
    connectedPairs: Partial<
      Record<keyof Actions & ActionName, keyof State & string>
    > = {}
  ) =>
  <A extends keyof Actions & ActionName, S extends keyof State & string>(
    actionNamesList: readonly A[],
    stateNamesList: readonly S[]
  ) =>
    forwardRef(
      createRender<A, S>(
        createUseStateAndActions<A, S>(
          actionNamesList,
          stateNamesList,
          connectedPairs as Partial<Record<A, S>>
        )
      )
    );

export default wrapper;
