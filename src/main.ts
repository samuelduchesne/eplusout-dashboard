import './styles.css';
import { bootstrapApp } from './app/App';
import { createLogger } from './services/Logger';

const logger = createLogger('bootstrap');

try {
  bootstrapApp();
} catch (error) {
  logger.error('Application bootstrap failed', { error });
  const body = document.getElementById('chart');
  if (body) {
    body.textContent = 'Application failed to start. Check console logs for details.';
  }
}
