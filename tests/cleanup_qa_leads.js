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

async function cleanup() {
  console.log("Cleaning up QA test leads from victoria_leads...");
  
  // 1. Delete by utm_source
  const { data: d1, error: e1 } = await supabase
    .from('victoria_leads')
    .delete()
    .eq('utm_source', 'qa-test')
    .select('id, name');

  if (e1) console.error("Error deleting by utm_source:", e1);
  else console.log(`Deleted ${d1 ? d1.length : 0} leads with utm_source='qa-test'`);

  // 2. Delete by name containing 'QA'
  const { data: d2, error: e2 } = await supabase
    .from('victoria_leads')
    .delete()
    .ilike('name', '%QA%')
    .select('id, name');

  if (e2) console.error("Error deleting by name:", e2);
  else console.log(`Deleted ${d2 ? d2.length : 0} leads with name containing 'QA'`);

  // 3. Delete by phone
  const { data: d3, error: e3 } = await supabase
    .from('victoria_leads')
    .delete()
    .eq('phone', '380631111111')
    .select('id, name');

  if (e3) console.error("Error deleting by phone:", e3);
  else console.log(`Deleted ${d3 ? d3.length : 0} leads with phone='380631111111'`);
}

cleanup().catch(console.error);
