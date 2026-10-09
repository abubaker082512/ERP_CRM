import crypto from 'crypto';

/**
 * DirectPay API Helper for Beraxis ERP
 * Gateway Reference: DirectPay Payment Landing Page API (Payin PWA) v1.0
 */

export interface DirectPayInitiateParams {
  clientId?: string;
  clientSecret?: string;
  clientTransactionId: string;
  amountInPKR: number;
  description?: string;
  payerName?: string;
  email?: string;
  msisdn?: string;
  currency?: string;
  successRedirectUrl?: string;
  failedRedirectUrl?: string;
  baseUrl?: string;
}

export interface DirectPayInquiryResult {
  success: boolean;
  client_transaction_id: string;
  gateway_transaction_id?: string;
  status: 'completed' | 'pending' | 'failed' | 'unknown';
  amountInPKR?: number;
  currency?: string;
  raw?: any;
  error?: string;
}

export const DIRECTPAY_DEFAULT_CLIENT_ID = process.env.DIRECTPAY_CLIENT_ID || 'pwa_ci_k1qlq54hv4gw5pr0khux';
export const DIRECTPAY_DEFAULT_CLIENT_SECRET = process.env.DIRECTPAY_CLIENT_SECRET || 'pwa_secret_zp5rai8z02zr3o5sebm1co6uxci58uca';
export const DIRECTPAY_DEFAULT_BASE_URL = process.env.DIRECTPAY_BASE_URL || 'https://payin-pwa.directpay.pro/pay';
export const DIRECTPAY_DEFAULT_STATUS_URL = process.env.DIRECTPAY_STATUS_URL || 'https://payin-pwa.directpay.pro/pay/status';

/**
 * Generates HMAC-SHA256 checksum for DirectPay PWA validation
 */
export function generateDirectPayChecksum(
  clientTransactionId: string,
  description: string,
  amountInPaisas: string,
  clientSecret: string = DIRECTPAY_DEFAULT_CLIENT_SECRET
): string {
  const plainText = `DirectPay:${clientTransactionId}:${description}:${amountInPaisas}`;
  return crypto
    .createHmac('sha256', clientSecret)
    .update(plainText)
    .digest('hex');
}

/**
 * Normalizes Pakistani mobile number format into 03xxxxxxxxx (11 digits)
 */
export function normalizeDirectPayPhone(phone: string): string {
  let clean = (phone || '').replace(/[^0-9]/g, '');
  if (clean.startsWith('92')) {
    clean = '0' + clean.substring(2);
  } else if (clean.length === 10 && clean.startsWith('3')) {
    clean = '0' + clean;
  }
  if (!/^03\d{9}$/.test(clean)) {
    if (clean.length >= 11) {
      clean = '03' + clean.slice(-9);
    } else {
      clean = '03001234567';
    }
  }
  return clean;
}

/**
 * Builds the secure DirectPay PWA checkout URL
 */
export function buildDirectPayUrl({
  clientId = DIRECTPAY_DEFAULT_CLIENT_ID,
  clientSecret = DIRECTPAY_DEFAULT_CLIENT_SECRET,
  clientTransactionId,
  amountInPKR,
  description = 'Beraxis Enterprise ERP Subscription',
  payerName = 'Beraxis Customer',
  email = 'billing@beraxis.online',
  msisdn = '03001234567',
  currency = 'PKR',
  successRedirectUrl,
  failedRedirectUrl,
  baseUrl = DIRECTPAY_DEFAULT_BASE_URL
}: DirectPayInitiateParams): string {
  const cleanPhone = normalizeDirectPayPhone(msisdn);

  // Convert PKR to paisas (1 PKR = 100 Paisas)
  const amountInPaisas = Math.round(Number(amountInPKR) * 100).toString();
  const paisasNum = parseInt(amountInPaisas, 10);

  // Validate limits (1,000 to 5,000,000 paisas -> 10.00 to 50,000.00 PKR)
  if (isNaN(paisasNum) || paisasNum < 1000 || paisasNum > 5000000) {
    throw new Error('DirectPay amount must be between 10.00 and 50,000.00 PKR');
  }

  const cleanDescription = (description || 'Beraxis Enterprise Service').substring(0, 500);

  // Generate cryptographic checksum
  const checksum = generateDirectPayChecksum(
    clientTransactionId,
    cleanDescription,
    amountInPaisas,
    clientSecret
  );

  const url = new URL(baseUrl);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('client_transaction_id', clientTransactionId);
  url.searchParams.set('amount', amountInPaisas);
  url.searchParams.set('description', cleanDescription);
  url.searchParams.set('payer_name', (payerName || 'Beraxis Customer').trim());
  url.searchParams.set('email', (email || 'billing@beraxis.online').trim());
  url.searchParams.set('msisdn', cleanPhone);
  url.searchParams.set('checksum', checksum);
  url.searchParams.set('currency', currency);

  if (successRedirectUrl) {
    url.searchParams.set('success_redirect_url', successRedirectUrl);
  }
  if (failedRedirectUrl) {
    url.searchParams.set('failed_redirect_url', failedRedirectUrl);
  }

  return url.toString();
}

/**
 * Queries the DirectPay status endpoint to check real-time settlement
 */
export async function inquireDirectPayTransaction(
  clientTransactionId: string,
  clientId: string = DIRECTPAY_DEFAULT_CLIENT_ID
): Promise<DirectPayInquiryResult> {
  try {
    const url = `${DIRECTPAY_DEFAULT_STATUS_URL}?client_id=${clientId}&client_transaction_id=${encodeURIComponent(clientTransactionId)}`;
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      cache: 'no-store'
    });

    if (!res.ok) {
      return {
        success: false,
        client_transaction_id: clientTransactionId,
        status: 'unknown',
        error: `HTTP error ${res.status}: ${res.statusText}`
      };
    }

    const data = await res.json();
    const gwStatus = (data.status || '').toLowerCase();
    
    let normalizedStatus: 'completed' | 'pending' | 'failed' | 'unknown' = 'pending';
    if (['completed', 'success', 'paid', '0000'].includes(gwStatus)) {
      normalizedStatus = 'completed';
    } else if (['failed', 'cancelled', 'declined', 'expired'].includes(gwStatus)) {
      normalizedStatus = 'failed';
    }

    return {
      success: true,
      client_transaction_id: clientTransactionId,
      gateway_transaction_id: data.gateway_transaction_id || data.dp_txn_id || data.transaction_id || data.reference_id,
      status: normalizedStatus,
      amountInPKR: data.amount ? parseFloat(data.amount) / 100 : undefined,
      currency: data.currency || 'PKR',
      raw: data
    };
  } catch (err: any) {
    return {
      success: false,
      client_transaction_id: clientTransactionId,
      status: 'unknown',
      error: err.message || 'DirectPay inquiry request failed'
    };
  }
}
