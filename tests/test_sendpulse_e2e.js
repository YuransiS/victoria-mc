const BASE_URL = 'http://localhost:3000';
// Valid UUIDs required by Supabase database schema and SendPulse contact validations
const visitorId = '11111111-1111-4111-a111-111111111111'; 
const spContactId = '22222222-2222-4222-b222-222222222222'; 

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function runE2ETest() {
  console.log('🏁 STARTING SENDPULSE E2E INTEGRATION TEST...');
  console.log(`- Test visitor ID: ${visitorId}`);
  console.log(`- Test SendPulse Contact ID: ${spContactId}`);

  // 1. Test State 1: Page Landed (Log Analytics)
  console.log('\n--- 1. Testing State 1: Landed (log analytics) ---');
  try {
    const res = await fetch(`${BASE_URL}/api/analytics/log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitorId,
        path: '/free-lection/vsl-form',
        sp_contact_id: spContactId,
        utms: {
          utm_source: 'youtube_test',
          utm_medium: 'video_description',
          utm_campaign: 'e2e_vsl_test',
          utm_content: 'video1',
          utm_term: 'keyword'
        }
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Response:`, data);
  } catch (err) {
    console.error('State 1 failed:', err.message);
  }

  await sleep(1000);

  // 2. Test State 2: Video Progress (>= 15 minutes)
  console.log('\n--- 2. Testing State 2: Video Watched (>= 15 mins) ---');
  try {
    const res = await fetch(`${BASE_URL}/api/video-progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        visitor_id: visitorId,
        sp_contact_id: spContactId,
        seconds_watched: 920, // 15 mins 20 secs
        current_time: 920,
        played: true,
        status: 'Дивився відео'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Response:`, data);
  } catch (err) {
    console.error('State 2 failed:', err.message);
  }

  await sleep(1000);

  // 3. Test State 3: Lead Submitted (Questionnaire)
  console.log('\n--- 3. Testing State 3: Submitted form ---');
  try {
    const res = await fetch(`${BASE_URL}/api/lead`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'QA E2E Tester',
        phone: '+380990000999',
        social: '@qa_e2e_tele',
        instagram: '@qa_e2e_insta',
        purpose: 'для свого особистого-експертного блогу',
        subscription_duration: '1-3 місяці',
        difficulties: 'Автоматичне тестування інтеграції SendPulse',
        readiness: 'готова на всі 100%',
        target_sheet: 'VSL Форма',
        visitor_id: visitorId,
        sp_contact_id: spContactId,
        utm_source: 'youtube_test',
        utm_medium: 'video_description',
        utm_campaign: 'e2e_vsl_test',
        utm_content: 'video1',
        utm_term: 'keyword'
      })
    });
    const data = await res.json();
    console.log(`Status: ${res.status}, Response:`, data);
  } catch (err) {
    console.error('State 3 failed:', err.message);
  }

  console.log('\n✅ SENDPULSE E2E INTEGRATION TEST RUN COMPLETED!');
}

runE2ETest();
