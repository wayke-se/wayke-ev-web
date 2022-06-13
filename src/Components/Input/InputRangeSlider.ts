import HtmlNode from '../Extension/HtmlNode';

interface InputRangeSliderProps {
  readonly title?: string;
  readonly name: string;
  readonly id?: string;
  readonly value?: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly onChange: (e: Event) => void;
}

interface Contexts {
  input?: HTMLInputElement;
}

class InputRangeSlider extends HtmlNode {
  private readonly props: InputRangeSliderProps;
  private contexts: Contexts = {};
  private value?: string;

  constructor(element: HTMLElement | null, props: InputRangeSliderProps) {
    super(element);

    this.props = props;
    this.render();
  }

  update(value: string) {
    this.value = value;
    if (this.contexts.input) {
      this.contexts.input.value = this.value;
    }
  }

  render() {
    const { id, name, value, title, min, max, step, onChange } = this.props;
    this.node.innerHTML = `
      ${
        title
          ? `
          <div class="waykeev-input-label">
            <label class="waykeev-input-label__label">${title}</label>
          </div>
        `
          : ''
      }
      <div class="waykeev-input-range">
        <input 
          type="range"
          ${name ? `name="${name}"` : ''}
          ${id ? `id="${id}"` : ''}
          ${step ? `step="${step}"` : ''}
          min="${min}"
          max="${max}"
          value="${value}"
          class="waykeev-input-range__input"
        />
      </div>
    `;

    this.contexts.input = this.node.querySelector<HTMLInputElement>('input') || undefined;
    if (this.contexts.input) {
      this.contexts.input.addEventListener('input', (e) => onChange(e));
    }
  }
}

export default InputRangeSlider;
