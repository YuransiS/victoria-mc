const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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
    env[key] = value;
  }
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function getFunnelName(targetSheet, pagePath) {
  if (targetSheet === 'Анкета передзапису' || pagePath === '/anketa') return 'Анкета передзапису';
  if (targetSheet === 'VSL Форма' || targetSheet === 'Ленд 2' || pagePath === '/free-lection/vsl-form') return 'VSL Анкета (Форма)';
  if (targetSheet === 'VSL 1 етап' || targetSheet === 'Ленд 1' || targetSheet === 'VSL Воронка (старт)' || pagePath === '/free-lection') return 'VSL Воронка (Лекція)';
  if (targetSheet === 'Автовеб' || targetSheet === 'Masterclass_Leads') return 'Майстер-клас';
  if (pagePath === '/practicum') return 'Практикум';
  if (pagePath === '/rozbir' || (targetSheet && targetSheet.includes('розбір'))) return 'Персональний розбір';
  if (pagePath === '/price') return 'Сторінка тарифів';
  return targetSheet || pagePath || 'Лендінг';
}

function formatDate(isoStr) {
  const d = new Date(isoStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${day}.${month}.${year} ${hours}:${mins}`;
}

async function fetchPreviousProducts(phone, visitorUuid, currentTargetSheet) {
  if (!phone && !visitorUuid) return [];

  const queryConditions = [];
  if (phone) queryConditions.push(`phone.eq.${phone}`);
  if (visitorUuid) queryConditions.push(`visitor_uuid.eq.${visitorUuid}`);

  const { data, error } = await supabase
    .from('victoria_leads')
    .select('created_at, target_sheet, page_path, status')
    .or(queryConditions.join(','))
    .order('created_at', { ascending: true });

  if (error || !data) {
    console.error('Supabase query error:', error);
    return [];
  }

  // Deduplicate visits to the same funnel/product on the same date or list significant product interactions
  const seenFunnels = new Set();
  const historyList = [];

  for (const item of data) {
    const funnelName = getFunnelName(item.target_sheet, item.page_path);
    // Ignore generic home page clicks or exact current product if it's the only hit
    if (!funnelName || funnelName === 'Лендінг' || funnelName === '/') continue;

    const formattedTime = formatDate(item.created_at);
    const key = `${funnelName}_${formattedTime.substring(0, 10)}`; // group by funnel and date day

    if (!seenFunnels.has(key)) {
      seenFunnels.add(key);
      historyList.push({
        funnel: funnelName,
        date: formattedTime,
        status: item.status
      });
    }
  }

  return historyList;
}

async function run() {
  const sampleUuid = 'a3407b1b-bfec-413e-8052-c529ff8622b8';
  const history = await fetchPreviousProducts(null, sampleUuid, 'Анкета передзапису');
  console.log('Sample History for UUID:', history);
}

run().catch(console.error);
