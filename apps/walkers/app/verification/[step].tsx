import React from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { VerificationStepModal } from '../../src/features/verification/screens/VerificationStepModal';
import { useWalkerSessionStore } from '../../src/store/session.store';
import { useWalkerData } from '../../src/providers/DataProvider';
import { useQuery, useQueryClient } from '@tanstack/react-query';

export default function VerificationStepRoute() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { step } = useLocalSearchParams<{ step: string }>();
  const { walker, phone } = useWalkerSessionStore();
  const { verificationRepository } = useWalkerData();

  const stepNumber = (parseInt(step || '1', 10) || 1) as 1 | 2 | 3 | 4;
  const walkerId = walker?.id || phone || 'w1';

  const { data: vData } = useQuery({
    queryKey: ['verification', walkerId],
    queryFn: () => verificationRepository.getVerificationData(walkerId),
  });

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.replace('/verification');
    }
  };

  return (
    <VerificationStepModal
      visible={true}
      step={stepNumber}
      walkerId={walkerId}
      initialData={vData || undefined}
      onClose={handleBack}
      onSaved={() => {
        queryClient.invalidateQueries({ queryKey: ['verification', walkerId] });
        handleBack();
      }}
    />
  );
}

