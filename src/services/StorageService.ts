import { createLogger } from './Logger';

const logger = createLogger('storage');

export class StorageService {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem(key);
      if (raw == null) return fallback;
      return JSON.parse(raw) as T;
    } catch (error) {
      logger.warn('Failed to read localStorage key', { key, error });
      return fallback;
    }
  }

  set<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      logger.warn('Failed to write localStorage key', { key, error });
    }
  }
}
