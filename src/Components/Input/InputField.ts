import HtmlNode from '../Extension/HtmlNode';
import InputError from './InputError';
import InputInformation from './InputInformation';

interface InputFieldProps {
  readonly title: string;
  readonly value: string;
  readonly name: string;
  readonly id: string;
  readonly unit?: string;
  error?: boolean;
  errorMessage?: string;
  readonly placeholder?: string;
  readonly information?: string;
  readonly type?: string;
  readonly autocomplete?: string;
  readonly pattern?: string;
  readonly inputmode?: string;
  readonly disabled?: boolean;
  readonly onChange?: (e: Event) => void;
  readonly onBlur?: (e: Event) => void;
  readonly onKeyDown?: (e: KeyboardEvent) => void;
}

class InputField extends HtmlNode {
  private readonly props: InputFieldProps;
  private contexts: {
    error?: InputError;
  } = {};

  constructor(element: HTMLElement | null, props: InputFieldProps) {
    super(element);

    this.props = props;
    this.render();
  }

  private updateBorder() {
    const border = this.node.querySelector('.waykevaluation-input-text');
    if (border) {
      if (this.props.error) {
        border?.classList.add('waykevaluation-input-text--has-error');
      } else {
        border?.classList.remove('waykevaluation-input-text--has-error');
      }
    }
  }

  setError(error: boolean, errorMessage?: string) {
    this.props.error = error;
    if (errorMessage) {
      this.props.errorMessage = errorMessage;
    }
    this.updateBorder();
    this.contexts.error?.setError(error);
  }

  private render() {
    const {
      id,
      title,
      type,
      name,
      value,
      autocomplete,
      placeholder,
      unit,
      error,
      errorMessage,
      information,
      pattern,
      inputmode,
      disabled,
      onChange,
      onBlur,
      onKeyDown,
    } = this.props;

    this.node.innerHTML = `
      <div class="waykevaluation-input-label">
        <label for="${id}" class="waykevaluation-input-label__label">${title}</label>
      </div>
      <div class="waykevaluation-input-text">
        <input
          ${type ? `type="${type}"` : 'type="text"'}
          ${type === 'number' ? `pattern="[0-9]*" inputmode="numeric"` : ''}
          id="${id}"
          ${pattern ? `pattern="${pattern}"` : ''}
          ${inputmode ? `inputmode="${inputmode}"` : ''}
          value="${value}"
          name="${name}"
          ${autocomplete ? `autocomplete="${autocomplete}"` : ''}
          ${placeholder ? `placeholder="${placeholder}"` : ''}
          class="waykevaluation-input-text__input"
          ${disabled ? `disabled=""` : ''}
        />
        ${unit ? `<div class="waykevaluation-input-text__unit">${unit}</div>` : ''}
      </div>
    `;

    this.updateBorder();
    if (errorMessage) {
      this.contexts.error = new InputError(this.node, {
        error,
        errorMessage,
      });
    }

    if (information) {
      new InputInformation(this.node.querySelector<HTMLElement>('.waykevaluation-input-label'), {
        information,
      });
    }

    const input = this.node.querySelector('input');
    if (input) {
      if (onChange) {
        input.addEventListener('input', onChange);
      }
      if (onBlur) {
        input.addEventListener('blur', onBlur);
      }

      if (onKeyDown) {
        input.addEventListener('keydown', onKeyDown);
      }
    }
  }
}

export default InputField;
