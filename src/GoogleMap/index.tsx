'use client';

import {
  type ComponentProps,
  type FC,
  type PropsWithChildren,
  type SuspenseProps,
  Suspense,
  forwardRef,
  useContext,
  useState,
} from 'react';
import type {
  CombineProps,
  GetValue,
  DragEventName,
  MouseHandlers,
  PreventLoadProps,
} from '../types';
import MapContext from '../utils/MapContext';
import useHandlersAndProps from '../utils/useHandlersAndProps';
import getConnectedEventsAndProps from '../utils/getConnectedEventsAndProps';
import useConst from 'react-helpful-utils/useConst';
import setRef from 'react-helpful-utils/setRef';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import { MAPS } from '../utils/constants';
import noop from 'lodash.noop';
import GetPaneContext from '../utils/GetPaneContext';
import handleHas from '../utils/handleHas';
import toKey from 'keyweaver';
import handleRef from '../utils/handleRef';

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
  Pick<SuspenseProps, 'fallback'> &
  PreventLoadProps;

export type GoogleMapProps = ComponentProps<typeof GoogleMap>;

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
  'preventLoad',
]);

const mapsStorage = new Map<
  string,
  [mapsInUse: Set<number>, maps: (google.maps.Map | google.maps.MapPanes)[]]
>();

const PropsHandler: FC<PropsWithChildren<Props>> = (props) => {
  useHandlersAndProps<PropsWithChildren<Props>, google.maps.Map>(
    props,
    connectedEventsAndProps,
    isKeyOmitted
  )(useContext(MapContext));

  return null;
};

const GoogleMap = forwardRef<google.maps.Map, PropsWithChildren<Props>>(
  (props, ref) =>
    useConst(() => {
      const { preventLoad } = props;

      let getPane: (pane: keyof google.maps.MapPanes) => Element;

      let map: google.maps.Map;

      let error: any;

      let forceRerender: (value: {}) => void;

      const divRef = handleRef<HTMLDivElement>((el) => {
        let isAlive = true;

        let isExisted: boolean;

        const options: google.maps.MapOptions = {
          ...props.defaultOptions,
          ...props,
        };

        const key = toKey([
          options.backgroundColor || null,
          options.controlSize || 40,
          options.mapId || null,
          options.renderingType || null,
        ]);

        if (!mapsStorage.has(key)) {
          mapsStorage.set(key, [new Set(), []]);
        }

        const [mapsInUse, maps] = mapsStorage.get(key)!;

        for (
          var currMapIndex = 0;
          mapsInUse.has(currMapIndex);
          currMapIndex += 2
        ) {}

        mapsInUse.add(currMapIndex);

        map = maps[currMapIndex] as google.maps.Map;

        const handleMap = () => {
          if (isAlive) {
            isExisted = true;

            if (map) {
              delete options.backgroundColor;
              delete options.controlSize;
              delete options.mapId;
              delete options.renderingType;

              map.setOptions(options);

              map.moveCamera({});
            } else {
              const div = document.createElement('div');

              div.style.width = div.style.height = '100%';

              maps[currMapIndex] = map = new (GoogleMapsLoader.get(MAPS)!.Map)(
                div,
                options
              );
            }

            let promise: Promise<void> | undefined;

            let panes = maps[currMapIndex + 1] as google.maps.MapPanes;

            getPane = (pane) => {
              if (panes) {
                return panes[pane];
              }

              if (!promise) {
                promise = new Promise<void>((resolve) => {
                  const overlayView = new (GoogleMapsLoader.get(
                    MAPS
                  )!.OverlayView)();

                  overlayView.onRemove = overlayView.draw = noop;

                  overlayView.onAdd = () => {
                    maps[currMapIndex + 1] = panes = overlayView.getPanes()!;

                    overlayView.setMap(null);

                    promise = undefined;

                    resolve();
                  };

                  overlayView.setMap(map);
                });
              }

              throw promise;
            };

            el.prepend(map.getDiv());

            setRef(ref, map);

            forceRerender({});
          }
        };

        if (map) {
          handleMap();
        } else {
          const status = GoogleMapsLoader.getStatus(MAPS);

          if (status == 'loaded') {
            handleMap();
          } else {
            const onError = (err: any) => {
              if (isAlive) {
                error = err;

                forceRerender({});
              }
            };

            if (status != 'error') {
              (preventLoad
                ? GoogleMapsLoader.getCompletion
                : GoogleMapsLoader.load)(MAPS).then(handleMap, onError);
            } else {
              onError(GoogleMapsLoader.getError(MAPS));
            }
          }
        }

        return () => {
          isAlive = false;

          mapsInUse.delete(currMapIndex);

          if (isExisted) {
            const MAX_LAT = (Math.atan(Math.sinh(Math.PI)) * 180) / Math.PI;

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
                map.getRenderingType() === google.maps.RenderingType.VECTOR,
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

            setRef(ref, null);
          }
        };
      });

      return (props: PropsWithChildren<Props>) => {
        if (error) {
          throw error;
        }

        const { children, fallback } = props;

        forceRerender = useState<{}>()[1];

        return (
          <div
            ref={divRef}
            className={props.className}
            style={props.style}
            id={props.id}
          >
            {map ? (
              <MapContext.Provider value={map}>
                <PropsHandler {...props} />
                {children && (
                  <GetPaneContext.Provider value={getPane}>
                    <Suspense fallback={fallback || null}>{children}</Suspense>
                  </GetPaneContext.Provider>
                )}
              </MapContext.Provider>
            ) : (
              fallback
            )}
          </div>
        );
      };
    })(props)
);

export default GoogleMap;
