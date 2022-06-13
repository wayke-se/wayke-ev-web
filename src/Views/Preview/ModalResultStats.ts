import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';

type PriceOptionTypes = 'standardPrice' | 'customPrice';

const calculateCostPerMonth = (costPerKilometer: number | undefined, distance?: number) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * 10) / 12;
};

interface ModalResultStatsProps {
  priceOption: PriceOptionTypes;
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  mileage: number;
}

class ModalResultStats extends HtmlNode {
  private readonly props: ModalResultStatsProps;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private mileage: number;

  constructor(element: HTMLElement | null, props: ModalResultStatsProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.mileage = props.mileage;

    this.render();
  }

  update(charginCostPerKilometer: EvCalculationChargingPerKilometer, mileage: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.mileage = mileage;
    this.render();
  }

  render() {
    const costPerMonth = calculateCostPerMonth(
      this.charginCostPerKilometer?.description.costPerKilometer.value,
      this.mileage
    );

    const costPerKwh = this.charginCostPerKilometer?.description.costPerKwh;
    const vehicle = this.charginCostPerKilometer?.vehicle;
    const batteryCapacity = vehicle?.batteryCapacity;
    const electricalRangeWLTP = vehicle?.electricalRangeWLTP;

    this.node.innerHTML = `
      <div class="waykeev-stack waykeev-stack--3">
        <div class="waykeev-stack waykeev-stack--1">
          <div class="waykeev-heading waykeev-heading--3 waykeev-no-margin">${prettyNumber(
            costPerMonth,
            {
              postfix: 'kr/mån*',
              decimals: 0,
            }
          )}</div>
        </div>
        <div class="waykeev-stack waykeev-stack--1">
          <div class="waykeev-disclaimer">*Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på 130 öre/kWh.</div>
        </div>
      </div>
      <div class="waykeev-stack waykeev-stack--3">
        <ul class="waykeev-key-value-list">
          <li class="waykeev-key-value-list__item">
            <div class="waykeev-key-value-list__key">Fordonets batterikapacitet</div>
            <div class="waykeev-key-value-list__value">${prettyNumber(batteryCapacity?.value, {
              postfix: batteryCapacity?.unit,
            })}</div>
          </li>
          <li class="waykeev-key-value-list__item">
            <div class="waykeev-key-value-list__key">Fordonets räckvidd</div>
            <div class="waykeev-key-value-list__value">${prettyNumber(electricalRangeWLTP?.value, {
              postfix: electricalRangeWLTP?.unit,
            })}</div>
            </li>
          <li class="waykeev-key-value-list__item">
            <div class="waykeev-key-value-list__key"> Angiven årlig körsträcka</div>
            <div class="waykeev-key-value-list__value">${prettyNumber(this.mileage, {
              postfix: 'mil',
            })}</div>
          </li>
          ${
            this.props.priceOption === 'standardPrice'
              ? `
                <li class="waykeev-key-value-list__item">
                  <div class="waykeev-key-value-list__key">Elpris schablon, inkl. energiskatt och moms</div>
                  <div class="waykeev-key-value-list__value">
                    ${prettyNumber((costPerKwh?.value || 0) * 100, { postfix: 'öre/kWh' })}
                  </div>
                </li>
                <li class="waykeev-key-value-list__item">
                  <div class="waykeev-key-value-list__key">Elnätsavgift</div>
                  <div class="waykeev-key-value-list__value">Inte inkluderad i beräkningen</div>
                </li>
              `
              : ''
          }
        </ul>
      </div>
    `;
  }
}

export default ModalResultStats;
