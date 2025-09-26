import React from 'react';
import { DataProvider } from '../../contexts/DataContext';

interface AppProvidersProps {
  children: React.ReactNode;
}

/**
 * AppProviders component that wraps all context providers for the application.
 * This centralizes all providers and makes it easy to manage them in one place.
 */
const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  return (
    <DataProvider>
      {children}
    </DataProvider>
  );
};

export default AppProviders;