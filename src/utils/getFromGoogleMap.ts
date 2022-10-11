type Get<T extends {}, K> = K extends readonly [infer Head, ...infer Tail]
  ? Head extends keyof T
    ? [] extends Tail
      ? T[Head]
      : T[Head] extends {}
      ? Get<T[Head], Tail>
      : never
    : never
  : never;

export type GetFromGoogleMap<T> = Get<typeof google.maps, T>;

const getFromGoogleMap = <T extends ReadonlyArray<string>>(path: T) => {
  let curr = google.maps;

  for (let i = 0; i < path.length; i++) {
    curr = curr[path[i]];
  }

  return curr as Get<typeof google.maps, T>;
};

export default getFromGoogleMap;
