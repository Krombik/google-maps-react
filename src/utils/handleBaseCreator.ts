import { useLayoutEffect } from 'react';
import { ClassType, ExtendsOrNever, OptionsOf, UnGet } from '../types';
import useGoogleMap from '../hook/useGoogleMap';
import wrapper from './wrapper';
import useConst from '../hook/utils/useConst';
import setRef from './setRef';
import { HandlerName } from './constants';
import getFromGoogleMap, { GetFromGoogleMap } from './getFromGoogleMap';

type MapChild = google.maps.MVCObject & {
  setMap(map: google.maps.Map | null): void;
};

const handleBaseCreator = <
  Keys extends ReadonlyArray<string>,
  Options extends OptionsOf<Instance>,
  Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
  Props extends {},
  Instance extends MapChild = ExtendsOrNever<
    InstanceType<GetFromGoogleMap<Keys>>,
    MapChild
  >
>(
  classNames: Instance extends MapChild ? Keys : never,
  connectedHandlersAndState?: Partial<
    Record<keyof Handlers, UnGet<keyof Instance>>
  >
) =>
  wrapper<Instance, Options, Handlers, Props>(
    (useHandlersAndProps) => (props, ref) => {
      const map = useGoogleMap();

      let remove: () => void;

      useLayoutEffect(() => remove, []);

      useHandlersAndProps(
        useConst(() => {
          const instance: Instance = new (getFromGoogleMap(
            classNames
          ) as ClassType<Instance>)({
            map,
            ...props.defaultOptions,
            ...props,
          });

          setRef(ref, instance);

          remove = () => {
            instance.setMap(null);

            setRef(ref, null);
          };

          return instance;
        }),
        props
      );

      return null;
    },
    connectedHandlersAndState
  );

export default handleBaseCreator;
