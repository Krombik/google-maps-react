const isNotArraysEqual = (arr1: unknown[], arr2: unknown[]) => {
  if (arr1.length !== arr2.length) return true;

  for (let i = arr1.length; i--; ) {
    if (isNotEqual(arr1[i], arr2[i])) return true;
  }

  return false;
};

const isNotEqual = (first: unknown, second: unknown) => {
  if (first === second) return false;

  if (first === null || second === null) return true;

  if (typeof first == 'object' && typeof second == 'object') {
    if (Array.isArray(first) && Array.isArray(second))
      return isNotArraysEqual(first, second);

    const keys = Object.keys(first!);

    const keysLength = keys.length;

    const _keys = Object.keys(second!);

    if (keysLength != _keys.length) return true;

    for (let i = keysLength; i--; ) {
      let failed = true;

      for (let j = _keys.length; j--; ) {
        if (keys[i] == _keys[j]) {
          const key = keys[i];

          if (isNotEqual(first![key], second![key])) return true;

          _keys.splice(j, 1);

          failed = false;

          break;
        }
      }

      if (failed) return true;
    }

    return false;
  }

  return true;
};

export default isNotEqual;
