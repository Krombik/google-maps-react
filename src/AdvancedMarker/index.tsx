'use client';

import {
  type ReactNode,
  type FC,
  useContext,
  forwardRef,
  useLayoutEffect,
  useEffect,
  useRef,
} from 'react';
import { createPortal } from 'react-dom';
import noop from 'lodash.noop';
import { GoogleMapsLoader } from 'google-maps-js-api-loader';
import setRef from 'react-helpful-utils/setRef';
import MapContext from '../utils/MapContext';
import createHas from '../utils/createHas';
import type { PreventLoadProps } from '../types';

type AdvancedMarkerElement = google.maps.marker.AdvancedMarkerElement;

const MARKER = 'marker';

export type AdvancedMarkerProps = Omit<
  google.maps.marker.AdvancedMarkerElementOptions,
  'content' | 'map'
> & {
  /**
   * Custom marker content (portaled into a container the marker adopts). Takes
   * precedence over {@link AdvancedMarkerProps.pin pin}. When neither is given,
   * the default Google pin is shown.
   */
  children?: ReactNode;
  /**
   * Options for a {@link google.maps.marker.PinElement} used as the marker's
   * content — a customizable variant of the default pin. Ignored when
   * {@link AdvancedMarkerProps.children children} is provided.
   */
  pin?: google.maps.marker.PinElementOptions;
  onClick?(
    this: AdvancedMarkerElement,
    event: google.maps.marker.AdvancedMarkerClickEvent
  ): void;
  onDrag?(this: AdvancedMarkerElement, event: google.maps.MapMouseEvent): void;
  onDragStart?(
    this: AdvancedMarkerElement,
    event: google.maps.MapMouseEvent
  ): void;
  onDragEnd?(
    this: AdvancedMarkerElement,
    event: google.maps.MapMouseEvent
  ): void;
} & PreventLoadProps;

const isKeyOmitted = createHas<AdvancedMarkerProps>([
  'children',
  'pin',
  'preventLoad',
  'ref',
]);

let isUnsafe = true;

const AdvancedMarker = forwardRef<AdvancedMarkerElement, AdvancedMarkerProps>(
  (props, outerRef) => {
    if (isUnsafe) {
      const status = GoogleMapsLoader.getStatus(MARKER);

      if (status != 'loaded') {
        throw (
          status != 'error'
            ? props.preventLoad
              ? GoogleMapsLoader.getCompletion
              : GoogleMapsLoader.load
            : GoogleMapsLoader.getError
        )(MARKER);
      }

      isUnsafe = false;
    }

    const renderRef = useRef<FC<AdvancedMarkerProps>>(noop as any);

    if (renderRef.current == noop) {
      const content = document.createElement('div');

      let marker!: AdvancedMarkerElement;

      let pin: google.maps.marker.PinElement | undefined;

      const handlersList: string[] = [];

      const propsList: string[] = [];

      for (const key in props) {
        if (!isKeyOmitted(key as keyof AdvancedMarkerProps)) {
          (key.startsWith('on') ? handlersList : propsList).push(key);
        }
      }

      renderRef.current = (props) => {
        const map = useContext(MapContext);

        const hasContent = props.children != null;

        useLayoutEffect(() => {
          let contentNode: Node | undefined;

          if (hasContent) {
            contentNode = content;
          } else if (props.pin) {
            pin = new (GoogleMapsLoader.get(MARKER)!.PinElement)();

            contentNode = pin.element;
          }

          marker = new (GoogleMapsLoader.get(MARKER)!.AdvancedMarkerElement)({
            map,
            content: contentNode,
          });

          setRef(outerRef, marker);

          return () => {
            marker.map = null;

            setRef(outerRef, null);
          };
        }, []);

        const pinOptions = props.pin;

        useLayoutEffect(() => {
          if (pin && pinOptions) {
            for (const key in pinOptions) {
              const value = (pinOptions as Record<string, any>)[key];

              if (value !== undefined) {
                (pin as Record<string, any>)[key] = value;
              }
            }
          }
        }, [pinOptions]);

        for (let i = propsList.length; i--; ) {
          const key = propsList[i];

          const value = (props as Record<string, any>)[key];

          useLayoutEffect(() => {
            if (value !== undefined) {
              (marker as Record<string, any>)[key] = value;
            }
          }, [value]);
        }

        for (let i = handlersList.length; i--; ) {
          const key = handlersList[i];

          const value = (props as Record<string, any>)[key] as
            | ((...args: any[]) => void)
            | undefined;

          useEffect(() => {
            if (value) {
              const listener = marker.addListener(
                key != 'onClick' ? key.slice(2).toLowerCase() : 'gmp-click',
                value.bind(marker)
              );

              return () => listener.remove();
            }
          }, [value]);
        }

        return hasContent ? createPortal(props.children, content) : null;
      };
    }

    return renderRef.current(props);
  }
);

export default AdvancedMarker;
