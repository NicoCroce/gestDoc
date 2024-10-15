import { Routes } from 'react-router-dom';
import { Toaster } from './Aplication/Components/ui/sonner';
import { AnimatePresence } from 'framer-motion';

import { AllRoutes } from './Infrastructure';

import './App.css';

export const App = () => {
  return (
    <>
      <AnimatePresence mode="wait">
        <Routes>{AllRoutes}</Routes>
      </AnimatePresence>
      <Toaster richColors />
    </>
  );
};
