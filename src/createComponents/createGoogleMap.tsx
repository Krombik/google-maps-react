import React, {
  CSSProperties,
  PropsWithChildren,
  useEffect,
  useRef,
  useState,
} from 'react';
import { GenerateHandlers } from '../types';
import setRef from '../utils/setRef';
import { MapContext } from '../hooks/useGoogleMap';
import wrapper from '../utils/wrapper';

type Handlers = GenerateHandlers<
  google.maps.Map,
  {
    onBoundsChanged: [];
    onCenterChanged: [];
    onClick: [e: google.maps.MapMouseEvent | google.maps.IconMouseEvent];
    onContextMenu: [e: google.maps.MapMouseEvent];
    onDoubleClick: [e: google.maps.MapMouseEvent];
    onDrag: [];
    onDragEnd: [];
    onDragStart: [];
    onHeadingChanged: [];
    onIdle: [];
    onMapTypeIdChanged: [];
    onMouseMove: [e: google.maps.MapMouseEvent];
    onMouseOut: [e: google.maps.MapMouseEvent];
    onMouseOver: [e: google.maps.MapMouseEvent];
    onProjectionChanged: [];
    onResize: [];
    onRightClick: [e: google.maps.MapMouseEvent];
    onTilesLoaded: [];
    onTiltChanged: [];
    onZoomChanged: [];
  }
>;

type State = Required<
  Pick<
    google.maps.MapOptions,
    | 'center'
    | 'clickableIcons'
    | 'heading'
    | 'mapTypeId'
    | 'streetView'
    | 'tilt'
    | 'zoom'
  >
>;

type Props = PropsWithChildren<{
  className?: string;
  style?: CSSProperties;
  defaultOptions?: Readonly<google.maps.MapOptions>;
}>;

const createGoogleMapComponent = wrapper<
  Props,
  Handlers,
  State,
  google.maps.Map
>(
  (useStateAndHandlers) =>
    ({ children, className, style, defaultOptions, ...props }, ref) => {
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

          if (ref) setRef(ref, map);

          setMap(map);
        }

        return () => {
          if (ref) setRef(ref, null);
        };
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
