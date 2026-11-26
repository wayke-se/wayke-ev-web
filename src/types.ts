/** Which Wayke environment the widget reads from. */
export type Environment = 'production' | 'test';

/** Sweden (Wayke) or Norway (Drive). Decides currency, distance unit and default language. */
export type MarketCode = 'SE' | 'NO';

export type Language = 'sv' | 'nb' | 'en';

/**
 * What the calculator needs to know about one vehicle. Wayke computes the figures
 * for every battery-electric vehicle; a vehicle without them has no charging cost.
 */
export interface ChargingData {
  /** Energy drawn from the socket in kWh per 100 km, charging losses included. */
  energyPer100Km: number;
  /** Cost per km at `pricePerKwh`, in the market's currency. */
  costPerKm: number;
  /** Wayke's template electricity price per kWh (energy tax and VAT included), in the market's currency. */
  pricePerKwh: number;
  /** The market the figures are priced for. Defaults to `marketCode` in the options, then `SE`. */
  marketCode?: MarketCode;
  /** Battery capacity in kWh. The row is left out when it is missing. */
  batteryCapacityKwh?: number;
  /** WLTP range in km. The row is left out when it is missing. */
  rangeKm?: number;
}

export interface Theme {
  /** Slider, radio buttons and other accents. */
  primaryColor?: string;
  /** Text and icons placed on `primaryColor`. */
  primaryColorForeground?: string;
  linkColor?: string;
}

export type PriceOption = 'standard' | 'custom';

/** Why no calculator is shown. */
export type UnavailableReason =
  /** No published vehicle has this id. */
  | 'not-found'
  /** The vehicle is not battery-electric, or Wayke lacks the data to estimate its cost. */
  | 'no-charging-data';

export type ErrorReason =
  /** The site's domain (or `apiKey`) is not registered with Wayke in this environment. */
  | 'unauthorized'
  /** The site is registered, but its branch does not have the charging cost calculator at Wayke. */
  | 'not-enabled'
  | 'rate-limited'
  | 'network'
  | 'server';

export type EvEvent =
  /** The calculator is on the page. */
  | { type: 'ready'; data: ChargingData }
  /** Nothing is shown: the vehicle has no charging cost. */
  | { type: 'unavailable'; reason: UnavailableReason }
  /** Nothing is shown: the request failed. */
  | { type: 'error'; reason: ErrorReason }
  /** `distanceKm` is the yearly distance in km in both markets. */
  | { type: 'distance-change'; distanceKm: number; control: 'slider' | 'select' }
  | { type: 'modal-open' }
  | { type: 'modal-close' }
  | { type: 'price-option-change'; priceOption: PriceOption }
  /** The visitor's own price per kWh, in the market's currency. */
  | { type: 'custom-price-change'; pricePerKwh: number };

export interface MountOptions {
  /**
   * The id of the vehicle's ad at Wayke. The widget fetches the figures itself.
   * Either `id` or `data` is required.
   */
  id?: string;
  /**
   * The figures, when the page already has them. No request is made.
   * Either `id` or `data` is required.
   */
  data?: ChargingData;
  /** Default `production`. */
  environment?: Environment;
  /** Identifies the site instead of its domain, for local development. */
  apiKey?: string;
  /** Default: the market of the vehicle. */
  marketCode?: MarketCode;
  /** Default: `sv` in Sweden and `nb` in Norway. */
  language?: Language;
  theme?: Theme;
  /**
   * Adds `#wayke-ev` to the url while the calculator is open, so the browser's back
   * button closes it. Useful on mobile, where it covers the screen.
   */
  hash?: boolean;
  /** `false` hides the "Powered by Wayke" line (Drive in Norway). Default `true`. */
  poweredBy?: boolean;
  onEvent?: (event: EvEvent) => void;
}

export interface EvInstance {
  /** Removes the widget and everything it added to the page. */
  unmount: () => void;
}
