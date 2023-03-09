import handleService from './handleService';
import useConst from './useConst';
import type { PathTo } from '../types';

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
