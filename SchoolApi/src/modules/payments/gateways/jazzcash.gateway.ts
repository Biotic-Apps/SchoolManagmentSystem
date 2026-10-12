import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';
import type { Invoice } from '../../../generated/prisma/client';
import { AppConfigService } from '../../../config/app-config.service';
import { invalid } from '../../../core/common/errors/errors';
import type {
  GatewayCallbackRequest,
  GatewayInitiateResult,
  PaymentGateway,
  VerifiedGatewayPayment,
} from './payment-gateway';

export const JAZZCASH_GATEWAY = 'JAZZCASH';

const SANDBOX_URL = 'https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform';
const PRODUCTION_URL = 'https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform';

/**
 * JazzCash hosted checkout adapter.
 *
 * Flow: the API builds a form-post payload with HMAC integrity hash,
 * returns the redirect URL + payload to the frontend which submits
 * a hidden form. JazzCash posts back to our callback endpoint.
 */
@Injectable()
export class JazzCashGateway implements PaymentGateway {
  readonly key = JAZZCASH_GATEWAY;
  private readonly logger = new Logger(JazzCashGateway.name);

  constructor(private readonly config: AppConfigService) {}

  async initiate(invoice: Invoice): Promise<GatewayInitiateResult> {
    const merchantId = this.env('JAZZCASH_MERCHANT_ID');
    const password = this.env('JAZZCASH_PASSWORD');
    const salt = this.env('JAZZCASH_INTEGRITY_SALT');
    const sandbox = this.envBool('JAZZCASH_SANDBOX');
    const appUrl = this.config.get('APP_URL');
    const returnUrl = `${appUrl}/api/v1/payments/online/callback/jazzcash`;

    const txnRefNo = `INV-${invoice.id.replace(/-/g, '').slice(0, 20)}-${Date.now()}`;
    const amountStr = invoice.totalMinor.toString();
    const now = new Date();
    const txnDateTime = formatJazzCashDate(now);
    const expiryDateTime = formatJazzCashDate(new Date(now.getTime() + 60 * 60 * 1000)); // 1 hour

    const fields: Record<string, string> = {
      pp_Version: '1.1',
      pp_TxnType: 'MWALLET',
      pp_Language: 'EN',
      pp_MerchantID: merchantId,
      pp_SubMerchantID: '',
      pp_Password: password,
      pp_BankID: 'TBANK',
      pp_ProductID: 'RETL',
      pp_TxnRefNo: txnRefNo,
      pp_Amount: amountStr,
      pp_TxnCurrency: invoice.currency || 'PKR',
      pp_TxnDateTime: txnDateTime,
      pp_TxnExpiryDateTime: expiryDateTime,
      pp_BillReference: invoice.invoiceNo,
      pp_Description: `Fee payment for invoice ${invoice.invoiceNo}`,
      pp_ReturnURL: returnUrl,
      ppmpf_1: invoice.id, // custom field: invoiceId
      ppmpf_2: '',
      ppmpf_3: '',
      ppmpf_4: '',
      ppmpf_5: '',
    };

    fields.pp_SecureHash = this.computeHash(fields, salt);
    const baseUrl = sandbox ? SANDBOX_URL : PRODUCTION_URL;

    return { redirectUrl: baseUrl, formData: fields };
  }

  async verifyCallback(
    request: GatewayCallbackRequest,
  ): Promise<VerifiedGatewayPayment | null> {
    const body = request.body as Record<string, string>;
    const salt = this.env('JAZZCASH_INTEGRITY_SALT');

    // Verify HMAC
    const receivedHash = body.pp_SecureHash;
    if (!receivedHash) {
      this.logger.warn('JazzCash callback missing pp_SecureHash');
      return null;
    }

    const computed = this.computeHash(body, salt);
    if (!timingSafeEqual(receivedHash, computed)) {
      this.logger.warn('JazzCash callback HMAC mismatch');
      return null;
    }

    // Check response code: 000 = success
    if (body.pp_ResponseCode !== '000') {
      this.logger.log(
        `JazzCash payment not successful: ${body.pp_ResponseCode} - ${body.pp_ResponseMessage}`,
      );
      return null;
    }

    const invoiceId = body.ppmpf_1;
    if (!invoiceId) {
      this.logger.warn('JazzCash callback missing invoiceId in ppmpf_1');
      return null;
    }

    const amountMinor = BigInt(body.pp_Amount || '0');
    if (amountMinor <= 0n) return null;

    return {
      invoiceId,
      amountMinor,
      reference: body.pp_TxnRefNo || body.pp_RetreivalReferenceNo || '',
    };
  }

  async refund(): Promise<void> {
    throw invalid('JazzCash refunds are processed manually');
  }

  private computeHash(
    fields: Record<string, string>,
    salt: string,
  ): string {
    // JazzCash HMAC: sort field names that start with "pp_", concatenate values with "&", prepend salt
    const sortedKeys = Object.keys(fields)
      .filter((k) => k.startsWith('pp_') || k.startsWith('ppmpf_'))
      .filter((k) => k !== 'pp_SecureHash' && fields[k] !== '')
      .sort();
    const message = salt + '&' + sortedKeys.map((k) => fields[k]).join('&');
    return crypto
      .createHmac('sha256', salt)
      .update(message)
      .digest('hex')
      .toUpperCase();
  }

  private env(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw invalid(`${key} is not configured`);
    }
    return value;
  }

  private envBool(key: string): boolean {
    return process.env[key] === 'true';
  }
}

function formatJazzCashDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const h = String(date.getHours()).padStart(2, '0');
  const mi = String(date.getMinutes()).padStart(2, '0');
  const s = String(date.getSeconds()).padStart(2, '0');
  return `${y}${m}${d}${h}${mi}${s}`;
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(Buffer.from(a), Buffer.from(b));
}
