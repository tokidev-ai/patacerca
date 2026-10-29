import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button, IconButton } from '@patacerca/ui';
import {
  isStep1Complete,
  isStep2Complete,
  isStep3Complete,
  isStep4Complete,
  getCompletedStepsCount,
  APP_STRINGS,
} from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';
import { useWalkerSessionStore } from '../../../store/session.store';
import { useToastStore } from '../../../store/toast.store';
import { VerificationStepModal } from './VerificationStepModal';

export const VerificationScreen: React.FC = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { verificationRepository } = useWalkerData();
  const { walker, phone, status, setStatus } = useWalkerSessionStore();
  const { showToast } = useToastStore();

  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | 4 | null>(null);

  const walkerId = walker?.id || phone || 'walker_current';

  const { data: vData } = useQuery({
    queryKey: ['verification', walkerId],
    queryFn: () => verificationRepository.getVerificationData(walkerId),
  });

  const submitMutation = useMutation({
    mutationFn: () => verificationRepository.submitForReview(walkerId),
    onSuccess: (newStatus) => {
      setStatus(newStatus);
      queryClient.invalidateQueries({ queryKey: ['verification', walkerId] });
      showToast(APP_STRINGS.toasts.verificationSent);
    },
    onError: () => {
      showToast(APP_STRINGS.errors.incompleteVerification);
    },
  });

  const step1Done = isStep1Complete(vData || undefined);
  const step2Done = isStep2Complete(vData || undefined);
  const step3Done = isStep3Complete(vData || undefined);
  const step4Done = isStep4Complete(vData || undefined);
  const completedCount = getCompletedStepsCount(vData || undefined);
  const allStepsComplete = completedCount === 4;

  const stepsConfig = [
    {
      step: 1 as const,
      title: 'Identidad',
      desc: 'Carnet por ambos lados y selfie',
      isCompleted: step1Done,
    },
    {
      step: 2 as const,
      title: 'Antecedentes',
      desc: 'Certificado de antecedentes vigente',
      isCompleted: step2Done,
    },
    {
      step: 3 as const,
      title: 'Referencias',
      desc: 'Dos personas que te conozcan',
      isCompleted: step3Done,
    },
    {
      step: 4 as const,
      title: 'Entrevista',
      desc: 'Videollamada de 15 minutos',
      isCompleted: step4Done,
    },
  ];

  const handleStepPress = (step: 1 | 2 | 3 | 4) => {
    if (status === 'in_review') return;
    setActiveStep(step);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <IconButton icon="back" onPress={() => router.back()} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={styles.eyebrow}>{completedCount} de 4 pasos</Text>
        <Text style={styles.title}>Verificación de paseador</Text>
        <Text style={styles.subtitle}>
          Los dueños confían en ti porque nosotros te conocemos primero. Toma unos
          10 minutos.
        </Text>

        {/* Founder banner */}
        <View style={styles.founderBanner}>
          <Text style={styles.founderText}>
            Paseador fundador: tu verificación es gratuita.
          </Text>
        </View>

        {/* Status notice */}
        {status === 'in_review' && (
          <View style={styles.reviewNotice}>
            <Text style={styles.reviewNoticeTitle}>
              Enviado a revisión
            </Text>
            <Text style={styles.reviewNoticeText}>
              Revisaremos tus documentos y te confirmaremos la entrevista por
              WhatsApp.
            </Text>
          </View>
        )}

        {status === 'approved' && (
          <View style={styles.approvedNotice}>
            <Text style={styles.approvedText}>
              ✓ Eres paseador verificado. Ya puedes aceptar paseos.
            </Text>
          </View>
        )}

        {/* Steps List */}
        <View style={styles.stepsList}>
          {stepsConfig.map((item) => (
            <TouchableOpacity
              key={item.step}
              activeOpacity={status === 'in_review' ? 1 : 0.7}
              onPress={() => handleStepPress(item.step)}
              style={[
                styles.stepCard,
                item.isCompleted && styles.stepCardCompleted,
              ]}
            >
              <View
                style={[
                  styles.stepNumberCircle,
                  item.isCompleted && styles.stepCircleCompleted,
                ]}
              >
                <Text
                  style={[
                    styles.stepNumberText,
                    item.isCompleted && styles.stepNumberCompletedText,
                  ]}
                >
                  {item.isCompleted ? '✓' : item.step}
                </Text>
              </View>

              <View style={styles.stepInfo}>
                <Text style={styles.stepTitle}>{item.title}</Text>
                <Text style={styles.stepDesc}>{item.desc}</Text>
              </View>

              {status !== 'in_review' && (
                <Text
                  style={[
                    styles.stepActionText,
                    item.isCompleted
                      ? styles.actionTextCompleted
                      : styles.actionTextStart,
                  ]}
                >
                  {item.isCompleted ? 'Editar' : 'Empezar'}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Button if status is pending */}
      {status === 'pending' && (
        <SafeAreaView style={styles.bottomSafeArea}>
          <View style={styles.bottomBar}>
            <Button
              title="Enviar a revisión"
              onPress={() => submitMutation.mutate()}
              variant={allStepsComplete ? 'primary' : 'disabled'}
              loading={submitMutation.isPending}
              size="lg"
            />
          </View>
        </SafeAreaView>
      )}

      {/* Step Modal Sheet */}
      {activeStep && (
        <VerificationStepModal
          visible={Boolean(activeStep)}
          step={activeStep}
          walkerId={walkerId}
          initialData={vData || undefined}
          onClose={() => setActiveStep(null)}
          onSaved={() => {
            queryClient.invalidateQueries({
              queryKey: ['verification', walkerId],
            });
            setActiveStep(null);
          }}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F2EA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  eyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
    marginBottom: 4,
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 28,
    color: '#2A2420',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 15,
    lineHeight: 22,
    color: '#6B6058',
    marginBottom: 16,
  },
  founderBanner: {
    backgroundColor: '#E4EFE6',
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  founderText: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 14,
    color: '#2F6E48',
  },
  reviewNotice: {
    backgroundColor: '#EFE6D8',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  reviewNoticeTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
    marginBottom: 4,
  },
  reviewNoticeText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    color: '#4A413A',
    lineHeight: 20,
  },
  approvedNotice: {
    backgroundColor: '#3E8E5E',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  approvedText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#FFFFFF',
    textAlign: 'center',
  },
  stepsList: {
    gap: 12,
  },
  stepCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFCF7',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 18,
    padding: 16,
  },
  stepCardCompleted: {
    borderColor: '#BFD9C7',
  },
  stepNumberCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F7F2EA',
    borderWidth: 1,
    borderColor: '#E6DCCD',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepCircleCompleted: {
    backgroundColor: '#3E8E5E',
    borderColor: '#3E8E5E',
  },
  stepNumberText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  stepNumberCompletedText: {
    color: '#FFFFFF',
  },
  stepInfo: {
    flex: 1,
    marginLeft: 14,
    marginRight: 10,
  },
  stepTitle: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
  },
  stepDesc: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 2,
  },
  stepActionText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
  },
  actionTextStart: {
    color: '#3E8E5E',
  },
  actionTextCompleted: {
    color: '#6B6058',
  },
  bottomSafeArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F7F2EA',
  },
  bottomBar: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
  },
});

