import './styles/styles.scss';

import { AppProps } from './@types/AppProps';

import { version } from '../package.json';
import Preview from './Views/Preview';
import getCostPerKilometer from './Http/getCostPerKilometer';
import { EvCalculationChargingPerKilometer } from './@types/EvCalculation';

const VIEW_NODE = 'wayke-ev-web-view-node';

interface AppState {
  charginCostPerKilometer?: EvCalculationChargingPerKilometer;
}

interface AppContexts {
  preview?: Preview;
}

class App {
  private root: HTMLElement;
  private readonly props: AppProps;
  private state: AppState = {};
  private contexts: AppContexts = {};

  constructor(props: AppProps) {
    this.props = props;
    const createdRoot = document.createElement('div');
    createdRoot.className = 'waykeev-root';
    this.root = createdRoot;
    if (this.props.rootId) {
      const rootNode = document.getElementById(this.props.rootId);
      if (!rootNode) throw `Missing element with id '${this.props.rootId}'`;
      rootNode.appendChild(createdRoot);
    } else {
      document.body.appendChild(this.root);
    }

    this.root.dataset.version = version;
    this.render();
    if (this.props.id) {
      this.fetchData(this.props.id);
    }
  }

  private async fetchData(id: string) {
    try {
      const response = await getCostPerKilometer(this.props.url, id);
      this.state.charginCostPerKilometer = response;
      this.contexts.preview?.update(response);
    } catch (e) {
      //console.log('err');
    }
  }

  render() {
    this.root.innerHTML = `
      <div id="${VIEW_NODE}"></div>
    `;

    const node = this.root.querySelector<HTMLElement>(`#${VIEW_NODE}`);
    this.contexts.preview = new Preview(node, {
      settings: this.props,
    });
  }
}

export default App;
