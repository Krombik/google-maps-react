export type DragEventName = 'onDrag' | 'onDragEnd' | 'onDragStart';

export type PolyHandlers = Omit<
  MouseHandlers<google.maps.PolyMouseEvent>,
  DragEventName
> &
  Pick<MouseHandlers, DragEventName>;

export type MouseHandlers<Event = google.maps.MapMouseEvent> = {
  onClick: [e: Event];
  onContextMenu: [e: Event];
  onDoubleClick: [e: Event];
  onDrag: [e: Event];
  onDragEnd: [e: Event];
  onDragStart: [e: Event];
  onMouseDown: [e: Event];
  onMouseMove: [e: Event];
  onMouseOut: [e: Event];
  onMouseOver: [e: Event];
  onMouseUp: [e: Event];
  /**
   * @deprecated Use the {@link MouseHandlers.onContextMenu onContextMenu} instead in order to support usage patterns like control-click on macOS
   */
  onRightClick: [e: Event];
};
