import {
  IVerificationRepository,
  VerificationData,
  WalkerStatus,
  isStep1Complete,
  isStep2Complete,
  isStep3Complete,
  isStep4Complete,
} from '@patacerca/core';
import { mockStorage } from '../storage/mock-storage';

export class MockVerificationRepository implements IVerificationRepository {
  private getStorageKey(walkerId: string): string {
    return `@patacerca:verification:${walkerId}`;
  }

  async getVerificationData(walkerId: string): Promise<VerificationData | null> {
    return mockStorage.getItem<VerificationData | null>(
      this.getStorageKey(walkerId),
      null
    );
  }

  async saveStep(
    walkerId: string,
    data: Partial<VerificationData>
  ): Promise<VerificationData> {
    const key = this.getStorageKey(walkerId);
    const existing = await mockStorage.getItem<VerificationData>(key, {
      nationalIdNumber: '',
      idFrontUploaded: false,
      idBackUploaded: false,
      selfieUploaded: false,
      policeRecordUploaded: false,
      ref1Name: '',
      ref1Phone: '',
      ref2Name: '',
      ref2Phone: '',
      interviewSlot: '',
    });

    const updated: VerificationData = {
      ...existing,
      ...data,
    };
    await mockStorage.setItem(key, updated);
    return updated;
  }

  async submitForReview(walkerId: string): Promise<WalkerStatus> {
    const data = await this.getVerificationData(walkerId);
    const allDone =
      isStep1Complete(data || undefined) &&
      isStep2Complete(data || undefined) &&
      isStep3Complete(data || undefined) &&
      isStep4Complete(data || undefined);

    if (!allDone) {
      throw new Error('Incomplete verification');
    }

    await mockStorage.setItem(`@patacerca:walker_status:${walkerId}`, 'in_review');
    return 'in_review';
  }

  async simulateApproval(walkerId: string): Promise<WalkerStatus> {
    await mockStorage.setItem(`@patacerca:walker_status:${walkerId}`, 'approved');
    return 'approved';
  }
}

