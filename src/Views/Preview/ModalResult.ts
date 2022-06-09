import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputField from '../../Components/Input/InputField';
import InputRadioGroup, { RadioItem } from '../../Components/Input/InputRadioGroup';
import getCostPerKilometer from '../../Http/getCostPerKilometer';
import { onlyFloat, prettyNumber } from '../../Utils/format';

const PRICE_OPTION = 'wayke-ev-extended-price-option';
const PRICE_NODE = `${PRICE_OPTION}-node`;

const CUSTOM_PRICE_INPUT = 'wayke-ev-extended-price-input-custom-node';
const CUSTOM_PRICE_INPUT_NODE = `${CUSTOM_PRICE_INPUT}-node`;

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

const calculateCostPerMonth = (costPerKilometer: number | undefined, distance?: number) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * 10) / 12;
};

interface ModalResultProps {
  settings: AppProps;
  costPerKilometer?: number;
  mileage: number;
  costPerKwh: number;
}

interface ModalResultContext {
  input?: InputField;
  priceOption?: InputRadioGroup;
}

let timeoutRef: number = -1;
class ModalResult extends HtmlNode {
  private readonly props: ModalResultProps;
  private contexts: ModalResultContext = {};
  private priceOption: PriceOptionTypes = STANDARD_PRICE;
  private costPerKwh: number;
  private costPerKilometer?: number;
  private mileage?: number;
  private charginCostPerKilometerCustom?: EvCalculationChargingPerKilometer;

  constructor(element: HTMLElement | null, props: ModalResultProps) {
    super(element);
    this.props = props;
    this.costPerKilometer = props.costPerKilometer;
    this.mileage = props.mileage;
    this.costPerKwh = props.costPerKwh;

    this.render();
  }

  private async fetchData() {
    console.log('fetching');
    if (!this.props.settings.id) return;
    try {
      const response = await getCostPerKilometer(this.props.settings.url, this.props.settings.id);
      this.charginCostPerKilometerCustom = response;
      this.render();
    } catch (e) {
      console.log('err');
    }
  }

  private onChangeRadio(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = currentTarget.value as PriceOptionTypes;
    this.priceOption = value;
    this.render();
    if (this.priceOption === 'customPrice' && this.costPerKwh !== this.props.costPerKwh) {
      this.fetchData();
    }
  }

  update(costPerKilomter?: number, mileage?: number) {
    this.costPerKilometer = costPerKilomter;
    this.mileage = mileage;
    this.render();
  }

  private onChange(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = onlyFloat(currentTarget.value);
    currentTarget.value = value;
    this.costPerKwh = parseFloat(value) || this.props.costPerKwh;
    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
      if (this.costPerKwh) {
        this.fetchData();
      }
    }, 250) as unknown as number;
  }

  render() {
    const costPerMonth = calculateCostPerMonth(this.costPerKilometer, this.mileage);

    this.node.innerHTML = `
      <div>
        <div id="${PRICE_NODE}"></div>
        <div id="${CUSTOM_PRICE_INPUT_NODE}"></div>
        <div id="${STATS_NODE}"></div>
        <h2>Laddkostnad</h2>
        <p>${prettyNumber(costPerMonth, { postfix: 'kr/mån*', decimals: 0 })}</p>
        <p>*Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på 130 öre/kWh.</p>
      </div>
    `;

    if (this.priceOption === 'customPrice') {
      this.contexts.input = new InputField(
        this.node.querySelector<HTMLDivElement>(`#${CUSTOM_PRICE_INPUT_NODE}`),
        {
          id: CUSTOM_PRICE_INPUT,
          title: 'Din årliga körsträcka',
          name: 'mileage',
          value: this.costPerKwh.toString(),
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
  }
}

export default ModalResult;
