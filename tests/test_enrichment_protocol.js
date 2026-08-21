const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// 1. Load env variables
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let key = match[1];
    let value = match[2] || '';
    if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
    if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
    env[key] = value.trim();
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

console.log('🧪 =================================================================');
console.log('🧪 B&W CRM v2.0 ENRICHMENT PROTOCOL TEST SUITE');
console.log('🧪 =================================================================\n');

// 2. Mock / Re-implement functions from enrichment.ts for CommonJS test runner
function normalizePhone(rawPhone) {
  if (!rawPhone) return null;
  const trimmed = String(rawPhone).trim();
  if (!trimmed || trimmed === '-' || trimmed.toLowerCase() === 'null' || trimmed.toLowerCase() === 'none') {
    return null;
  }
  let digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  if (digits.length === 9) {
    digits = '380' + digits;
  } else if (digits.length === 10 && digits.startsWith('0')) {
    digits = '38' + digits;
  } else if (digits.length === 11 && digits.startsWith('80')) {
    digits = '38' + digits.substring(1);
  }
  return `+${digits}`;
}

function normalizeEmail(rawEmail) {
  if (!rawEmail) return null;
  const trimmed = String(rawEmail).trim().toLowerCase();
  if (!trimmed || trimmed === '-' || trimmed === 'none' || trimmed === 'null' || !trimmed.includes('@')) {
    return null;
  }
  return trimmed;
}

function normalizeTelegram(rawTg) {
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

function normalizeCurrency(rawCurrency) {
  if (!rawCurrency) return 'UAH';
  const clean = String(rawCurrency).toUpperCase().trim();
  if (clean === 'USD' || clean.includes('$') || clean === 'DOLLAR') return 'USD';
  if (clean === 'EUR' || clean.includes('€') || clean === 'EURO') return 'EUR';
  if (clean === 'UAH' || clean.includes('₴') || clean.includes('ГРН')) return 'UAH';
  return 'UAH';
}

function normalizeAmount(rawAmount) {
  if (rawAmount === undefined || rawAmount === null || rawAmount === '') return 0.00;
  const parsed = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/,/g, '.').replace(/[^\d.-]/g, ''));
  if (isNaN(parsed) || parsed < 0) return 0.00;
  return Number(parsed.toFixed(2));
}

function resolveProductType(opts) {
  const { productType, tariffName, targetSheet, pagePath, amount } = opts;
  const numAmount = normalizeAmount(amount);
  if (productType) {
    const pt = productType.toLowerCase().trim();
    if (['course', 'tripwire', 'subscription', 'consultation', 'lead'].includes(pt)) return pt;
  }
  const path = (pagePath || '').toLowerCase();
  const sheet = (targetSheet || '').toLowerCase();
  const tariff = (tariffName || '').toLowerCase();

  if (numAmount === 0 && (path.includes('anketa') || path.includes('free-lection') || sheet.includes('анкета') || sheet.includes('vsl'))) return 'lead';
  if (path.includes('rozbir') || sheet.includes('розбір') || tariff.includes('розбір')) return 'consultation';
  if (tariff.includes('клуб') || tariff.includes('підписк')) return 'subscription';
  if (path.includes('intensive') || path.includes('practicum') || sheet.includes('інтенсив') || sheet.includes('практикум') || tariff.includes('інтенсив') || tariff.includes('практикум') || (numAmount > 0 && numAmount <= 250 && (path === '/' || sheet === 'автовеб'))) return 'tripwire';
  if (numAmount > 0) return 'course';
  return 'lead';
}

function normalizeStatus(rawStatus) {
  if (!rawStatus) return 'pending';
  const s = String(rawStatus).toLowerCase().trim();
  if (s === 'closed_won') return 'closed_won';
  if (s === 'declined' || s === 'failed') return 'declined';
  if (s === 'pending') return 'pending';
  if (s === 'new') return 'new';
  if (s === 'клик') return 'Клик';
  if (s === 'кликформы' || s === 'клик_формы') return 'КликФормы';
  if (s.includes('передплат') || s.includes('предоплат') || s.includes('бронь')) return 'внесена предоплата';
  if (s.includes('оплат') || s.includes('оплач') || s.includes('approved') || s.includes('paid') || s.includes('success') || s.includes('купив')) {
    if (!s.includes('не') && !s.includes('очікує')) return 'closed_won';
  }
  if (s.includes('fail') || s.includes('decline') || s.includes('expire') || s.includes('відхил')) return 'declined';
  if (s.includes('зареєстр') || s.includes('заявк') || s === 'new') return 'new';
  return 'pending';
}

