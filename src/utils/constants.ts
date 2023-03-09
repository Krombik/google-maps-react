/** @internal */
export const handlersMap = {
  // Mouse
  onClick: 'click',
  onContextMenu: 'contextmenu',
  onDoubleClick: 'dblclick',
  onDrag: 'drag',
  onDragEnd: 'dragend',
  onDragStart: 'dragstart',
  onMouseDown: 'mousedown',
  onMouseUp: 'mouseup',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onRightClick: 'rightclick',

  // Common
  onBoundsChanged: 'bounds_changed',
  onCenterChanged: 'center_changed',
  onVisibleChanged: 'visible_changed',

  // Map
  onHeadingChanged: 'heading_changed',
  onIdle: 'idle',
  onMapTypeIdChanged: 'maptypeid_changed',
  onProjectionChanged: 'projection_changed',
  onResize: 'resize',
  onTilesLoaded: 'tilesloaded',
  onTiltChanged: 'tilt_changed',
  onZoomChanged: 'zoom_changed',

  // Marker
  onAnimationChanged: 'animation_changed',
  onClickableChanged: 'clickable_changed',
  onCursorChanged: 'cursor_changed',
  onDraggableChanged: 'draggable_changed',
  onFlatChanged: 'flat_changed',
  onIconChanged: 'icon_changed',
  onPositionChanged: 'position_changed',
  onShapeChanged: 'shape_changed',
  onTitleChanged: 'title_changed',
  onZIndexChanged: 'zindex_changed',

  // Circle
  onRadiusChange: 'radius_changed',

  // DrawingManager
  onCircleComplete: 'circlecomplete',
  onMarkerComplete: 'markercomplete',
  onOverlayComplete: 'overlaycomplete',
  onPolygonComplete: 'polygoncomplete',
  onPolylineComplete: 'polylinecomplete',
  onRectangleComplete: 'rectanglecomplete',
} as const;

/** @internal */
export type HandlerName = keyof typeof handlersMap;
