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

async function test() {
  const { data: sheets } = await supabase
    .from('victoria_leads')
    .select('target_sheet')
    .not('target_sheet', 'is', null);

  const sheetCounts = {};
  sheets.forEach(s => {
    sheetCounts[s.target_sheet] = (sheetCounts[s.target_sheet] || 0) + 1;
  });
  console.log('Distinct target_sheet counts:', sheetCounts);

  const { data: paths } = await supabase
    .from('victoria_leads')
    .select('page_path')
    .not('page_path', 'is', null);

  const pathCounts = {};
  paths.forEach(p => {
    if (p.page_path) pathCounts[p.page_path] = (pathCounts[p.page_path] || 0) + 1;
  });
  console.log('Distinct page_path counts:', pathCounts);
}

test().catch(console.error);
