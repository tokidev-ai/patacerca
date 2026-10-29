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
}

export interface VerificationStepState {
  step: 1 | 2 | 3 | 4;
  title: string;
  description: string;
  isCompleted: boolean;
}

