import { MarketCode } from '../@types/MarketCode';

interface LogotypeProps {
  market: MarketCode | undefined;
  className?: string;
}

// Receive symbol logotype based on current market

export const getSymbolLogotype = ({ market, className }: LogotypeProps) => {
  switch (market) {
    case 'SE':
      return `
        <svg ${
          !!className ? `class="${className}"` : ''
        } viewBox="0 0 185.57 109.13" preserveAspectRatio="xMinYMid" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <title>Wayke</title>
          <circle cx="4.25" cy="39.68" r="4.25"></circle>
          <circle cx="25.15" cy="68.03" r="4.96"></circle>
          <circle cx="46.04" cy="96.38" r="6.38"></circle>
          <circle cx="66.93" cy="68.03" r="7.09"></circle>
          <circle cx="87.82" cy="39.68" r="8.5"></circle>
          <circle cx="108.72" cy="68.03" r="10.63"></circle>
          <circle cx="129.61" cy="96.38" r="12.76"></circle>
          <circle cx="150.5" cy="68.03" r="13.47"></circle>
          <circle cx="171.4" cy="39.68" r="14.17"></circle>
          <circle cx="129.61" cy="39.68" r="12.05"></circle>
          <circle cx="66.93" cy="11.34" r="7.09"></circle>
          <circle cx="150.5" cy="11.34" r="11.34"></circle>
          <circle cx="108.72" cy="11.34" r="10.63"></circle>
          <circle cx="46.04" cy="39.68" r="6.38"></circle>
          <circle cx="25.15" cy="11.34" r="4.96"></circle>
        </svg>
      `;
    case 'NO':
      return `
        <svg ${
          !!className ? `class="${className}"` : ''
        } xmlns="http://www.w3.org/2000/svg" viewBox="0 0 37 38">
          <title>Drive</title>
          <path d="M19.27 0H5.348L2.126 22.838h8.445l2.126-15.241h5.479c6.83 0 11.086 4.886 10.156 11.4a13.292 13.292 0 0 1-4.537 8.195 13.441 13.441 0 0 1-8.84 3.206H1.063L0 38h13.919c11.74 0 21.349-8.41 22.88-19.018C38.328 8.373 31.01 0 19.27 0Z" />
        </svg>
      `;
    default:
      return '';
  }
};
