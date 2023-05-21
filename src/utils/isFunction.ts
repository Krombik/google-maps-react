/** @internal */
const isFunction = (value: any): value is Function =>
  typeof value == 'function';

/** @internal */
export default isFunction;
