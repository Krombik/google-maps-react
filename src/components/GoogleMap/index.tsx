import React, {
  CSSProperties,
  ComponentProps,
  PropsWithChildren,
  forwardRef,
} from 'react';
import type {
  CombineProps,
  GetValue,
  DragEventName,
  MouseHandlers,
} from '../../types';
import useConst from '../../utils/useConst';
import setRef from '../../utils/setRef';
import MapContext from '../../context/MapContext';
import useHandlersAndProps from '../../utils/useHandlersAndProps';
import PanesProvider from '../../providers/PanesProvider';

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
> & {
  className?: string;
  style?: CSSProperties;
};

export type GoogleMapProps = ComponentProps<typeof GoogleMap>;

const GoogleMap = forwardRef<google.maps.Map, PropsWithChildren<Props>>(
  (props, ref) => {
    const { children } = props;

    const data = useConst(() => {
      const div = document.createElement('div');

      const map = new google.maps.Map(div, {
        ...props.defaultOptions,
        ...props,
      });

      div.style.width = div.style.height = '100%';

      setRef(ref, map);

      return [
        map,
        (el: HTMLDivElement | null) => {
          if (el) {
            el.prepend(div);
          } else {
            setRef(ref, el);
          }
        },
      ] as const;
    });

    const map = data[0];

    useHandlersAndProps(
      map,
      props,
      {
        onCenterChanged: 'center',
        onHeadingChanged: 'heading',
        onMapTypeIdChanged: 'mapTypeId',
        onTiltChanged: 'tilt',
        onZoomChanged: 'zoom',
        onBoundsChanged: 'bounds',
      },
      ['className', 'style', 'children', 'defaultOptions']
    );

    return (
      <div ref={data[1]} className={props.className} style={props.style}>
        {children && (
          <MapContext.Provider value={map}>
            <PanesProvider map={map}>{children}</PanesProvider>
          </MapContext.Provider>
        )}
      </div>
    );
  }
);

export default GoogleMap;
