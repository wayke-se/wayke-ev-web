import { Theme } from '../@types/AppProps';

const WAYKE_EV_THEME = 'wayke-ev-theme';

export const createTheme = (theme?: Theme) => {
  if (!theme) return;
  const exist = document.getElementById(WAYKE_EV_THEME);
  const style = exist || document.createElement('style');
  style.id = WAYKE_EV_THEME;

  style.innerHTML = `
    ${
      theme.primaryColor || theme.primaryColorForeground || theme.linkColor
        ? `
      :root {
        ${theme.primaryColor ? `--waykeev-primary-color: ${theme.primaryColor};` : ''}
        ${
          theme.primaryColorForeground
            ? `--waykeev-primary-color-foreground: ${theme.primaryColorForeground};`
            : ''
        }
        ${theme.linkColor ? `--waykeev-link-color: ${theme.linkColor};` : ''}
      }
    `
        : ''
    }
  `;

  if (!exist) {
    document.head.appendChild(style);
  }
};
