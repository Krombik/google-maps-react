import handleService from './handleService';
import useConst from '../hook/utils/useConst';
import { ExtendsOrNever } from '../types';
import { GetFromGoogleMap } from './getFromGoogleMap';

const handleUseService =
  <Path extends ReadonlyArray<string>>(
    path: Path,
    keys: (keyof ExtendsOrNever<
      InstanceType<GetFromGoogleMap<Path>>,
      Record<string, any>
    >)[]
  ) =>
  () =>
    useConst(() => handleService(path, keys));

export default handleUseService;
