import type {
  Owner,
  Pet,
  Walker,
  OwnerDocument,
  WalkerDocument,
  WalkRequestDocument,
  VerificationDocument,
  WalkRequest,
  VerificationData,
} from '@patacerca/core';
import { sanitizeRemotePhotoUrl } from '@patacerca/core';
import { omitUndefinedDeep } from './firestore-payload';

const now = () => Date.now();

export function ownerToDocument(owner: Owner): OwnerDocument {
  const ts = now();
  return omitUndefinedDeep({
    phone: owner.phone,
    email: owner.email,
    photoUrl: sanitizeRemotePhotoUrl(owner.photoUrl),
    name: owner.name,
    zone: owner.zone,
    dogName: owner.dogName,
    dogSize: owner.dogSize,
    pets: (owner.pets || []).map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      breed: p.breed,
      photoUrl: sanitizeRemotePhotoUrl(p.photoUrl),
    })),
    createdAt: owner.createdAt || ts,
    updatedAt: ts,
  });
}

export function documentToOwner(doc: OwnerDocument): Owner {
  return {
    phone: doc.phone,
    email: doc.email,
    photoUrl: doc.photoUrl,
    name: doc.name,
    zone: doc.zone,
    dogName: doc.dogName,
    dogSize: doc.dogSize,
    pets: doc.pets.map((p): Pet => ({
      id: p.id,
      name: p.name,
      size: p.size,
      breed: p.breed,
      photoUrl: p.photoUrl,
    })),
    createdAt: doc.createdAt,
  };
}

export function walkerToDocument(walker: Walker): WalkerDocument {
  const ts = now();
  return omitUndefinedDeep({
    ...walker,
    photoUrl: sanitizeRemotePhotoUrl(walker.photoUrl),
    createdAt: ts,
    updatedAt: ts,
  });
}

export function documentToWalker(doc: WalkerDocument): Walker {
  return { ...doc };
}

export function walkRequestToDocument(req: WalkRequest): WalkRequestDocument {
  const ts = req.updatedAt ?? req.createdAt;
  return omitUndefinedDeep({
    ...req,
    createdAt: req.createdAt,
    updatedAt: ts,
  });
}

export function documentToWalkRequest(doc: WalkRequestDocument): WalkRequest {
  return {
    id: doc.id,
    ownerPhone: doc.ownerPhone,
    ownerName: doc.ownerName,
    ownerZone: doc.ownerZone,
    dogName: doc.dogName,
    dogSize: doc.dogSize,
    walkerId: doc.walkerId,
    walkerName: doc.walkerName,
    durationMinutes: doc.durationMinutes,
    dayText: doc.dayText,
    timeText: doc.timeText,
    note: doc.note,
    price: doc.price,
    status: doc.status as WalkRequest['status'],
    rating: doc.rating,
    ratingComment: doc.ratingComment,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export function verificationToDocument(
  walkerId: string,
  data: VerificationData
): VerificationDocument {
  const ts = now();
  return omitUndefinedDeep({
    walkerId,
    ...data,
    idFrontPhoto: sanitizeRemotePhotoUrl(data.idFrontPhoto),
    idBackPhoto: sanitizeRemotePhotoUrl(data.idBackPhoto),
    selfiePhoto: sanitizeRemotePhotoUrl(data.selfiePhoto),
    policeRecordPhoto: sanitizeRemotePhotoUrl(data.policeRecordPhoto),
    createdAt: ts,
    updatedAt: ts,
  });
}

export function documentToVerification(doc: VerificationDocument): VerificationData {
  return {
    nationalIdNumber: doc.nationalIdNumber,
    idFrontUploaded: doc.idFrontUploaded,
    idBackUploaded: doc.idBackUploaded,
    selfieUploaded: doc.selfieUploaded,
    policeRecordUploaded: doc.policeRecordUploaded,
    ref1Name: doc.ref1Name,
    ref1Phone: doc.ref1Phone,
    ref2Name: doc.ref2Name,
    ref2Phone: doc.ref2Phone,
    interviewSlot: doc.interviewSlot,
    idFrontPhoto: doc.idFrontPhoto,
    idBackPhoto: doc.idBackPhoto,
    selfiePhoto: doc.selfiePhoto,
    policeRecordPhoto: doc.policeRecordPhoto,
  };
}
