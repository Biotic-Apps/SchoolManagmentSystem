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

export const EASYPAISA_GATEWAY = 'EASYPAISA';

const SANDBOX_URL = 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';
const PRODUCTION_URL = 'https://easypay.easypaisa.com.pk/easypay/Index.jsf';

/**
 * Easypaisa hosted checkout adapter.
 *
 * Flow: the API builds a form-post payload with HMAC hash,
 * returns the redirect URL + payload to the frontend which submits
 * a hidden form. Easypaisa posts back to our callback endpoint.
 */
@Injectable()
export class EasypaisaGateway implements PaymentGateway {
  readonly key = EASYPAISA_GATEWAY;
  private readonly logger = new Logger(EasypaisaGateway.name);

  constructor(private readonly config: AppConfigService) {}

  initiate(invoice: Invoice): Promise<GatewayInitiateResult> {
    // Executor throws (e.g. missing config) become rejections.
    return new Promise((resolve) => resolve(this.buildInitiate(invoice)));
  }

  verifyCallback(
    request: GatewayCallbackRequest,
  ): Promise<VerifiedGatewayPayment | null> {
    return new Promise((resolve) => resolve(this.verify(request)));
  }

  refund(): Promise<void> {
    return Promise.reject(invalid('Easypaisa refunds are processed manually'));
  }

  private buildInitiate(invoice: Invoice): GatewayInitiateResult {
    const storeId = this.env('EASYPAISA_STORE_ID');
    const hashKey = this.env('EASYPAISA_HASH_KEY');
    const sandbox = this.envBool('EASYPAISA_SANDBOX');
    const appUrl = this.config.get('APP_URL');
    const returnUrl = `${appUrl}/api/v1/payments/online/callback/easypaisa`;

    const orderId = `INV-${invoice.id.replace(/-/g, '').slice(0, 20)}-${Date.now()}`;
    // Easypaisa expects amount as a decimal string (e.g. "1500.00")
    const amountDecimal = (Number(invoice.totalMinor) / 100).toFixed(2);
    const now = new Date();
    const expiryDate = formatEasypaisaDate(
      new Date(now.getTime() + 60 * 60 * 1000),
    );

    const fields: Record<string, string> = {
      storeId,
      amount: amountDecimal,
      postBackURL: returnUrl,
      orderRefNum: orderId,
      expiryDate,
      merchantHashedReq: '', // computed below
      autoRedirect: '1',
      paymentMethod: 'InitialRedirect_MWALLET',
      emailAddr: '',
      mobileNum: '',
    };

    // Easypaisa hash: SHA-256 HMAC of specific ordered fields
    const hashString = [
      amountDecimal,
      '1', // autoRedirect
      '', // emailAddr
      expiryDate,
      '', // mobileNum
      orderId,
      'InitialRedirect_MWALLET',
      returnUrl,
      storeId,
    ].join('&');

    fields.merchantHashedReq = crypto
      .createHmac('sha256', hashKey)
      .update(hashString)
      .digest('hex')
      .toUpperCase();

    // Store invoiceId in a custom field that the callback carries back
    fields.customField1 = invoice.id;
    fields.customField2 = invoice.invoiceNo;
    // Store the original minor amount for verification
    fields.customField3 = invoice.totalMinor.toString();

    const baseUrl = sandbox ? SANDBOX_URL : PRODUCTION_URL;
    return { redirectUrl: baseUrl, formData: fields };
  }

  private verify(
    request: GatewayCallbackRequest,
  ): VerifiedGatewayPayment | null {
    const body = request.body as Record<string, string>;
    const hashKey = this.env('EASYPAISA_HASH_KEY');

    // Verify the response hash if present
    const responseHash = body.merchantHashedReq || body.hashResp;
    if (responseHash) {
      const hashString = [
        body.amount || '',
        body.orderRefNum || '',
        body.responseCode || '',
        body.storeId || '',
      ].join('&');

      const computed = crypto
        .createHmac('sha256', hashKey)
        .update(hashString)
        .digest('hex')
        .toUpperCase();

      if (!timingSafeEqual(responseHash, computed)) {
        this.logger.warn('Easypaisa callback HMAC mismatch');
        return null;
      }
    }

    // Check response code: 0000 = success
    if (body.responseCode !== '0000') {
      this.logger.log(
        `Easypaisa payment not successful: ${body.responseCode} - ${body.responseDesc}`,
      );
      return null;
    }

    const invoiceId = body.customField1;
    if (!invoiceId) {
      this.logger.warn('Easypaisa callback missing invoiceId in customField1');
      return null;
    }

    // Restore amount to minor units (Easypaisa returns decimal)
    const amountDecimal = parseFloat(body.amount || '0');
    const amountMinor = BigInt(Math.round(amountDecimal * 100));
    if (amountMinor <= 0n) return null;

    return {
      invoiceId,
      amountMinor,
      reference:
        body.transactionId ||
        body.transactionRefNumber ||
        body.orderRefNum ||
        '',
    };
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

function formatEasypaisaDate(date: Date): string {
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
