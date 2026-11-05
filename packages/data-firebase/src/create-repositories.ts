import type {
  IAuthRepository,
  IChatRepository,
  IProfileRepository,
  IRequestsRepository,
  IVerificationRepository,
  IWalkersRepository,
} from '@patacerca/core';
import { isFirebaseConfigured, shouldUseMockData } from '@patacerca/core';
import {
  MockAuthRepository,
  MockChatRepository,
  MockProfileRepository,
  MockRequestsRepository,
  MockVerificationRepository,
  MockWalkersRepository,
} from '@patacerca/data-mock';
import { assertFirebaseConfigured } from './firebase/app';
import { FirebaseAuthRepository } from './repositories/firebase-auth.repository';
import { FirebaseProfileRepository } from './repositories/firebase-profile.repository';
import { FirebaseWalkersRepository } from './repositories/firebase-walkers.repository';
import { FirebaseRequestsRepository } from './repositories/firebase-requests.repository';
import { FirebaseVerificationRepository } from './repositories/firebase-verification.repository';

export interface OwnerRepositories {
  authRepository: IAuthRepository;
  walkersRepository: IWalkersRepository;
  requestsRepository: IRequestsRepository;
  chatRepository: IChatRepository;
  profileRepository: IProfileRepository;
}

export interface WalkerRepositories extends OwnerRepositories {
  verificationRepository: IVerificationRepository;
}

function resolveUseMock(explicit?: boolean): boolean {
  if (typeof explicit === 'boolean') return explicit;
  return shouldUseMockData();
}

function createFirebaseOwnerRepositories(): OwnerRepositories {
  assertFirebaseConfigured();
  return {
    authRepository: new FirebaseAuthRepository(),
    walkersRepository: new FirebaseWalkersRepository(),
    requestsRepository: new FirebaseRequestsRepository(),
    chatRepository: new MockChatRepository(),
    profileRepository: new FirebaseProfileRepository(),
  };
}

function createMockOwnerRepositories(): OwnerRepositories {
  return {
    authRepository: new MockAuthRepository(),
    walkersRepository: new MockWalkersRepository(),
    requestsRepository: new MockRequestsRepository(),
    chatRepository: new MockChatRepository(),
    profileRepository: new MockProfileRepository(),
  };
}

/** Owners app — mock o Firebase según EXPO_PUBLIC_USE_MOCK_DATA. */
export function createOwnerRepositories(options?: {
  useMock?: boolean;
}): OwnerRepositories {
  const useMock = resolveUseMock(options?.useMock);
  if (useMock) return createMockOwnerRepositories();
  if (!isFirebaseConfigured()) {
    console.warn(
      '[Patacerca] EXPO_PUBLIC_USE_MOCK_DATA=false pero faltan variables Firebase; usando mock.'
    );
    return createMockOwnerRepositories();
  }
  return createFirebaseOwnerRepositories();
}

/** Walkers app — incluye verificación. */
export function createWalkerRepositories(options?: {
  useMock?: boolean;
}): WalkerRepositories {
  const useMock = resolveUseMock(options?.useMock);

  if (useMock || !isFirebaseConfigured()) {
    if (!useMock && !isFirebaseConfigured()) {
      console.warn(
        '[Patacerca] EXPO_PUBLIC_USE_MOCK_DATA=false pero faltan variables Firebase; usando mock.'
      );
    }
    return {
      ...createMockOwnerRepositories(),
      verificationRepository: new MockVerificationRepository(),
    };
  }

  return {
    ...createFirebaseOwnerRepositories(),
    verificationRepository: new FirebaseVerificationRepository(),
  };
}
