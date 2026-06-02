'use client';

import type { ComponentProps } from 'react';
import type { GetValue, MouseHandlers } from '../types';
import createMapChildComponent from '../utils/createMapChildComponent';

export type MarkerProps = ComponentProps<typeof Marker>;

/** @deprecated */
const Marker = createMapChildComponent<
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
  'anchorPoint' | 'collisionBehavior' | 'crossOnDrag' | 'optimized'
>(
  ['marker', 'Marker'],
  [
    'animation',
    'cursor',
    'draggable',
    'icon',
    'position',
    'shape',
    'title',
    'visible',
    'zIndex',
  ]
);

export default Marker;