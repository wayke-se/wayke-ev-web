import i18next from 'i18next';
import { EvCalculationChargingPerKilometer } from '../../@types/EvCalculation';
import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';
import { MarketCode } from '../../@types/MarketCode';

type PriceOptionTypes = 'standardPrice' | 'customPrice';

const calculateCostPerMonth = (
  costPerKilometer: number | undefined,
  distance: number | undefined,
  marketCode: MarketCode
) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * (marketCode === 'SE' ? 10 : 1)) / 12;
};

interface ModalResultStatsProps {
  priceOption: PriceOptionTypes;
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  distance: number;
  marketCode: MarketCode;
}

class ModalResultStats extends HtmlNode {
  private readonly props: ModalResultStatsProps;
  private charginCostPerKilometer?: EvCalculationChargingPerKilometer;
  private distance: number;
  private marketCode: MarketCode;

  constructor(element: HTMLElement | null, props: ModalResultStatsProps) {
    super(element);
    this.props = props;
    this.charginCostPerKilometer = props.charginCostPerKilometer;
    this.distance = props.distance;
    this.marketCode = props.marketCode;
    this.render();
  }

  update(charginCostPerKilometer: EvCalculationChargingPerKilometer | undefined, distance: number) {
    this.charginCostPerKilometer = charginCostPerKilometer;
    this.distance = distance;
    this.render();
  }

  hide() {
    this.node.innerHTML = '';
  }

  render() {
    const costPerMonth = calculateCostPerMonth(
      this.charginCostPerKilometer?.description.costPerKilometer.value,
      this.distance,
      this.marketCode
    );

    const costPerKwh = this.charginCostPerKilometer?.description.costPerKwh;
    const vehicle = this.charginCostPerKilometer?.vehicle;
    const batteryCapacity = vehicle?.batteryCapacity;
    const electricalRangeWLTP = vehicle?.electricalRangeWLTP;

    this.node.innerHTML = `
      <div class="waykeev-balloon">
        <div class="waykeev-stack waykeev-stack--3">
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
            * ${i18next.t(
              this.props.priceOption === 'standardPrice'
                ? 'costPerMonthDisclaimer.templated'
                : 'costPerMonthDisclaimer.statedPrice',
              {
                costPerKwh: prettyNumber((costPerKwh?.value || 0) * 100, {
                  postfix: i18next.t('costPerKwh') || undefined,
                }),
              }
            )}
            </div>
          </div>
        </div>
        <div class="waykeev-stack waykeev-stack--3">
          <ul class="waykeev-key-value-list">
            <li class="waykeev-key-value-list__item">
              <div class="waykeev-key-value-list__key">${i18next.t('vehicleBatteryCapacity')}</div>
              <div class="waykeev-key-value-list__value">${prettyNumber(batteryCapacity?.value, {
                postfix: batteryCapacity?.unit,
              })}</div>
            </li>
            <li class="waykeev-key-value-list__item">
              <div class="waykeev-key-value-list__key">${i18next.t('vehicleRange')}</div>
              <div class="waykeev-key-value-list__value">${prettyNumber(
                electricalRangeWLTP?.value,
                {
                  postfix: electricalRangeWLTP?.unit,
                }
              )}</div>
              </li>
            <li class="waykeev-key-value-list__item">
              <div class="waykeev-key-value-list__key">${i18next.t('statedAnnualDistance')}</div>
              <div class="waykeev-key-value-list__value">${prettyNumber(this.distance, {
                postfix: i18next.t('distanceUnit', { count: this.distance }) || undefined,
              })}</div>
            </li>
            ${
              this.props.priceOption === 'standardPrice'
                ? `
                  <li class="waykeev-key-value-list__item">
                    <div class="waykeev-key-value-list__key">${i18next.t(
                      'electricityPriceTemplateIncVat'
                    )}</div>
                    <div class="waykeev-key-value-list__value">
                      ${prettyNumber((costPerKwh?.value || 0) * 100, {
                        postfix: i18next.t('costPerKwh') || undefined,
                      })}
                    </div>
                  </li>
                  <li class="waykeev-key-value-list__item">
                    <div class="waykeev-key-value-list__key">${i18next.t(
                      'electricGridFee.key'
                    )}</div>
                    <div class="waykeev-key-value-list__value">${i18next.t(
                      'electricGridFee.value'
                    )}</div>
                  </li>
                `
                : ''
            }
          </ul>
        </div>
      </div>
    `;
  }
}

export default ModalResultStats;
