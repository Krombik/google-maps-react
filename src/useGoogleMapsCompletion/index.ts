import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import createUseLibrary from '../utils/createUseLibrary';

/**
 * Hook for awaiting loading of google.maps script or specific library/libraries
 * > Works only for [Suspense](https://react.dev/reference/react/Suspense) wrapped components
 */
const useGoogleMapsCompletion = createUseLibrary(
  GoogleMapsLoader.getCompletion
);

export default useGoogleMapsCompletion;
