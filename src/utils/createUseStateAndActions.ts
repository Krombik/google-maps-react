import { MutableRefObject, useEffect, useRef } from 'react';
import { ActionName } from '../types';
import { eventMap } from './constants';

// const useStateAndActions = <A extends Action, S extends string>(
//   connectedActions: A[],
//   connectedState: S[],
//   connectedPairs: Partial<Record<A, S>>,
//   instanceRef: MutableRefObject<
//     Pick<google.maps.Map, 'addListener' | 'set'> | undefined
//   >,
//   props: Partial<Record<A, (...args: any) => void>> &
//     Partial<Record<S, unknown>>
// ) => {
//   const dataRef = useRef<{
//     isTriggeredBySetStateObj: Record<string, boolean>;
//     isNotFirstRerender?: boolean;
//   }>({ isTriggeredBySetStateObj: {} });

//   const connectedActionsLength = connectedActions.length;

//   for (let i = 0; i < connectedActionsLength; i++) {
//     const actionName = connectedActions[i];

//     const action = props[actionName];

//     useEffect(() => {
//       if (!action) return;

//       const dependBy: S | undefined = connectedPairs[actionName];

//       const { isTriggeredBySetStateObj } = dataRef.current;

//       return instanceRef.current?.addListener(
//         eventMap[actionName],
//         dependBy
//           ? function (this: ThisParameterType<typeof action>, ...args: any[]) {
//               if (!isTriggeredBySetStateObj[dependBy]) {
//                 action.apply(this, args);
//               } else {
//                 isTriggeredBySetStateObj[dependBy] = false;
//               }
//             }
//           : action
//       ).remove;
//     }, [action]);
//   }

//   const connectedStateLength = connectedState.length;

//   for (let i = 0; i < connectedStateLength; i++) {
//     const stateName = connectedState[i];

//     const state: unknown = props[stateName];

//     useEffect(() => {
//       const data = dataRef.current;

//       if (data.isNotFirstRerender) {
//         data.isTriggeredBySetStateObj[stateName] = true;

//         instanceRef.current?.set(stateName, state);
//       } else {
//         data.isNotFirstRerender = true;
//       }
//     }, [state]);
//   }
// };

export type UseStateAndActions<
  A extends ActionName = ActionName,
  S extends string = string
> =
  | ((
      instanceRef: MutableRefObject<
        Pick<google.maps.Map, 'addListener' | 'set'> | undefined
      >,
      props: Partial<Record<A, (...args: any) => void>> & Record<S, unknown>
    ) => void)
  | null;

const createUseStateAndActions = <A extends ActionName, S extends string>(
  actionNamesList: readonly A[],
  stateNamesList: readonly S[],
  connectPairs: Partial<Record<A, S>>
): UseStateAndActions<A, S> => {
  if (stateNamesList.length === 0 && actionNamesList.length === 0) return null;

  actionNamesList = Array.from(new Set(actionNamesList)).reverse();

  stateNamesList = Array.from(new Set(stateNamesList)).reverse();

  const stateNamesListLength = stateNamesList.length;

  const actionNamesListLength = actionNamesList.length;

  if (actionNamesListLength === 0) {
    return (instanceRef, props) => {
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
    };
  }

  if (stateNamesListLength === 0) {
    return (instanceRef, props) => {
      for (let i = actionNamesListLength; i--; ) {
        const actionName = actionNamesList[i];

        const action = props[actionName];
        console.log(i);

        useEffect(
          () =>
            action &&
            instanceRef.current?.addListener(eventMap[actionName], action)
              .remove,
          [action]
        );
      }
    };
  }

  const connectedPairs = actionNamesList.reduce<Partial<Record<A, S>>>(
    (acc, actionName) => {
      const stateName: S | undefined = connectPairs[actionName];

      return stateName && stateNamesList.includes(stateName)
        ? { ...acc, [actionName]: stateName }
        : acc;
    },
    {}
  );

  const connectedActions = Object.keys(connectedPairs) as A[];

  const connectedActionsLength = connectedActions.length;

  if (connectedActionsLength === 0) {
    return (instanceRef, props) => {
      for (let i = actionNamesListLength; i--; ) {
        const actionName = actionNamesList[i];

        const action = props[actionName];

        useEffect(
          () =>
            action &&
            instanceRef.current?.addListener(eventMap[actionName], action)
              .remove,
          [action]
        );
      }

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
    };
  }

  const connectedState: S[] = Object.values(connectedPairs);

  const connectedStateLength = connectedState.length;

  const unconnectedActions = actionNamesList.filter(
    (item) => !connectedActions.includes(item)
  );

  const unconnectedActionsLength = unconnectedActions.length;

  const unconnectedState = stateNamesList.filter(
    (item) => !connectedState.includes(item)
  );

  const unconnectedStateLength = unconnectedState.length;

  return (instanceRef, props) => {
    const dataRef = useRef<{
      isTriggeredBySetStateObj: Record<string, boolean>;
      isNotFirstRender?: boolean;
    }>({ isTriggeredBySetStateObj: {} });

    for (let i = unconnectedActionsLength; i--; ) {
      const actionName = unconnectedActions[i];

      const action = props[actionName];

      useEffect(
        () =>
          action &&
          instanceRef.current?.addListener(eventMap[actionName], action).remove,
        [action]
      );
    }

    for (let i = connectedActionsLength; i--; ) {
      const actionName = connectedActions[i];

      const action = props[actionName];

      useEffect(() => {
        if (!action) return;

        const dependBy = connectedPairs[actionName]!;

        const { isTriggeredBySetStateObj } = dataRef.current;

        return instanceRef.current?.addListener(
          eventMap[actionName],
          function (this: ThisParameterType<typeof action>, ...args: any[]) {
            if (!isTriggeredBySetStateObj[dependBy]) {
              action.apply(this, args);
            } else {
              isTriggeredBySetStateObj[dependBy] = false;
            }
          }
        ).remove;
      }, [action]);
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

export default createUseStateAndActions;
