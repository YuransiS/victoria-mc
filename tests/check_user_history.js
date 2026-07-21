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

async function check() {
  const searchPhone = '522585558244';
  console.log(`Searching history for phone: ${searchPhone}...`);
  const { data, error } = await supabase
    .from('victoria_leads')
    .select('*')
    .ilike('phone', `%${searchPhone}%`)
    .order('created_at', { ascending: true });

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Found ${data.length} records:`);
  data.forEach((r, idx) => {
    console.log(`[#${idx+1}] Created: ${new Date(r.created_at).toLocaleString()}, Status: ${r.status}, Path: ${r.page_path}, Amount: ${r.amount}, Target: ${r.target_sheet || '-'}`);
  });
}

check().catch(console.error);
