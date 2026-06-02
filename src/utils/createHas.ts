const createHas = <O extends Record<string, any>>(
  keys: Array<keyof O | 'ref'>
) => {
  const set = new Set(keys);

  return set.has.bind(set);
};

export default createHas;
