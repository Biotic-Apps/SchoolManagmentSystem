import { Injectable } from '@nestjs/common';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type {
  GatewayInitiateResult,
  PaymentGateway,
  VerifiedGatewayPayment,
} from './payment-gateway';

export const MANUAL_GATEWAY = 'MANUAL';

const disabled = () =>
  new AppError(
    ErrorCode.GATEWAY_DISABLED,
    'Online payment is not available; pay at the school office or upload a proof',
  );

/** Default adapter: no online payment; money comes in at the counter or by proof. */
@Injectable()
export class ManualGateway implements PaymentGateway {
  readonly key = MANUAL_GATEWAY;

  initiate(): Promise<GatewayInitiateResult> {
    return Promise.reject(disabled());
  }

  verifyCallback(): Promise<VerifiedGatewayPayment | null> {
    return Promise.resolve(null);
  }

  refund(): Promise<void> {
    return Promise.reject(disabled());
  }
}
