import { Theme } from '../@types/AppProps';

const WAYKE_EV_THEME = 'wayke-ev-theme';

export const createTheme = (theme?: Theme) => {
  if (!theme) return;
  const exist = document.getElementById(WAYKE_EV_THEME);
  const style = exist || document.createElement('style');
  style.id = WAYKE_EV_THEME;

  style.innerHTML = `
    .waykeev-root {
      --theme-primary-bg: ${theme.primaryColor || 'initial'};
      --theme-primary-fg: ${theme.primaryColorForeground || 'initial'};
      --theme-link-color: ${theme.linkColor || 'initial'};
    }
  `;

  if (!exist) {
    document.head.appendChild(style);
  }
};
