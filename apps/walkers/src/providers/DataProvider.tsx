import React, { createContext, useContext, useMemo } from 'react';
import {
  IAuthRepository,
  IWalkersRepository,
  IRequestsRepository,
  IChatRepository,
  IVerificationRepository,
  IProfileRepository,
} from '@patacerca/core';
import { createWalkerRepositories } from '@patacerca/data-firebase';

interface WalkerDataContextValue {
  authRepository: IAuthRepository;
  walkersRepository: IWalkersRepository;
  requestsRepository: IRequestsRepository;
  chatRepository: IChatRepository;
  verificationRepository: IVerificationRepository;
  profileRepository: IProfileRepository;
}

const DataContext = createContext<WalkerDataContextValue | null>(null);

export const WalkerDataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useMemo<WalkerDataContextValue>(() => createWalkerRepositories(), []);

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useWalkerData(): WalkerDataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useWalkerData must be used within WalkerDataProvider');
  }
  return ctx;
}
