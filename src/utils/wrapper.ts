import { forwardRef, ForwardRefRenderFunction } from 'react';
import { UnGet } from '../types';
import { HandlerName } from './constants';
import handleUseHandlersAndProps, {
  UseHandlersAndProps,
} from './handleUseHandlersAndProps';

const wrapper =
  <
    Instance extends google.maps.MVCObject,
    DefaultOptions extends {},
    Handlers extends Partial<Record<HandlerName, (...args: any[]) => void>>,
    Props extends Record<string, any>,
    BaseProps extends {} = {}
  >(
    createRender: <
      H extends keyof Handlers & HandlerName,
      P extends keyof Props
    >(
      useHandlersAndProps: UseHandlersAndProps
    ) => ForwardRefRenderFunction<
      Instance,
      BaseProps & { defaultOptions?: Omit<DefaultOptions, 'map'> } & Partial<
          Pick<Handlers, H>
        > &
        Pick<Props, P>
    >,
    connectedHandlersAndState: Partial<
      Record<keyof Handlers, UnGet<keyof Instance>>
    > = {}
  ) =>
  <H extends keyof Handlers & HandlerName, P extends keyof Props & string>(
    handlerNamesList: H[],
    propNamesList: P[]
  ) =>
    forwardRef(
      createRender<H, P>(
        handleUseHandlersAndProps<H, P>(
          handlerNamesList,
          propNamesList,
          connectedHandlersAndState
        )
      )
    );

export default wrapper;
