import { ClassType, ExtendsOrNever } from '../types';
import getFromGoogleMap, { GetFromGoogleMap } from './getFromGoogleMap';
import isFunction from './isFunction';

type AnyService = Record<string, any>;

const handleService = <Path extends ReadonlyArray<string>>(
  path: Path,
  keys: (keyof ExtendsOrNever<
    InstanceType<GetFromGoogleMap<Path>>,
    AnyService
  >)[],
  arg?: any
) => {
  type Instance = ExtendsOrNever<
    InstanceType<GetFromGoogleMap<Path>>,
    AnyService
  >;

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

export default handleService;
