import './styles/styles.scss';

import { AppProps } from './@types/AppProps';

import { version } from '../package.json';
import Preview from './Views/Preview';
import getCostPerKilometer from './Http/getCostPerKilometer';
import { EvCalculationChargingPerKilometer } from './@types/EvCalculation';
import { createTheme } from './Utils/theme';
import { EvEvent, EvView, pushEvent, registerEventListner } from './Utils/events';
import { RequestError } from './Http/http';

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

    createTheme(this.props.theme);
    this.root.dataset.version = version;
    if (this.props.onEvent) {
      registerEventListner(this.props.onEvent);
    }

    this.render();
    pushEvent(EvView.MAIN, EvEvent.INITIALIZED, { id: this.props.id });
    if (this.props.id) {
      this.fetchData(this.props.id);
    }
  }

  private async fetchData(id: string) {
    try {
      pushEvent(EvView.MAIN, EvEvent.INITIAL_REQUEST_PENDING, { id: this.props.id });
      const response = await getCostPerKilometer(this.props.url, id);

      pushEvent(EvView.MAIN, EvEvent.INITIAL_REQUEST_SUCCEEDED, { id: this.props.id });
      this.state.charginCostPerKilometer = response;
      this.contexts.preview?.update(response);
    } catch (e) {
      const statusCode = (e as RequestError)?.status;
      pushEvent(EvView.MAIN, EvEvent.INITIAL_REQUEST_FAILED, { id: this.props.id, statusCode });
    }
  }

  render() {
    this.root.innerHTML = `<div id="${VIEW_NODE}"><div>`;

    const node = this.root.querySelector<HTMLElement>(`#${VIEW_NODE}`);
    this.contexts.preview = new Preview(node, {
      settings: this.props,
    });
  }
}

export default App;
