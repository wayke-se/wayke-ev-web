import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import Button from '../../Components/Button/Button';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputRangeSlider from '../../Components/Input/InputRangeSlider';
import InputSelect from '../../Components/Input/InputSelect';
import { prettyNumber } from '../../Utils/format';
import Modal from './Modal';
import Result from './Result';

const MODAL_BUTTON = 'wayke-ev-modal-button';
const MODAL_BUTTON_NODE = `${MODAL_BUTTON}-node`;
const MILEAGE_SELECT = 'wayke-ev-mileage-select';
const MILEAGE_SELECT_NODE = `${MILEAGE_SELECT}-node`;
const MILEAGE_RANGE = 'wayke-ev-mileage-range';
const MILEAGE_RANGE_NODE = `${MILEAGE_RANGE}-node`;
const RESULT_NODE = 'wayke-ev-result-node';
const MODAL_NODE = 'wayke-ev-web-modal-node';

const DistanceOptions = [500, 1000, 1500, 2000, 2500, 3000, 3500, 4000, 4500, 5000];
const DistanceOptionsMapped = DistanceOptions.map((d) => ({
  value: d.toString(),
  title: prettyNumber(d, { postfix: 'mil' }),
}));

interface PreviewProps {
  settings: AppProps;
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
}

interface PreviewContext {
  select?: InputSelect;
  range?: InputRangeSlider;
  result?: Result;
  modal?: Modal;
  modalButton?: Button;
}

class Preview extends HtmlNode {
  private readonly props: PreviewProps;
  private contexts: PreviewContext = {};
  private mileage = DistanceOptionsMapped[4].value;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;

  constructor(element: HTMLElement | null, props: PreviewProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.render();
  }

  update(charginCostPerKilometer?: EvCalculationChargingPerKilometer) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.render();
  }

  private onChangeSelect(e: Event) {
    const currentTarget = e.currentTarget as HTMLSelectElement;
    this.mileage = currentTarget.value;
    this.contexts.range?.update(this.mileage);
    this.contexts.select?.update(this.mileage);
    this.contexts.result?.update(this.charginCostPerKilometer, parseInt(this.mileage, 10));
    this.contexts.modal?.update(this.charginCostPerKilometer, parseInt(this.mileage, 10));
  }

  private onChangeRange(e: Event) {
    const currentTarget = e.currentTarget as HTMLSelectElement;
    this.mileage = currentTarget.value;
    this.contexts.range?.update(this.mileage);
    this.contexts.select?.update(this.mileage);
    this.contexts.result?.update(this.charginCostPerKilometer, parseInt(this.mileage, 10));
    this.contexts.modal?.update(this.charginCostPerKilometer, parseInt(this.mileage, 10));
  }

  render() {
    if (this.charginCostPerKilometer === undefined) return;

    this.node.innerHTML = `
      <h2>Beräkna laddkostnad</h2>
      <p>Se vad det kostar att ladda denna elbil per månad. Du behöver bara ange din årliga körsträcka för att se fordonets uppskattade laddningskostnad.</p>
      <div id="${MILEAGE_SELECT_NODE}"></div>
      <div id="${MILEAGE_RANGE_NODE}"></div>

      <p>Vill du anpassa kostnaden efter ditt elpris?</p>
      <div id="${MODAL_BUTTON_NODE}"></div>
      <div id="${RESULT_NODE}"></div>
      <div id="${MODAL_NODE}"></div>
    `;

    this.contexts.select = new InputSelect(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_SELECT_NODE}`),
      {
        id: MILEAGE_SELECT,
        title: 'Din årliga körsträcka',
        name: 'mileage',
        value: this.mileage,
        options: DistanceOptionsMapped,
        onChange: (e) => this.onChangeSelect(e),
      }
    );

    this.contexts.range = new InputRangeSlider(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_RANGE_NODE}`),
      {
        id: MILEAGE_RANGE,
        name: 'mileage',
        value: parseInt(this.mileage, 10),
        step: 500,
        min: DistanceOptions[0],
        max: DistanceOptions[DistanceOptions.length - 1],
        onChange: (e) => this.onChangeRange(e),
      }
    );

    this.contexts.modalButton = new Button(
      this.node.querySelector<HTMLDivElement>(`#${MODAL_BUTTON_NODE}`),
      {
        id: MODAL_BUTTON,
        title: 'Öppna uträknaren',
        onClick: () => this.contexts.modal?.open(),
      }
    );

    this.contexts.result = new Result(this.node.querySelector<HTMLDivElement>(`#${RESULT_NODE}`), {
      charginCostPerKilometer: this.charginCostPerKilometer,
      mileage: parseInt(this.mileage, 10),
    });

    this.contexts.modal = new Modal(this.node.querySelector<HTMLDivElement>(`#${MODAL_NODE}`), {
      settings: this.props.settings,
      charginCostPerKilometer: this.charginCostPerKilometer,
      mileage: parseInt(this.mileage, 10),
      distanceOptions: DistanceOptions,
      distanceOptionsMapped: DistanceOptionsMapped,
      onChangeSelect: (e) => this.onChangeSelect(e),
      onChangeRange: (e) => this.onChangeRange(e),
    });
  }
}

export default Preview;
