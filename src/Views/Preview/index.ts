import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import LinkButton from '../../Components/LinkButton/LinkButton';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputRangeSlider from '../../Components/Input/InputRangeSlider';
import InputSelect from '../../Components/Input/InputSelect';
import { prettyNumber } from '../../Utils/format';
import Modal from './Modal';
import Result from './Result';
import { EvEvent, EvView, pushEvent } from '../../Utils/events';
import PoweredByWayke from '../../Templates/PoweredByWayke';

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
  value: d,
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
  modalButton?: LinkButton;
}

class Preview extends HtmlNode {
  private readonly props: PreviewProps;
  private contexts: PreviewContext = {};
  private mileage = DistanceOptionsMapped[2].value;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;

  constructor(element: HTMLElement | null, props: PreviewProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.render();

    if (this.props.settings.hash) {
      window.addEventListener(
        'hashchange',
        () => {
          if (!location.hash) {
            this.contexts.modal?.close();
          }
        },
        false
      );
    }
  }

  update(charginCostPerKilometer?: EvCalculationChargingPerKilometer) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.render();
  }

  private onChangeRange(e: Event) {
    pushEvent(
      EvView.MAIN,
      (e.currentTarget as HTMLInputElement | HTMLSelectElement).nodeName === 'SELECT'
        ? EvEvent.MILEAGE_SELECT
        : EvEvent.MILEAGE_SLIDER,
      { id: this.props.settings.id }
    );
    if (this.charginCostPerKilometer !== undefined) {
      const currentTarget = e.currentTarget as HTMLSelectElement;
      this.mileage = parseInt(currentTarget.value, 10);
      this.contexts.select?.update(this.mileage.toString());
      this.contexts.range?.update(this.mileage);
      this.contexts.result?.update(this.charginCostPerKilometer, this.mileage);
      this.contexts.modal?.update(this.charginCostPerKilometer, this.mileage);
    }
  }

  render() {
    if (this.charginCostPerKilometer === undefined) return;

    this.node.innerHTML = `
      <div class="waykeev-stack waykeev-stack--3">
        <h2 class="waykeev-heading waykeev-heading--2">Beräkna laddkostnad</h2>
        <div class="waykeev-content">
          <p class="waykeev-content__p">Se vad det kostar att ladda denna elbil per månad. Du behöver bara ange din årliga körsträcka för att se fordonets uppskattade laddningskostnad.</p>
        </div>
      </div>
      <div class="waykeev-stack waykeev-stack--3">
        <div class="waykeev-stack waykeev-stack--2" id="${MILEAGE_SELECT_NODE}"></div>
        <div class="waykeev-stack waykeev-stack--2" id="${MILEAGE_RANGE_NODE}"></div>
      </div>
      <div class="waykeev-stack waykeev-stack--3" id="${RESULT_NODE}"></div>
      <div class="waykeev-stack waykeev-stack--3">
        <div class="waykeev-hstack waykeev-hstack--spacing-2 waykeev-hstack--align-center">
          <div class="waykeev-hstack__item waykeev-hstack__item--no-shrink" aria-hidden="true">
            <div class="waykeev-icon-backdrop waykeev-icon-backdrop--large waykeev-icon-backdrop--success">
              <svg viewBox="0 0 16 16" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" class="waykeev-icon" data-icon="Bulb">
                <path d="M7 2V1c0-.6.4-1 1-1s1 .4 1 1v1c0 .6-.4 1-1 1s-1-.4-1-1zM2.3 4.7c.2.2.4.3.7.3s.5-.1.7-.3c.4-.4.4-1 0-1.4l-1-1c-.4-.4-1-.4-1.4 0s-.4 1 0 1.4l1 1zm12.4-1c.4-.4.4-1 0-1.4s-1-.4-1.4 0l-1 1c-.4.4-.4 1 0 1.4.2.2.4.3.7.3s.5-.1.7-.3l1-1zm-2.4 2.6c.5.7.7 1.5.7 2.4 0 .8-.2 1.6-.7 2.3-.3.5-.8 1-1.3 1.3V15c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-2.7c-.5-.3-1-.8-1.3-1.3-.5-.7-.7-1.5-.7-2.4 0-.8.2-1.6.7-2.3.4-.7 1.1-1.3 1.8-1.7C6.3 4.2 7.1 4 8 4c.9 0 1.7.2 2.5.6.7.4 1.4 1 1.8 1.7zM11 8.6c0-.4-.1-.9-.4-1.3-.2-.3-.6-.7-1.1-.9C9.1 6.1 8.6 6 8 6c-.5 0-1.1.1-1.5.4-.5.2-.9.5-1.1.9-.3.4-.4.9-.4 1.3s.1.9.4 1.3c.3.4.6.7 1.1 1 .3.2.5.5.5.9V14h2v-2.2c0-.4.2-.7.5-.9.5-.2.8-.6 1.1-1 .3-.4.4-.8.4-1.3zM15 7h-.5c-.6 0-1 .4-1 1s.4 1 1 1h.5c.6 0 1-.4 1-1s-.4-1-1-1zM1.5 7H1c-.6 0-1 .4-1 1s.4 1 1 1h.5c.6 0 1-.4 1-1s-.4-1-1-1z" />
              </svg>
            </div>
          </div>
          <div class="waykeev-hstack__item waykeev-hstack__item--grow">
            <span class="waykeev-text waykeev-text--font-medium waykeev-text--bump-right">Vill du anpassa kostnaden efter ditt elpris?</span>
            <span id="${MODAL_BUTTON_NODE}"></span>
          </div>
        </div>
      </div>
      <div class="waykeev-stack waykeev-stack--3">
        <div class="waykeev-hstack waykeev-hstack--spacing-1 waykeev-hstack--align-center waykeev-hstack--justify-center">
          ${PoweredByWayke()}
        </div>
      </div>
      <div id="${MODAL_NODE}"></div>
    `;

    this.contexts.select = new InputSelect(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_SELECT_NODE}`),
      {
        id: MILEAGE_SELECT,
        title: 'Din årliga körsträcka',
        name: 'mileage',
        value: this.mileage.toString(),
        options: DistanceOptionsMapped,
        onChange: (e) => this.onChangeRange(e),
      }
    );

    this.contexts.range = new InputRangeSlider(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_RANGE_NODE}`),
      {
        id: MILEAGE_RANGE,
        name: 'mileage',
        value: this.mileage,
        step: 500,
        min: DistanceOptions[0],
        max: DistanceOptions[DistanceOptions.length - 1],
        label: 'Din årliga körsträcka',
        onChange: (e) => this.onChangeRange(e),
      }
    );

    this.contexts.modalButton = new LinkButton(
      this.node.querySelector<HTMLDivElement>(`#${MODAL_BUTTON_NODE}`),
      {
        id: MODAL_BUTTON,
        title: 'Öppna uträknaren',
        onClick: () => {
          pushEvent(EvView.MAIN, EvEvent.MODAL_OPENED, { id: this.props.settings.id });
          this.contexts.modal?.open();
          if (this.props.settings.hash) {
            location.hash = 'wayke-ev';
          }
        },
      }
    );

    this.contexts.result = new Result(this.node.querySelector<HTMLDivElement>(`#${RESULT_NODE}`), {
      charginCostPerKilometer: this.charginCostPerKilometer,
      mileage: this.mileage,
    });

    this.contexts.modal = new Modal(this.node.querySelector<HTMLDivElement>(`#${MODAL_NODE}`), {
      settings: this.props.settings,
      charginCostPerKilometer: this.charginCostPerKilometer,
      mileage: this.mileage,
      distanceOptions: DistanceOptions,
      distanceOptionsMapped: DistanceOptionsMapped,
      onChangeRange: (e) => this.onChangeRange(e),
    });
  }
}

export default Preview;
