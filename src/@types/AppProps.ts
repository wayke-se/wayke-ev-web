import { EvView, EvEvent } from '../Utils/events';

export interface Theme {
  primaryColor?: string;
  primaryColorForeground?: string;
  linkColor?: string;
}

export interface AppProps {
  rootId?: string;
  url: string;
  id?: string;
  theme?: Theme;
  onEvent?: (view: EvView, event: EvEvent, data?: any) => void;
}
