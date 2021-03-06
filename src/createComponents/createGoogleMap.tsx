import React, {
  CSSProperties,
  ReactNode,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GetValue } from '../types';
import { MapContext } from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';
import noop from '../utils/noop';

export type GoogleMapsHandlers = {
  onBoundsChanged(
    bounds: GetValue<google.maps.Map, 'bounds'>,
    map: google.maps.Map
  ): void;
  onCenterChanged(
    center: GetValue<google.maps.Map, 'center'>,
    map: google.maps.Map
  ): void;
  onClick(
    e: google.maps.MapMouseEvent | google.maps.IconMouseEvent,
    map: google.maps.Map
  ): void;
  onContextMenu(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onDoubleClick(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onDrag(map: google.maps.Map): void;
  onDragEnd(map: google.maps.Map): void;
  onDragStart(map: google.maps.Map): void;
  onHeadingChanged(
    heading: GetValue<google.maps.Map, 'heading'>,
    map: google.maps.Map
  ): void;
  onIdle(map: google.maps.Map): void;
  onMapTypeIdChanged(
    mapTypeId: GetValue<google.maps.Map, 'mapTypeId'>,
    map: google.maps.Map
  ): void;
  onMouseMove(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onMouseOut(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onMouseOver(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onProjectionChanged(
    projection: GetValue<google.maps.Map, 'projection'>,
    map: google.maps.Map
  ): void;
  onResize(map: google.maps.Map): void;
  onRightClick(e: google.maps.MapMouseEvent, map: google.maps.Map): void;
  onTilesLoaded(map: google.maps.Map): void;
  onTiltChanged(
    tilt: GetValue<google.maps.Map, 'tilt'>,
    map: google.maps.Map
  ): void;
  onZoomChanged(
    zoom: GetValue<google.maps.Map, 'zoom'>,
    map: google.maps.Map
  ): void;
};

export type GoogleMapsBaseProps = {
  className?: string;
  style?: CSSProperties;
  defaultOptions?: Readonly<google.maps.MapOptions>;
  children?: ReactNode | ((map: google.maps.Map) => ReactNode);
};

const createGoogleMapComponent = wrapper<
  google.maps.Map,
  GoogleMapsBaseProps,
  GoogleMapsHandlers,
  | 'center'
  | 'clickableIcons'
  | 'heading'
  | 'mapTypeId'
  | 'streetView'
  | 'tilt'
  | 'zoom'
>(
  (useStateAndHandlers) =>
    ({
      children,
      className,
      style,
      defaultOptions,
      onMount,
      onUnmount,
      ...props
    }) => {
      const mapElRef = useRef<HTMLDivElement>(null);

      const mapRef = useRef<google.maps.Map>();

      const [map, setMap] = useState<google.maps.Map>();

      useEffect(() => {
        const mapEl = mapElRef.current!;

        const map = new google.maps.Map(mapEl, {
          ...defaultOptions,
          ...props,
        });

        mapRef.current = map;

        google.maps.event.addListenerOnce(map, 'idle', () => {
          setMap(map);

          (onMount || noop)(map);
        });

        return onUnmount;
      }, []);

      useStateAndHandlers(mapRef, props);

      return (
        <div ref={mapElRef} className={className} style={style}>
          {children && map && (
            <MapContext.Provider value={map}>
              {typeof children === 'function' ? children(map) : children}
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
