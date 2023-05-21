import handleService from './handleService';
import type { PathTo } from '../types';
import useConst from 'react-helpful-utils/useConst';

/** @internal */
const handleUseService =
  <Instance extends Record<keyof Instance, (...args: any[]) => any>>(
    path: PathTo<Instance>,
    keys: Array<keyof Instance>
  ) =>
  () =>
    useConst(() => handleService(path, keys));

/** @internal */
export default handleUseService;
