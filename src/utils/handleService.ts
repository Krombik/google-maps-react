import { ClassType, PathTo } from '../types';
import getFromGoogleMap from './getFromGoogleMap';
import isFunction from './isFunction';

/** @internal */
const handleService = <
  Instance extends Record<keyof Instance, (...args: any[]) => any>
>(
  path: PathTo<Instance>,
  keys: Array<keyof Instance>,
  arg?: any
) => {
  let service: Instance;

  const self = {} as Instance;

  for (let i = keys.length; i--; ) {
    const key = keys[i];

    Object.defineProperty(self, key, {
      get() {
        if (!service) {
          service = new (getFromGoogleMap(path) as ClassType<Instance>)(
            isFunction(arg) ? arg() : arg
          );
        }

        const value = service[key].bind(service);

        Object.defineProperty(self, key, { value });

        return value;
      },
      configurable: true,
    });
  }

  return self;
};

/** @internal */
export default handleService;
