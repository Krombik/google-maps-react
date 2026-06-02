import type { UnGet } from '../types';
import { CHANGED } from './constants';

/** @internal */
const createConnectedEventMap = <Instance>(
  arr: Array<UnGet<keyof Instance>> | undefined
) => {
  const connectedPairs = new Map<string, UnGet<keyof Instance>>();

  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      const item = arr[i];

      connectedPairs.set((item as string).toLowerCase() + CHANGED, item);
    }
  }

  return connectedPairs;
};

/** @internal */
export default createConnectedEventMap;
