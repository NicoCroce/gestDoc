import { createIDBPersister } from './Indexdb';

export const PERSISTER_KEY = 'reactQuery';

export const persistOptions = {
  persister: createIDBPersister(PERSISTER_KEY),
  maxAge: 1000 * 60 * 60 * 24, // 24 hours, must not exceed queryClient gcTime
  // discard persisted data from previous deploys
  buster: __APP_VERSION__,
};
