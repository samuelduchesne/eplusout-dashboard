import './styles.css';
import { createRoot } from 'react-dom/client';
import { Root } from './app/Root';

const container = document.getElementById('react-root');
if (container) {
  const root = createRoot(container);
  root.render(<Root />);
}
