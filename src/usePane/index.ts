import { useContext } from 'react';
import PanesContext from '../utils/PanesContext';

const usePane = (pane: keyof google.maps.MapPanes) =>
  useContext(PanesContext)[pane];

export default usePane;
