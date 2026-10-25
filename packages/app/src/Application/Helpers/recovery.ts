import { del } from 'idb-keyval';
import { PERSISTER_KEY } from './persister';

const RECOVERY_FLAG = 'app-recovery-attempted';

/**
 * Clears everything that may hold a previous version of the app
 * (persisted queries, service workers and their caches).
 */
export const clearAppCache = async (): Promise<void> => {
  await del(PERSISTER_KEY).catch(() => undefined);

  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map((r) => r.unregister()));
  }

  if ('caches' in window) {
    const keys = await caches.keys();
    await Promise.all(keys.map((key) => caches.delete(key)));
  }
};

export const hasAttemptedRecovery = (): boolean =>
  sessionStorage.getItem(RECOVERY_FLAG) === 'true';

/**
 * Clears caches and reloads once per browser session.
 * Returns false when a recovery was already attempted, to avoid reload loops.
 */
export const recoverApp = async (force = false): Promise<boolean> => {
  if (!force && hasAttemptedRecovery()) return false;

  sessionStorage.setItem(RECOVERY_FLAG, 'true');
  await clearAppCache();
  window.location.reload();
  return true;
};
