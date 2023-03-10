import React, { FC, PropsWithChildren, useState } from 'react';
import PanesContext from '../context/PanesContext';
import noop from '../utils/noop';

type Props = PropsWithChildren<{ map: google.maps.Map }>;

/** @internal */
const PanesProvider: FC<Props> = (props) => {
  const [panes, setPanes] = useState<google.maps.MapPanes | null>(() => {
    const overlayView = new google.maps.OverlayView();

    overlayView.onRemove = overlayView.draw = noop;

    overlayView.onAdd = () => {
      setPanes(overlayView.getPanes());

      overlayView.setMap(null);
    };

    overlayView.setMap(props.map);

    return null;
  });

  return (
    <PanesContext.Provider value={panes}>
      {props.children}
    </PanesContext.Provider>
  );
};

/** @internal */
export default PanesProvider;
