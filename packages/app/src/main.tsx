import React from 'react';
import { HashRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';

import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

import './index.css';
import { Layout } from './Application/Components/Layout/AppLayout/Layout';
import { recoverApp, registerEventViewport } from './Application/Helpers';
import { AppErrorBoundary } from './Application/Components/Layout/AppErrorBoundary';
import { TrpcApi, trpcClientApi } from './Infrastructure/Services/clientApi';
import { persistOptions } from './Application/Helpers/persister';
import { registerSW } from 'virtual:pwa-register';
import { queryClient } from './queryClient';

// new versions are activated and reloaded automatically (registerType: autoUpdate)
registerSW({ immediate: true });

// a lazy chunk from a previous deploy no longer exists on the server
window.addEventListener('vite:preloadError', () => {
  void recoverApp();
});

registerEventViewport(queryClient);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <TrpcApi.Provider client={trpcClientApi} queryClient={queryClient}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        <AppErrorBoundary>
          <HashRouter basename="/">
            <Layout />
          </HashRouter>
        </AppErrorBoundary>
        <ReactQueryDevtools initialIsOpen={false} />
      </PersistQueryClientProvider>
    </TrpcApi.Provider>
  </React.StrictMode>,
);
