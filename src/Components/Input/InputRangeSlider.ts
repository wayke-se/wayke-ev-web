import HtmlNode from '../Extension/HtmlNode';

interface InputRangeSliderProps {
  readonly title?: string;
  readonly name: string;
  readonly id?: string;
  readonly value: number;
  readonly min: number;
  readonly max: number;
  readonly step?: number;
  readonly label?: string;
  readonly onChange: (e: Event) => void;
}

interface Contexts {
  input?: HTMLInputElement;
}

class InputRangeSlider extends HtmlNode {
  private readonly props: InputRangeSliderProps;
  private contexts: Contexts = {};
  private value: number;
  private min: number;
  private max: number;
  private rangeSpan: number;
  private inputFieldValue: number;
  private currentValueInPercentage: number;

  constructor(element: HTMLElement | null, props: InputRangeSliderProps) {
    super(element);

    this.props = props;
    this.value = props.value;
    this.min = props.min;
    this.max = props.max;
    this.inputFieldValue = this.value;
    this.rangeSpan = this.max - this.min;
    this.currentValueInPercentage = parseInt(
      (100 * ((this.value - this.min) / this.rangeSpan)).toString(),
      10
    );
    this.render();
  }

  update(value: number) {
    this.value = value;
    if (this.contexts.input) {
      this.contexts.input.value = this.value.toString();
      this.currentValueInPercentage = parseInt(
        (100 * ((this.value - this.min) / this.rangeSpan)).toString(),
        10
      );
      this.updateRangeSliderColor(this.contexts.input);
    }
  }

  onInput(e: Event) {
    const currentTarget = e.currentTarget as HTMLInputElement;
    this.value = parseInt(currentTarget.value, 10);
    this.inputFieldValue = this.value;

    this.currentValueInPercentage = parseInt(
      (100 * ((this.value - this.min) / this.rangeSpan)).toString(),
      10
    );

    this.updateRangeSliderColor(currentTarget);
  }

  updateRangeSliderColor(element?: HTMLInputElement) {
    const elem = element || this.node.querySelector<HTMLInputElement>(`#${this.props.id}`);
    if (elem) {
      const style = getComputedStyle(elem);
      const currentBackgroundImageBits = style.backgroundImage.split(',');
      currentBackgroundImageBits[3] = currentBackgroundImageBits[3]?.replace(
        /(?:[1-9]\d?%|0%|100%)/,
        `${this.currentValueInPercentage}%`
      );
      currentBackgroundImageBits[6] = currentBackgroundImageBits[6]?.replace(
        /(?:[1-9]\d?%|0%|100%)/,
        `${this.currentValueInPercentage}%`
      );

      elem.style.backgroundImage = currentBackgroundImageBits.join(',');
    }
  }

  render() {
    const { id, name, value, title, min, max, step, label, onChange } = this.props;
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
          ${label ? `aria-label="${label}"` : ''}
        />
      </div>
    `;

    this.contexts.input = this.node.querySelector<HTMLInputElement>('input') || undefined;
    if (this.contexts.input) {
      this.contexts.input.addEventListener('input', (e) => onChange(e));
      this.contexts.input.addEventListener('input', (e) => this.onInput(e));
      this.updateRangeSliderColor(this.contexts.input);
    }
  }
}

export default InputRangeSlider;
