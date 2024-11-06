import { Routes } from 'react-router-dom';
import { Toaster } from './Aplication/Components/ui/sonner';

import { AllRoutes } from './Infrastructure';

import './App.css';
import { ChangePasswordModal } from './Domains/Users/Components/ChangePassword/ChangePasswordModal';

export const App = () => {
  return (
    <>
      <Routes>{AllRoutes}</Routes>
      <ChangePasswordModal />
      <Toaster richColors />
    </>
  );
};
