import { EvView, EvEvent } from '../Utils/events';
import { MarketCode } from './MarketCode';

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
  marketCode?: MarketCode;
  onEvent?: (view: EvView, event: EvEvent, data?: any) => void;
}
