import { VerificationData } from '../models/verification.model';
import { WalkerStatus } from '../models/walker.model';

export interface IVerificationRepository {
  getVerificationData(walkerId: string): Promise<VerificationData | null>;
  saveStep(walkerId: string, data: Partial<VerificationData>): Promise<VerificationData>;
  submitForReview(walkerId: string): Promise<WalkerStatus>;
  simulateApproval(walkerId: string): Promise<WalkerStatus>;
}

