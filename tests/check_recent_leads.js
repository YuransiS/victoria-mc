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
  console.log("Fetching all Approved leads from victoria_leads...");
  const { data: leads, error } = await supabase
    .from('victoria_leads')
    .select('created_at, name, phone, status, target_sheet, amount, order_id, page_url, utm_source, utm_medium, utm_campaign, utm_content')
    .eq('status', 'Approved')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    return;
  }

  if (!leads || leads.length === 0) {
    console.log("No approved leads found.");
    return;
  }

  console.log(`\nFound ${leads.length} Approved Leads:`);
  console.log("=".repeat(160));
  console.log(
    "Created At".padEnd(22) + 
    "Name".padEnd(15) + 
    "Phone".padEnd(15) + 
    "Amount".padEnd(8) + 
    "Source".padEnd(15) + 
    "Medium".padEnd(15) + 
    "Campaign".padEnd(15) + 
    "Content".padEnd(20) +
    "Page URL"
  );
  console.log("=".repeat(160));

  leads.forEach(l => {
    console.log(
      new Date(l.created_at).toLocaleString().padEnd(22) +
      String(l.name || '-').substring(0, 13).padEnd(15) +
      String(l.phone || '-').substring(0, 14).padEnd(15) +
      String(l.amount || '0').padEnd(8) +
      String(l.utm_source || '-').substring(0, 14).padEnd(15) +
      String(l.utm_medium || '-').substring(0, 14).padEnd(15) +
      String(l.utm_campaign || '-').substring(0, 14).padEnd(15) +
      String(l.utm_content || '-').substring(0, 18).padEnd(20) +
      String(l.page_url || '-')
    );
  });
  console.log("=".repeat(160));
}

check().catch(console.error);
