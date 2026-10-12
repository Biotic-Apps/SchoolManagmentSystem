import { Injectable, Optional } from '@nestjs/common';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import { EasypaisaGateway } from './easypaisa.gateway';
import { JazzCashGateway } from './jazzcash.gateway';
import { ManualGateway } from './manual.gateway';
import type { PaymentGateway } from './payment-gateway';

/** Gateway adapters by key (`fees.onlineGateway`, callback path). */
@Injectable()
export class PaymentGatewayRegistry {
  private readonly gateways = new Map<string, PaymentGateway>();

  constructor(
    manual: ManualGateway,
    @Optional() jazzcash?: JazzCashGateway,
    @Optional() easypaisa?: EasypaisaGateway,
  ) {
    this.register(manual);
    if (jazzcash) this.register(jazzcash);
    if (easypaisa) this.register(easypaisa);
  }

  register(gateway: PaymentGateway): void {
    if (this.gateways.has(gateway.key)) {
      throw new Error(`Payment gateway ${gateway.key} already registered`);
    }
    this.gateways.set(gateway.key, gateway);
  }

  find(key: string): PaymentGateway | undefined {
    return this.gateways.get(key);
  }

  /** For a configured gateway: unknown keys mean online payment is off. */
  get(key: string): PaymentGateway {
    const gateway = this.find(key);
    if (!gateway) {
      throw new AppError(
        ErrorCode.GATEWAY_DISABLED,
        `Payment gateway ${key} is not available`,
      );
    }
    return gateway;
  }
}
