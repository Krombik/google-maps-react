type GetLiteral<T extends string> = `get${Capitalize<T>}`;

export type UnGet<T> = T extends `get${infer K}`
  ? '' extends K
    ? never
    : Uncapitalize<K>
  : never;

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

type _InstanceType<T extends new (...args: any) => any> = T extends new (
  ...args: any
) => infer R
  ? R
  : any;

export type ClassType<T> = T extends _InstanceType<infer K> ? K : never;

export type OptionsOf<Instance> = ConstructorParameters<ClassType<Instance>>[0];

export type ExtendsOrNever<T, O> = T extends O ? T : never;

export type Expand<T> = {} & { [P in keyof T]: T[P] };

export type HandlersMap<Instance, T extends Record<string, [arg?: any]>> = {
  [Key in keyof T]: { (this: Instance, ...args: T[Key]): void };
};

export type PropsMap<
  Instance extends Record<string, any>,
  T extends Record<string, true>
> = {
  [Key in keyof T]: SetValue<
    Instance,
    Key extends UnSet<keyof Instance> ? Key : never
  >;
};
