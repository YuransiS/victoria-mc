import crypto from 'crypto';
import { supabaseAdmin } from '@/lib/supabase';
import { normalizePhone, normalizeCurrency, normalizeAmount, resolveProductType } from '@/lib/enrichment';

export interface WfpTransaction {
  orderReference: string;
  merchantAccount?: string;
  createdDate: string | number;
  amount: string | number;
  currency: string;
  baseAmount?: string | number;
  baseCurrency?: string;
  transactionStatus: string;
  processingDate?: string | number;
  reasonCode?: string | number;
  reason?: string;
  email?: string;
  phone?: string;
  paymentSystem?: string;
  cardPan?: string;
  cardType?: string;
  issuerBankCountry?: string;
  issuerBankName?: string;
  fee?: string | number;
  [key: string]: any;
}

export interface SyncOptions {
  daysBack?: number;
  startDate?: string | Date;
  endDate?: string | Date;
  dryRun?: boolean;
}

export interface SyncResult {
  success: boolean;
  period: {
    start: string;
    end: string;
  };
  totalFetched: number;
  approvedCount: number;
  declinedCount: number;
  expiredCount: number;
  updatedInDb: number;
  createdInDb: number;
  skippedTestCount: number;
  alreadyUpToDate: number;
  errors: string[];
  durationMs: number;
  chunksProcessed: number;
}

/**
 * Resolves WayForPay merchant credentials from environment variables.
 */
