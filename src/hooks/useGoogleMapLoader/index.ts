import Loader from 'google-maps-js-api-loader';
import { useState, useLayoutEffect } from 'react';
import noop from '../../utils/noop';

type Options = {
  onLoaded?: () => void;
  onError?: (err: ErrorEvent | Error) => void;
};

const IS_CLIENT = typeof window != 'undefined';

const useGoogleMapLoader = /* #__PURE__ */ (options?: Options) => {
  let unlisten: undefined | (() => void);

  const [status, setStatus] = useState(() => {
    if (IS_CLIENT && Loader.status < 2) {
      const onLoad = (options && options.onLoaded) || noop;

      const onError = (options && options.onError) || noop;

      const unlistenLoaded = Loader.addListener(2, () => {
        setStatus(2);

        onLoad();
      });

      const unlistenError = Loader.addListener(3, (err: any) => {
        setStatus(3);

        onError(err);
      });

      unlisten = () => {
        unlistenLoaded();

        unlistenError();
      };

      Loader.load();
    }

    return Loader.status;
  });

  useLayoutEffect(() => unlisten, []);

  return status;
};

export default useGoogleMapLoader;
