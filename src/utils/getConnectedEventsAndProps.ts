import { UnGet } from '../types';

/** @internal */
const getConnectedEventsAndProps = <Instance>(
  arr: Array<UnGet<keyof Instance>> | undefined
) => {
  const connectedEventsAndProps = new Map<string, UnGet<keyof Instance>>();

  if (arr) {
    for (let i = arr.length; i--; ) {
      const item = arr[i];

      connectedEventsAndProps.set(
        `${(item as string).toLowerCase()}_changed`,
        item
      );
    }
  }

  return connectedEventsAndProps;
};

/** @internal */
export default getConnectedEventsAndProps;
