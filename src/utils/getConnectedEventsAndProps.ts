import type { UnGet } from '../types';
import { CHANGED } from './constants';

/** @internal */
const getConnectedEventsAndProps = <Instance>(
  arr: Array<UnGet<keyof Instance>> | undefined
) => {
  const connectedEventsAndProps = new Map<string, UnGet<keyof Instance>>();

  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];

      connectedEventsAndProps.set(
        (item as string).toLowerCase() + CHANGED,
        item
      );
    }
  }

  return connectedEventsAndProps;
};

/** @internal */
export default getConnectedEventsAndProps;
