export type ProductType = 'course' | 'tripwire' | 'subscription' | 'consultation' | 'lead';
export type CanonicalCurrency = 'UAH' | 'USD' | 'EUR';
export type CanonicalStatus = 
  | 'closed_won'
  | 'declined'
  | 'pending'
  | 'new'
  | 'внесена предоплата'
  | 'передплата'
  | 'Клик'
  | 'КликФормы';

export interface MarketingAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_content: string | null;
  utm_term: string | null;
  campaign_id: string | null;
  adset_id: string | null;
  ad_id: string | null;
  fbclid: string | null;
  gclid: string | null;
  fbp: string | null;
  fbc: string | null;
  visitor_uuid: string | null;
  page_path: string | null;
  page_url: string | null;
  ip_address?: string | null;
  user_agent?: string | null;
}

export interface OrderMetadata {
  currency: CanonicalCurrency;
  product_type: ProductType;
  product_name: string;
  payment_system: string;
  [key: string]: any;
}

/**
 * Normalizes phone numbers to standard E.164 (+380XXXXXXXXX for UA or +<country_code><digits>).
 */
export function normalizePhone(rawPhone?: string | null): string | null {
  if (!rawPhone) return null;
  const trimmed = String(rawPhone).trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'none') {
    return null;
  }

  // Strip everything except digits
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;

  // Ukrainian normalization patterns
  if (digits.length === 9) {
    digits = '380' + digits;
  } else if (digits.length === 10 && digits.startsWith('0')) {
    digits = '38' + digits;
  } else if (digits.length === 11 && digits.startsWith('80')) {
    digits = '38' + digits.substring(1);
  }

  return `+${digits}`;
}

/**
 * Normalizes email addresses to trimmed lowercase.
 */
export function normalizeEmail(rawEmail?: string | null): string | null {
  if (!rawEmail) return null;
  const trimmed = String(rawEmail).trim().toLowerCase();
  if (!trimmed || trimmed === '-' || trimmed === 'none' || trimmed === 'null' || !trimmed.includes('@')) {
    return null;
  }
  return trimmed;
}

/**
 * Normalizes Telegram username or ID: removes '@', URLs, whitespace.
 */
export function normalizeTelegram(rawTg?: string | null): string | null {
  if (!rawTg) return null;
  let username = String(rawTg).trim();
  if (!username || username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return null;
  }

  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.replace('t.me/', 'telegram.me/').split('telegram.me/');
      username = parts[parts.length - 1];
    }
  }

  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();

  return username || null;
}

/**
 * Normalizes Instagram handle.
 */
export function normalizeInstagram(rawIg?: string | null): string | null {
  if (!rawIg) return null;
  let username = String(rawIg).trim();
  if (!username || username === '-' || username.toLowerCase() === 'none' || username.toLowerCase() === 'null') {
    return null;
  }

  if (username.startsWith('http://') || username.startsWith('https://')) {
    try {
      const urlObj = new URL(username);
      username = urlObj.pathname.replace(/^\//, '');
    } catch (_) {
      const parts = username.split('instagram.com/');
      username = parts[parts.length - 1];
    }
  }

  username = username.split('/')[0].split('?')[0];
  if (username.startsWith('@')) {
    username = username.substring(1);
  }
  username = username.trim();

  return username || null;
}

/**
 * Normalizes currency to strictly uppercase CanonicalCurrency ('UAH', 'USD', 'EUR').
 * Rejects symbols like '$', '₴', '€' and defaults to 'UAH'.
 */
export function normalizeCurrency(rawCurrency?: string | null): CanonicalCurrency {
  if (!rawCurrency) return 'UAH';
  const clean = String(rawCurrency).toUpperCase().trim();

  if (clean === 'USD' || clean.includes('$') || clean === 'DOLLAR') {
    return 'USD';
  }
  if (clean === 'EUR' || clean.includes('€') || clean === 'EURO') {
    return 'EUR';
  }
  if (clean === 'UAH' || clean.includes('₴') || clean.includes('ГРН')) {
    return 'UAH';
  }

  return 'UAH';
}

/**
 * Normalizes amount to a float number (e.g. 1490.00, 0.00 for free).
 */
export function normalizeAmount(rawAmount?: number | string | null): number {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') {
    return 0.00;
  }
  const parsed = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/,/g, '.').replace(/[^\d.-]/g, ''));
  if (isNaN(parsed) || parsed < 0) {
    return 0.00;
  }
  return Number(parsed.toFixed(2));
}

