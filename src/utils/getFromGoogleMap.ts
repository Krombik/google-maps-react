type Get<T extends {}, K> = K extends readonly [infer Head, ...infer Tail]
  ? Head extends keyof T
    ? [] extends Tail
      ? T[Head]
      : T[Head] extends {}
      ? Get<T[Head], Tail>
      : never
    : never
  : never;

/** @internal */
const getFromGoogleMap = <T extends ReadonlyArray<string>>(path: T) => {
  let curr = google.maps;

  for (let i = 0; i < path.length; i++) {
    curr = (curr as any)[path[i]];
  }

  return curr as Get<typeof google.maps, T>;
};

/** @internal */
export default getFromGoogleMap;
