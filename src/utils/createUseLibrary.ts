import {
  type GoogleMapsLibraries,
  type GoogleMapsLibrary,
  GoogleMapsLoader,
} from 'google-maps-js-api-loader';

/** @internal */
const createUseLibrary = (
  getCompletion:
    | typeof GoogleMapsLoader.load
    | typeof GoogleMapsLoader.getCompletion
) =>
  ((...libraries: GoogleMapsLibrary[]) => {
    const l = libraries.length;

    if (l < 2) {
      const status = GoogleMapsLoader.getStatus(...(libraries as []));

      if (status == 'loaded') {
        return l ? GoogleMapsLoader.get(libraries[0])! : undefined;
      }

      throw status != 'error'
        ? getCompletion(...libraries)
        : GoogleMapsLoader.getError(libraries[0]);
    }

    const libs: GoogleMapsLibraries[GoogleMapsLibrary][] = [];

    for (let i = 0; i < l; i++) {
      const library = libraries[i];

      const lib = GoogleMapsLoader.get(library);

      if (!lib) {
        throw GoogleMapsLoader.getStatus(library) != 'error'
          ? getCompletion(...libraries)
          : GoogleMapsLoader.getError(library);
      }

      libs.push(lib);
    }

    return libs;
  }) as {
    (): void;
    <L extends GoogleMapsLibrary>(library: L): GoogleMapsLibraries[L];
    <const A extends GoogleMapsLibrary[]>(
      ...libraries: A
    ): {
      [Index in keyof A]: GoogleMapsLibraries[A[Index]];
    };
  };

/** @internal */
export default createUseLibrary;
