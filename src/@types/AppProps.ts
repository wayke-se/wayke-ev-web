import { EvView, EvEvent } from '../Utils/events';

export interface Theme {
  primaryColor?: string;
  primaryColorForeground?: string;
  linkColor?: string;
}

export interface AppProps {
  url: string;
  id: string;
  rootId?: string;
  hash?: boolean;
  theme?: Theme;
  onEvent?: (view: EvView, event: EvEvent, data?: any) => void;
}
