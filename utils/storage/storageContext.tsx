'use client';
import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { MessageStorageService } from './MessageStorageService';

interface StorageContextType {
  storageService: MessageStorageService;
}

const StorageContext = createContext<StorageContextType | undefined>(undefined);

export const StorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const storageService = useMemo(() => new MessageStorageService(), []);

  return <StorageContext.Provider value={{ storageService }}>{children}</StorageContext.Provider>;
};

export const useStorage = () => {
  const context = useContext(StorageContext);
  if (!context) {
    throw new Error('useStorage must be used within StorageProvider');
  }
  return context.storageService;
};
