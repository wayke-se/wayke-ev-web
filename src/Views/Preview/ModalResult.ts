import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import ErrorAlert from '../../Components/ErrorAlert';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputField from '../../Components/Input/InputField';
import InputRadioGroup, { RadioItem } from '../../Components/Input/InputRadioGroup';
import getCostPerKilometer from '../../Http/getCostPerKilometer';
import { RequestError } from '../../Http/http';
import { EvEvent, EvView, pushEvent } from '../../Utils/events';
import { onlyFloat } from '../../Utils/format';
import ModalResultStats from './ModalResultStats';

const PRICE_OPTION = 'wayke-ev-extended-price-option';
const PRICE_NODE = `${PRICE_OPTION}-node`;

const CUSTOM_PRICE_INPUT = 'wayke-ev-extended-price-input-custom-node';
const CUSTOM_PRICE_INPUT_NODE = `${CUSTOM_PRICE_INPUT}-node`;
const REQUEST_ERROR = 'wayke-ev-req-error';

const STATS_NODE = 'wayke-ev-extended-stats-node';

const STANDARD_PRICE = 'standardPrice';
const CUSTOM_PRICE = 'customPrice';

type PriceOptionTypes = 'standardPrice' | 'customPrice';

const RadioElements: RadioItem[] = [
  {
    id: `radio-standard-price`,
    value: STANDARD_PRICE,
    title: 'Schablonpris',
  },
  {
    id: `radio-custom-price`,
    value: CUSTOM_PRICE,
    title: 'Eget elpris',
  },
];

interface ModalResultProps {
  settings: AppProps;
  charginCostPerKilometer: EvCalculationChargingPerKilometer;
  mileage: number;
}

interface ModalResultContext {
  input?: InputField;
  priceOption?: InputRadioGroup;
  stats?: ModalResultStats;
  errorAlert?: ErrorAlert;
}

let storedCostPerKwh: number | undefined;
let timeoutRef: number = -1;
class ModalResult extends HtmlNode {
  private readonly props: ModalResultProps;
  private contexts: ModalResultContext = {};
  private priceOption: PriceOptionTypes = STANDARD_PRICE;
  private costPerKwh?: number;
  private charginCostPerKilometer: EvCalculationChargingPerKilometer;
  private mileage: number;
  private costPerKilometerCustom?: EvCalculationChargingPerKilometer;

  constructor(element: HTMLElement | null, props: ModalResultProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.costPerKwh =
      storedCostPerKwh || (props.charginCostPerKilometer?.description.costPerKwh.value || 0) * 100;
    this.mileage = props.mileage;
    this.costPerKilometerCustom = props.charginCostPerKilometer;

    this.render();
  }

  private async fetchData() {
    if (!this.props.settings.id) return;
    this.contexts.errorAlert?.update(undefined);
    try {
      pushEvent(EvView.MODAL, EvEvent.REQUEST_CUSTOM_COST_PENDING);
      const response = await getCostPerKilometer(
        this.props.settings.url,
        this.props.settings.id,
        (this.costPerKwh || 0) / 100
      );

      pushEvent(EvView.MODAL, EvEvent.REQUEST_CUSTOM_COST_SUCCEEDED);
      this.costPerKilometerCustom = response;
      this.contexts.stats?.update(this.costPerKilometerCustom, this.mileage);
    } catch (e) {
      const statusCode = (e as RequestError)?.status;
      pushEvent(EvView.MODAL, EvEvent.REQUEST_CUSTOM_COST_FAILED, { statusCode });
      this.contexts.errorAlert?.update(
        `Ett fel har inträffat. <button type="button" title="Försök igen" class="waykeev-link" id="waykeev-error-retry">Försök igen</button>`
      );
      this.contexts.errorAlert?.node
        ?.querySelector('#waykeev-error-retry')
        ?.addEventListener('click', () => this.fetchData());
      this.contexts.stats?.hide();
    }
  }

  private onChangeRadio(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = currentTarget.value as PriceOptionTypes;
    this.priceOption = value;
    pushEvent(EvView.MODAL, EvEvent.TOGGLE_PRICE, value);
    this.render();
    if (
      this.priceOption === 'customPrice' &&
      this.costPerKwh !== this.props.charginCostPerKilometer?.description.costPerKwh.value
    ) {
      this.fetchData();
    } else if (this.costPerKilometerCustom && this.mileage) {
      this.contexts.stats?.update(
        this.priceOption === 'customPrice'
          ? this.costPerKilometerCustom
          : this.props.charginCostPerKilometer,
        this.mileage
      );
    }
  }

  update(mileage: number) {
    this.mileage = mileage;
    this.contexts.stats?.update(
      this.priceOption === 'customPrice'
        ? this.costPerKilometerCustom
        : this.props.charginCostPerKilometer,
      this.mileage
    );
  }

  private onChange(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = onlyFloat(currentTarget.value);
    currentTarget.value = value;
    this.costPerKwh =
      parseFloat(value) ||
      (this.props.charginCostPerKilometer?.description.costPerKwh.value || 0) * 100;
    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
      if (this.costPerKwh) {
        pushEvent(EvView.MODAL, EvEvent.CUSTOM_PRICE_CHANGE, { costPerKwh: this.costPerKwh });
        storedCostPerKwh = this.costPerKwh;
        this.fetchData();
      }
    }, 250) as unknown as number;
  }

  render() {
    this.node.innerHTML = `
      <div class="waykeev-stack waykeev-stack--3">
        <div class="waykeev-stack waykeev-stack--2" id="${PRICE_NODE}"></div>
        <div class="waykeev-stack waykeev-stack--2" id="${CUSTOM_PRICE_INPUT_NODE}"></div>
        <div class="waykeev-stack waykeev-stack--2" id="${REQUEST_ERROR}"></div>
      </div>
      <div class="waykeev-stack waykeev-stack--3"id="${STATS_NODE}"></div>
    `;

    if (this.priceOption === 'customPrice') {
      this.contexts.input = new InputField(
        this.node.querySelector<HTMLDivElement>(`#${CUSTOM_PRICE_INPUT_NODE}`),
        {
          id: CUSTOM_PRICE_INPUT,
          title: 'Ditt elpris',
          name: 'custom-price',
          value: this.costPerKwh?.toString() || '',
          unit: 'öre/kWh',
          information: 'Ange ditt totala pris per kWh så som det står på din faktura.',
          onChange: (e) => this.onChange(e),
        }
      );
    }

    this.contexts.priceOption = new InputRadioGroup(this.node.querySelector(`#${PRICE_NODE}`), {
      title: 'Vilket elpris vill du räkna på?',
      checked: this.priceOption,
      name: 'price',
      options: RadioElements,
      onClick: (e) => this.onChangeRadio(e),
    });

    this.contexts.stats = new ModalResultStats(this.node.querySelector(`#${STATS_NODE}`), {
      priceOption: this.priceOption,
      charginCostPerKilometer:
        this.priceOption === 'standardPrice'
          ? this.charginCostPerKilometer
          : this.costPerKilometerCustom,
      mileage: this.mileage || 0,
    });

    this.contexts.errorAlert = new ErrorAlert(
      this.node.querySelector<HTMLDivElement>(`#${REQUEST_ERROR}`),
      {}
    );
  }
}

export default ModalResult;
