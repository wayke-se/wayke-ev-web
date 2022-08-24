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
}
