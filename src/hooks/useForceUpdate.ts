import { useState } from 'react';

const useForceUpdate = () => useState()[1] as () => void;

export default useForceUpdate;