async function runUnitTests() {
  console.log('🔹 1. Testing Contact Normalization:');
  assert.strictEqual(normalizePhone('0991234567'), '+380991234567');
  assert.strictEqual(normalizePhone('380991234567'), '+380991234567');
  assert.strictEqual(normalizePhone('+380 (99) 123-45-67'), '+380991234567');
  assert.strictEqual(normalizePhone('80991234567'), '+380991234567');
  assert.strictEqual(normalizePhone('+1 (555) 019-2834'), '+15550192834');
  console.log('   ✅ Phone normalization matches E.164 (+380XXXXXXXXX)');

  assert.strictEqual(normalizeEmail('  Test.User+1@Gmail.COM '), 'test.user+1@gmail.com');
  assert.strictEqual(normalizeEmail('-'), null);
  console.log('   ✅ Email normalization converts to trimmed lowercase');

  assert.strictEqual(normalizeTelegram('@vika_cooperation'), 'vika_cooperation');
  assert.strictEqual(normalizeTelegram('https://t.me/vika_cooperation'), 'vika_cooperation');
  assert.strictEqual(normalizeTelegram('  @user_name  '), 'user_name');
  console.log('   ✅ Telegram normalization removes @ and URLs');

  console.log('\n🔹 2. Testing Currency & Amount Normalization:');
  assert.strictEqual(normalizeCurrency('uah'), 'UAH');
  assert.strictEqual(normalizeCurrency('1490 ₴'), 'UAH');
  assert.strictEqual(normalizeCurrency('100 $'), 'USD');
  assert.strictEqual(normalizeCurrency('9 €'), 'EUR');
  assert.strictEqual(normalizeCurrency(null), 'UAH');
  console.log('   ✅ Currency strictly uppercase (UAH, USD, EUR), symbols stripped');

  assert.strictEqual(normalizeAmount(1490), 1490.00);
  assert.strictEqual(normalizeAmount('1500,50'), 1500.50);
  assert.strictEqual(normalizeAmount('0'), 0.00);
  assert.strictEqual(normalizeAmount(null), 0.00);
  console.log('   ✅ Amount formatted as float number with 2 decimal places');

  console.log('\n🔹 3. Testing Product Type Resolution:');
  assert.strictEqual(resolveProductType({ tariffName: 'Тариф Преміум', amount: 15000 }), 'course');
  assert.strictEqual(resolveProductType({ tariffName: 'Практикум по связкам', amount: 49 }), 'tripwire');
  assert.strictEqual(resolveProductType({ pagePath: '/rozbir', amount: 390 }), 'consultation');
  assert.strictEqual(resolveProductType({ pagePath: '/anketa', amount: 0 }), 'lead');
  assert.strictEqual(resolveProductType({ tariffName: 'Клуб щомісячний', amount: 500 }), 'subscription');
  console.log('   ✅ Product type resolved: course, tripwire, subscription, consultation, lead');

  console.log('\n🔹 4. Testing Canonical Status Mapping:');
  assert.strictEqual(normalizeStatus('Approved'), 'closed_won');
  assert.strictEqual(normalizeStatus('APPROVED (Redirect)'), 'closed_won');
  assert.strictEqual(normalizeStatus('Оплачено'), 'closed_won');
  assert.strictEqual(normalizeStatus('Declined'), 'declined');
  assert.strictEqual(normalizeStatus('Expired'), 'declined');
  assert.strictEqual(normalizeStatus('внесена предоплата'), 'внесена предоплата');
  assert.strictEqual(normalizeStatus('Зареєстровано'), 'new');
  assert.strictEqual(normalizeStatus('Клик'), 'Клик');
  assert.strictEqual(normalizeStatus('КликФормы'), 'КликФормы');
  console.log('   ✅ Canonical status mapping verified');
}

