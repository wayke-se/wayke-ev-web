import { MarketCode } from '../@types/MarketCode';

const WAYKE_VALUATION_FONT = 'wayke-valuation-font';

import fontBaseRegularWoff from '../assets/font/base/OpenSauceOne-Regular.woff';
import fontBaseRegularWoff2 from '../assets/font/base/OpenSauceOne-Regular.woff2';
import fontBaseBoldWoff from '../assets/font/base/OpenSauceOne-ExtraBold.woff';
import fontBaseBoldWoff2 from '../assets/font/base/OpenSauceOne-ExtraBold.woff2';

import fontSeLightWoff from '../assets/font/se/StyreneA-Light-Web.woff';
import fontSeLightWoff2 from '../assets/font/se/StyreneA-Light-Web.woff2';
import fontSeRegularWoff from '../assets/font/se/StyreneA-Regular-Web.woff';
import fontSeRegularWoff2 from '../assets/font/se/StyreneA-Regular-Web.woff2';
import fontSeMediumWoff from '../assets/font/se/StyreneA-Medium-Web.woff';
import fontSeMediumWoff2 from '../assets/font/se/StyreneA-Medium-Web.woff2';
import fontSeBoldWoff from '../assets/font/se/StyreneA-Bold-Web.woff';
import fontSeBoldWoff2 from '../assets/font/se/StyreneA-Bold-Web.woff2';

import fontNoRegularWoff from '../assets/font/no/GeneralSans-Regular.woff';
import fontNoRegularWoff2 from '../assets/font/no/GeneralSans-Regular.woff2';
import fontNoSemiBoldWoff from '../assets/font/no/GeneralSans-Semibold.woff';
import fontNoSemiBoldWoff2 from '../assets/font/no/GeneralSans-Semibold.woff2';
import fontNoBoldWoff from '../assets/font/no/GeneralSans-Bold.woff';
import fontNoBoldWoff2 from '../assets/font/no/GeneralSans-Bold.woff2';

const getFontSettings = (market?: MarketCode) => {
  switch (market) {
    case 'SE':
      return {
        light: {
          woff: fontSeLightWoff,
          woff2: fontSeLightWoff2,
          weight: 300,
        },
        regular: {
          woff: fontSeRegularWoff,
          woff2: fontSeRegularWoff2,
          weight: 400,
        },
        medium: {
          woff: fontSeMediumWoff,
          woff2: fontSeMediumWoff2,
          weight: 500,
        },
        bold: {
          woff: fontSeBoldWoff,
          woff2: fontSeBoldWoff2,
          weight: 700,
        },
      };
    case 'NO':
      return {
        light: {
          woff: fontNoRegularWoff,
          woff2: fontNoRegularWoff2,
          weight: 400,
        },
        regular: {
          woff: fontNoRegularWoff,
          woff2: fontNoRegularWoff2,
          weight: 400,
        },
        medium: {
          woff: fontNoSemiBoldWoff,
          woff2: fontNoSemiBoldWoff2,
          weight: 600,
        },
        bold: {
          woff: fontNoBoldWoff,
          woff2: fontNoBoldWoff2,
          weight: 700,
        },
      };
    default:
      return {
        light: {
          woff: fontBaseRegularWoff,
          woff2: fontBaseRegularWoff2,
          weight: 400,
        },
        regular: {
          woff: fontBaseRegularWoff,
          woff2: fontBaseRegularWoff2,
          weight: 400,
        },
        medium: {
          woff: fontBaseBoldWoff,
          woff2: fontBaseBoldWoff2,
          weight: 800,
        },
        bold: {
          woff: fontBaseBoldWoff,
          woff2: fontBaseBoldWoff2,
          weight: 800,
        },
      };
  }
};

export const loadFont = (market?: MarketCode) => {
  if (!market) return;

  const exist = document.getElementById(WAYKE_VALUATION_FONT);
  const style = exist || document.createElement('style');
  style.id = WAYKE_VALUATION_FONT;

  const fontSettings = getFontSettings(market);

  style.innerHTML = `
    @font-face {
      font-family: 'Wayke EV Font';
      src: url(${fontSettings.light.woff}) format('woff2'), url(${fontSettings.light.woff2}) format('woff');
      font-weight: ${fontSettings.light.weight};
      font-display: swap;
    }

    @font-face {
      font-family: 'Wayke EV Font';
      src: url(${fontSettings.regular.woff}) format('woff2'), url(${fontSettings.regular.woff2}) format('woff');
      font-weight: ${fontSettings.regular.weight};
      font-display: swap;
    }

    @font-face {
      font-family: 'Wayke EV Font';
      src: url(${fontSettings.medium.woff}) format('woff2'), url(${fontSettings.medium.woff2}) format('woff');
      font-weight: ${fontSettings.medium.weight};
      font-display: swap;
    }

    @font-face {
      font-family: 'Wayke EV Font';
      src: url(${fontSettings.bold.woff}) format('woff2'), url(${fontSettings.bold.woff2}) format('woff');
      font-weight: ${fontSettings.bold.weight};
      font-display: swap;
    }

    .waykevaluation-root {
      --waykeev-font-weight-light: ${fontSettings.light.weight};
      --waykeev-font-weight-regular: ${fontSettings.regular.weight};
      --waykeev-font-weight-medium: ${fontSettings.medium.weight};
      --waykeev-font-weight-bold: ${fontSettings.bold.weight};
    }
  `;

  if (!exist) {
    document.head.appendChild(style);
  }
};
