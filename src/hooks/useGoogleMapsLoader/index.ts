import GoogleMapsLoader from 'google-maps-js-api-loader';
import { useState, useLayoutEffect } from 'react';
import noop from '../../utils/noop';

type Options = {
  onLoaded?: () => void;
  onError?: (err: ErrorEvent | Error) => void;
};

const IS_CLIENT = typeof window != 'undefined';

const useGoogleMapsLoader = (options?: Options) => {
  let unlisten: undefined | (() => void);

  const [status, setStatus] = useState(() => {
    if (IS_CLIENT && GoogleMapsLoader.status < 2) {
      const onLoad = (options && options.onLoaded) || noop;

      const onError = (options && options.onError) || noop;

      const unlistenLoaded = GoogleMapsLoader.addListener(2, () => {
        setStatus(2);

        onLoad();
      });

      const unlistenError = GoogleMapsLoader.addListener(3, (err: any) => {
        setStatus(3);

        onError(err);
      });

      unlisten = () => {
        unlistenLoaded();

        unlistenError();
      };

      GoogleMapsLoader.load();
    }

    return GoogleMapsLoader.status;
  });

  useLayoutEffect(() => unlisten, []);

  return status;
};

export default useGoogleMapsLoader;