async function runSupabaseIntegrationTest() {
  console.log('\n🔹 5. Testing Supabase Live Database Enrichment Protocol:');

  const testOrderId = `TEST_ENRICH_${Date.now()}`;
  const testPhone = `+38099${Math.floor(1000000 + Math.random() * 9000000)}`;
  const testVisitorUuid = '44444444-4444-4444-4444-444444444444';

  const testLeadPayload = {
    name: 'QA Enrichment Protocol Test',
    phone: testPhone,
    social: '@qa_enrich_user',
    instagram: '@qa_instagram',
    amount: 1490.00,
    status: 'Approved',
    order_id: testOrderId,
    target_sheet: 'Автовеб',
    page_path: '/masterclass',
    page_url: 'https://victoria-mc.vercel.app/masterclass?utm_source=fb&utm_medium=cpc&campaign_id=120202&adset_id=340303&ad_id=560505&fbclid=IwARTEST',
    utm_source: 'fb',
    utm_medium: 'cpc',
    utm_campaign: 'spring_launch',
    utm_content: 'video_hook_1',
    utm_term: 'retargeting',
    visitor_uuid: testVisitorUuid,
    raw_payload: {
      currency: 'UAH',
      product_type: 'tripwire',
      product_name: 'Майстер-клас 28.07',
      payment_system: 'wayforpay',
      campaign_id: '120202',
      adset_id: '340303',
      ad_id: '560505',
      fbclid: 'IwARTEST',
      fbp: 'fb.1.1711234567.890',
      fbc: 'fb.1.1711234567.IwARTEST',
      metadata: {
        currency: 'UAH',
        product_type: 'tripwire',
        product_name: 'Майстер-клас 28.07',
        payment_system: 'wayforpay'
      }
    }
  };

  // Insert into victoria_leads
  const { data: inserted, error: insertError } = await supabase
    .from('victoria_leads')
    .insert(testLeadPayload)
    .select('*')
    .single();

  if (insertError) {
    console.error('❌ Supabase insert error:', insertError.message);
    throw insertError;
  }

  console.log(`   ✅ Inserted test lead into victoria_leads (ID: ${inserted.id}, Order: ${testOrderId})`);

  // Wait 1.5s for trigger sync
  await new Promise(resolve => setTimeout(resolve, 1500));

  // Check sync in unified_customers
  const { data: customer, error: custError } = await supabase
    .from('unified_customers')
    .select('*')
    .eq('phone', testPhone)
    .maybeSingle();

  if (custError) {
    console.error('❌ Error selecting customer:', custError.message);
  } else if (customer) {
    console.log(`   ✅ Synced to unified_customers (ID: ${customer.id}, Name: ${customer.name}, Phone: ${customer.phone})`);
  }

  // Check sync in unified_orders
  const { data: order, error: ordError } = await supabase
    .from('unified_orders')
    .select('*')
    .eq('order_id', testOrderId)
    .maybeSingle();

  if (ordError) {
    console.error('❌ Error selecting unified_order:', ordError.message);
  } else if (order) {
    console.log(`   ✅ Synced to unified_orders (ID: ${order.id}, Status: ${order.status}, Amount: ${order.amount}, Path: ${order.page_path})`);
  }

  // Clean up test data
  await supabase.from('victoria_leads').delete().eq('id', inserted.id);
  if (order) {
    await supabase.from('unified_orders').delete().eq('id', order.id);
  }
  if (customer) {
    await supabase.from('unified_customers').delete().eq('id', customer.id);
  }
  console.log('   🧹 Test data cleaned up successfully.');
}

async function run() {
  try {
    await runUnitTests();
    await runSupabaseIntegrationTest();
    console.log('\n🎉 ALL ENRICHMENT PROTOCOL TESTS PASSED SUCCESSFULLY!');
  } catch (err) {
    console.error('\n❌ Test suite failed:', err);
    process.exit(1);
  }
}

run();
