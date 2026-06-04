// E2E Integration and QA Test Script for all landings and APIs
// Default target is production. Change to http://localhost:3001 for local testing.
const BASE_URL = 'https://victoria-mc.vercel.app';

const visitorId = '33333333-3333-3333-3333-333333333333'; // Unique test session UUID

const utms = {
  utm_source: 'qa-test',
  utm_medium: 'test-runner',
  utm_campaign: 'all-landings-coverage',
  utm_content: 'automated-regression-suite',
  utm_term: 'stable'
};

const pagesToVisit = [
  { path: '/', label: 'Web/Autoveb Landing' },
  { path: '/price', label: 'Booking/Price Landing' },
  { path: '/practicum', label: 'Masterclass Practicum Landing' },
  { path: '/free-lection', label: 'VSL 1 Start Landing' },
  { path: '/free-lection/vsl-form', label: 'VSL Form Step 2' },
  { path: '/rozbir', label: 'Rozbir Personal Breakdown Page' },
  { path: '/anketa', label: 'Pre-registration Questionnaire Landing' }
];

async function simulatePageViews() {
  console.log('🌐 SIMULATING CLIENT PAGE VIEWS (TELEMETRY)...');
  for (const page of pagesToVisit) {
    const start = Date.now();
    try {
      const payload = {
        visitorId,
        path: page.path,
        status: 'Клик',
        name: 'QA Simulation Viewer',
        phone: '380990000200',
        social: '@qa_viewer',
        utms,
        fullUrl: `${BASE_URL}${page.path}`
      };
      
      const res = await fetch(`${BASE_URL}/api/analytics/log`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Antigravity-QA-Test-Runner' },
        body: JSON.stringify(payload)
      });
      const duration = Date.now() - start;
      console.log(`[VIEW] Logged 'Клик' for ${page.label.padEnd(35)} -> Status: ${res.status} (${duration}ms)`);
    } catch (err) {
      console.error(`[VIEW] Failed to log ${page.path}: ${err.message}`);
    }
  }
}

async function simulateFormSubmissions() {
  console.log('\n📝 INITIATING FORM SUBMISSIONS (CRM + TG ALERTS)...');

  // 1. VSL 1 Lead Submission
  const vsl1Lead = {
    name: 'QA VSL 1 Lead',
    phone: '380990000021',
    social: '@qa_vsl1_lead',
    target_sheet: 'VSL 1 етап',
    visitor_id: visitorId,
    ...utms,
    full_url: `${BASE_URL}/free-lection`
  };
  await sendLead('/api/lead', vsl1Lead, 'VSL 1 етап');

  // 2. VSL Form Lead Submission
  const vslFormLead = {
    name: 'QA VSL Form Lead',
    phone: '380990000022',
    social: '@qa_vsl_form_lead',
    target_sheet: 'VSL Форма',
    visitor_id: visitorId,
    ...utms,
    full_url: `${BASE_URL}/free-lection/vsl-form`
  };
  await sendLead('/api/lead', vslFormLead, 'VSL Форма');

  // 3. Autoweb Lead Submission
  const autowebLead = {
    name: 'QA Autoweb Lead',
    phone: '380990000023',
    social: '@qa_autoweb_lead',
    target_sheet: 'Автовеб',
    sheet_id: '726331330',
    visitor_id: visitorId,
    ...utms,
    full_url: `${BASE_URL}/`
  };
  await sendLead('/api/lead', autowebLead, 'Автовеб');

  // 4. Booking Payment Submission
  const bookingPayment = {
    amount: 1,
    currency: 'UAH',
    tariffName: 'QA Бронювання тарифа',
    customerEmail: 'booking-qa@test.com',
    customerName: 'QA Booking User',
    customerPhone: '380990000024',
    telegram: '@qa_booking_user',
    successUrl: '/price/thanks',
    failUrl: '/price/fail',
    targetSheet: 'Бронювання',
    ...utms,
    full_url: `${BASE_URL}/price`,
    visitor_id: visitorId
  };
  await sendPayment('/api/create-payment', bookingPayment, 'Бронювання');

  // 5. Practicum Payment Submission
  const practicumPayment = {
    amount: 1,
    currency: 'UAH',
    tariffName: 'QA Практикум Stories',
    customerEmail: 'practicum-qa@test.com',
    customerName: 'QA Practicum User',
    customerPhone: '380990000025',
    telegram: '@qa_practicum_user',
    successUrl: '/practicum/thanks',
    failUrl: '/practicum/fail',
    targetSheet: 'Практикум',
    ...utms,
    full_url: `${BASE_URL}/practicum`,
    visitor_id: visitorId
  };
  await sendPayment('/api/create-payment', practicumPayment, 'Практикум');

  // 6. Rozbir Payment Submission
  const rozbirPayment = {
    name: 'QA Rozbir User',
    phone: '380990000026',
    social: '@qa_rozbir_user',
    amount: 99,
    ...utms,
    visitor_id: visitorId
  };
  await sendPayment('/api/rozbir/initiate', rozbirPayment, 'Ленд 3 (Розбір)');

  // 7. Pre-registration Questionnaire Submission
  const preRegLead = {
    name: 'QA Pre-registration Lead',
    phone: '380990000027',
    social: '@qa_prereg_lead',
    instagram: '@qa_prereg_insta',
    purpose: 'для свого особистого-експертного блогу',
    difficulties: 'Важко регулярно знімати контент',
    readiness: 'готова на всі 100%',
    target_sheet: 'Анкета передзапису',
    visitor_id: visitorId,
    ...utms,
    full_url: `${BASE_URL}/anketa`
  };
  await sendLead('/api/lead', preRegLead, 'Анкета передзапису');
}

async function sendLead(endpoint, payload, sheetName) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Antigravity-QA-Test-Runner' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[LEAD] ${sheetName.padEnd(20)} -> Status: ${res.status} (${Date.now() - start}ms) - UUID: ${data.uuid || 'none'}`);
  } catch (err) {
    console.error(`[LEAD] Failed to send lead for ${sheetName}: ${err.message}`);
  }
}

async function sendPayment(endpoint, payload, sheetName) {
  const start = Date.now();
  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'User-Agent': 'Antigravity-QA-Test-Runner' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    console.log(`[PAYMENT] ${sheetName.padEnd(20)} -> Status: ${res.status} (${Date.now() - start}ms) - Ref: ${data.orderReference || 'none'}`);
  } catch (err) {
    console.error(`[PAYMENT] Failed to initiate payment for ${sheetName}: ${err.message}`);
  }
}

async function run() {
  console.log(`🏁 STARTING FULL-COVERAGE INTEGRATION & QA TEST RUN ON ${BASE_URL}...`);
  await simulatePageViews();
  await simulateFormSubmissions();
  console.log('\n✅ ALL INTEGRATION EVENTS FIRED!');
}

run().catch(console.error);
