const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
if (!fs.existsSync(envPath)) {
  console.error("Missing .env.local file");
  process.exit(1);
}
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

function getLast8Digits(phone) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 8) return null;
  return digits.slice(-8);
}

async function fetchAll(tableName) {
  let allData = [];
  let from = 0;
  const limit = 1000;
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + limit - 1)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
    if (error) throw error;
    if (!data || data.length === 0) break;
    allData = allData.concat(data);
    if (data.length < limit) break;
    from += limit;
  }
  return allData;
}

async function healCustomers() {
  const isExecute = process.argv.includes('--execute');
  console.log(isExecute ? "=== EXECUTION MODE ===" : "=== DRY RUN MODE ===");

  console.log("Fetching all unified_customers...");
  const customers = await fetchAll('unified_customers');
  console.log(`Loaded ${customers.length} customers.`);

  console.log("Fetching all victoria_leads...");
  const leads = await fetchAll('victoria_leads');
  console.log(`Loaded ${leads.length} leads.`);

  // Group leads by last 8 digits of phone
  const leadsByPhone = new Map();
  leads.forEach(lead => {
    const last8 = getLast8Digits(lead.phone || lead.raw_payload?.phone);
    if (!last8) return;
    if (!leadsByPhone.has(last8)) {
      leadsByPhone.set(last8, []);
    }
    leadsByPhone.get(last8).push(lead);
  });

  let updatedCount = 0;

  for (const customer of customers) {
    const last8 = getLast8Digits(customer.phone);
    if (!last8) continue;

    const matchingLeads = leadsByPhone.get(last8) || [];
    if (matchingLeads.length === 0) continue;

    // Find the best values from matching leads
    let bestName = customer.name || '';
    let bestTelegram = customer.telegram || '';
    let bestEmail = customer.email || '';

    matchingLeads.forEach(lead => {
      const leadName = lead.name || '';
      const leadTg = lead.social || lead.raw_payload?.social || lead.raw_payload?.telegram || '';
      const leadEmail = lead.raw_payload?.email || '';

      if (leadName.length > bestName.length) {
        bestName = leadName;
      }
      if (leadTg && (!bestTelegram || (leadTg.startsWith('@') && !bestTelegram.startsWith('@')) || leadTg.length > bestTelegram.length)) {
        bestTelegram = leadTg;
      }
      if (leadEmail.length > bestEmail.length) {
        bestEmail = leadEmail;
      }
    });

    // Check if we need to update
    const needsNameUpdate = bestName && bestName !== customer.name;
    const needsTgUpdate = bestTelegram && bestTelegram !== customer.telegram;
    const needsEmailUpdate = bestEmail && bestEmail !== customer.email;

    if (needsNameUpdate || needsTgUpdate || needsEmailUpdate) {
      updatedCount++;
      const updates = {};
      if (needsNameUpdate) updates.name = bestName;
      if (needsTgUpdate) updates.telegram = bestTelegram;
      if (needsEmailUpdate) updates.email = bestEmail;

      console.log(`\nCustomer ID: ${customer.id} (Phone: ${customer.phone}):`);
      if (needsNameUpdate) console.log(`  Name: "${customer.name || ''}" -> "${bestName}"`);
      if (needsTgUpdate) console.log(`  Telegram: "${customer.telegram || ''}" -> "${bestTelegram}"`);
      if (needsEmailUpdate) console.log(`  Email: "${customer.email || ''}" -> "${bestEmail}"`);

      if (isExecute) {
        const { error: updateError } = await supabase
          .from('unified_customers')
          .update(updates)
          .eq('id', customer.id);
        
        if (updateError) {
          console.error(`  Error updating customer ${customer.id}:`, updateError);
        } else {
          console.log(`  Successfully updated profile.`);
        }
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`Total customer profiles needing enrichment: ${updatedCount}`);
  if (!isExecute) {
    console.log("\n💡 Run with --execute to apply changes: node tests/heal_customers.js --execute");
  }
}

healCustomers().catch(console.error);
