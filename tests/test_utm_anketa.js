const BASE_URL = 'https://victoria-mc.vercel.app';
const visitorId = '44444444-4444-4444-4444-444444444444'; // Unique test session UUID for UTM tests

const testCases = [
  {
    name: 'QA Test inst_shapka',
    utm_source: 'inst_shapka',
    phone: '+380990000101',
  },
  {
    name: 'QA Test inst_direct',
    utm_source: 'inst_direct',
    phone: '+380990000102',
  },
  {
    name: 'QA Test vsl',
    utm_source: 'vsl',
    phone: '+380990000103',
  },
  {
    name: 'QA Test bot_tg',
    utm_source: 'bot_tg',
    phone: '+380990000104',
  },
  {
    name: 'QA Test channel_tg',
    utm_source: 'channel_tg',
    phone: '+380990000105',
  }
];

async function runTests() {
  console.log('🏁 STARTING UTM ANKETA TESTS...');
  for (const tc of testCases) {
    const start = Date.now();
    const payload = {
      name: tc.name,
      phone: tc.phone,
      social: `@qa_${tc.utm_source}`,
      instagram: `@qa_${tc.utm_source}_insta`,
      purpose: 'для свого особистого-експертного блогу',
      difficulties: 'Автоматичний QA тест UTM міток',
      readiness: 'готова на всі 100%',
      target_sheet: 'Анкета передзапису',
      visitor_id: visitorId,
      page_path: '/anketa',
      full_url: `${BASE_URL}/anketa?utm_source=${tc.utm_source}`,
      utm_source: tc.utm_source,
      utm_medium: 'qa-test',
      utm_campaign: 'utm-source-verification',
      utm_term: 'stable',
      utm_content: 'automated'
    };

    try {
      const res = await fetch(`${BASE_URL}/api/lead`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'Antigravity-QA-Test-Runner' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      console.log(`[UTM TEST] ${tc.utm_source.padEnd(20)} -> Status: ${res.status} (${Date.now() - start}ms) - UUID: ${data.uuid || 'none'}`);
    } catch (err) {
      console.error(`[UTM TEST] Failed for ${tc.utm_source}: ${err.message}`);
    }
  }
  console.log('✅ UTM ANKETA TESTS FINISHED!');
}

runTests();
