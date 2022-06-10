import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputField from '../../Components/Input/InputField';
import InputRadioGroup, { RadioItem } from '../../Components/Input/InputRadioGroup';
import getCostPerKilometer from '../../Http/getCostPerKilometer';
import { onlyFloat } from '../../Utils/format';
import ModalResultStats from './ModalResultStats';

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
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  mileage: number;
}

interface ModalResultContext {
  input?: InputField;
  priceOption?: InputRadioGroup;
  stats?: ModalResultStats;
}

let timeoutRef: number = -1;
class ModalResult extends HtmlNode {
  private readonly props: ModalResultProps;
  private contexts: ModalResultContext = {};
  private priceOption: PriceOptionTypes = STANDARD_PRICE;
  private costPerKwh?: number;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private mileage?: number;
  private costPerKilometerCustom?: EvCalculationChargingPerKilometer;

  constructor(element: HTMLElement | null, props: ModalResultProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.costPerKwh = props.charginCostPerKilometer?.description.costPerKwh.value;
    this.mileage = props.mileage;
    this.costPerKilometerCustom = props.charginCostPerKilometer;

    this.render();
  }

  private getCostPerMonth() {
    const costPerMonth = calculateCostPerMonth(
      this.priceOption === 'standardPrice'
        ? this.charginCostPerKilometer?.description.costPerKilometer.value
        : this.costPerKilometerCustom?.description.costPerKilometer.value,
      this.mileage
    );
    return costPerMonth;
  }

  private async fetchData() {
    if (!this.props.settings.id) return;
    try {
      const response = await getCostPerKilometer(
        this.props.settings.url,
        this.props.settings.id,
        this.costPerKwh
      );
      this.costPerKilometerCustom = response;
      this.contexts.stats?.update(this.costPerKilometerCustom, this.props.mileage);
    } catch (e) {
      //console.log('err');
    }
  }

  private onChangeRadio(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = currentTarget.value as PriceOptionTypes;
    this.priceOption = value;
    this.render();
    if (
      this.priceOption === 'customPrice' &&
      this.costPerKwh !== this.props.charginCostPerKilometer?.description.costPerKwh.value
    ) {
      this.fetchData();
    } else if (this.props.charginCostPerKilometer) {
      this.contexts.stats?.update(this.props.charginCostPerKilometer, this.props.mileage);
    }
  }

  update(charginCostPerKilometer?: EvCalculationChargingPerKilometer, mileage?: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.mileage = mileage;
    this.render();
  }

  private onChange(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    const value = onlyFloat(currentTarget.value);
    currentTarget.value = value;
    this.costPerKwh =
      parseFloat(value) || this.props.charginCostPerKilometer?.description.costPerKwh.value;
    clearTimeout(timeoutRef);
    timeoutRef = setTimeout(() => {
      if (this.costPerKwh) {
        this.fetchData();
      }
    }, 250) as unknown as number;
  }

  render() {
    this.node.innerHTML = `
      <div>
        <div id="${PRICE_NODE}"></div>
        <div id="${CUSTOM_PRICE_INPUT_NODE}"></div>
        <div id="${STATS_NODE}"></div>
      </div>
    `;

    if (this.priceOption === 'customPrice') {
      this.contexts.input = new InputField(
        this.node.querySelector<HTMLDivElement>(`#${CUSTOM_PRICE_INPUT_NODE}`),
        {
          id: CUSTOM_PRICE_INPUT,
          title: 'Din årliga körsträcka',
          name: 'mileage',
          value: this.costPerKwh?.toString() || '',
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
      mileage: this.props.mileage,
    });
  }
}

export default ModalResult;
