import { GoogleMapEvents } from '../enums';

export const handlersMap = Object.freeze({
  // Common handlers
  onClick: GoogleMapEvents.CLICK,
  onDoubleClick: GoogleMapEvents.DOUBLE_CLICK,
  onDrag: GoogleMapEvents.DRAG,
  onDragEnd: GoogleMapEvents.DRAG_END,
  onDragStart: GoogleMapEvents.DRAG_START,
  onContextMenu: GoogleMapEvents.CONTEXT_MENU,
  onMouseMove: GoogleMapEvents.MOUSE_MOVE,
  onMouseOut: GoogleMapEvents.MOUSE_OUT,
  onMouseOver: GoogleMapEvents.MOUSE_OVER,
  onRightClick: GoogleMapEvents.RIGHT_CLICK,

  // Map handlers
  onBoundsChanged: GoogleMapEvents.BOUNDS_CHANGED,
  onCenterChanged: GoogleMapEvents.CENTER_CHANGED,
  onHeadingChanged: GoogleMapEvents.HEADING_CHANGED,
  onIdle: GoogleMapEvents.IDLE,
  onMapTypeIdChanged: GoogleMapEvents.MAP_TYPE_ID_CHANGED,
  onProjectionChanged: GoogleMapEvents.PROJECTION_CHANGED,
  onResize: GoogleMapEvents.RESIZE,
  onTilesLoaded: GoogleMapEvents.TILES_LOADED,
  onTiltChanged: GoogleMapEvents.TILT_CHANGED,
  onZoomChanged: GoogleMapEvents.ZOOM_CHANGED,

  // Marker handlers
  onAnimationChanged: GoogleMapEvents.ANIMATION_CHANGED,
  onClickableChanged: GoogleMapEvents.CLICKABLE_CHANGED,
  onCursorChanged: GoogleMapEvents.CURSOR_CHANGED,
  onDraggableChanged: GoogleMapEvents.DRAGGABLE_CHANGED,
  onFlatChanged: GoogleMapEvents.FLAT_CHANGED,
  onIconChanged: GoogleMapEvents.ICON_CHANGED,
  onMouseDown: GoogleMapEvents.MOUSE_DOWN,
  onMouseUp: GoogleMapEvents.MOUSE_UP,
  onPositionChanged: GoogleMapEvents.POSITION_CHANGED,
  onShapeChanged: GoogleMapEvents.SHAPE_CHANGED,
  onTitleChanged: GoogleMapEvents.TITLE_CHANGED,
  onVisibleChanged: GoogleMapEvents.VISIBLE_CHANGED,
  onZIndexChanged: GoogleMapEvents.Z_INDEX_CHANGED,
} as const);
