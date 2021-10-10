export enum GoogleMapEvents {
  // Common events
  CLICK = 'click',
  CONTEXT_MENU = 'contextmenu',
  DOUBLE_CLICK = 'dblclick',
  DRAG = 'drag',
  DRAG_END = 'dragend',
  DRAG_START = 'dragstart',
  MOUSE_MOVE = 'mousemove',
  MOUSE_OUT = 'mouseout',
  MOUSE_OVER = 'mouseover',
  RIGHT_CLICK = 'rightclick',

  // Map events
  BOUNDS_CHANGED = 'bounds_changed',
  CENTER_CHANGED = 'center_changed',
  HEADING_CHANGED = 'heading_changed',
  IDLE = 'idle',
  MAP_TYPE_ID_CHANGED = 'maptypeid_changed',
  PROJECTION_CHANGED = 'projection_changed',
  RESIZE = 'resize',
  TILES_LOADED = 'tilesloaded',
  TILT_CHANGED = 'tilt_changed',
  ZOOM_CHANGED = 'zoom_changed',

  // Marker events
  ANIMATION_CHANGED = 'animation_changed',
  CLICKABLE_CHANGED = 'clickable_changed',
  CURSOR_CHANGED = 'cursor_changed',
  DRAGGABLE_CHANGED = 'draggable_changed',
  FLAT_CHANGED = 'flat_changed',
  ICON_CHANGED = 'icon_changed',
  MOUSE_DOWN = 'mousedown',
  MOUSE_UP = 'mouseup',
  POSITION_CHANGED = 'position_changed',
  SHAPE_CHANGED = 'shape_changed',
  TITLE_CHANGED = 'title_changed',
  VISIBLE_CHANGED = 'visible_changed',
  Z_INDEX_CHANGED = 'zindex_changed',
}

export enum GoogleMapLoaderStatus {
  ERROR,
  LOADED,
  LOADING,
}
