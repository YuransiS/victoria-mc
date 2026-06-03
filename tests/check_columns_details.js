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
  console.log("Checking columns and sample data of unified_customers...");
  const { data: cust, error: custErr } = await supabase.from('unified_customers').select('*').limit(1);
  if (custErr) console.error(custErr);
  else console.log("unified_customers columns:", Object.keys(cust[0] || {}));

  console.log("\nChecking columns and sample data of unified_orders...");
  const { data: ord, error: ordErr } = await supabase.from('unified_orders').select('*').limit(1);
  if (ordErr) console.error(ordErr);
  else console.log("unified_orders columns:", Object.keys(ord[0] || {}));
}

check().catch(console.error);
