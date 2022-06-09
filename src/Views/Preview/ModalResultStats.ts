import HtmlNode from '../../Components/Extension/HtmlNode';
import { prettyNumber } from '../../Utils/format';

interface ModalResultStatsProps {
  costPerMonth: number;
}

class ModalResultStats extends HtmlNode {
  private readonly props: ModalResultStatsProps;
  private costPerMonth: number;

  constructor(element: HTMLElement | null, props: ModalResultStatsProps) {
    super(element);
    this.props = props;
    this.costPerMonth = props.costPerMonth;

    this.render();
  }

  update(costPerMonth: number) {
    this.costPerMonth = costPerMonth;
    this.render();
  }

  render() {
    this.node.innerHTML = `
        <h2>Laddkostnad</h2>
        <p>${prettyNumber(this.costPerMonth, { postfix: 'kr/mån*', decimals: 0 })}</p>
        <p>*Beräknat på fordonets batterikapacitet, räckvidd, den angivna årliga körsträckan samt en schablonkostnad på 130 öre/kWh.</p>
    `;
  }
}

export default ModalResultStats;
