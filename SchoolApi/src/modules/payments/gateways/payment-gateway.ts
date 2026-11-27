import type { Invoice, Payment } from '../../../generated/prisma/client';

export interface GatewayCallbackRequest {
  headers: Record<string, string | string[] | undefined>;
  body: unknown;
  query: Record<string, unknown>;
}

export interface VerifiedGatewayPayment {
  invoiceId: string;
  amountMinor: bigint;
  /** The gateway's transaction id; payments are idempotent on it. */
  reference: string;
}

/**
 * Online payment adapter (contract B3). A real adapter must verify the
 * callback signature itself; only then is a payment recorded.
 */
export interface GatewayInitiateResult {
  redirectUrl: string;
  /** When present the frontend submits a hidden form instead of a plain redirect. */
  formData?: Record<string, string>;
}

export interface PaymentGateway {
  readonly key: string;
  /** `amountMinor`: what the parent pays now, i.e. the invoice's open balance (never the full total). */
  initiate(
    invoice: Invoice,
    amountMinor: bigint,
  ): Promise<GatewayInitiateResult>;
  /** `null` when the callback is not authentic or not a success. */
  verifyCallback(
    request: GatewayCallbackRequest,
  ): Promise<VerifiedGatewayPayment | null>;
  refund(payment: Payment, amountMinor: bigint): Promise<void>;
}