/**
 * Resolves product_type strictly according to the B&W CRM v2.0 Enrichment Protocol:
 * - "course" (main course, high-ticket packages)
 * - "tripwire" (low-ticket practicum, intensive, masterclass entry)
 * - "subscription" (club, ongoing recurring membership)
 * - "consultation" (diagnostics, personal breakdown / rozbir)
 * - "lead" (free registration, anketa, webinar lead)
 */
export function resolveProductType(opts: {
  productType?: string | null;
  tariffName?: string | null;
  targetSheet?: string | null;
  pagePath?: string | null;
  amount?: number | string | null;
}): ProductType {
  const { productType, tariffName, targetSheet, pagePath, amount } = opts;
  const numAmount = normalizeAmount(amount);

  if (productType) {
    const pt = productType.toLowerCase().trim();
    if (pt === 'course' || pt === 'tripwire' || pt === 'subscription' || pt === 'consultation' || pt === 'lead') {
      return pt as ProductType;
    }
  }

  const path = (pagePath || '').toLowerCase();
  const sheet = (targetSheet || '').toLowerCase();
  const tariff = (tariffName || '').toLowerCase();

  // Free leads
  if (numAmount === 0 && (path.includes('anketa') || path.includes('free-lection') || sheet.includes('анкета') || sheet.includes('vsl') || sheet.includes('старт'))) {
    return 'lead';
  }

  // Consultation
  if (path.includes('rozbir') || sheet.includes('розбір') || sheet.includes('ленд 3') || tariff.includes('розбір') || tariff.includes('діагностика')) {
    return 'consultation';
  }

  // Subscription / Club
  if (tariff.includes('клуб') || tariff.includes('підписк') || tariff.includes('sub') || sheet.includes('клуб')) {
    return 'subscription';
  }

  // Tripwire (under ~100 USD / ~4000 UAH or explicitly practicum / intensive / autoweb low-price)
  if (
    path.includes('intensive') ||
    path.includes('practicum') ||
    sheet.includes('інтенсив') ||
    sheet.includes('практикум') ||
    tariff.includes('інтенсив') ||
    tariff.includes('практикум') ||
    tariff.includes('5 лайків') ||
    (numAmount > 0 && numAmount <= 250 && (path === '/' || sheet === 'автовеб'))
  ) {
    return 'tripwire';
  }

  // Course (high ticket or default paid product)
  if (numAmount > 0) {
    if (path.includes('price') || sheet.includes('бронювання') || tariff.includes('тариф') || tariff.includes('самостійний') || tariff.includes('групов') || tariff.includes('індивідуал') || numAmount >= 500) {
      return 'course';
    }
    return 'tripwire';
  }

  return 'lead';
}

/**
 * Extracts cookie values (_fbp, _fbc) from cookie string or document.cookie.
 */
export function extractCookies(cookieStr?: string): { fbp: string | null; fbc: string | null } {
  if (!cookieStr && typeof document !== 'undefined') {
    cookieStr = document.cookie;
  }
  if (!cookieStr) {
    return { fbp: null, fbc: null };
  }

  let fbp: string | null = null;
  let fbc: string | null = null;

  const cookies = cookieStr.split(';');
  for (const c of cookies) {
    const [name, ...val] = c.trim().split('=');
    const value = val.join('=');
    if (name === '_fbp' && value) fbp = decodeURIComponent(value);
    if (name === '_fbc' && value) fbc = decodeURIComponent(value);
  }

  return { fbp, fbc };
}

/**
 * Extracts and consolidates full marketing attribution from query params, storage, cookies, and location.
 */
