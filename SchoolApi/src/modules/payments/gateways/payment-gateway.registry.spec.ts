import type { Invoice, Payment } from '../../../generated/prisma/client';
import { AppError } from '../../../core/common/errors/app-error';
import { ErrorCode } from '../../../core/common/errors/error-code.enum';
import type { EasypaisaGateway } from './easypaisa.gateway';
import type { JazzCashGateway } from './jazzcash.gateway';
import { MANUAL_GATEWAY, ManualGateway } from './manual.gateway';
import type { PaymentGateway } from './payment-gateway';
import { PaymentGatewayRegistry } from './payment-gateway.registry';

const fake = (key: string): PaymentGateway => ({
  key,
  initiate: () => Promise.resolve({ redirectUrl: 'https://pay.example' }),
  verifyCallback: () => Promise.resolve(null),
  refund: () => Promise.resolve(),
});

describe('PaymentGatewayRegistry', () => {
  it('has the manual gateway by default', () => {
    const registry = new PaymentGatewayRegistry(new ManualGateway());
    expect(registry.find(MANUAL_GATEWAY)).toBeInstanceOf(ManualGateway);
  });

  it('finds registered adapters and refuses duplicates', () => {
    const registry = new PaymentGatewayRegistry(new ManualGateway());
    registry.register(fake('TEST'));
    expect(registry.find('TEST')?.key).toBe('TEST');
    expect(() => registry.register(fake('TEST'))).toThrow(/already/);
  });

  it('reports unknown gateways as disabled', () => {
    const registry = new PaymentGatewayRegistry(new ManualGateway());
    expect(registry.find('JAZZCASH')).toBeUndefined();
    expect(() => registry.get('JAZZCASH')).toThrow(AppError);
  });

  it('registers optional gateways when provided', () => {
    const jc = fake('JAZZCASH');
    const ep = fake('EASYPAISA');
    const registry = new PaymentGatewayRegistry(
      new ManualGateway(),
      jc as unknown as JazzCashGateway,
      ep as unknown as EasypaisaGateway,
    );
    expect(registry.find('JAZZCASH')?.key).toBe('JAZZCASH');
    expect(registry.find('EASYPAISA')?.key).toBe('EASYPAISA');
  });
});

describe('ManualGateway', () => {
  const gateway: PaymentGateway = new ManualGateway();

  it('refuses to start an online payment with GATEWAY_DISABLED', async () => {
    await expect(gateway.initiate({} as Invoice)).rejects.toMatchObject({
      code: ErrorCode.GATEWAY_DISABLED,
    });
  });

  it('never accepts a callback', async () => {
    await expect(
      gateway.verifyCallback({ headers: {}, body: {}, query: {} }),
    ).resolves.toBeNull();
  });

  it('cannot refund online', async () => {
    await expect(gateway.refund({} as Payment, 100n)).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
