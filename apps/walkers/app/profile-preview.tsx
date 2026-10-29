import React from 'react';
import { useRouter } from 'expo-router';
import { ProfilePreviewModal } from '../src/features/profile/screens/ProfilePreviewModal';
import { useWalkerSessionStore } from '../src/store/session.store';

export default function ProfilePreviewRoute() {
  const router = useRouter();
  const { walker, status } = useWalkerSessionStore();

  return (
    <ProfilePreviewModal
      visible={true}
      walker={walker}
      status={status}
      price30={walker?.price30 || 20}
      bio={walker?.bio || ''}
      onClose={() => router.back()}
    />
  );
}

