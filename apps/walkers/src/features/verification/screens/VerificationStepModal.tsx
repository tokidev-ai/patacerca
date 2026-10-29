import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  Button,
  IconButton,
  Input,
  PhoneInput,
  UploadTile,
  Field,
} from '@patacerca/ui';
import {
  VerificationData,
  INTERVIEW_SLOTS,
  APP_STRINGS,
  cleanBolivianPhone,
  isValidBolivianPhone,
} from '@patacerca/core';
import { useWalkerData } from '../../../providers/DataProvider';

export interface VerificationStepModalProps {
  visible: boolean;
  step: 1 | 2 | 3 | 4;
  walkerId: string;
  initialData?: Partial<VerificationData>;
  onClose: () => void;
  onSaved: () => void;
}

export const VerificationStepModal: React.FC<VerificationStepModalProps> = ({
  visible,
  step,
  walkerId,
  initialData,
  onClose,
  onSaved,
}) => {
  const { verificationRepository } = useWalkerData();

  // Step 1 states
  const [ciNum, setCiNum] = useState(initialData?.nationalIdNumber || '');
  const [ciF, setCiF] = useState(initialData?.idFrontUploaded || false);
  const [ciB, setCiB] = useState(initialData?.idBackUploaded || false);
  const [selfie, setSelfie] = useState(initialData?.selfieUploaded || false);

  // Step 2 states
  const [antec, setAntec] = useState(initialData?.policeRecordUploaded || false);

  // Step 3 states
  const [r1n, setR1n] = useState(initialData?.ref1Name || '');
  const [r1p, setR1p] = useState(initialData?.ref1Phone || '');
  const [r2n, setR2n] = useState(initialData?.ref2Name || '');
  const [r2p, setR2p] = useState(initialData?.ref2Phone || '');

  // Step 4 states
  const [slot, setSlot] = useState(initialData?.interviewSlot || '');

  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      if (step === 1) {
        if (!ciNum.trim() || ciNum.trim().length < 5 || !ciF || !ciB || !selfie) {
          setError(APP_STRINGS.errors.missingVerificationStep1);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          nationalIdNumber: ciNum.trim(),
          idFrontUploaded: ciF,
          idBackUploaded: ciB,
          selfieUploaded: selfie,
        });
      } else if (step === 2) {
        if (!antec) {
          setError(APP_STRINGS.errors.missingVerificationStep2);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          policeRecordUploaded: antec,
        });
      } else if (step === 3) {
        const clean1 = cleanBolivianPhone(r1p);
        const clean2 = cleanBolivianPhone(r2p);
        if (
          !r1n.trim() ||
          !r2n.trim() ||
          !isValidBolivianPhone(clean1) ||
          !isValidBolivianPhone(clean2)
        ) {
          setError(APP_STRINGS.errors.missingVerificationStep3);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          ref1Name: r1n.trim(),
          ref1Phone: clean1,
          ref2Name: r2n.trim(),
          ref2Phone: clean2,
        });
      } else if (step === 4) {
        if (!slot) {
          setError(APP_STRINGS.errors.missingVerificationStep4);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          interviewSlot: slot,
        });
      }

      onSaved();
    } catch {
      setError('Ocurrió un error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Identidad';
      case 2:
        return 'Antecedentes';
      case 3:
        return 'Referencias';
      case 4:
        return 'Entrevista';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
              style={styles.sheet}
            >
              <View style={styles.header}>
                <View>
                  <Text style={styles.eyebrow}>Paso {step} de 4</Text>
                  <Text style={styles.title}>{getStepTitle()}</Text>
                </View>
                <IconButton icon="close" onPress={onClose} />
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
                contentContainerStyle={styles.scrollContent}
              >
                {step === 1 && (
                  <View style={styles.stepContent}>
                    <Field label="Número de carnet">
                      <Input
                        placeholder="Ej. 8765432 CB"
                        value={ciNum}
                        onChangeText={setCiNum}
                      />
                    </Field>

                    <Text style={styles.subLabel}>Fotos requeridas</Text>
                    <View style={styles.tilesRow}>
                      <View style={styles.tileCol}>
                        <UploadTile
                          label="Anverso"
                          isUploaded={ciF}
                          onPress={() => setCiF(!ciF)}
                        />
                      </View>
                      <View style={styles.tileCol}>
                        <UploadTile
                          label="Reverso"
                          isUploaded={ciB}
                          onPress={() => setCiB(!ciB)}
                        />
                      </View>
                    </View>

                    <View style={styles.selfieTile}>
                      <UploadTile
                        label="Selfie sosteniendo tu carnet"
                        isUploaded={selfie}
                        onPress={() => setSelfie(!selfie)}
                        aspectRatio={16 / 7}
                      />
                    </View>

                    <Text style={styles.note}>
                      La selfie debe mostrarte sosteniendo tu carnet junto a tu
                      cara.
                    </Text>
                  </View>
                )}

                {step === 2 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.desc}>
                      Sube tu certificado de antecedentes vigente. Debe tener menos
                      de 3 meses.
                    </Text>
                    <UploadTile
                      label="Certificado de antecedentes (PDF o foto)"
                      isUploaded={antec}
                      onPress={() => setAntec(!antec)}
                      aspectRatio={16 / 8}
                    />
                  </View>
                )}

                {step === 3 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.desc}>
                      Dos personas que te conozcan y no sean familiares. Las
                      llamaremos brevemente.
                    </Text>

                    <Text style={styles.refHeader}>Referencia 1</Text>
                    <Field label="Nombre">
                      <Input
                        placeholder="Nombre completo"
                        value={r1n}
                        onChangeText={setR1n}
                      />
                    </Field>
                    <Field label="Teléfono">
                      <PhoneInput value={r1p} onChangeText={setR1p} />
                    </Field>

                    <Text style={styles.refHeader}>Referencia 2</Text>
                    <Field label="Nombre">
                      <Input
                        placeholder="Nombre completo"
                        value={r2n}
                        onChangeText={setR2n}
                      />
                    </Field>
                    <Field label="Teléfono">
                      <PhoneInput value={r2p} onChangeText={setR2p} />
                    </Field>
                  </View>
                )}

                {step === 4 && (
                  <View style={styles.stepContent}>
                    <Text style={styles.desc}>
                      Una videollamada de 15 minutos para conocerte. Elige un
                      horario.
                    </Text>
                    <View style={styles.slotsGrid}>
                      {INTERVIEW_SLOTS.map((s) => {
                        const isSelected = slot === s;
                        return (
                          <TouchableOpacity
                            key={s}
                            activeOpacity={0.7}
                            onPress={() => setSlot(s)}
                            style={[
                              styles.slotButton,
                              isSelected && styles.slotButtonSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.slotText,
                                isSelected && styles.slotTextSelected,
                              ]}
                            >
                              {s}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                )}

                {Boolean(error) && (
                  <Text style={styles.errorText}>{error}</Text>
                )}
              </ScrollView>

              <View style={styles.footer}>
                <Button
                  title="Guardar"
                  onPress={handleSave}
                  loading={saving}
                  size="lg"
                />
              </View>
            </KeyboardAvoidingView>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(42, 36, 32, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
  },
  eyebrow: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#3E8E5E',
  },
  title: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 22,
    color: '#2A2420',
  },
  scrollContent: {
    paddingVertical: 16,
  },
  stepContent: {
    gap: 12,
  },
  desc: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 14,
    lineHeight: 20,
    color: '#6B6058',
    marginBottom: 8,
  },
  subLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 15,
    color: '#2A2420',
  },
  tilesRow: {
    flexDirection: 'row',
    gap: 12,
  },
  tileCol: {
    flex: 1,
  },
  selfieTile: {
    marginTop: 4,
  },
  note: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#8A7D70',
    marginTop: 4,
  },
  refHeader: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
    marginTop: 8,
  },
  slotsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  slotButton: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  slotButtonSelected: {
    backgroundColor: '#3E8E5E',
    borderColor: '#3E8E5E',
  },
  slotText: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 14,
    color: '#2A2420',
  },
  slotTextSelected: {
    color: '#FFFFFF',
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 10,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
  },
});

