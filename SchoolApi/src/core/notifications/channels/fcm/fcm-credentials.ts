import { readFileSync } from 'node:fs';

export interface FcmCredentials {
  projectId: string;
  clientEmail: string;
  privateKey: string;
}

/** Accepts the service-account JSON itself or a path to the file. */
export function parseFcmCredentials(raw: string): FcmCredentials {
  const text = raw.trim().startsWith('{') ? raw : readFileSync(raw, 'utf8');
  const json = JSON.parse(text) as Record<string, string>;
  if (!json.project_id || !json.client_email || !json.private_key) {
    throw new Error('FCM service account JSON is incomplete');
  }
  return {
    projectId: json.project_id,
    clientEmail: json.client_email,
    privateKey: json.private_key,
  };
}
