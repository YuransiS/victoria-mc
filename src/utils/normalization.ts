export type CanonicalCurrency = 'UAH' | 'USD' | 'EUR';

export type CanonicalProductType = 'course' | 'tripwire' | 'subscription' | 'consultation' | 'lead';

export type CanonicalPaymentStatus = 
  | 'closed_won' 
  | 'paid' 
  | 'approved' 
  | 'оплачено' 
  | 'внесена предоплата' 
  | 'передплата' 
  | 'new' 
  | 'pending' 
  | 'declined' 
  | 'failed' 
  | 'Клик' 
  | 'КликФормы';

export interface MarketingAttribution {
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_content?: string | null;
  utm_term?: string | null;
  campaign_id?: string | null;
  adset_id?: string | null;
  ad_id?: string | null;
  fbclid?: string | null;
  gclid?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  visitor_uuid?: string | null;
  page_path?: string | null;
  page_url?: string | null;
}

/**
 * Normalizes phone number into standard international format (+380XXXXXXXXX for UA or +<country><digits>).
 * Strips all spaces, brackets, hyphens, and non-digit characters.
 */
export function normalizePhone(rawPhone?: string | null): string {
  if (!rawPhone) return '';
  let digits = rawPhone.toString().replace(/\D/g, '');
  if (!digits) return '';

  // Ukraine specific normalization
  if (digits.length === 10 && digits.startsWith('0')) {
    return `+38${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('80')) {
    return `+3${digits}`;
  }
  if (digits.length === 12 && digits.startsWith('380')) {
    return `+${digits}`;
  }
  if (digits.length === 9) {
    return `+380${digits}`;
  }

  // General international format with leading plus
  return `+${digits}`;
}

/**
 * Normalizes email address by trimming and converting to lowercase.
 */
export function normalizeEmail(rawEmail?: string | null): string {
  if (!rawEmail) return '';
  return rawEmail.toString().trim().toLowerCase();
}

/**
 * Normalizes telegram handle by stripping '@' prefix, spaces, and leading/trailing whitespace.
 */
export function normalizeTelegram(rawTelegram?: string | null): string {
  if (!rawTelegram) return '';
  return rawTelegram.toString().replace(/^@+/, '').trim().toLowerCase();
}

/**
 * Normalizes currency to strictly UPPERCASE standard: 'UAH', 'USD', or 'EUR'.
 */
export function normalizeCurrency(rawCurrency?: string | null): CanonicalCurrency {
  if (!rawCurrency) return 'UAH';
  const c = rawCurrency.toString().trim().toUpperCase();

  if (c === '$' || c === 'USD' || c.includes('DOLLAR')) return 'USD';
  if (c === '€' || c === 'EUR' || c.includes('EURO')) return 'EUR';
  if (c === '₴' || c === 'UAH' || c === 'ГРН' || c.includes('ГРИВ')) return 'UAH';

  if (['USD', 'EUR', 'UAH'].includes(c)) {
    return c as CanonicalCurrency;
  }
  return 'UAH';
}

/**
 * Normalizes amount to a float number rounded to 2 decimal places.
 * For free/lead registrations, returns 0.00.
 */
export function normalizeAmount(rawAmount?: number | string | null): number {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') return 0.00;
  const num = typeof rawAmount === 'number' ? rawAmount : parseFloat(rawAmount.toString().replace(',', '.'));
  if (isNaN(num) || num < 0) return 0.00;
  return Math.round(num * 100) / 100;
}

/**
 * Normalizes product type to canonical taxonomy.
 */
export function normalizeProductType(rawType?: string | null): CanonicalProductType {
  if (!rawType) return 'tripwire';
  const t = rawType.toString().trim().toLowerCase();

  if (t === 'lead' || t.includes('безкоштовн') || t.includes('вебінар') || t.includes('вебинар') || t === 'free') {
    return 'lead';
  }
  if (t === 'consultation' || t.includes('діагностик') || t.includes('диагностик') || t.includes('аудит')) {
    return 'consultation';
  }
  if (t === 'subscription' || t.includes('клуб') || t.includes('підписк') || t.includes('подписк')) {
    return 'subscription';
  }
  if (t === 'course' || t.includes('курс') || t.includes('основн') || t.includes('vip') || t.includes('pro')) {
    return 'course';
  }
  if (t === 'tripwire' || t.includes('практикум') || t.includes('інтенсив') || t.includes('интенсив')) {
    return 'tripwire';
  }

  return 'tripwire';
}

/**
 * Reads cookie value by name in browser context.
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

/**
 * Retrieves or generates visitor UUID from localStorage/cookies.
 */
export function getClientVisitorUUID(): string {
  if (typeof window === 'undefined') return '';
  let vid = localStorage.getItem('visitor_id');
  if (!vid) {
    vid = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `vid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('visitor_id', vid);
  }
  return vid;
}

/**
 * Collects complete client-side marketing attribution data.
 */
export function collectClientMarketingAttribution(customPath?: string): MarketingAttribution {
  if (typeof window === 'undefined') return {};

  const urlParams = new URLSearchParams(window.location.search);
  const storedLastUtmsRaw = localStorage.getItem('last_utms');
  const storedLastUtms = storedLastUtmsRaw ? JSON.parse(storedLastUtmsRaw) : {};

  const utm_source = urlParams.get('utm_source') || storedLastUtms.utm_source || null;
  const utm_medium = urlParams.get('utm_medium') || storedLastUtms.utm_medium || null;
  const utm_campaign = urlParams.get('utm_campaign') || storedLastUtms.utm_campaign || null;
  const utm_content = urlParams.get('utm_content') || storedLastUtms.utm_content || null;
  const utm_term = urlParams.get('utm_term') || storedLastUtms.utm_term || null;

  const campaign_id = urlParams.get('campaign_id') || storedLastUtms.campaign_id || null;
  const adset_id = urlParams.get('adset_id') || storedLastUtms.adset_id || null;
  const ad_id = urlParams.get('ad_id') || storedLastUtms.ad_id || null;

  const fbclid = urlParams.get('fbclid') || storedLastUtms.fbclid || null;
  const gclid = urlParams.get('gclid') || storedLastUtms.gclid || null;

  const fbp = getCookie('_fbp') || storedLastUtms.fbp || null;
  const fbc = getCookie('_fbc') || storedLastUtms.fbc || null;

  const visitor_uuid = getClientVisitorUUID();
  const page_path = customPath || window.location.pathname;
  const page_url = window.location.href;

  return {
    utm_source,
    utm_medium,
    utm_campaign,
    utm_content,
    utm_term,
    campaign_id,
    adset_id,
    ad_id,
    fbclid,
    gclid,
    fbp,
    fbc,
    visitor_uuid,
    page_path,
    page_url
  };
}
