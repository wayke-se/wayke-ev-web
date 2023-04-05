import i18next from 'i18next';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';

const calculateCostPerMonth = (costPerKilometer: number | undefined, distance?: number) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * 10) / 12;
};

interface ResultProps {
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  mileage: number;
}

class Result extends HtmlNode {
  private readonly props: ResultProps;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private mileage?: number;

  constructor(element: HTMLElement | null, props: ResultProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.mileage = props.mileage;
    this.render();
  }

  update(charginCostPerKilometer?: EvCalculationChargingPerKilometer, mileage?: number) {
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

    this.node.innerHTML = `
      <div class="waykeev-balloon">
        <div class="waykeev-stack waykeev-stack--1">
          <div class="waykeev-heading waykeev-heading--3 waykeev-no-margin">${prettyNumber(
            costPerMonth,
            {
              postfix: `${i18next.t('costPerMonth')}*`,
              decimals: 0,
            }
          )}</div>
        </div>
        <div class="waykeev-stack waykeev-stack--1">
          <div class="waykeev-disclaimer">
            * ${i18next.t('costPerMonthDisclaimer.templated', {
              costPerKwh: prettyNumber((costPerKwh?.value || 0) * 100, {
                postfix: i18next.t('costPerKwh') || undefined,
              }),
            })}
          </div>
        </div>
      </div>
    `;
  }
}

export default Result;
