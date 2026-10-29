import React, { createContext, useContext, useMemo } from 'react';
import {
  IAuthRepository,
  IWalkersRepository,
  IRequestsRepository,
  IChatRepository,
  IProfileRepository,
} from '@patacerca/core';
import {
  MockAuthRepository,
  MockWalkersRepository,
  MockRequestsRepository,
  MockChatRepository,
  MockProfileRepository,
} from '@patacerca/data-mock';

interface DataContextValue {
  authRepository: IAuthRepository;
  walkersRepository: IWalkersRepository;
  requestsRepository: IRequestsRepository;
  chatRepository: IChatRepository;
  profileRepository: IProfileRepository;
}

const DataContext = createContext<DataContextValue | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = useMemo<DataContextValue>(
    () => ({
      authRepository: new MockAuthRepository(),
      walkersRepository: new MockWalkersRepository(),
      requestsRepository: new MockRequestsRepository(),
      chatRepository: new MockChatRepository(),
      profileRepository: new MockProfileRepository(),
    }),
    []
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export function useData(): DataContextValue {
  const ctx = useContext(DataContext);
  if (!ctx) {
    throw new Error('useData must be used within a DataProvider');
  }
  return ctx;
}

