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
  console.log("Fetching yesterday's leads (July 20, 2026) with filled details...");
  const { data: leads, error } = await supabase
    .from('victoria_leads')
    .select('created_at, name, phone, status, target_sheet, amount, order_id, page_path')
    .order('created_at', { ascending: false })
    .limit(300);

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  const realLeads = (leads || []).filter(l => {
    const isQa = (l.name && l.name.startsWith('QA ')) || 
                 (l.phone && l.phone.startsWith('380990000')) ||
                 (l.name && l.name.includes('QA'));
    if (isQa) return false;
    
    // Only yesterday (2026-07-20)
    const dateStr = new Date(l.created_at).toISOString();
    if (!dateStr.startsWith('2026-07-21')) return false;

    // Only those with details filled
    return l.name || l.phone;
  });

  console.log(`\nFound ${realLeads.length} Real Leads with details yesterday:`);
  console.log("=".repeat(120));
  console.log(
    "Created At".padEnd(25) + 
    "Name".padEnd(20) + 
    "Phone".padEnd(15) + 
    "Status".padEnd(22) + 
    "Target Sheet".padEnd(20) + 
    "Amount"
  );
  console.log("=".repeat(120));

  realLeads.forEach(l => {
    console.log(
      new Date(l.created_at).toLocaleString().padEnd(25) +
      String(l.name || '-').substring(0, 18).padEnd(20) +
      String(l.phone || '-').substring(0, 14).padEnd(15) +
      String(l.status || '-').substring(0, 20).padEnd(22) +
      String(l.target_sheet || '-').substring(0, 18).padEnd(20) +
      String(l.amount || '0')
    );
  });
  console.log("=".repeat(120));
}

check().catch(console.error);
