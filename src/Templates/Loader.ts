type LoaderType = 'inline';

interface LoaderProps {
  type?: LoaderType;
}

const getType = (type?: LoaderType) => {
  switch (type) {
    case 'inline':
      return 'waykevaluation-loader--inline-block';
    default:
      return '';
  }
};

const Loader = (props?: LoaderProps) => {
  const classList = ['waykevaluation-loader'];
  const classType = getType(props?.type);
  if (classType) {
    classList.push(classType);
  }

  return `
  <div class="${classList.join(' ')}" role="status">
    <div class="waykevaluation-loader__spinner" aria-hidden="true"></div>
    <div class="waykevaluation-sr-only">Laddar...</div>
  </div>
`;
};

export default Loader;
