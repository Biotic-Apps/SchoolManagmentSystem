import { EMPTY_VALUE } from "@/lib/format";
import type { Certificate } from "./types";

export function serialOf(certificate: Certificate): string {
  return certificate.serial ?? certificate.serialNo ?? EMPTY_VALUE;
}

export function studentNameOf(certificate: Certificate): string {
  return certificate.student?.name ?? certificate.studentName ?? EMPTY_VALUE;
}

export function requestedOn(certificate: Certificate): string | null {
  return certificate.requestedAt ?? certificate.createdAt ?? null;
}

export function issuedOn(certificate: Certificate): string | null {
  return certificate.issuedAt ?? certificate.issuedOn ?? null;
}

export function isDuplicate(certificate: Certificate): boolean {
  return !!certificate.duplicate || !!certificate.isDuplicate || (certificate.reissueCount ?? 0) > 0;
}
