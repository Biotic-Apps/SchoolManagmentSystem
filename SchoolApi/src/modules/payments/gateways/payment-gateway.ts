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
export interface PaymentGateway {
  readonly key: string;
  initiate(invoice: Invoice): Promise<{ redirectUrl: string }>;
  /** `null` when the callback is not authentic or not a success. */
  verifyCallback(
    request: GatewayCallbackRequest,
  ): Promise<VerifiedGatewayPayment | null>;
  refund(payment: Payment, amountMinor: bigint): Promise<void>;
}