export function extractMarketingAttribution(
  source: Record<string, any> | URLSearchParams | null | undefined,
  cookieStr?: string,
  defaultPath?: string,
  defaultUrl?: string
): MarketingAttribution {
  const getParam = (key: string): string | null => {
    if (!source) return null;
    if (source instanceof URLSearchParams) {
      const val = source.get(key);
      return val && val !== '-' && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'none' ? val.trim() : null;
    }
    const val = source[key];
    return val && val !== '-' && val.toLowerCase() !== 'null' && val.toLowerCase() !== 'none' ? String(val).trim() : null;
  };

  const { fbp: extractedFbp, fbc: extractedFbc } = extractCookies(cookieStr);

  const fbclid = getParam('fbclid');
  const gclid = getParam('gclid');
  const fbp = getParam('fbp') || getParam('_fbp') || extractedFbp;
  let fbc = getParam('fbc') || getParam('_fbc') || extractedFbc;

  // Auto-generate fbc if fbclid exists and fbc is not present
  if (!fbc && fbclid) {
    fbc = `fb.1.${Date.now()}.${fbclid}`;
  }

  const rawVisitor = getParam('visitor_uuid') || getParam('visitor_id') || getParam('visitorId');
  const visitor_uuid = rawVisitor && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(rawVisitor)
    ? rawVisitor
    : null;

  return {
    utm_source: getParam('utm_source'),
    utm_medium: getParam('utm_medium'),
    utm_campaign: getParam('utm_campaign'),
    utm_content: getParam('utm_content'),
    utm_term: getParam('utm_term'),
    campaign_id: getParam('campaign_id') || getParam('campaignId') || getParam('ad_campaign_id'),
    adset_id: getParam('adset_id') || getParam('adsetId') || getParam('ad_group_id'),
    ad_id: getParam('ad_id') || getParam('adId') || getParam('creative_id'),
    fbclid,
    gclid,
    fbp,
    fbc,
    visitor_uuid,
    page_path: getParam('page_path') || defaultPath || null,
    page_url: getParam('page_url') || getParam('full_url') || defaultUrl || null
  };
}

/**
 * Client-side helper to get full attribution payload from URL + localStorage + document.cookie.
 */
export function getClientMarketingAttribution(overrides: Partial<MarketingAttribution> = {}): MarketingAttribution {
  if (typeof window === 'undefined') {
    return {
      utm_source: overrides.utm_source || null,
      utm_medium: overrides.utm_medium || null,
      utm_campaign: overrides.utm_campaign || null,
      utm_content: overrides.utm_content || null,
      utm_term: overrides.utm_term || null,
      campaign_id: overrides.campaign_id || null,
      adset_id: overrides.adset_id || null,
      ad_id: overrides.ad_id || null,
      fbclid: overrides.fbclid || null,
      gclid: overrides.gclid || null,
      fbp: overrides.fbp || null,
      fbc: overrides.fbc || null,
      visitor_uuid: overrides.visitor_uuid || null,
      page_path: overrides.page_path || null,
      page_url: overrides.page_url || null
    };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const currentAttr = extractMarketingAttribution(searchParams, document.cookie, window.location.pathname, window.location.href);

  // Fallback to localStorage saved attribution
  let storedAttr: Partial<MarketingAttribution> = {};
  try {
    const raw = localStorage.getItem('last_marketing_attribution') || localStorage.getItem('last_utms');
    if (raw) storedAttr = JSON.parse(raw);
  } catch (_) {}

  const visitorId = localStorage.getItem('visitor_id') || currentAttr.visitor_uuid || crypto.randomUUID();

  return {
    utm_source: overrides.utm_source || currentAttr.utm_source || storedAttr.utm_source || null,
    utm_medium: overrides.utm_medium || currentAttr.utm_medium || storedAttr.utm_medium || null,
    utm_campaign: overrides.utm_campaign || currentAttr.utm_campaign || storedAttr.utm_campaign || null,
    utm_content: overrides.utm_content || currentAttr.utm_content || storedAttr.utm_content || null,
    utm_term: overrides.utm_term || currentAttr.utm_term || storedAttr.utm_term || null,
    campaign_id: overrides.campaign_id || currentAttr.campaign_id || storedAttr.campaign_id || null,
    adset_id: overrides.adset_id || currentAttr.adset_id || storedAttr.adset_id || null,
    ad_id: overrides.ad_id || currentAttr.ad_id || storedAttr.ad_id || null,
    fbclid: overrides.fbclid || currentAttr.fbclid || storedAttr.fbclid || null,
    gclid: overrides.gclid || currentAttr.gclid || storedAttr.gclid || null,
    fbp: overrides.fbp || currentAttr.fbp || storedAttr.fbp || null,
    fbc: overrides.fbc || currentAttr.fbc || storedAttr.fbc || null,
    visitor_uuid: overrides.visitor_uuid || visitorId,
    page_path: overrides.page_path || window.location.pathname,
    page_url: overrides.page_url || window.location.href
  };
}