export function getWfpCredentials() {
  const merchantAccount = (
    process.env.WFP_MERCHANT_LOGIN ||
    process.env.WAYFORPAY_MERCHANT_ACCOUNT ||
    process.env.WFP_MERCHANT_ACCOUNT ||
    ''
  ).replace(/['"]/g, '').trim();

  const secretKey = (
    process.env.WFP_SECRET_KEY ||
    process.env.WAYFORPAY_SECRET_KEY ||
    ''
  ).replace(/['"]/g, '').trim();

  return { merchantAccount, secretKey };
}

/**
 * Checks if a transaction is a technical test from developers/QA.
 */
export function isTestTransaction(tx: WfpTransaction): boolean {
  const ref = (tx.orderReference || '').toLowerCase();
  const email = (tx.email || '').toLowerCase();
  const phone = (tx.phone || '').toLowerCase();
  const amount = parseFloat(String(tx.amount || '0'));
  const currency = (tx.currency || 'UAH').toUpperCase();

  // Test prefixes
  if (
    ref.startsWith('test_') ||
    ref.startsWith('qa_') ||
    ref.startsWith('qa-test') ||
    ref.includes('test_runner')
  ) {
    return true;
  }

  // Test emails/phones
  if (
    email.includes('qa-test') ||
    email.includes('test-runner') ||
    phone.includes('380990000') ||
    phone.startsWith('000000')
  ) {
    return true;
  }

  // Amounts <= 5 UAH or <= 0.1 for EUR/USD are typical dev test transactions
  if (currency === 'UAH' && amount > 0 && amount <= 5) {
    return true;
  }
  if ((currency === 'EUR' || currency === 'USD') && amount > 0 && amount <= 0.1) {
    return true;
  }

  return false;
}

/**
 * Validates that an order reference belongs specifically to the Victoria website/project.
 */
export function isVictoriaOrder(tx: WfpTransaction, existsInDb: boolean = false): boolean {
  if (existsInDb) return true;
  const ref = (tx.orderReference || '').toUpperCase();
  return ref.startsWith('VMC_') || ref.startsWith('ROZ_');
}

/**
 * Detects the funnel/product properties from order reference, currency, and amount.
 */
export function detectProductFunnel(tx: WfpTransaction): {
  targetSheet: string;
  pagePath: string;
  tariffName: string;
} {
  const ref = (tx.orderReference || '').toUpperCase();
  const currency = (tx.currency || 'UAH').toUpperCase();
  const amount = parseFloat(String(tx.amount || '0'));

  if (ref.startsWith('ROZ_') || ref.includes('ROZBIR')) {
    return {
      targetSheet: 'Ленд 3',
      pagePath: '/rozbir',
      tariffName: 'Персональний розбір',
    };
  }

  if (ref.startsWith('PR_') || ref.includes('PRACTICUM') || currency === 'USD') {
    return {
      targetSheet: 'Практикум',
      pagePath: '/practicum',
      tariffName: 'Практикум',
    };
  }

  if (amount === 9 && (currency === 'EUR' || ref.includes('INTENSIVE') || ref.includes('5LIKES'))) {
    return {
      targetSheet: 'Інтенсив',
      pagePath: '/intensive/5-likes',
      tariffName: 'Інтенсив 5 Лайків',
    };
  }

  if (ref.startsWith('VMC_') || ref.includes('MC')) {
    return {
      targetSheet: 'Автовеб',
      pagePath: '/',
      tariffName: 'Майстер-клас',
    };
  }

  return {
    targetSheet: 'Автовеб',
    pagePath: '/',
    tariffName: 'Майстер-клас',
  };
}

/**
 * Fetches a single chunk of transactions from WayForPay (max 31 days).
 */
async function fetchWfpChunk(
  merchantAccount: string,
  secretKey: string,
  dateBegin: number,
  dateEnd: number
): Promise<WfpTransaction[]> {
  const signStr = `${merchantAccount};${dateBegin};${dateEnd}`;
  const signature = crypto.createHmac('md5', secretKey).update(signStr).digest('hex');

  const payload = {
    transactionType: 'TRANSACTION_LIST',
    merchantAccount,
    merchantSignature: signature,
    apiVersion: 1,
    dateBegin,
    dateEnd,
  };

  const res = await fetch('https://api.wayforpay.com/api', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`WayForPay HTTP error ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.reasonCode !== 1100 && data.reasonCode !== '1100') {
    // If empty or no transactions in period, reasonCode might indicate notice
    if (data.reason && data.reason.toLowerCase().includes('empty')) {
      return [];
    }
    console.warn(`[WFP Sync] API response notice (${dateBegin}-${dateEnd}):`, data.reason);
    return [];
  }

  return (data.transactionList || []) as WfpTransaction[];
}

/**
 * Core synchronization utility:
 * Fetches transactions from WayForPay and idempotently reconciles with Supabase (victoria_leads).
 */
export async function syncWayForPayTransactions(options: SyncOptions = {}): Promise<SyncResult> {
  const startTimeMs = Date.now();
  const { merchantAccount, secretKey } = getWfpCredentials();

  if (!merchantAccount || !secretKey) {
    const errorMsg = 'WayForPay credentials (WFP_MERCHANT_LOGIN / WFP_SECRET_KEY) are missing in environment.';
    console.error(`[WFP Sync] ${errorMsg}`);
    return {
      success: false,
      period: { start: '', end: '' },
      totalFetched: 0,
      approvedCount: 0,
      declinedCount: 0,
      expiredCount: 0,
      updatedInDb: 0,
      createdInDb: 0,
      skippedTestCount: 0,
      alreadyUpToDate: 0,
      errors: [errorMsg],
      durationMs: Date.now() - startTimeMs,
      chunksProcessed: 0,
    };
  }

  // 1. Determine timestamps range
  const now = Math.floor(Date.now() / 1000);
  let startTimestamp: number;
  let endTimestamp: number = now;

  if (options.endDate) {
    endTimestamp = Math.floor(new Date(options.endDate).getTime() / 1000);
  }

  if (options.startDate) {
    startTimestamp = Math.floor(new Date(options.startDate).getTime() / 1000);
  } else {
    const days = options.daysBack !== undefined ? options.daysBack : 3;
    startTimestamp = endTimestamp - days * 24 * 60 * 60;
  }

  const periodStartIso = new Date(startTimestamp * 1000).toISOString();
  const periodEndIso = new Date(endTimestamp * 1000).toISOString();
  console.log(`[WFP Sync] Starting synchronization from ${periodStartIso} to ${periodEndIso} (dryRun: ${!!options.dryRun})...`);

  // 2. Query WayForPay in 28-day chunks (WayForPay limit is 31 days)
  const CHUNK_SECONDS = 28 * 24 * 60 * 60;
  const allTransactions: WfpTransaction[] = [];
  const errors: string[] = [];
  let chunksProcessed = 0;
  let curStart = startTimestamp;

  while (curStart < endTimestamp) {
    const curEnd = Math.min(curStart + CHUNK_SECONDS, endTimestamp);
    chunksProcessed++;

    try {
      const chunkTxs = await fetchWfpChunk(merchantAccount, secretKey, curStart, curEnd);
      allTransactions.push(...chunkTxs);
      console.log(`[WFP Sync] Chunk ${chunksProcessed} (${new Date(curStart * 1000).toISOString().slice(0, 10)} to ${new Date(curEnd * 1000).toISOString().slice(0, 10)}): fetched ${chunkTxs.length} transactions.`);
    } catch (err: any) {
      const msg = `Chunk ${chunksProcessed} fetch failed: ${err.message || err}`;
      console.error(`[WFP Sync] ${msg}`);
      errors.push(msg);
    }

    curStart = curEnd;
    if (curStart < endTimestamp) {
      await new Promise(resolve => setTimeout(resolve, 150)); // Gentle rate-limiting
    }
  }

  console.log(`[WFP Sync] Total transactions fetched: ${allTransactions.length}`);

  // 3. Deduplicate fetched transactions by orderReference (keeping the latest transaction state)
  const uniqueTransactionsMap = new Map<string, WfpTransaction>();
  for (const tx of allTransactions) {
    if (!tx.orderReference) continue;
    uniqueTransactionsMap.set(tx.orderReference, tx);
  }

  const uniqueTransactions = Array.from(uniqueTransactionsMap.values());

  // 4. Batch lookup and update Supabase records
  let approvedCount = 0;
  let declinedCount = 0;
  let expiredCount = 0;
  let updatedInDb = 0;
  let createdInDb = 0;
  let skippedTestCount = 0;
  let alreadyUpToDate = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < uniqueTransactions.length; i += BATCH_SIZE) {
    const batch = uniqueTransactions.slice(i, i + BATCH_SIZE);
    const orderRefs = batch.map(t => t.orderReference).filter(Boolean);

    // Fetch existing leads for these order references
    const { data: existingLeads, error: dbSelectErr } = await supabaseAdmin
      .from('victoria_leads')
      .select('*')
      .in('order_id', orderRefs);

    if (dbSelectErr) {
      const msg = `Supabase select batch error: ${dbSelectErr.message}`;
      console.error(`[WFP Sync] ${msg}`);
      errors.push(msg);
      continue;
    }

    const existingMap = new Map<string, any>();
    (existingLeads || []).forEach(lead => {
      if (lead.order_id) {
        existingMap.set(lead.order_id, lead);
      }
    });

    for (const tx of batch) {
      const existingLead = existingMap.get(tx.orderReference);
      if (!isVictoriaOrder(tx, !!existingLead)) {
        continue;
      }

      const status = (tx.transactionStatus || '').trim();
      const isApproved = status.toLowerCase() === 'approved';
      const isDeclined = status.toLowerCase() === 'declined';
      const isExpired = status.toLowerCase() === 'expired';

      if (isApproved) approvedCount++;
      else if (isDeclined) declinedCount++;
      else if (isExpired) expiredCount++;

      if (isTestTransaction(tx)) {
        skippedTestCount++;
        continue;
      }

      const parsedAmount = parseFloat(String(tx.amount || '0'));

      if (existingLead) {
        const currentDbStatus = (existingLead.status || '').trim();
        const isDbApproved = currentDbStatus.toLowerCase() === 'approved';

        const canonicalCurrency = normalizeCurrency(tx.currency);
        const floatAmount = normalizeAmount(tx.amount);
        const productInfo = detectProductFunnel(tx);
        const prodType = resolveProductType({
          tariffName: productInfo.tariffName,
          targetSheet: productInfo.targetSheet,
          pagePath: productInfo.pagePath,
          amount: floatAmount
        });

        if (isApproved) {
          if (!isDbApproved) {
            // Found unconfirmed payment in DB -> Update to Approved!
            console.log(`[WFP Sync] Reconciling order ${tx.orderReference}: status was '${currentDbStatus}' -> updating to 'Approved' (${floatAmount} ${canonicalCurrency})`);
            if (!options.dryRun) {
              const updatedPayload = {
                ...(typeof existingLead.raw_payload === 'object' ? existingLead.raw_payload : {}),
                wayforpay_sync: tx,
                currency: canonicalCurrency,
                product_type: prodType,
                product_name: productInfo.tariffName,
                payment_system: 'wayforpay',
                metadata: {
                  currency: canonicalCurrency,
                  product_type: prodType,
                  product_name: productInfo.tariffName,
                  payment_system: 'wayforpay'
                },
                synced_at: new Date().toISOString(),
              };

              const { error: updateErr } = await supabaseAdmin
                .from('victoria_leads')
                .update({
                  status: 'Approved',
                  amount: floatAmount,
                  is_free: false,
                  raw_payload: updatedPayload,
                })
                .eq('id', existingLead.id);

              if (updateErr) {
                const msg = `Failed to update lead ${existingLead.id} (${tx.orderReference}): ${updateErr.message}`;
                console.error(`[WFP Sync] ${msg}`);
                errors.push(msg);
              } else {
                updatedInDb++;
              }

              // Update unified_orders directly to canonical closed_won
              await supabaseAdmin
                .from('unified_orders')
                .update({
                  status: 'closed_won',
                  amount: floatAmount,
                  metadata: {
                    currency: canonicalCurrency,
                    product_type: prodType,
                    product_name: productInfo.tariffName,
                    payment_system: 'wayforpay'
                  }
                })
                .eq('order_id', tx.orderReference);
            } else {
              updatedInDb++;
            }
          } else {
            alreadyUpToDate++;
          }
        } else if (isDeclined || isExpired) {
          // If DB lead was waiting/pending, mark as declined/expired
          if (
            currentDbStatus.includes('Очікує') ||
            currentDbStatus.toLowerCase() === 'pending' ||
            currentDbStatus.toLowerCase() === 'inprocessing'
          ) {
            console.log(`[WFP Sync] Updating pending order ${tx.orderReference}: '${currentDbStatus}' -> '${status}'`);
            if (!options.dryRun) {
              const { error: updateErr } = await supabaseAdmin
                .from('victoria_leads')
                .update({
                  status: isDeclined ? 'Declined' : 'Expired',
                  raw_payload: {
                    ...(typeof existingLead.raw_payload === 'object' ? existingLead.raw_payload : {}),
                    wayforpay_sync: tx,
                    currency: canonicalCurrency,
                    product_type: prodType,
                    product_name: productInfo.tariffName,
                    payment_system: 'wayforpay',
                    metadata: {
                      currency: canonicalCurrency,
                      product_type: prodType,
                      product_name: productInfo.tariffName,
                      payment_system: 'wayforpay'
                    },
                    synced_at: new Date().toISOString(),
                  },
                })
                .eq('id', existingLead.id);

              if (updateErr) {
                errors.push(`Failed to update declined status for ${tx.orderReference}: ${updateErr.message}`);
              } else {
                updatedInDb++;
              }

              // Update unified_orders to declined
              await supabaseAdmin
                .from('unified_orders')
                .update({
                  status: 'declined',
                  metadata: {
                    currency: canonicalCurrency,
                    product_type: prodType,
                    product_name: productInfo.tariffName,
                    payment_system: 'wayforpay'
                  }
                })
                .eq('order_id', tx.orderReference);
            } else {
              updatedInDb++;
            }
          } else {
            alreadyUpToDate++;
          }
        }
      } else {
        // Record NOT found in database
        if (isApproved) {
          const canonicalCurrency = normalizeCurrency(tx.currency);
          const floatAmount = normalizeAmount(tx.amount);
          const productInfo = detectProductFunnel(tx);
          const prodType = resolveProductType({
            tariffName: productInfo.tariffName,
            targetSheet: productInfo.targetSheet,
            pagePath: productInfo.pagePath,
            amount: floatAmount
          });

          console.log(`[WFP Sync] Missing Approved order detected: ${tx.orderReference} (${floatAmount} ${canonicalCurrency}) -> inserting into DB`);

          if (!options.dryRun) {
            const customerName = (
              tx.name ||
              (tx.email ? tx.email.split('@')[0] : '') ||
              'Клієнт WayForPay'
            ).trim();

            const canonicalPhone = normalizePhone(tx.phone);

            const leadInsertPayload = {
              order_id: tx.orderReference,
              name: customerName,
              phone: canonicalPhone || tx.phone || '',
              social: tx.email || '',
              amount: floatAmount,
              status: 'Approved',
              is_free: false,
              target_sheet: productInfo.targetSheet,
              page_path: productInfo.pagePath,
              created_at: tx.createdDate
                ? new Date(parseInt(String(tx.createdDate), 10) * 1000).toISOString()
                : new Date().toISOString(),
              raw_payload: {
                wayforpay_sync: tx,
                currency: canonicalCurrency,
                product_type: prodType,
                product_name: productInfo.tariffName,
                payment_system: 'wayforpay',
                metadata: {
                  currency: canonicalCurrency,
                  product_type: prodType,
                  product_name: productInfo.tariffName,
                  payment_system: 'wayforpay'
                },
                source: 'wfp_sync_backfill',
                synced_at: new Date().toISOString(),
              },
            };

            const { error: insertErr } = await supabaseAdmin
              .from('victoria_leads')
              .insert(leadInsertPayload);

            if (insertErr) {
              const msg = `Failed to insert missing order ${tx.orderReference}: ${insertErr.message}`;
              console.error(`[WFP Sync] ${msg}`);
              errors.push(msg);
            } else {
              createdInDb++;
            }
          } else {
            createdInDb++;
          }
        }
      }
    }
  }

  const durationMs = Date.now() - startTimeMs;
  console.log(`[WFP Sync] Completed in ${durationMs}ms: fetched=${uniqueTransactions.length}, approved=${approvedCount}, updated=${updatedInDb}, created=${createdInDb}, alreadyUpToDate=${alreadyUpToDate}, skippedTests=${skippedTestCount}, errors=${errors.length}`);

  return {
    success: errors.length === 0,
    period: {
      start: periodStartIso,
      end: periodEndIso,
    },
    totalFetched: uniqueTransactions.length,
    approvedCount,
    declinedCount,
    expiredCount,
    updatedInDb,
    createdInDb,
    skippedTestCount,
    alreadyUpToDate,
    errors,
    durationMs,
    chunksProcessed,
  };
}
