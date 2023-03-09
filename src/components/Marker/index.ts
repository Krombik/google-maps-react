import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../../types';
import handleComponent from '../../utils/handleComponent';

export type MarkerProps = ComponentProps<typeof Marker>;

const Marker = handleComponent<
  google.maps.Marker,
  {
    onAnimationChanged: [animation: GetValue<google.maps.Marker, 'animation'>];
    onClickableChanged: [clickable: GetValue<google.maps.Marker, 'clickable'>];
    onCursorChanged: [cursor: GetValue<google.maps.Marker, 'cursor'>];
    onDraggableChanged: [draggable: GetValue<google.maps.Marker, 'draggable'>];
    onFlatChanged: [];
    onIconChanged: [icon: GetValue<google.maps.Marker, 'icon'>];
    onPositionChanged: [position: GetValue<google.maps.Marker, 'position'>];
    onShapeChanged: [shape: GetValue<google.maps.Marker, 'shape'>];
    onTitleChanged: [title: GetValue<google.maps.Marker, 'title'>];
    onVisibleChanged: [visible: GetValue<google.maps.Marker, 'visible'>];
    onZIndexChanged: [zIndex: GetValue<google.maps.Marker, 'zIndex'>];
  } & MouseHandlers,
  {
    /**
     * Which animation to play when marker is added to a map.
     */
    animation: true;
    /**
     * If `true`, the marker receives mouse and touch events.
     */
    clickable: true;
    /**
     * Mouse cursor type to show on hover.
     */
    cursor: true;
    /**
     * If true, the marker can be dragged.
     */
    draggable: true;
    /**
     * Icon for the foreground. If a string is provided, it is treated as though it were an Icon with the string as url.
     */
    icon: true;
    /**
     * Adds a label to the marker. A marker label is a letter or number that appears inside a marker. The label can either be a string, or a MarkerLabel object. If provided and {@link google.maps.MarkerOptions.title title} is not provided, an accessibility text (e.g. for use with screen readers) will be added to the marker with the provided label's text. Please note that the label is currently only used for accessibility text for non-optimized markers.
     */
    label: true;
    /**
     * A number between 0.0, transparent, and 1.0, opaque.
     */
    opacity: true;
    position: true;
    /**
     * Image map region definition used for drag/click.
     */
    shape: true;
    /**
     * Rollover text. If provided, an accessibility text (e.g. for use with screen readers) will be added to the marker with the provided value. Please note that the title is currently only used for accessibility text for non-optimized markers.
     */
    title: true;
    /**
     * If `true`, the marker is visible.
     */
    visible: true;
    /**
     * All markers are displayed on the map in order of their zIndex, with higher values displaying in front of markers with lower values. By default, markers are displayed according to their vertical position on screen, with lower markers appearing in front of markers further up the screen.
     */
    zIndex: true;
  }
>(['Marker'], {
  onAnimationChanged: 'animation',
  onCursorChanged: 'cursor',
  onDraggableChanged: 'draggable',
  onIconChanged: 'icon',
  onPositionChanged: 'position',
  onShapeChanged: 'shape',
  onTitleChanged: 'title',
  onVisibleChanged: 'visible',
  onZIndexChanged: 'zIndex',
});

export default Marker;
