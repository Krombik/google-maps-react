import Loader, { LoaderStatus } from 'google-maps-js-api-loader';
import { useState, useLayoutEffect } from 'react';
import noop from '../utils/noop';

type Options = {
  onLoaded?: () => void;
  onError?: (err: ErrorEvent | Error) => void;
  silent?: boolean;
};

const IS_CLIENT = typeof window != 'undefined';

const useGoogleMapLoader = ((options: Options = {}) => {
  let unlisten: undefined | (() => void);

  const laud = !options.silent;

  const [status, setStatus] = useState(() => {
    if (IS_CLIENT && Loader.status < 2) {
      const { onLoaded, onError } = options;

      const handleLoaded = laud
        ? () => {
            setStatus(2);

            (onLoaded || noop)();
          }
        : onLoaded;

      const handleError = laud
        ? (err: any) => {
            setStatus(3);

            (onError || noop)(err);
          }
        : onError;

      const unlistenLoaded =
        handleLoaded && Loader.addListener(2, handleLoaded);

      const unlistenError = handleError && Loader.addListener(3, handleError);

      unlisten =
        unlistenLoaded && unlistenError
          ? () => {
              unlistenLoaded();

              unlistenError();
            }
          : unlistenLoaded || unlistenError;

      Loader.load();
    }

    return Loader.status;
  });

  useLayoutEffect(() => unlisten, []);

  if (laud) {
    return status;
  }
}) as {
  (options?: Omit<Options, 'silent'> & { silent?: false }): LoaderStatus;
  (options: Omit<Options, 'silent'> & { silent: true }): void;
};

export default useGoogleMapLoader;
