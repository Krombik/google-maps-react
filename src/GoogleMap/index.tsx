'use client';

import {
  type ComponentProps,
  type FC,
  type PropsWithChildren,
  type SuspenseProps,
  type ForwardedRef,
  type ReactElement,
  Suspense,
  forwardRef,
  useRef,
} from 'react';
import type {
  CombineProps,
  GetValue,
  DragEventName,
  MouseHandlers,
} from '../types';
import MapContext from '../utils/MapContext';
import useHandlersAndProps from '../utils/useHandlersAndProps';
import createConnectedEventMap from '../utils/createConnectedEventMap';
import setRef from 'react-helpful-utils/setRef';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import { IS_SERVER, MAPS } from '../utils/constants';
import noop from 'lodash.noop';
import PanesContext from '../utils/PanesContext';
import createHas from '../utils/createHas';
import createRefCallback from '../utils/createRefCallback';
import { jsx } from 'react/jsx-runtime';

type Props = CombineProps<
  google.maps.Map,
  {
    onBoundsChanged: [bounds: GetValue<google.maps.Map, 'bounds'>];
    onCenterChanged: [center: GetValue<google.maps.Map, 'center'>];
    onDrag: [];
    onDragEnd: [];
    onDragStart: [];
    onHeadingChanged: [heading: GetValue<google.maps.Map, 'heading'>];
    onIdle: [];
    onMapTypeIdChanged: [mapTypeId: GetValue<google.maps.Map, 'mapTypeId'>];
    onProjectionChanged: [projection: GetValue<google.maps.Map, 'projection'>];
    onResize: [];
    onTilesLoaded: [];
    onTiltChanged: [tilt: GetValue<google.maps.Map, 'tilt'>];
    onZoomChanged: [zoom: GetValue<google.maps.Map, 'zoom'>];
  } & Omit<MouseHandlers, DragEventName>,
  | 'backgroundColor'
  | 'controlSize'
  | 'mapId'
  | 'renderingType'
  | 'minZoom'
  | 'maxZoom'
  | 'restriction'
> &
  Pick<ComponentProps<'div'>, 'className' | 'style' | 'id'> &
  Pick<SuspenseProps, 'fallback'>;

export type GoogleMapProps = ComponentProps<typeof GoogleMap>;

let defaultMapOptions: google.maps.MapOptions | undefined;

/**
 * Settable {@link google.maps.MapOptions} reset to their defaults when a pooled
 * map instance is reused. Built lazily — `google.maps` is not available at
 * module-eval time. `setOptions` only overrides passed keys, so any omitted key
 * keeps the previous consumer's value.
 *
 * `maxZoom`, `minZoom` and `restriction` are intentionally NOT listed:
 * - They have no fixed default — Google's default is "auto" (per-location zoom
 *   range; no restriction). No number resets zoom (any value is a cap), and a
 *   restriction needs longitude bounds that grey out wide viewports.
 * - Pushing them through `setOptions` on an already-initialized vector (WebGL)
 *   map re-clamps the camera and breaks the reattached view (grey tiles) —
 *   including `null`, which is the documented "clear" value.
 * Consumers needing a zoom cap or restriction should pass it via `defaultOptions`.
 */
const updateOptions = (map: google.maps.Map, options: Props) => {
  if (!defaultMapOptions) {
    const { ControlPosition, MapTypeId } = google.maps;

    defaultMapOptions = {
      cameraControl: true,
      cameraControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_END,
      },
      clickableIcons: true,
      disableDefaultUI: false,
      disableDoubleClickZoom: false,
      draggable: true,
      draggableCursor: null,
      draggingCursor: null,

      fullscreenControl: true,
      fullscreenControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_START,
      },
      gestureHandling: 'auto',
      heading: 0,
      headingInteractionEnabled: false,
      keyboardShortcuts: true,
      mapTypeControl: true,

      mapTypeControlOptions: {
        mapTypeIds: [
          MapTypeId.ROADMAP,
          MapTypeId.SATELLITE,
          MapTypeId.HYBRID,
          MapTypeId.TERRAIN,
        ],
        position: ControlPosition.BLOCK_START_INLINE_START,
        style: google.maps.MapTypeControlStyle.DEFAULT,
      },
      mapTypeId: MapTypeId.ROADMAP,
      noClear: false,
      panControl: false,
      panControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_END,
      },
      rotateControl: false,
      rotateControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_END,
      },
      scaleControl: false,
      scaleControlOptions: {
        style: google.maps.ScaleControlStyle.DEFAULT,
      },
      scrollwheel: true,
      streetView: null,
      streetViewControl: true,
      streetViewControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_END,
      },
      styles: null,
      tilt: 0,
      tiltInteractionEnabled: false,
      zoomControl: true,
      zoomControlOptions: {
        position: ControlPosition.INLINE_END_BLOCK_END,
      },
    };
  }

  map.setOptions({
    ...defaultMapOptions,
    isFractionalZoomEnabled:
      map.getRenderingType() == google.maps.RenderingType.VECTOR,
    ...options,
  });

  map.moveCamera({});
};

const connectedEventsAndProps = createConnectedEventMap<google.maps.Map>([
  'center',
  'heading',
  'mapTypeId',
  'tilt',
  'zoom',
  'bounds',
]);

