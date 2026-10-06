import { conflict } from '../../core/common/errors/errors';

/** Maps a unique violation (P2002) to CONFLICT with a domain message. */
export function onDuplicate(message: string) {
  return (error: unknown): never => {
    if ((error as { code?: string }).code === 'P2002') throw conflict(message);
    throw error;
  };
}

export const isDuplicate = (error: unknown): boolean =>
  (error as { code?: string }).code === 'P2002';
