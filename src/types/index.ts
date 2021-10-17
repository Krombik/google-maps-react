import { handlersMap } from '../utils/constants';

export type HandlerName = keyof typeof handlersMap;

export type GenerateHandlers<
  This,
  T extends Partial<Record<HandlerName, any[]>>
> = {
  [key in keyof T]?: T[key] extends any[]
    ? { (this: This, ...args: T[key]): void }
    : never;
};

type UnArray<T extends {}[]> = T[keyof T extends string ? keyof T : never];

type AddEmptyFields<T extends {}[], K extends {}> = {
  [i in keyof T]: Omit<K, keyof T[i]> & T[i];
};

type ArrayOfFieldKeys<T extends {}[]> = {
  [i in keyof T]: keyof T[i];
};

type FieldKeysFromArray<T extends string[]> = T[keyof T extends string
  ? keyof T
  : never];

export type XOR<T extends {}[]> = UnArray<
  AddEmptyFields<
    T,
    Partial<Record<FieldKeysFromArray<ArrayOfFieldKeys<T>>, undefined>>
  >
>;

type GetLiteral<T extends string> = `get${Capitalize<T>}`;

type UnGet<T> = T extends GetLiteral<infer K> ? Uncapitalize<K> : never;

export type GetValue<
  Instance extends Record<GetLiteral<string>, () => any> | {},
  Key extends UnGet<keyof Instance>
> = GetLiteral<Key> extends keyof Instance
  ? Instance[GetLiteral<Key>] extends () => infer K
    ? NonNullable<K>
    : never
  : never;

export type SetLiteral<T extends string> = `set${Capitalize<T>}`;

export type UnSet<T> = T extends SetLiteral<infer K> ? Uncapitalize<K> : never;

export type GetState<
  Instance extends Record<SetLiteral<string>, (value: any) => void> | {},
  Key extends UnSet<keyof Instance>
> = {
  [key in Key]: SetLiteral<key> extends keyof Instance
    ? Instance[SetLiteral<key>] extends (value: infer K) => void
      ? NonNullable<K>
      : never
    : never;
};
