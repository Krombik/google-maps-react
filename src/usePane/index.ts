import { useContext } from 'react';
import GetPaneContext from '../utils/GetPaneContext';

const usePane = (pane: keyof google.maps.MapPanes) =>
  useContext(GetPaneContext)(pane);

export default usePane;
