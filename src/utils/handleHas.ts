const handleHas = <O extends Record<string, any>>(keys: Array<keyof O>) => {
  const set = new Set(keys);

  return set.has.bind(set);
};

export default handleHas;
