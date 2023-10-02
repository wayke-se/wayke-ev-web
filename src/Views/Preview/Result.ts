import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';
import { MarketCode } from '../../@types/MarketCode';
import i18next from '../../Utils/i18n';

const calculateCostPerMonth = (
  costPerKilometer: number | undefined,
  distance?: number,
  marketCode?: MarketCode
) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * (marketCode === 'SE' ? 10 : 1)) / 12;
};

interface ResultProps {
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  distance: number;
  marketCode: MarketCode;
}

class Result extends HtmlNode {
  private readonly props: ResultProps;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private distance?: number;
  private marketCode: MarketCode;

  constructor(element: HTMLElement | null, props: ResultProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.distance = props.distance;
    this.marketCode = props.marketCode;
    this.render();
  }

  update(charginCostPerKilometer?: EvCalculationChargingPerKilometer, distance?: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.distance = distance;
    this.render();
  }

  render() {
    const costPerMonth = calculateCostPerMonth(
      this.charginCostPerKilometer?.description.costPerKilometer.value,
      this.distance,
      this.marketCode
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
