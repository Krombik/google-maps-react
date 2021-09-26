import { useState } from 'react';

const useConst = <T>(getConst: () => T) => useState(getConst)[0];

export default useConst;
