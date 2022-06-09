import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';

const calculateCostPerMonth = (costPerKilometer: number | undefined, distance?: number) => {
  if (!costPerKilometer || !distance) return undefined;
  return (costPerKilometer * distance * 10) / 12;
};

interface ResultProps {
  costPerKilometer?: number;
  mileage: number;
}

class Result extends HtmlNode {
  private readonly props: ResultProps;
  private costPerKilometer?: number;
  private mileage?: number;

  constructor(element: HTMLElement | null, props: ResultProps) {
    super(element);
    this.props = props;
    this.costPerKilometer = props.costPerKilometer;
    this.mileage = props.mileage;
    this.render();
  }

  update(costPerKilomter?: number, mileage?: number) {
    this.costPerKilometer = costPerKilomter;
    this.mileage = mileage;
    this.render();
  }

  render() {
    const costPerMonth = calculateCostPerMonth(this.costPerKilometer, this.mileage);

    this.node.innerHTML = `
      <div>
        <h2>Laddkostnad</h2>
        <p>${prettyNumber(costPerMonth, { postfix: 'kr/mån*', decimals: 0 })}</p>
        <p>*Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på 130 öre/kWh.</p>
      </div>
    `;
  }
}

export default Result;
