#!/usr/bin/env node

/**
 * Historical WayForPay Transaction Reconciliation Script
 * 
 * Usage:
 *   node scripts/run_sync.js                   # Full historical sync from project inception (2024-05-01)
 *   node scripts/run_sync.js --days=3          # Last 3 days auto-sync
 *   node scripts/run_sync.js --start=2026-06-01 --end=2026-08-01
 *   node scripts/run_sync.js --dry-run
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// 1. Parse environment variables from .env.local
const envPath = path.resolve(__dirname, '../.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const envText = fs.readFileSync(envPath, 'utf8');
  envText.split('\n').forEach(line => {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (match) {
      let value = match[2] || '';
      if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
      env[match[1]] = value;
    }
  });
}

const merchantAccount = (
  process.env.WFP_MERCHANT_LOGIN ||
  process.env.WAYFORPAY_MERCHANT_ACCOUNT ||
  env.WFP_MERCHANT_LOGIN ||
  env.WAYFORPAY_MERCHANT_ACCOUNT ||
  ''
).replace(/['"]/g, '').trim();

const secretKey = (
  process.env.WFP_SECRET_KEY ||
  process.env.WAYFORPAY_SECRET_KEY ||
  env.WFP_SECRET_KEY ||
  env.WAYFORPAY_SECRET_KEY ||
  ''
).replace(/['"]/g, '').trim();

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  env.NEXT_PUBLIC_SUPABASE_URL ||
  ''
).replace(/['"]/g, '').trim();

const supabaseKey = (
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  env.SUPABASE_SERVICE_ROLE_KEY ||
  ''
).replace(/['"]/g, '').trim();

if (!merchantAccount || !secretKey) {
  console.error('❌ Error: Missing WayForPay credentials (WFP_MERCHANT_LOGIN / WFP_SECRET_KEY).');
  process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials (NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY).');
  process.exit(1);
}

// 2. Parse CLI arguments
const args = process.argv.slice(2);
let daysArg = null;
let startArg = null;
let endArg = null;
let isDryRun = false;

args.forEach(arg => {
  if (arg.startsWith('--days=')) daysArg = parseInt(arg.split('=')[1], 10);
  if (arg.startsWith('--start=')) startArg = arg.split('=')[1];
  if (arg.startsWith('--end=')) endArg = arg.split('=')[1];
  if (arg === '--dry-run' || arg === '-d') isDryRun = true;
});

function isTestTransaction(tx) {
  const ref = (tx.orderReference || '').toLowerCase();
  const email = (tx.email || '').toLowerCase();
  const phone = (tx.phone || '').toLowerCase();
  const amount = parseFloat(String(tx.amount || '0'));
  const currency = (tx.currency || 'UAH').toUpperCase();

  if (
    ref.startsWith('test_') ||
    ref.startsWith('qa_') ||
    ref.startsWith('qa-test') ||
    ref.includes('test_runner')
  ) {
    return true;
  }

  if (
    email.includes('qa-test') ||
    email.includes('test-runner') ||
    phone.includes('380990000') ||
    phone.startsWith('000000')
  ) {
    return true;
  }

  if (currency === 'UAH' && amount > 0 && amount <= 5) return true;
  if ((currency === 'EUR' || currency === 'USD') && amount > 0 && amount <= 0.1) return true;

  return false;
}

function detectProductFunnel(tx) {
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

  return {
    targetSheet: 'Автовеб',
    pagePath: '/',
    tariffName: 'Майстер-клас',
  };
}

async function fetchWfpChunk(dateBegin, dateEnd) {
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
    throw new Error(`HTTP ${res.status}: ${await res.text()}`);
  }

  const data = await res.json();
  if (data.reasonCode !== 1100 && data.reasonCode !== '1100') {
    if (data.reason && data.reason.toLowerCase().includes('empty')) return [];
    console.warn(`[WFP API] Notice (${dateBegin}-${dateEnd}):`, data.reason);
    return [];
  }

  return data.transactionList || [];
}

async function run() {
  const startTimeMs = Date.now();
  console.log('===========================================================');
  console.log('🔄 WAYFORPAY DATABASE RECONCILIATION RUNNER');
  console.log('===========================================================');
  console.log(`Merchant Account: ${merchantAccount}`);
  console.log(`Supabase URL:     ${supabaseUrl}`);
  console.log(`Dry Run Mode:     ${isDryRun ? 'YES (Simulated)' : 'NO (Live DB Updates)'}`);

  const now = Math.floor(Date.now() / 1000);
  let startTimestamp;
  let endTimestamp = now;

  if (endArg) {
    endTimestamp = Math.floor(new Date(endArg).getTime() / 1000);
  }

  if (startArg) {
    startTimestamp = Math.floor(new Date(startArg).getTime() / 1000);
  } else if (daysArg !== null) {
    startTimestamp = endTimestamp - daysArg * 24 * 60 * 60;
  } else {
    // Default: full history from May 1, 2024
    startTimestamp = Math.floor(new Date('2024-05-01T00:00:00Z').getTime() / 1000);
  }

  const startDateIso = new Date(startTimestamp * 1000).toISOString();
  const endDateIso = new Date(endTimestamp * 1000).toISOString();
  console.log(`Target Period:    ${startDateIso} -> ${endDateIso}\n`);

  // 1. Fetch from WFP in 28-day chunks
  const CHUNK_SECONDS = 28 * 24 * 60 * 60;
  let curStart = startTimestamp;
  const allTxs = [];
  let chunkIdx = 0;

  while (curStart < endTimestamp) {
    const curEnd = Math.min(curStart + CHUNK_SECONDS, endTimestamp);
    chunkIdx++;
    process.stdout.write(`⏳ Fetching chunk ${chunkIdx} (${new Date(curStart * 1000).toISOString().slice(0, 10)} to ${new Date(curEnd * 1000).toISOString().slice(0, 10)})... `);

    try {
      const txs = await fetchWfpChunk(curStart, curEnd);
      console.log(`OK (${txs.length} transactions)`);
      allTxs.push(...txs);
    } catch (e) {
      console.log(`FAILED: ${e.message}`);
    }

    curStart = curEnd;
    if (curStart < endTimestamp) {
      await new Promise(r => setTimeout(r, 100));
    }
  }

  console.log(`\n📦 Total Raw Transactions Fetched: ${allTxs.length}`);

  // 2. Deduplicate by orderReference
  const txMap = new Map();
  allTxs.forEach(t => {
    if (t.orderReference) txMap.set(t.orderReference, t);
  });
  const uniqueTxs = Array.from(txMap.values());
  console.log(`🎯 Unique Orders to Reconcile:      ${uniqueTxs.length}`);

  // 3. Batch Reconcile with Supabase
  let approvedCount = 0;
  let declinedCount = 0;
  let expiredCount = 0;
  let updatedInDb = 0;
  let createdInDb = 0;
  let skippedTests = 0;
  let alreadyCorrect = 0;
  let totalApprovedAmount = 0;

  const BATCH_SIZE = 50;
  for (let i = 0; i < uniqueTxs.length; i += BATCH_SIZE) {
    const batch = uniqueTxs.slice(i, i + BATCH_SIZE);
    const orderRefs = batch.map(t => t.orderReference).filter(Boolean);

    // Fetch existing records from DB
    const selectUrl = `${supabaseUrl}/rest/v1/victoria_leads?select=*&order_id=in.(${orderRefs.map(r => `"${r}"`).join(',')})`;
    const dbRes = await fetch(selectUrl, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    if (!dbRes.ok) {
      console.error(`❌ DB Select Batch Error: ${await dbRes.text()}`);
      continue;
    }

    const existingLeads = await dbRes.json();
    const existingMap = new Map();
    existingLeads.forEach(l => existingMap.set(l.order_id, l));

    for (const tx of batch) {
      const status = (tx.transactionStatus || '').trim();
      const isApproved = status.toLowerCase() === 'approved';
      const isDeclined = status.toLowerCase() === 'declined';
      const isExpired = status.toLowerCase() === 'expired';
      const parsedAmount = parseFloat(String(tx.amount || '0'));

      if (isApproved) {
        approvedCount++;
        totalApprovedAmount += parsedAmount;
      } else if (isDeclined) {
        declinedCount++;
      } else if (isExpired) {
        expiredCount++;
      }

      if (isTestTransaction(tx)) {
        skippedTests++;
        continue;
      }

      const existingLead = existingMap.get(tx.orderReference);

      if (existingLead) {
        const currentDbStatus = (existingLead.status || '').trim();
        const isDbApproved = currentDbStatus.toLowerCase() === 'approved';

        if (isApproved) {
          if (!isDbApproved) {
            console.log(` [UPDATE] Order ${tx.orderReference}: status was '${currentDbStatus}' -> 'Approved' (${parsedAmount} ${tx.currency})`);
            if (!isDryRun) {
              const patchUrl = `${supabaseUrl}/rest/v1/victoria_leads?id=eq.${existingLead.id}`;
              const updatedPayload = {
                ...(typeof existingLead.raw_payload === 'object' ? existingLead.raw_payload : {}),
                wayforpay_sync: tx,
                synced_at: new Date().toISOString(),
              };

              const updateRes = await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                  status: 'Approved',
                  amount: parsedAmount,
                  is_free: false,
                  raw_payload: updatedPayload,
                }),
              });

              if (!updateRes.ok) {
                console.error(` ❌ Update failed for ${tx.orderReference}: ${await updateRes.text()}`);
              } else {
                updatedInDb++;
              }
            } else {
              updatedInDb++;
            }
          } else {
            alreadyCorrect++;
          }
        } else if (isDeclined || isExpired) {
          if (
            currentDbStatus.includes('Очікує') ||
            currentDbStatus.toLowerCase() === 'pending' ||
            currentDbStatus.toLowerCase() === 'inprocessing'
          ) {
            console.log(` [UPDATE] Order ${tx.orderReference}: status was '${currentDbStatus}' -> '${status}'`);
            if (!isDryRun) {
              const patchUrl = `${supabaseUrl}/rest/v1/victoria_leads?id=eq.${existingLead.id}`;
              await fetch(patchUrl, {
                method: 'PATCH',
                headers: {
                  'apikey': supabaseKey,
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                  'Prefer': 'return=minimal',
                },
                body: JSON.stringify({
                  status: isDeclined ? 'Declined' : 'Expired',
                  raw_payload: {
                    ...(typeof existingLead.raw_payload === 'object' ? existingLead.raw_payload : {}),
                    wayforpay_sync: tx,
                    synced_at: new Date().toISOString(),
                  },
                }),
              });
              updatedInDb++;
            } else {
              updatedInDb++;
            }
          } else {
            alreadyCorrect++;
          }
        }
      } else {
        // Missing record in DB
        if (isApproved) {
          const productInfo = detectProductFunnel(tx);
          console.log(` [INSERT] Missing Order ${tx.orderReference} (${parsedAmount} ${tx.currency}) -> Creating in DB (${productInfo.targetSheet})`);
          
          if (!isDryRun) {
            const customerName = (
              tx.name ||
              (tx.email ? tx.email.split('@')[0] : '') ||
              'Клієнт WayForPay'
            ).trim();

            const insertUrl = `${supabaseUrl}/rest/v1/victoria_leads`;
            const leadInsertPayload = {
              order_id: tx.orderReference,
              name: customerName,
              phone: tx.phone || '',
              social: tx.email || '',
              amount: parsedAmount,
              status: 'Approved',
              is_free: false,
              target_sheet: productInfo.targetSheet,
              page_path: productInfo.pagePath,
              created_at: tx.createdDate
                ? new Date(parseInt(String(tx.createdDate), 10) * 1000).toISOString()
                : new Date().toISOString(),
              raw_payload: {
                wayforpay_sync: tx,
                tariffName: productInfo.tariffName,
                source: 'wfp_sync_backfill',
                synced_at: new Date().toISOString(),
              },
            };

            const insertRes = await fetch(insertUrl, {
              method: 'POST',
              headers: {
                'apikey': supabaseKey,
                'Authorization': `Bearer ${supabaseKey}`,
                'Content-Type': 'application/json',
                'Prefer': 'return=minimal',
              },
              body: JSON.stringify(leadInsertPayload),
            });

            if (!insertRes.ok) {
              console.error(` ❌ Insert failed for ${tx.orderReference}: ${await insertRes.text()}`);
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

  const durationSec = ((Date.now() - startTimeMs) / 1000).toFixed(2);
  console.log('\n===========================================================');
  console.log('✅ RECONCILIATION SUMMARY');
  console.log('===========================================================');
  console.log(`⏱️ Duration:               ${durationSec}s`);
  console.log(`💳 Total Approved Orders:   ${approvedCount}`);
  console.log(`💰 Total Approved Revenue:  ${totalApprovedAmount.toFixed(2)} UAH/EUR/USD`);
  console.log(`⚠️ Expired Transactions:   ${expiredCount}`);
  console.log(`❌ Declined Transactions:  ${declinedCount}`);
  console.log(`🧪 Test Orders Skipped:    ${skippedTests}`);
  console.log(`✔️ Already Up-To-Date:     ${alreadyCorrect}`);
  console.log(`🔄 Records Updated in DB:  ${updatedInDb}`);
  console.log(`➕ Missing Orders Backfilled: ${createdInDb}`);
  console.log('===========================================================');
}

run().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
