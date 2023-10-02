import HtmlNode from '../Extension/HtmlNode';

export interface SelectItem {
  value: string | number;
  title?: string;
}

interface InputSelectProps {
  readonly title: string;
  readonly name: string;
  readonly id?: string;
  readonly value?: string;
  readonly options: SelectItem[];
  readonly placeholder?: string;
  readonly onChange: (e: Event) => void;
}

interface Contexts {
  select?: HTMLSelectElement;
}

class InputSelect extends HtmlNode {
  private readonly props: InputSelectProps;
  private contexts: Contexts = {};
  private value?: string;

  constructor(element: HTMLElement | null, props: InputSelectProps) {
    super(element);

    this.props = props;
    this.value = props.value;
    this.render();
  }

  update(value: string) {
    this.value = value;
    if (this.contexts.select) {
      this.contexts.select.value = this.value;
    }
  }

  render() {
    const { id, options, name, title, placeholder, onChange } = this.props;
    this.node.innerHTML = `
      <div class="waykeev-input-label">
        <label for="wayke-ev-distance-select" class="waykeev-input-label__label">${title}</label>
      </div>
      <select
        class="waykeev-select"
        ${name ? `name="${name}"` : ''}
        ${id ? `id="${id}"` : ''}
        value="${this.value}"
      >
        ${
          placeholder ? `<option value="placeholder" disabled selected>${placeholder}</option>` : ''
        }
        ${options
          .map(
            (option) =>
              `<option value="${option.value.toString()}" ${
                option.value.toString() === this.value ? `selected="selected"` : ''
              }>${option.title || option.value}</option>`
          )
          .join('')}
      </select>
    `;

    this.contexts.select = this.node.querySelector<HTMLSelectElement>('select') || undefined;
    if (this.contexts.select) {
      this.contexts.select.addEventListener('change', (e) => onChange(e));
    }
  }
}

export default InputSelect;
