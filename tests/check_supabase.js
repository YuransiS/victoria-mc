const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually to get Supabase credentials
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

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase configuration in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkLeads() {
  console.log('🔍 Querying Supabase for recent test records...');
  
  const { data, error } = await supabase
    .from('victoria_leads')
    .select('id, created_at, name, phone, social, amount, status, target_sheet, visitor_uuid, utm_source, utm_campaign, page_path')
    .eq('utm_campaign', 'all-landings-coverage')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads from Supabase:', error);
    return;
  }

  console.log(`\n🎉 Found ${data.length} test records matching 'all-landings-coverage':\n`);
  data.forEach((lead, index) => {
    console.log(`[Record #${index + 1}]`);
    console.log(`  Created At:   ${lead.created_at}`);
    console.log(`  Name:         ${lead.name}`);
    console.log(`  Phone:        ${lead.phone}`);
    console.log(`  Social:       ${lead.social}`);
    console.log(`  Amount:       ${lead.amount} UAH`);
    console.log(`  Status:       ${lead.status}`);
    console.log(`  Target Sheet: ${lead.target_sheet}`);
    console.log(`  Path Visited: ${lead.page_path}`);
    console.log(`  Visitor UUID: ${lead.visitor_uuid}`);
    console.log('------------------------------------------------------');
  });
}

checkLeads().catch(console.error);
