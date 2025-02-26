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
  useMemo,
  useState,
} from 'react';
import type {
  CombineProps,
  GetValue,
  DragEventName,
  MouseHandlers,
} from '../types';
import MapContext from '../utils/MapContext';
import useHandlersAndProps from '../utils/useHandlersAndProps';
import getConnectedEventsAndProps from '../utils/getConnectedEventsAndProps';
import setRef from 'react-helpful-utils/setRef';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import { MAPS } from '../utils/constants';
import noop from 'lodash.noop';
import PanesContext from '../utils/PanesContext';
import handleHas from '../utils/handleHas';
import handleRef from '../utils/handleRef';
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
  {
    center: true;
    /**
     * When `false`, map icons are not clickable. A map icon represents a point of interest, also known as a POI.
     */
    clickableIcons: true;
    /**
     * The heading for aerial imagery in degrees measured clockwise from cardinal direction North. Headings are snapped to the nearest available angle for which imagery is available.
     */
    heading: true;
    /**
     * The initial Map mapTypeId. Defaults to **ROADMAP**.
     */
    mapTypeId: true;
    /**
     * A {@link google.maps.StreetViewPanorama StreetViewPanorama} to display when the Street View pegman is dropped on the map. If no panorama is specified, a default {@link google.maps.StreetViewPanorama StreetViewPanorama} will be displayed in the map's div when the pegman is dropped.
     */
    streetView: true;
    /**
     * The initial Map zoom level. Valid zoom values are numbers from zero up to the supported maximum zoom level. Larger zoom values correspond to a higher resolution.
     */
    zoom: true;
  }
> &
  Pick<ComponentProps<'div'>, 'className' | 'style' | 'id'> &
  Pick<SuspenseProps, 'fallback'>;

export type GoogleMapProps = ComponentProps<typeof GoogleMap>;

const MAX_LAT = (Math.atan(Math.sinh(Math.PI)) * 180) / Math.PI;

const connectedEventsAndProps = getConnectedEventsAndProps<google.maps.Map>([
  'center',
  'heading',
  'mapTypeId',
  'tilt',
  'zoom',
  'bounds',
]);

const isKeyOmitted = handleHas<GoogleMapProps>([
  'className',
  'style',
  'id',
  'children',
  'defaultOptions',
  'fallback',
]);

type RenderMap = ((
  props: PropsWithChildren<Props>,
  ref: ForwardedRef<google.maps.Map>
) => ReactElement) & {
  _isFree?: boolean;
};

const mapsStorage = new Map<string, Array<RenderMap>>();

const GoogleMap = forwardRef<google.maps.Map, PropsWithChildren<Props>>(
  (props, ref) => {
    const { defaultOptions = {} } = props;

    const key = `${defaultOptions.backgroundColor || ''},${
      defaultOptions.controlSize || 40
    },${defaultOptions.mapId || ''},${defaultOptions.renderingType || ''}`;

    return useMemo(() => {
      if (!mapsStorage.has(key)) {
        mapsStorage.set(key, []);
      }

      const components = mapsStorage.get(key)!;

      for (let i = 0; i < components.length; i++) {
        const render = components[i];

        if (render._isFree) {
          return render;
        }
      }

      let map: google.maps.Map | undefined;

      let panes: google.maps.MapPanes | undefined;

      let mapPromise: Promise<void> | undefined;

      let resolveMap: () => void = noop;

      let isPanesPending = true;

      const Content: FC<PropsWithChildren> = (props) => {
        const forceRerender = useState<{}>()[1];

        if (panes) {
          return (
            <MapContext.Provider value={map!}>
              <PanesContext.Provider value={panes}>
                {props.children}
              </PanesContext.Provider>
            </MapContext.Provider>
          );
        }

        if (isPanesPending) {
          isPanesPending = false;

          const overlayView = new (GoogleMapsLoader.get(MAPS)!.OverlayView)();

          overlayView.onRemove = overlayView.draw = noop;

          overlayView.onAdd = () => {
            panes = overlayView.getPanes()!;

            overlayView.setMap(null);

            forceRerender(panes);
          };

          overlayView.setMap(map!);
        }

        return null;
      };

      const SuspendedGoogleMap: FC<PropsWithChildren<Props>> = (props) => {
        if (map) {
          const { children } = props;

          useHandlersAndProps<PropsWithChildren<Props>, google.maps.Map>(
            props,
            connectedEventsAndProps,
            isKeyOmitted
          )(map);

          return children ? <Content>{children}</Content> : null;
        }

        if (GoogleMapsLoader.getStatus(MAPS) == 'error') {
          throw GoogleMapsLoader.getError(MAPS);
        }

        if (!mapPromise) {
          mapPromise = new Promise((resolve) => {
            resolveMap = () => {
              resolveMap = noop;

              mapPromise = undefined;

              resolve();
            };
          });
        }

        throw mapPromise;
      };

      const divRef = handleRef<HTMLDivElement>((el) => {
        let isAlive = true;

        const options = {
          ...props.defaultOptions,
          ...props,
        };

        const _ref = ref;

        props = ref = undefined!;

        if (map) {
          map.setOptions(options);

          map.moveCamera({});

          el.prepend(map.getDiv());

          setRef(_ref, map);
        } else {
          const handleMap = () => {
            if (isAlive) {
              const div = document.createElement('div');

              div.style.width = div.style.height = '100%';

              map = new (GoogleMapsLoader.get(MAPS)!.Map)(div, options);

              resolveMap();

              el.prepend(div);

              setRef(_ref, map);
            }
          };

          if (GoogleMapsLoader.getStatus(MAPS) == 'loaded') {
            handleMap();
          } else {
            GoogleMapsLoader.load(MAPS).then(handleMap, () => {
              resolveMap();
            });
          }
        }

        return () => {
          isAlive = false;

          render._isFree = true;

          resolveMap();

          if (map) {
            const { ControlPosition, MapTypeId } = google.maps;

            map.setOptions({
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
              headingInteractionEnabled: false,
              isFractionalZoomEnabled:
                map.getRenderingType() == google.maps.RenderingType.VECTOR,
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
              maxZoom: null,
              minZoom: null,
              noClear: false,
              panControl: false,
              panControlOptions: {
                position: ControlPosition.INLINE_END_BLOCK_END,
              },
              restriction: {
                latLngBounds: {
                  west: -180,
                  east: 180,
                  north: MAX_LAT,
                  south: -MAX_LAT,
                },
                strictBounds: false,
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
              styles: null,
              tiltInteractionEnabled: false,
              zoomControl: true,
              zoomControlOptions: {
                position: ControlPosition.INLINE_END_BLOCK_END,
              },
            });

            map.moveCamera({ tilt: 0, heading: 0 });

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

      return render;
    }, [key])(props, ref);
  }
);

export default GoogleMap;
