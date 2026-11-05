import React, { useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  TouchableOpacity,
  Pressable,
  Platform,
} from 'react-native';
import DateTimePicker, {
  type DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Button,
  IconButton,
  Input,
  PhoneInput,
  UploadTile,
  Field,
  keyboardAvoidingBehavior,
  pickImageFromLibraryOrCamera,
} from '@patacerca/ui';
import {
  VerificationData,
  APP_STRINGS,
  cleanBolivianPhone,
  isValidBolivianPhone,
  clampInterviewScheduleDate,
  clampInterviewTime,
  formatInterviewSlotLabel,
  formatInterviewSlotStored,
  formatTimeHHmm,
  formatWalkDayCalendar,
  getDefaultInterviewTime,
  getInterviewScheduleMaxDate,
  getWalkScheduleMinDate,
  INTERVIEW_SCHEDULE_MAX_DAYS_AHEAD,
  initInterviewScheduleFromStored,
  isInterviewScheduleInPast,
  toWalkDayId,
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

function buildStep1Error(
  ciNum: string,
  idFrontUri: string | null,
  idBackUri: string | null,
  selfieUri: string | null
): string {
  const missing: string[] = [];
  if (!ciNum.trim() || ciNum.trim().length < 5) {
    missing.push('número de carnet (mín. 5 caracteres)');
  }
  if (!idFrontUri) missing.push('foto del anverso');
  if (!idBackUri) missing.push('foto del reverso');
  if (!selfieUri) missing.push('selfie con tu carnet');
  if (missing.length === 0) return '';
  return `Falta: ${missing.join(', ')}.`;
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

  const [ciNum, setCiNum] = useState(initialData?.nationalIdNumber || '');
  const [idFrontUri, setIdFrontUri] = useState<string | null>(
    initialData?.idFrontUploaded ? 'saved' : null
  );
  const [idBackUri, setIdBackUri] = useState<string | null>(
    initialData?.idBackUploaded ? 'saved' : null
  );
  const [selfieUri, setSelfieUri] = useState<string | null>(
    initialData?.selfieUploaded ? 'saved' : null
  );

  const [antecUri, setAntecUri] = useState<string | null>(
    initialData?.policeRecordUploaded ? 'saved' : null
  );

  const [r1n, setR1n] = useState(initialData?.ref1Name || '');
  const [r1p, setR1p] = useState(initialData?.ref1Phone || '');
  const [r2n, setR2n] = useState(initialData?.ref2Name || '');
  const [r2p, setR2p] = useState(initialData?.ref2Phone || '');

  const interviewInit = useMemo(
    () => initInterviewScheduleFromStored(initialData?.interviewSlot),
    [initialData?.interviewSlot]
  );
  const [interviewDate, setInterviewDate] = useState(interviewInit.date);
  const [interviewTime, setInterviewTime] = useState(interviewInit.time);
  const [showAndroidDatePicker, setShowAndroidDatePicker] = useState(false);
  const [showAndroidTimePicker, setShowAndroidTimePicker] = useState(false);

  const scheduleMinDate = useMemo(() => getWalkScheduleMinDate(), []);
  const scheduleMaxDate = useMemo(() => getInterviewScheduleMaxDate(), []);
  const interviewDayId = toWalkDayId(interviewDate);
  const interviewCalendarLabel = formatWalkDayCalendar(interviewDate);
  const datePickerValue = useMemo(() => {
    const d = new Date(interviewDate);
    d.setHours(12, 0, 0, 0);
    return d;
  }, [interviewDate]);

  const [error, setError] = useState('');
  const [showMissing, setShowMissing] = useState(false);
  const [saving, setSaving] = useState(false);

  const applyInterviewDate = (next: Date) => {
    const clamped = clampInterviewScheduleDate(next);
    setInterviewDate(clamped);
    const nextDayId = toWalkDayId(clamped);
    setInterviewTime((prev) =>
      isInterviewScheduleInPast(nextDayId, prev) ? getDefaultInterviewTime() : prev
    );
    if (error) setError('');
  };

  const handleInterviewDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidDatePicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    applyInterviewDate(date);
  };

  const handleInterviewTimeChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowAndroidTimePicker(false);
    }
    if (event.type === 'dismissed' || !date) return;
    const rounded = clampInterviewTime(date);
    if (isInterviewScheduleInPast(interviewDayId, rounded)) {
      setError('Elige una hora futura para este día');
      return;
    }
    setInterviewTime(rounded);
    if (error) setError('');
  };

  const pickIdPhoto = async (title: string, setter: (uri: string | null) => void) => {
    const uri = await pickImageFromLibraryOrCamera(title);
    if (uri) {
      setter(uri);
      setError('');
      setShowMissing(false);
    }
  };

  const handleSave = async () => {
    setError('');
    setSaving(true);

    try {
      if (step === 1) {
        const stepError = buildStep1Error(ciNum, idFrontUri, idBackUri, selfieUri);
        if (stepError) {
          setShowMissing(true);
          setError(stepError);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          nationalIdNumber: ciNum.trim(),
          idFrontUploaded: true,
          idBackUploaded: true,
          selfieUploaded: true,
        });
      } else if (step === 2) {
        if (!antecUri) {
          setShowMissing(true);
          setError(APP_STRINGS.errors.missingVerificationStep2);
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          policeRecordUploaded: true,
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
        const dayId = toWalkDayId(interviewDate);
        if (isInterviewScheduleInPast(dayId, interviewTime)) {
          setError('Elige una fecha y hora futuras');
          setSaving(false);
          return;
        }
        await verificationRepository.saveStep(walkerId, {
          interviewSlot: formatInterviewSlotStored(dayId, interviewTime),
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
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityRole="button" />
        <KeyboardAvoidingView behavior={keyboardAvoidingBehavior} style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerText}>
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
                    onChangeText={(val) => {
                      setCiNum(val);
                      if (error) setError('');
                    }}
                  />
                </Field>

                <Text style={styles.subLabel}>Fotos requeridas (las tres)</Text>
                <View style={styles.tilesRow}>
                  <View style={styles.tileCol}>
                    <UploadTile
                      label="Anverso"
                      isUploaded={Boolean(idFrontUri)}
                      previewUri={
                        idFrontUri && idFrontUri !== 'saved' ? idFrontUri : null
                      }
                      highlightMissing={showMissing}
                      onPress={() =>
                        void pickIdPhoto('Anverso del carnet', setIdFrontUri)
                      }
                    />
                  </View>
                  <View style={styles.tileCol}>
                    <UploadTile
                      label="Reverso"
                      isUploaded={Boolean(idBackUri)}
                      previewUri={idBackUri && idBackUri !== 'saved' ? idBackUri : null}
                      highlightMissing={showMissing}
                      onPress={() => void pickIdPhoto('Reverso del carnet', setIdBackUri)}
                    />
                  </View>
                </View>

                <View style={styles.selfieTile}>
                  <UploadTile
                    label="Selfie sosteniendo tu carnet"
                    isUploaded={Boolean(selfieUri)}
                    previewUri={selfieUri && selfieUri !== 'saved' ? selfieUri : null}
                    highlightMissing={showMissing}
                    onPress={() => void pickIdPhoto('Selfie con tu carnet', setSelfieUri)}
                    aspectRatio={16 / 7}
                  />
                </View>

                <Text style={styles.note}>
                  La selfie debe mostrarte sosteniendo tu carnet junto a tu cara. Toca
                  cada recuadro para abrir galería o cámara.
                </Text>
              </View>
            )}

            {step === 2 && (
              <View style={styles.stepContent}>
                <Text style={styles.desc}>
                  Sube tu certificado de antecedentes vigente. Debe tener menos de 3
                  meses.
                </Text>
                <UploadTile
                  label="Certificado de antecedentes (PDF o foto)"
                  isUploaded={Boolean(antecUri)}
                  previewUri={antecUri && antecUri !== 'saved' ? antecUri : null}
                  highlightMissing={showMissing}
                  onPress={() =>
                    void pickIdPhoto('Certificado de antecedentes', setAntecUri)
                  }
                  aspectRatio={16 / 8}
                />
              </View>
            )}

            {step === 3 && (
              <View style={styles.stepContent}>
                <Text style={styles.desc}>
                  Dos personas que te conozcan y no sean familiares. Las llamaremos
                  brevemente.
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
                  Una videollamada de 15 minutos para conocerte. Elige día y hora en el
                  calendario.
                </Text>
                <Text style={styles.scheduleHint}>
                  Horario de entrevistas: 09:00 a 18:00 · hasta{' '}
                  {INTERVIEW_SCHEDULE_MAX_DAYS_AHEAD} días adelante
                </Text>

                <View style={styles.scheduleCard}>
                  <View style={styles.scheduleBlock}>
                    <Text style={styles.scheduleLabel}>Fecha</Text>
                    {Platform.OS === 'ios' ? (
                      <DateTimePicker
                        value={datePickerValue}
                        mode="date"
                        display="spinner"
                        minimumDate={scheduleMinDate}
                        maximumDate={scheduleMaxDate}
                        onChange={handleInterviewDateChange}
                        themeVariant="light"
                        style={styles.iosPicker}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.androidPickerButton}
                          onPress={() => setShowAndroidDatePicker(true)}
                        >
                          <Text style={styles.androidPickerMain}>
                            {interviewCalendarLabel}
                          </Text>
                          <Text style={styles.androidPickerHint}>Seleccionar fecha</Text>
                        </TouchableOpacity>
                        {showAndroidDatePicker ? (
                          <DateTimePicker
                            value={datePickerValue}
                            mode="date"
                            minimumDate={scheduleMinDate}
                            maximumDate={scheduleMaxDate}
                            onChange={handleInterviewDateChange}
                          />
                        ) : null}
                      </>
                    )}
                  </View>

                  <View style={styles.scheduleDivider} />

                  <View style={styles.scheduleBlock}>
                    <Text style={styles.scheduleLabel}>Hora</Text>
                    {Platform.OS === 'ios' ? (
                      <DateTimePicker
                        value={interviewTime}
                        mode="time"
                        display="spinner"
                        is24Hour
                        minuteInterval={15}
                        onChange={handleInterviewTimeChange}
                        themeVariant="light"
                        style={styles.iosPicker}
                      />
                    ) : (
                      <>
                        <TouchableOpacity
                          activeOpacity={0.8}
                          style={styles.androidPickerButton}
                          onPress={() => setShowAndroidTimePicker(true)}
                        >
                          <Text style={styles.androidPickerMain}>
                            {formatTimeHHmm(interviewTime)}
                          </Text>
                          <Text style={styles.androidPickerHint}>Seleccionar hora</Text>
                        </TouchableOpacity>
                        {showAndroidTimePicker ? (
                          <DateTimePicker
                            value={interviewTime}
                            mode="time"
                            is24Hour
                            minuteInterval={15}
                            onChange={handleInterviewTimeChange}
                          />
                        ) : null}
                      </>
                    )}
                  </View>
                </View>

                <Text style={styles.scheduleConfirm}>
                  Programado: {formatInterviewSlotLabel(interviewDayId, interviewTime)}
                </Text>
              </View>
            )}

            {Boolean(error) && <Text style={styles.errorText}>{error}</Text>}
          </ScrollView>

          <SafeAreaView edges={['bottom', 'left', 'right']} style={styles.footer}>
            <Button title="Guardar" onPress={handleSave} loading={saving} size="lg" />
          </SafeAreaView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(42, 36, 32, 0.45)',
  },
  sheet: {
    backgroundColor: '#FFFCF7',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '92%',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 0,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E6DCCD',
    gap: 12,
  },
  headerText: {
    flex: 1,
    minWidth: 0,
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
    lineHeight: 18,
  },
  refHeader: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 16,
    color: '#2A2420',
    marginTop: 8,
  },
  scheduleHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    lineHeight: 18,
    color: '#8A7D70',
    marginBottom: 4,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E6DCCD',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 8 : 14,
    overflow: 'hidden',
  },
  scheduleBlock: {
    paddingVertical: 4,
  },
  scheduleDivider: {
    height: 1,
    backgroundColor: '#E6DCCD',
    marginVertical: 8,
  },
  scheduleLabel: {
    fontFamily: 'Figtree_600SemiBold',
    fontSize: 13,
    color: '#6B6058',
    marginBottom: 4,
  },
  scheduleConfirm: {
    fontFamily: 'Figtree_500Medium',
    fontSize: 13,
    color: '#2F6E48',
    textAlign: 'center',
    marginTop: 4,
  },
  iosPicker: {
    width: '100%',
    height: 150,
  },
  androidPickerButton: {
    backgroundColor: '#F7F2EA',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 4,
  },
  androidPickerMain: {
    fontFamily: 'BricolageGrotesque_700Bold',
    fontSize: 20,
    color: '#2A2420',
    textAlign: 'center',
  },
  androidPickerHint: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#6B6058',
    marginTop: 4,
  },
  errorText: {
    fontFamily: 'Figtree_400Regular',
    fontSize: 13,
    color: '#B4472B',
    marginTop: 10,
    lineHeight: 18,
  },
  footer: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#E6DCCD',
  },
});
