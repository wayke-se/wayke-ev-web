import Loader from '../../Templates/Loader';
import HtmlNode from '../Extension/HtmlNode';

interface LinkButtonProps {
  readonly title: string;
  readonly id?: string;
  disabled?: boolean;
  loading?: boolean;
  readonly onClick?: (e: Event) => void;
}

class LinkButton extends HtmlNode {
  private readonly props: LinkButtonProps;

  constructor(element: HTMLDivElement | null, props: LinkButtonProps) {
    super(element);
    this.props = props;
    this.render();
  }

  isDisabled() {
    return this.props.disabled;
  }

  disabled(disabled: boolean) {
    if (this.props.disabled !== disabled) {
      this.props.disabled = disabled;
      this.render();
    }
  }

  loading(loading: boolean) {
    if (this.props.loading !== loading) {
      this.props.loading = loading;
      this.props.disabled = loading;
      this.render();
    }
  }

  render() {
    const { title, id, disabled, loading, onClick } = this.props;
    this.node.innerHTML = `
      <button
        type="button"
        ${id ? `id="${id}"` : ''}
        title="${title}"
        ${disabled && `disabled=""`}
        class="waykeev-link"
      >
        <span class="waykeev-link__content">${title}</span>
        ${
          loading
            ? `
              <span class="waykeev-link__content">
                ${Loader({ type: 'inline' })}
              </span>`
            : ''
        }
      </button>
    `;
    if (onClick) {
      this.node.querySelector<HTMLButtonElement>('button')?.addEventListener('click', onClick);
    }
  }
}

export default LinkButton;
