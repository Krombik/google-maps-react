import React, {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GetValue } from '../types';
import { MapContext } from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';
import noop from '../utils/noop';

type Handlers = {
  onBoundsChanged(
    this: google.maps.Map,
    bounds: GetValue<google.maps.Map, 'bounds'>
  ): void;
  onCenterChanged(
    this: google.maps.Map,
    center: GetValue<google.maps.Map, 'center'>
  ): void;
  onClick(
    this: google.maps.Map,
    e: google.maps.MapMouseEvent | google.maps.IconMouseEvent
  ): void;
  onContextMenu(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onDoubleClick(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onDrag(this: google.maps.Map): void;
  onDragEnd(this: google.maps.Map): void;
  onDragStart(this: google.maps.Map): void;
  onHeadingChanged(
    this: google.maps.Map,
    heading: GetValue<google.maps.Map, 'heading'>
  ): void;
  onIdle(this: google.maps.Map): void;
  onMapTypeIdChanged(
    this: google.maps.Map,
    mapTypeId: GetValue<google.maps.Map, 'mapTypeId'>
  ): void;
  onMouseMove(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOut(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onMouseOver(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onProjectionChanged(
    this: google.maps.Map,
    projection: GetValue<google.maps.Map, 'projection'>
  ): void;
  onResize(this: google.maps.Map): void;
  onRightClick(this: google.maps.Map, e: google.maps.MapMouseEvent): void;
  onTilesLoaded(this: google.maps.Map): void;
  onTiltChanged(
    this: google.maps.Map,
    tilt: GetValue<google.maps.Map, 'tilt'>
  ): void;
  onZoomChanged(
    this: google.maps.Map,
    zoom: GetValue<google.maps.Map, 'zoom'>
  ): void;
};

type Props = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  defaultOptions?: Readonly<google.maps.MapOptions>;
}>;

const createGoogleMapComponent = wrapper<
  google.maps.Map,
  Props,
  Handlers,
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
        const mapEl = mapElRef.current;

        if (mapEl) {
          const map = new google.maps.Map(mapEl, {
            ...defaultOptions,
            ...props,
          });

          mapRef.current = map;

          (onMount || noop)(map);

          setMap(map);
        }

        return onUnmount;
      }, []);

      useStateAndHandlers(mapRef, props);

      return (
        <div ref={mapElRef} className={className} style={style}>
          {children && map && (
            <MapContext.Provider value={map}>{children}</MapContext.Provider>
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
  }
);

export default createGoogleMapComponent;
