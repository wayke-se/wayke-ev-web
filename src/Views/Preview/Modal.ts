import i18next from 'i18next';
import { AppProps } from '../../@types/AppProps';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import { MarketCode } from '../../@types/MarketCode';
import HtmlNode from '../../Components/Extension/HtmlNode';
import InputRangeSlider from '../../Components/Input/InputRangeSlider';
import InputSelect, { SelectItem } from '../../Components/Input/InputSelect';
import PoweredByWayke from '../../Templates/PoweredByWayke';
import { EvEvent, EvView, pushEvent } from '../../Utils/events';
import ModalResult from './ModalResult';

const MILEAGE_SELECT = 'wayke-ev-extended-mileage-select';
const MILEAGE_SELECT_NODE = `${MILEAGE_SELECT}-node`;
const MILEAGE_RANGE = 'wayke-ev-extended-mileage-range';
const MILEAGE_RANGE_NODE = `${MILEAGE_RANGE}-node`;

const RESULT_NODE = 'wayke-ev-result-extended-node';

interface ModalProps {
  settings: AppProps;
  open?: boolean;
  charginCostPerKilometer: EvCalculationChargingPerKilometer;
  mileage: number;
  distanceOptions: number[];
  distanceOptionsMapped: SelectItem[];
  market?: MarketCode;
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
  private charginCostPerKilometer: EvCalculationChargingPerKilometer;
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

  update(charginCostPerKilometer: EvCalculationChargingPerKilometer, mileage: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.mileage = mileage;
    this.contexts.select?.update(this.mileage.toString());
    this.contexts.range?.update(this.mileage);
    this.contexts.result?.update(this.mileage);
  }

  render() {
    this.node.innerHTML = `
      <div class="waykeev-modal" role="dialog" aria-modal="true" aria-labelledby="wayke-ev-modal-title">
        <div class="waykeev-modal__container">
          <div class="waykeev-modal__center">
            <div class="waykeev-modal__dialog">
              <div class="waykeev-modal__close">
                <button title="Stäng modalen" class="waykeev-modal__close-btn">
                  <span class="waykeev-sr-only">
                    ${i18next.t('closeModal')}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" class="waykeev-icon" aria-hidden="true">
                    <path d="M9.1 8l5.9 5.9-1.1 1.1L8 9.1 2.1 15 1 13.9 6.9 8 1 2.1 2.1 1 8 6.9 13.9 1 15 2.1 9.1 8z"></path>
                  </svg>
                </button>
              </div>
              <div class="waykeev-modal__body">
                <div class="waykeev-stack waykeev-stack--3">
                  <h3 class="waykeev-heading waykeev-heading--3" id="wayke-ev-modal-title">
                    ${i18next.t('popupTitle')}
                  </h3>
                  <div class="waykeev-content">
                    <p class="waykeev-content__p">
                      ${i18next.t('popupDescription')}
                    </p>
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
                  ${PoweredByWayke(this.props.market)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    const closeButton = this.node.querySelector<HTMLButtonElement>('.waykeev-modal__close-btn');
    if (closeButton) {
      closeButton.addEventListener('click', () => {
        pushEvent(EvView.MODAL, EvEvent.MODAL_CLOSED, { id: this.props.settings.id });
        this.close();
        if (this.props.settings.hash) {
          location.hash = '';
        }
      });
    }

    this.contexts.select = new InputSelect(
      this.node.querySelector<HTMLDivElement>(`#${MILEAGE_SELECT_NODE}`),
      {
        id: MILEAGE_SELECT,
        title: i18next.t('yourYearlyMileage'),
        name: 'mileage',
        value: this.mileage.toString(),
        options: this.props.distanceOptionsMapped,
        onChange: (e) => this.props.onChangeRange(e),
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
        label: i18next.t('yourYearlyMileage') || undefined,
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
