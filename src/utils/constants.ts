import { GoogleMapEvents } from '../enums';

export const eventMap = Object.freeze({
  onBoundsChanged: GoogleMapEvents.BOUNDS_CHANGED,
  onCenterChanged: GoogleMapEvents.CENTER_CHANGED,
  onClick: GoogleMapEvents.CLICK,
  onDoubleClick: GoogleMapEvents.DOUBLE_CLICK,
  onDrag: GoogleMapEvents.DRAG,
  onDragEnd: GoogleMapEvents.DRAG_END,
  onDragStart: GoogleMapEvents.DRAG_START,
  onContextMenu: GoogleMapEvents.CONTEXT_MENU,
  onHeadingChanged: GoogleMapEvents.HEADING_CHANGED,
  onIdle: GoogleMapEvents.IDLE,
  onMapTypeIdChanged: GoogleMapEvents.MAP_TYPE_ID_CHANGED,
  onMouseMove: GoogleMapEvents.MOUSE_MOVE,
  onMouseOut: GoogleMapEvents.MOUSE_OUT,
  onMouseOver: GoogleMapEvents.MOUSE_OVER,
  onProjectionChanged: GoogleMapEvents.PROJECTION_CHANGED,
  onResize: GoogleMapEvents.RESIZE,
  onRightClick: GoogleMapEvents.RIGHT_CLICK,
  onTilesLoaded: GoogleMapEvents.TILES_LOADED,
  onTiltChanged: GoogleMapEvents.TILT_CHANGED,
  onZoomChanged: GoogleMapEvents.ZOOM_CHANGED,
});
