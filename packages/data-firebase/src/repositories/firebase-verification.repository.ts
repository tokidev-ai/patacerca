import { doc, getDoc, setDoc } from 'firebase/firestore';
import {
  FS_COLLECTIONS,
  type IVerificationRepository,
  type VerificationData,
  type WalkerStatus,
  isStep1Complete,
  isStep2Complete,
  isStep3Complete,
  isStep4Complete,
} from '@patacerca/core';
import { getFirestoreDb } from '../firebase/app';
import { ensureRemoteImage } from '../firebase/storage';
import { documentToVerification, verificationToDocument } from '../firebase/mappers';
import { FirebaseWalkersRepository } from './firebase-walkers.repository';

const PHOTO_FIELDS = [
  ['idFrontPhoto', 'idFront'],
  ['idBackPhoto', 'idBack'],
  ['selfiePhoto', 'selfie'],
  ['policeRecordPhoto', 'policeRecord'],
] as const;

const emptyVerification = (): VerificationData => ({
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

export class FirebaseVerificationRepository implements IVerificationRepository {
  private walkersRepo = new FirebaseWalkersRepository();

  async getVerificationData(walkerId: string): Promise<VerificationData | null> {
    const snap = await getDoc(
      doc(getFirestoreDb(), FS_COLLECTIONS.verifications, walkerId)
    );
    if (!snap.exists()) return null;
    return documentToVerification(
      snap.data() as Parameters<typeof documentToVerification>[0]
    );
  }

  async saveStep(
    walkerId: string,
    data: Partial<VerificationData>
  ): Promise<VerificationData> {
    const ref = doc(getFirestoreDb(), FS_COLLECTIONS.verifications, walkerId);
    const existingSnap = await getDoc(ref);
    const existing = existingSnap.exists()
      ? documentToVerification(
          existingSnap.data() as Parameters<typeof documentToVerification>[0]
        )
      : emptyVerification();

    const updated: VerificationData = { ...existing, ...data };
    // Fotos locales -> Storage (verifications/{walkerId}/…); se guarda la URL https.
    for (const [field, name] of PHOTO_FIELDS) {
      const uri = data[field];
      if (uri) {
        updated[field] = await ensureRemoteImage(
          uri,
          `verifications/${walkerId}/${name}`
        );
      }
    }
    const payload = verificationToDocument(walkerId, updated);
    if (existingSnap.exists()) {
      const prev = existingSnap.data() as { createdAt?: number };
      payload.createdAt = prev.createdAt ?? payload.createdAt;
    }
    await setDoc(ref, payload, { merge: true });
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

    await this.walkersRepo.updateWalkerProfile(walkerId, { status: 'in_review' });
    return 'in_review';
  }

  async simulateApproval(walkerId: string): Promise<WalkerStatus> {
    await this.walkersRepo.updateWalkerProfile(walkerId, { status: 'approved' });
    return 'approved';
  }
}
