import { HandlerName } from './utils/constants';
type GetLiteral<T extends string> = `get${Capitalize<T>}`;

/** @internal */
export type UnGet<T> = T extends `get${infer K}`
  ? '' extends K
    ? never
    : Uncapitalize<K>
  : never;

/** @internal */
export type GetValue<
  Instance extends Record<GetLiteral<string>, () => any> | {},
  Key extends UnGet<keyof Instance>
> = GetLiteral<Key> extends keyof Instance
  ? Instance[GetLiteral<Key>] extends () => infer K
    ? NonNullable<K>
    : never
  : never;

type SetValue<
  Instance extends Record<SetLiteral<string>, () => any>,
  Key extends UnSet<keyof Instance>
> = SetLiteral<Key> extends keyof Instance
  ? Instance[SetLiteral<Key>] extends (arg: infer K) => void
    ? NonNullable<K>
    : never
  : never;

type SetLiteral<T extends string> = `set${Capitalize<T>}`;

type UnSet<T> = T extends `set${infer K}`
  ? '' extends K
    ? never
    : Uncapitalize<K>
  : never;

type _InstanceType<T extends new (...args: any[]) => any> = T extends new (
  ...args: any
) => infer R
  ? R
  : any;

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never;

type DeepSearchInstance<
  Instance,
  Store,
  Keys extends string[] = []
> = Store extends object
  ? {
      [Key in keyof Store]: Key extends string
        ? Key extends 'prototype'
          ? never
          : Store[Key] extends { new (...args: any[]): any }
          ? _InstanceType<Store[Key]> extends Instance
            ? [...Keys, Key]
            : never
          : DeepSearchInstance<Instance, Store[Key], [...Keys, Key]>
        : never;
    }
  : never;

type ExtractPathFromDeepMemberSearch<T> = T extends object
  ? [Extract<T[keyof T], string[]>] extends [never]
    ? ExtractPathFromDeepMemberSearch<UnionToIntersection<T[keyof T]>>
    : Extract<T[keyof T], string[]>
  : never;

/** @internal */
export type PathTo<Instance> = ExtractPathFromDeepMemberSearch<
  DeepSearchInstance<Instance, typeof google.maps>
>;

/** @internal */
export type ClassType<T> = T extends _InstanceType<infer K> ? K : never;

/** @internal */
export type TypicalInstance = google.maps.MVCObject & {
  setOptions(options: any): void;
};

type OptionsOf<Instance extends TypicalInstance> = NonNullable<
  Parameters<Instance['setOptions']>[0]
>;

/** @internal */
export type PossibleHandlers = Partial<Record<HandlerName, [arg?: any]>>;

/** @internal */
export type PossibleProps<Instance> = Partial<
  Record<UnGet<keyof Instance>, true>
>;

/** @internal */
export type CombineProps<
  Instance extends TypicalInstance,
  H extends PossibleHandlers,
  P extends PossibleProps<Instance>
> = Partial<
  HandlersMap<Instance, H> &
    PropsMap<Instance, P> & {
      defaultOptions: OptionsOf<Instance>;
    }
>;

type HandlersMap<Instance, T extends Record<string, [arg?: any]>> = {
  [Key in keyof T]: { (this: Instance, ...args: T[Key]): void };
};

type PropsMap<
  Instance extends Record<string, any>,
  T extends Record<string, any>
> = {
  [Key in keyof T]: SetValue<
    Instance,
    Key extends UnSet<keyof Instance> ? Key : never
  >;
};

/** @internal */
export type DragEventName = 'onDrag' | 'onDragEnd' | 'onDragStart';

/** @internal */
export type PolyHandlers = Omit<
  MouseHandlers<google.maps.PolyMouseEvent>,
  DragEventName
> &
  Pick<MouseHandlers, DragEventName>;

/** @internal */
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
