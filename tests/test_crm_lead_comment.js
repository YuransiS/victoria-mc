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

function formatUkrainianDate(isoString) {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('uk-UA', {
      timeZone: 'Europe/Kiev',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).replace(',', '');
  } catch (e) {
    return isoString;
  }
}

function resolveProductFunnelName(targetSheet, pagePath) {
  if (targetSheet === 'Анкета передзапису' || pagePath === '/anketa') return 'Анкета передзапису';
  if (targetSheet === 'VSL Форма' || targetSheet === 'Ленд 2' || targetSheet === 'Ленд2' || pagePath === '/free-lection/vsl-form') return 'VSL Анкета (Форма)';
  if (targetSheet === 'VSL 1 етап' || targetSheet === 'Ленд 1' || targetSheet === 'VSL Воронка (старт)' || pagePath === '/free-lection') return 'VSL Воронка (Лекція)';
  if (targetSheet === 'Автовеб' || targetSheet === 'Masterclass_Leads') return 'Майстер-клас';
  if (pagePath === '/practicum') return 'Практикум';
  if (pagePath === '/rozbir' || (targetSheet && targetSheet.includes('розбір'))) return 'Персональний розбір';
  if (pagePath === '/price') return 'Сторінка тарифів';
  return targetSheet || pagePath || '';
}

async function testLeadCommentGeneration() {
  console.log("=== TEST 1: User with Prior Visits across Funnels ===");
  // Test user with history
  const testPhone = '380955745949';
  const { data: historyRecords } = await supabase
    .from("victoria_leads")
    .select("created_at, target_sheet, page_path")
    .or(`phone.eq.${testPhone}`)
    .order("created_at", { ascending: true });

  let previousProductsList = [];
  if (historyRecords && historyRecords.length > 0) {
    const seenKeys = new Set();
    for (const item of historyRecords) {
      const funnelName = resolveProductFunnelName(item.target_sheet, item.page_path);
      if (!funnelName || funnelName === 'Лендінг' || funnelName === '/') continue;

      const formattedDate = formatUkrainianDate(item.created_at);
      const dateDay = formattedDate.split(' ')[0];
      const uniqueKey = `${funnelName}_${dateDay}`;

      if (!seenKeys.has(uniqueKey)) {
        seenKeys.add(uniqueKey);
        previousProductsList.push({
          funnel: funnelName,
          date: formattedDate
        });
      }
    }
  }

  const utms = {
    utm_source: 'fb_ads',
    utm_medium: 'cpc',
    utm_campaign: 'retargeting_vsl',
  };

  const commentLines = [];
  commentLines.push(`Форма: АНКЕТА ПЕРЕДЗАПИСУ`);
  commentLines.push(`Ніша: Психологія`);
  commentLines.push(`Мета: Збільшити дохід`);
  commentLines.push(`Складнощі: Немає системи`);
  commentLines.push(`Готовність: Готовий стартувати`);

  commentLines.push('');
  commentLines.push('UTM-мітки:');
  commentLines.push(`Source: ${utms.utm_source}`);
  commentLines.push(`Medium: ${utms.utm_medium}`);
  commentLines.push(`Campaign: ${utms.utm_campaign}`);

  if (previousProductsList.length > 0) {
    commentLines.push('');
    commentLines.push('Бул(а) на інших продуктах/воронках: Так');
    commentLines.push('Історія відвідувань:');
    previousProductsList.forEach((item) => {
      commentLines.push(`• [${item.date}] ${item.funnel}`);
    });
  }

  const crmCommentWithHistory = commentLines.join('\n');
  console.log("Generated BaseCRM Comment (With History):\n");
  console.log(crmCommentWithHistory);
  console.log("\n" + "=".repeat(60) + "\n");

  console.log("=== TEST 2: Direct Traffic User without Prior History ===");
  const utmsDirect = {
    utm_source: 'direct',
    utm_medium: '-',
    utm_campaign: '-',
  };

  const commentLinesDirect = [];
  commentLinesDirect.push(`Форма: АНКЕТА VSL (ФОРМА)`);
  commentLinesDirect.push(`Ніша: Дизайн`);

  commentLinesDirect.push('');
  commentLinesDirect.push('UTM-мітки:');
  commentLinesDirect.push(`Source: ${utmsDirect.utm_source}`);
  commentLinesDirect.push(`Medium: ${utmsDirect.utm_medium}`);
  commentLinesDirect.push(`Campaign: ${utmsDirect.utm_campaign}`);

  const previousProductsListEmpty = [];
  if (previousProductsListEmpty.length > 0) {
    commentLinesDirect.push('');
    commentLinesDirect.push('Бул(а) на інших продуктах/воронках: Так');
    commentLinesDirect.push('Історія відвідувань:');
    previousProductsListEmpty.forEach((item) => {
      commentLinesDirect.push(`• [${item.date}] ${item.funnel}`);
    });
  }

  const crmCommentDirect = commentLinesDirect.join('\n');
  console.log("Generated BaseCRM Comment (Direct / No History):\n");
  console.log(crmCommentDirect);
  console.log("\n" + "=".repeat(60));
}

testLeadCommentGeneration().catch(console.error);
