import { ErrorCode } from './error-code.enum';

interface PrismaKnownError extends Error {
  code: string;
}

interface MappedError {
  code: ErrorCode;
  message: string;
}

const PRISMA_CODES: Record<string, MappedError> = {
  P2002: { code: ErrorCode.CONFLICT, message: 'Record already exists' },
  P2003: { code: ErrorCode.CONFLICT, message: 'Related record constraint' },
  P2025: { code: ErrorCode.NOT_FOUND, message: 'Record not found' },
};

export function isPrismaKnownError(error: unknown): error is PrismaKnownError {
  return (
    error instanceof Error &&
    error.name === 'PrismaClientKnownRequestError' &&
    typeof (error as Partial<PrismaKnownError>).code === 'string'
  );
}

export function mapPrismaError(
  error: PrismaKnownError,
): MappedError | undefined {
  return PRISMA_CODES[error.code];
}
