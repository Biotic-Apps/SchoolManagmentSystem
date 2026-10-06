import type { CertificateType } from '../../generated/prisma/client';

export interface CertificateContent {
  type: CertificateType;
  studentName: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  guardianName: string | null;
  admissionNo: string;
  className: string | null;
  sessionName: string | null;
  admissionDate: string;
  leavingDate: string | null;
  purpose: string | null;
  achievement: string | null;
  attendance: { present: number; total: number } | null;
}

export const CERTIFICATE_TITLES: Record<CertificateType, string> = {
  SCHOOL_LEAVING: 'School Leaving Certificate',
  TRANSFER: 'Transfer Certificate',
  CHARACTER: 'Character Certificate',
  ATTENDANCE: 'Attendance Certificate',
  ACHIEVEMENT: 'Certificate of Achievement',
};

const pronoun = (gender: CertificateContent['gender']) =>
  gender === 'MALE' ? 'He' : gender === 'FEMALE' ? 'She' : 'They';

const relation = (gender: CertificateContent['gender']) =>
  gender === 'MALE'
    ? 'son of'
    : gender === 'FEMALE'
      ? 'daughter of'
      : 'child of';

/** Body paragraphs of a certificate (plain text, rendered by the PDF builder). */
export function certificateBody(c: CertificateContent): string[] {
  const who = c.guardianName
    ? `${c.studentName}, ${relation(c.gender)} ${c.guardianName}`
    : c.studentName;
  const intro = `This is to certify that ${who}, admission no. ${c.admissionNo},`;
  const he = pronoun(c.gender);
  const klass = c.className ?? 'the school';
  const lines: string[] = [];
  switch (c.type) {
    case 'SCHOOL_LEAVING':
      lines.push(
        `${intro} was a bonafide student of this school from ${c.admissionDate} to ${c.leavingDate ?? '-'}, last studying in ${klass}.`,
        `${he} has cleared all dues and returned all school property. Conduct during the stay was good.`,
      );
      break;
    case 'TRANSFER':
      lines.push(
        `${intro} has been a student of this school since ${c.admissionDate} and is studying in ${klass}.`,
        `${he} has cleared all dues and is allowed to transfer to another institution.`,
      );
      break;
    case 'CHARACTER':
      lines.push(
        `${intro} has been a student of this school since ${c.admissionDate}, studying in ${klass}.`,
        `To the best of our knowledge ${he.toLowerCase()} bears a good moral character.`,
      );
      break;
    case 'ATTENDANCE': {
      const a = c.attendance;
      const rate =
        a && a.total > 0
          ? ` (${Math.round((a.present * 1000) / a.total) / 10}%)`
          : '';
      lines.push(
        `${intro} studying in ${klass}${c.sessionName ? ` during session ${c.sessionName}` : ''},`,
        a
          ? `attended ${a.present} out of ${a.total} marked school days${rate}.`
          : 'has no attendance marked for the current session.',
      );
      break;
    }
    case 'ACHIEVEMENT':
      lines.push(
        `${intro} studying in ${klass}, is awarded this certificate in recognition of:`,
        c.achievement ?? '-',
      );
      break;
  }
  if (c.purpose) lines.push(`Issued for: ${c.purpose}.`);
  return lines;
}
