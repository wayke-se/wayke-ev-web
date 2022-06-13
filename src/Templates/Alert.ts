type Tones = 'success' | 'warning' | 'error' | 'info';

interface AlertProps {
  tone?: Tones;
  children?: string | Element;
}

const Alert = ({ tone, children }: AlertProps) => `
  <div class="waykeev-alert ${tone ? `waykeev-alert--${tone}` : ''}" role="alert">
    <div class="waykeev-alert__icon">
      <div class="waykeev-alert__icon-badge">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 16 16"
          class="waykeev-icon"
          data-icon="Info"
        >
          <path d="M7 6h2v8H7V6zm0-4v2h2V2H7z" />
        </svg>
      </div>
    </div>
    <div class="waykeev-alert__content">
     ${children}
    </div>
  </div>
`;

export default Alert;
