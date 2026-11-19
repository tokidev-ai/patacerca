export interface VerificationData {
  nationalIdNumber: string;
  idFrontUploaded: boolean;
  idBackUploaded: boolean;
  selfieUploaded: boolean;
  policeRecordUploaded: boolean;
  ref1Name: string;
  ref1Phone: string;
  ref2Name: string;
  ref2Phone: string;
  interviewSlot: string;
  /**
   * Fotos de verificación: al guardar se pasa la URI local; el repositorio Firebase
   * las sube a Storage y devuelve/persiste la URL https.
   */
  idFrontPhoto?: string;
  idBackPhoto?: string;
  selfiePhoto?: string;
  policeRecordPhoto?: string;
}

export interface VerificationStepState {
  step: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  isCompleted: boolean;
}
