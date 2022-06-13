type LoaderType = 'inline';

interface LoaderProps {
  type?: LoaderType;
}

const getType = (type?: LoaderType) => {
  switch (type) {
    case 'inline':
      return 'waykeev-loader--inline-block';
    default:
      return '';
  }
};

const Loader = (props?: LoaderProps) => {
  const classList = ['waykeev-loader'];
  const classType = getType(props?.type);
  if (classType) {
    classList.push(classType);
  }

  return `
  <div class="${classList.join(' ')}" role="status">
    <div class="waykeev-loader__spinner" aria-hidden="true"></div>
    <div class="waykeev-sr-only">Laddar...</div>
  </div>
`;
};

export default Loader;
