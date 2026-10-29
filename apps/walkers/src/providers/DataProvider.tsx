import React, { createContext, useContext, useMemo } from 'react';
import {
  IAuthRepository,
  IWalkersRepository,
  IRequestsRepository,
  IChatRepository,
  IVerificationRepository,
  IProfileRepository,
} from '@patacerca/core';
import {
  MockAuthRepository,
  MockWalkersRepository,
  MockRequestsRepository,
  MockChatRepository,
  MockVerificationRepository,
  MockProfileRepository,
} from '@patacerca/data-mock';

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
  const value = useMemo<WalkerDataContextValue>(
    () => ({
      authRepository: new MockAuthRepository(),
      walkersRepository: new MockWalkersRepository(),
      requestsRepository: new MockRequestsRepository(),
      chatRepository: new MockChatRepository(),
      verificationRepository: new MockVerificationRepository(),
      profileRepository: new MockProfileRepository(),
    }),
    []
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useWalkerData(): WalkerDataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useWalkerData must be used within WalkerDataProvider');
  }
  return ctx;
}