const isKeyOmitted = createHas<GoogleMapProps>([
  'className',
  'style',
  'id',
  'children',
  'defaultOptions',
  'fallback',
  'ref',
]);

const stringifyRestriction = (restriction: google.maps.MapRestriction) => {
  const bounds = restriction.latLngBounds as google.maps.LatLngBounds &
    google.maps.LatLngBoundsLiteral;

  const literal = typeof bounds.toJSON == 'function' ? bounds.toJSON() : bounds;

  return `${literal.north},${literal.south},${literal.east},${literal.west},${
    restriction.strictBounds ? 1 : 0
  }`;
};

type RenderMap = ((
  props: PropsWithChildren<Props>,
  ref: ForwardedRef<google.maps.Map>
) => ReactElement) & {
  _isFree?: boolean;
};

const mapsStorage = new Map<string, Array<RenderMap>>();

const GoogleMap = forwardRef<google.maps.Map, PropsWithChildren<Props>>(
  (props, ref) => {
    if (IS_SERVER) {
      return null;
    }

    const renderRef = useRef<RenderMap>(noop as any);

    if (renderRef.current == noop) {
      const defaultOptions = props.defaultOptions || {};

      const key = `${defaultOptions.controlSize || 40},${
        defaultOptions.backgroundColor || ''
      },${defaultOptions.mapId || ''},${defaultOptions.renderingType || ''},${
        defaultOptions.minZoom || ''
      },${defaultOptions.maxZoom || ''},${
        defaultOptions.restriction
          ? stringifyRestriction(defaultOptions.restriction)
          : ''
      }`;

      let components = mapsStorage.get(key);

      if (components) {
        for (let i = 0; i < components.length; i++) {
          const render = components[i];

          if (render._isFree) {
            renderRef.current = render;

            return render(props, ref);
          }
        }
      } else {
        mapsStorage.set(key, (components = []));
      }

      let map: google.maps.Map | undefined;

      let panes: google.maps.MapPanes | undefined;

      let mapPromise: Promise<void> | undefined;

      let resolvePromise: () => void = noop;

      const SuspendedGoogleMap: FC<PropsWithChildren<Props>> = (props) => {
        if (panes) {
          const { children } = props;

          useHandlersAndProps<PropsWithChildren<Props>, google.maps.Map>(
            props,
            connectedEventsAndProps,
            isKeyOmitted
          )(map!);

          return children ? (
            <MapContext.Provider value={map!}>
              <PanesContext.Provider value={panes}>
                {children}
              </PanesContext.Provider>
            </MapContext.Provider>
          ) : null;
        }

        if (GoogleMapsLoader.getStatus(MAPS) == 'error') {
          throw GoogleMapsLoader.getError(MAPS);
        }

        if (!mapPromise) {
          mapPromise = new Promise((resolve) => {
            resolvePromise = () => {
              resolvePromise = noop;

              mapPromise = undefined;

              resolve();
            };
          });
        }

        throw mapPromise;
      };

      const divRef = createRefCallback<HTMLDivElement>((el) => {
        let isAlive = true;

        const _ref = ref;

        if (map) {
          updateOptions(map, props);

          el.prepend(map.getDiv());

          setRef(_ref, map);
        } else {
          const options = props.defaultOptions
            ? {
                ...props.defaultOptions,
                ...props,
              }
            : props;

          const handleMap = () => {
            if (isAlive) {
              const div = document.createElement('div');

              const overlayView = new (GoogleMapsLoader.get(
                MAPS
              )!.OverlayView)();

              overlayView.onRemove = overlayView.draw = noop;

              overlayView.onAdd = () => {
                const resolvePanes = () => {
                  if (isAlive) {
                    const currentPanes = overlayView.getPanes();

                    if (currentPanes) {
                      panes = currentPanes;

                      overlayView.setMap(null);

                      resolvePromise();
                    } else {
                      requestAnimationFrame(resolvePanes);
                    }
                  }
                };

                resolvePanes();
              };

              div.style.width = div.style.height = '100%';

              el.prepend(div);

              overlayView.setMap(
                (map = new (GoogleMapsLoader.get(MAPS)!.Map)(div, options))
              );

              setRef(_ref, map);
            }
          };

          if (GoogleMapsLoader.getStatus(MAPS) == 'loaded') {
            handleMap();
          } else {
            GoogleMapsLoader.load(MAPS).then(handleMap, resolvePromise);
          }
        }

        props = ref = undefined!;

        return () => {
          isAlive = false;

          render._isFree = true;

          resolvePromise();

          if (map) {
            setRef(_ref, null);
          }
        };
      });

      const render: RenderMap = (_props, _ref) => {
        if (render._isFree) {
          props = _props;

          ref = _ref;

          render._isFree = false;
        }

        return (
          <div
            ref={divRef}
            className={_props.className}
            style={_props.style}
            id={_props.id}
          >
            <Suspense fallback={_props.fallback || null}>
              {jsx(SuspendedGoogleMap, _props)}
            </Suspense>
          </div>
        );
      };

      components.push(render);

      renderRef.current = render;
    }

    return renderRef.current(props, ref);
  }
);

export default GoogleMap;
