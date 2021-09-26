export enum GoogleMapEvents {
  BOUNDS_CHANGED = 'bounds_changed',
  CENTER_CHANGED = 'center_changed',
  CLICK = 'click',
  CONTEXT_MENU = 'contextmenu',
  DOUBLE_CLICK = 'dblclick',
  DRAG = 'drag',
  DRAG_END = 'dragend',
  DRAG_START = 'dragstart',
  HEADING_CHANGED = 'heading_changed',
  IDLE = 'idle',
  MAP_TYPE_ID_CHANGED = 'maptypeid_changed',
  MOUSE_MOVE = 'mousemove',
  MOUSE_OUT = 'mouseout',
  MOUSE_OVER = 'mouseover',
  PROJECTION_CHANGED = 'projection_changed',
  RESIZE = 'resize',
  RIGHT_CLICK = 'rightclick',
  TILES_LOADED = 'tilesloaded',
  TILT_CHANGED = 'tilt_changed',
  ZOOM_CHANGED = 'zoom_changed',
}

export enum GoogleMapLoaderStatus {
  ERROR,
  LOADED,
  LOADING,
}
