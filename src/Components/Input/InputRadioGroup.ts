import HtmlNode from '../Extension/HtmlNode';
import InputError from './InputError';
import InputRadioField from './InputRadioField';
import InputInformation from './InputInformation';

export interface RadioItem {
  id: string;
  value: string;
  title?: string;
  description?: string;
  meta?: string;
}

interface InputRadioGroupProps {
  readonly title?: string;
  readonly name: string;
  readonly checked?: string;
  readonly options: RadioItem[];
  error?: boolean;
  information?: string;
  readonly errorMessage?: string;
  readonly onClick: (e: Event) => void;
}

class InputRadioGroup extends HtmlNode {
  private readonly props: InputRadioGroupProps;
  private contexts: {
    error?: InputError;
  } = {};

  constructor(element: HTMLElement | null, props: InputRadioGroupProps) {
    super(element);

    this.props = props;
    this.render();
  }

  setError(error: boolean) {
    this.props.error = error;
    this.render();
  }

  render() {
    const { title, options, name, checked, error, errorMessage, information, onClick } = this.props;

    const fieldsetClassNames = ['waykeev-input-group'];
    if (error) {
      fieldsetClassNames.push('waykeev-input-group--has-error');
    }

    this.node.innerHTML = `
     <fieldset class="${fieldsetClassNames.join(' ')}" role="radiogroup" aria-required="true">
       ${
         title
           ? `<legend class="waykeev-input-label"><div class="waykeev-input-label__label">${title}</div></legend>`
           : ''
       }
        ${options
          .map((option) => `<div class="waykeev-input-group__item" id="${option.id}-node"></div>`)
          .join('')}
      </fieldset>
    `;

    if (errorMessage) {
      this.contexts.error = new InputError(this.node, {
        error,
        errorMessage,
      });
    }

    options.forEach(
      (option) =>
        new InputRadioField(this.node.querySelector<HTMLDivElement>(`#${option.id}-node`), {
          id: option.id,
          name,
          title: option.title || option.value,
          value: option.value,
          checked: checked === option.value,
          description: option.description,
          meta: option.meta,
          onClick: (e) => onClick(e),
        })
    );

    if (information) {
      new InputInformation(this.node.querySelector<HTMLElement>('.waykeev-input-label'), {
        information,
      });
    }
  }
}

export default InputRadioGroup;
