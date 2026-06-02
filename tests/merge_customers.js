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

async function fetchAllCustomers() {
  let allCustomers = [];
  let from = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from('unified_customers')
      .select('*')
      .range(from, from + limit - 1)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
      
    if (error) throw error;
    if (!data || data.length === 0) break;
    
    allCustomers = allCustomers.concat(data);
    if (data.length < limit) break;
    from += limit;
  }
  return allCustomers;
}

async function mergeCustomers() {
  const isExecute = process.argv.includes('--execute');
  console.log(isExecute ? "=== EXECUTION MODE ===" : "=== DRY RUN MODE ===");

  console.log("Fetching all unified_customers...");
  let customers;
  try {
    customers = await fetchAllCustomers();
  } catch (custError) {
    console.error("Error fetching customers:", custError);
    return;
  }

  console.log(`Fetched ${customers.length} customer profiles.`);

  // Group customers by last 8 digits of phone
  const groups = new Map();
  customers.forEach(c => {
    const last8 = getLast8Digits(c.phone);
    if (!last8) return;

    if (!groups.has(last8)) {
      groups.set(last8, []);
    }
    groups.get(last8).push(c);
  });

  let duplicateGroupsCount = 0;
  let totalDuplicatesCount = 0;

  for (const [last8, list] of groups.entries()) {
    if (list.length > 1) {
      duplicateGroupsCount++;
      totalDuplicatesCount += (list.length - 1);
      
      const primary = list[0]; // oldest is primary
      const duplicates = list.slice(1);
      
      console.log(`\nGroup for last 8 digits [${last8}] (${list.length} profiles):`);
      console.log(`  🟢 Primary: ID=${primary.id}, Name=${primary.name || '-'}, Phone=${primary.phone}, Created=${primary.created_at}`);
      
      for (const dup of duplicates) {
        console.log(`  🔴 Duplicate: ID=${dup.id}, Name=${dup.name || '-'}, Phone=${dup.phone}, Created=${dup.created_at}`);
        
        if (isExecute) {
          // 1. Update unified_orders to point to primary customer
          const { error: ordersError } = await supabase
            .from('unified_orders')
            .update({ customer_id: primary.id })
            .eq('customer_id', dup.id);
            
          if (ordersError) {
            console.error(`     Error updating orders for duplicate ${dup.id}:`, ordersError);
          } else {
            console.log(`     Updated orders to point to primary.`);
          }
          
          // 2. Delete duplicate from unified_customers
          const { error: delError } = await supabase
            .from('unified_customers')
            .delete()
            .eq('id', dup.id);
            
          if (delError) {
            console.error(`     Error deleting duplicate customer profile ${dup.id}:`, delError);
          } else {
            console.log(`     Deleted duplicate customer profile.`);
          }
        }
      }
    }
  }

  console.log(`\nSummary:`);
  console.log(`Total duplicate phone groups: ${duplicateGroupsCount}`);
  console.log(`Total duplicate profiles to merge: ${totalDuplicatesCount}`);

  if (!isExecute) {
    console.log("\n💡 Run with --execute flag to merge and delete duplicates: node tests/merge_customers.js --execute");
  }
}

mergeCustomers().catch(console.error);
