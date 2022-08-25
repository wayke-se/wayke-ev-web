export enum EvEvent {
  INITIALIZED = 'INITIALIZED',
  MILEAGE_SLIDER = 'MILEAGE_SLIDER',
  MILEAGE_SELECT = 'MILEAGE_SELECT',
  INITIAL_REQUEST_PENDING = 'INITIAL_REQUEST_PENDING',
  INITIAL_REQUEST_SUCCEEDED = 'INITIAL_REQUEST_SUCCEEDED',
  INITIAL_REQUEST_FAILED = 'INITIAL_REQUEST_FAILED',
  MODAL_OPENED = 'MODAL_OPENED',
  MODAL_CLOSED = 'MODAL_CLOSED',
  REQUEST_CUSTOM_PRICE_PENDING = 'REQUEST_CUSTOM_PRICE_PENDING',
  REQUEST_CUSTOM_PRICE_SUCCEEDED = 'REQUEST_CUSTOM_PRICE_SUCCEEDED',
  REQUEST_CUSTOM_PRICE_FAILED = 'REQUEST_CUSTOM_PRICE_FAILED',
  TOGGLE_PRICE = 'TOGGLE_PRICE',
  CUSTOM_PRICE_CHANGE = 'CUSTOM_PRICE_CHANGE',
}

export enum EvView {
  MAIN = 'MAIN',
  MODAL = 'MODAL',
}

type Listner = (view: EvView, event: EvEvent, data?: { [key: string]: any }) => void;

const listners: Listner[] = [];

export const registerEventListner = (fn: Listner) => {
  listners.push(fn);
};

export const unregisterEventListner = (fn: Listner) => {
  const index = listners.findIndex((f) => f === fn);
  if (index > -1) {
    listners.splice(index, 1);
  }
};

export const pushEvent = (view: EvView, evEvent: EvEvent, data?: any) => {
  if (!listners.length) return;
  listners.forEach((fn) => fn(view, evEvent, data));
};
