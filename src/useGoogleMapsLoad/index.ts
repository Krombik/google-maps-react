import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import createUseLibrary from '../utils/createUseLibrary';

/**
 * Hook for loading google maps script or specific library/libraries
 * > Works only for [Suspense](https://react.dev/reference/react/Suspense) wrapped components
 */
const useGoogleMapsLoad = createUseLibrary(GoogleMapsLoader.load);

export default useGoogleMapsLoad;
