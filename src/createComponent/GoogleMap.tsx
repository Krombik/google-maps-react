import React, { CSSProperties, PropsWithChildren, useState } from 'react';
import { Expand, GetValue, HandlersMap, PropsMap } from '../types';
import wrapper from '../utils/wrapper';
import noop from '../utils/noop';
import PanesContext from '../context/PanesContext';
import useConst from '../hook/utils/useConst';
import setRef from '../utils/setRef';
import MapContext from '../context/MapContext';
import { DragEventName, MouseHandlers } from './types';

type Handlers = HandlersMap<
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
  } & Omit<MouseHandlers, DragEventName>
>;

type Props = PropsMap<
  google.maps.Map,
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
>;

type BaseProps = {
  className?: string;
  style?: CSSProperties;
};

export type GoogleMapProps = Expand<Handlers & Props & BaseProps>;

const createGoogleMapComponent = wrapper<
  google.maps.Map,
  google.maps.MapOptions,
  Handlers,
  Props,
  PropsWithChildren<BaseProps>
>(
  (useHandlersAndProps) => (props, ref) => {
    const [panes, setPanes] = useState<google.maps.MapPanes>();

    const { _map, _divRef } = useConst(() => {
      const div = document.createElement('div');

      div.style.width = div.style.height = '100%';

      const _map = new google.maps.Map(div, {
        ...props.defaultOptions,
        ...props,
      });

      setRef(ref, _map);

      const t = new google.maps.OverlayView();

      t.onRemove = t.draw = noop;

      t.onAdd = () => {
        setPanes(t.getPanes()!);

        t.setMap(null);
      };

      t.setMap(_map);

      return {
        _map,
        _divRef(el: HTMLDivElement | null) {
          if (el) {
            el.prepend(div);
          } else {
            setRef(ref, el);
          }
        },
      };
    });

    useHandlersAndProps(_map, props);

    const { children } = props;

    return (
      <div ref={_divRef} className={props.className} style={props.style}>
        {children && (
          <MapContext.Provider value={_map}>
            <PanesContext.Provider value={panes}>
              {children}
            </PanesContext.Provider>
          </MapContext.Provider>
        )}
      </div>
    );
  },
  {
    onCenterChanged: 'center',
    onHeadingChanged: 'heading',
    onMapTypeIdChanged: 'mapTypeId',
    onTiltChanged: 'tilt',
    onZoomChanged: 'zoom',
    onBoundsChanged: 'bounds',
  }
);

export default createGoogleMapComponent;
