import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputRangeSlider from '../../Components/Input/InputRangeSlider';
import InputSelect, { SelectItem } from '../../Components/Input/InputSelect';
import ModalResult from './ModalResult';

const MILEAGE_SELECT = 'wayke-ev-extended-mileage-select';
const MILEAGE_SELECT_NODE = `${MILEAGE_SELECT}-node`;
const MILEAGE_RANGE = 'wayke-ev-extended-mileage-range';
const MILEAGE_RANGE_NODE = `${MILEAGE_RANGE}-node`;

const RESULT_NODE = 'wayke-ev-result-extended-node';

interface ModalProps {
  settings: AppProps;
  open?: boolean;
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  mileage: number;
  distanceOptions: number[];
  distanceOptionsMapped: SelectItem[];
  onChangeSelect: (e: Event) => void;
  onChangeRange: (e: Event) => void;
}

interface ModalContext {
  select?: InputSelect;
  range?: InputRangeSlider;
  result?: ModalResult;
}

class Modal extends HtmlNode {
  private readonly props: ModalProps;
  private contexts: ModalContext = {};
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private mileage: number;

  constructor(element: HTMLElement | null, props: ModalProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.mileage = props.mileage;

    if (props.open) {
      this.open();
    }
  }

  open() {
    this.render();
  }

  close() {
    this.node.innerHTML = '';
  }

  update(charginCostPerKilometer: EvCalculationChargingPerKilometer | undefined, mileage: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.mileage = mileage;

    this.contexts.select?.update(this.mileage.toString());
    this.contexts.range?.update(this.mileage.toString());
    this.contexts.result?.update(this.charginCostPerKilometer, this.mileage);
  }

  render() {
    this.node.innerHTML = `
      <div style="padding: 8px; border: 1px solid black">
        <h2>Beräkna laddkostnad</h2>
        <p>Har du funderat över vad det kostar att ladda en elbil? Här hittar du verktyget som visar dig den uppskattade laddningskostnaden för just den här bilen.</p>
        <div id="${MILEAGE_SELECT_NODE}"></div>
        <div id="${MILEAGE_RANGE_NODE}"></div>
        <div id="${RESULT_NODE}"></div>
      </div>
    `;

    this.contexts.select = new InputSelect(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_SELECT_NODE}`),
      {
        id: MILEAGE_SELECT,
        title: 'Din årliga körsträcka',
        name: 'mileage',
        value: this.mileage.toString(),
        options: this.props.distanceOptionsMapped,
        onChange: (e) => this.props.onChangeSelect(e),
      }
    );

    this.contexts.range = new InputRangeSlider(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_RANGE_NODE}`),
      {
        id: MILEAGE_RANGE,
        name: 'mileage',
        value: this.mileage,
        step: 500,
        min: this.props.distanceOptions[0],
        max: this.props.distanceOptions[this.props.distanceOptions.length - 1],
        onChange: (e) => this.props.onChangeRange(e),
      }
    );

    this.contexts.result = new ModalResult(
      this.node.querySelector<HTMLDivElement>(`#${RESULT_NODE}`),
      {
        charginCostPerKilometer: this.charginCostPerKilometer,
        mileage: this.mileage || 0,
        settings: this.props.settings,
      }
    );
  }
}

export default Modal;
