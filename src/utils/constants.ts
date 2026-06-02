import type { GoogleMapsLibrary } from 'google-maps-js-api-loader';

export const MAPS = 'maps' satisfies GoogleMapsLibrary;

export const CHANGED = '_changed';

/** @internal */
export const IS_SERVER = typeof window == 'undefined';
