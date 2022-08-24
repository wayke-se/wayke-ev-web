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
    this.contexts.range?.update(this.mileage);
    this.contexts.result?.update(this.charginCostPerKilometer, this.mileage);
  }

  render() {
    this.node.innerHTML = `
      <div class="waykeev-modal" role="dialog" aria-modal="true" aria-labelledby="wayke-ev-modal-title">
        <div class="waykeev-modal__container">
          <div class="waykeev-modal__center">
            <div class="waykeev-modal__dialog">
              <div class="waykeev-modal__close">
                <button title="Stäng modalen" class="waykeev-modal__close-btn">
                  <span class="waykeev-sr-only">Stäng modalen</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="waykeev-icon" aria-hidden="true">
                    <path d="M9.1 8l5.9 5.9-1.1 1.1L8 9.1 2.1 15 1 13.9 6.9 8 1 2.1 2.1 1 8 6.9 13.9 1 15 2.1 9.1 8z"></path>
                  </svg>
                </button>
              </div>
              <div class="waykeev-modal__body">
                <div class="waykeev-stack waykeev-stack--3">
                  <h3 class="waykeev-heading waykeev-heading--3" id="wayke-ev-modal-title">Beräkna laddkostnad</h3>
                  <div class="waykeev-content">
                    <p class="waykeev-content__p">Har du funderat över vad det kostar att ladda en elbil? Här hittar du verktyget som visar dig den uppskattade laddningskostnaden för just den här bilen.</p>
                  </div>
                </div>
                <div class="waykeev-stack waykeev-stack--3">
                  <div class="waykeev-stack waykeev-stack--2" id="${MILEAGE_SELECT_NODE}"></div>
                  <div class="waykeev-stack waykeev-stack--2" id="${MILEAGE_RANGE_NODE}"></div>
                </div>
                <div class="waykeev-stack waykeev-stack--3" id="${RESULT_NODE}"></div>
              </div>
              <footer class="waykeev-modal__footer">
                <div class="waykeev-hstack waykeev-hstack--spacing-1 waykeev-hstack--align-center">
                  <div class="waykeev-hstack__item waykeev-hstack__item--no-shrink">
                    <svg class="waykeev-powered-by-wayke" viewBox="0 0 185.57 109.13" preserveAspectRatio="xMinYMid" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <title>Wayke symbol</title>
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
                  </div>
                  <div class="waykeev-hstack__item">
                    Powered by <a href="https://www.wayke.se/" title="Gå till wayke.se" target="_blank" rel="noopener noreferer" class="waykeev-link waykeev-link--no-external-icon waykeev-link--current-color waykeev-link--underline">Wayke</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeButton = this.node.querySelector<HTMLButtonElement>('.waykeev-modal__close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => this.close());
    }

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
