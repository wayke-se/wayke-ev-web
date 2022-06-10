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
      <div style="padding: 8px; border: 1px solid black; margin-top: 8px">
        <h2>Laddkostnad</h2>
        <p>${prettyNumber(costPerMonth, { postfix: 'kr/mån*', decimals: 0 })}</p>
        <p>*Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på 130 öre/kWh.</p>
        <ul>
          <li>Fordonets batterikapacitet: ${prettyNumber(batteryCapacity?.value, {
            postfix: batteryCapacity?.unit,
          })}</li>
          <li>Fordonets räckvidd: ${prettyNumber(electricalRangeWLTP?.value, {
            postfix: electricalRangeWLTP?.unit,
          })}</li>
          <li>Angiven årlig körsträcka: ${prettyNumber(this.mileage, { postfix: 'mil' })}</li>
          ${
            this.props.priceOption === 'standardPrice'
              ? `
                <li>Elpris schablon, inkl. energiskatt och moms: ${prettyNumber(
                  (costPerKwh?.value || 0) * 100,
                  { postfix: 'öre/kWh' }
                )}</li>
                <li>Elnätsavgift: Inte inkluderad i beräkningen</li>
              `
              : ''
          }
        </ul>
      </div>
    `;
  }
}

export default ModalResultStats;
