import { Routes } from 'react-router-dom';
import { Toaster } from './Application/Components/ui/sonner';

import { AllRoutes } from './Infrastructure';

import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';
import { usePublicPages } from './Application/Hooks/usePublicPages';

export const App = () => {
  const isPublicPage = usePublicPages();

  return (
    <>
      <Routes>{AllRoutes}</Routes>
      {!isPublicPage && <ChangePasswordModal />}
      <Toaster richColors />
    </>
  );
};
