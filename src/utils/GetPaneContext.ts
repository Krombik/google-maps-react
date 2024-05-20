import { createContext } from 'react';

/** @internal */
export const GetPaneContext = createContext<
  (pane: keyof google.maps.MapPanes) => Element
>(null!);

/** @internal */
export default GetPaneContext;
