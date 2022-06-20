import Loader, { LoaderStatus } from 'google-maps-js-api-loader';

export type Service<T extends Record<string, any>> = {
  [key in keyof T]: ReturnType<T[key]> extends Awaited<ReturnType<T[key]>>
    ?
        | T[key]
        | {
            (...args: Parameters<T[key]>): Promise<ReturnType<T[key]>>;
          }
    : T[key];
};

const handleFn = <T extends Record<string, any>, K extends keyof T>(
  service: T,
  key: K,
  self: Service<T>
): T[K] => {
  const fn: T[K] = service[key].bind(service);

  Object.defineProperty(self, key, {
    value: fn,
    writable: false,
    configurable: false,
  });

  return fn;
};

const handleService = <T extends Record<string, any>>(
  getService: () => T,
  keys: (keyof T)[]
) => {
  let service: T;

  let promise: Promise<T>;

  const self = {} as Service<T>;

  for (let i = keys.length; i--; ) {
    const key = keys[i];

    Object.defineProperty(self, key, {
      get() {
        if (Loader.status === LoaderStatus.LOADED) {
          if (!service) {
            service = getService();
          }

          return handleFn(service, key, self);
        }

        if (!promise) {
          promise = Loader.completion.then(() => {
            service = getService();

            return service;
          });
        }

        let fn: T[keyof T];

        const method = async (...args: any[]) => {
          if (!fn) {
            fn = handleFn(await promise, key, self);
          }

          return fn(...args);
        };

        Object.defineProperty(self, key, { value: method, configurable: true });

        return method;
      },
      configurable: true,
    });
  }

  return self;
};

export default handleService;
