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

async function cleanTable(tableName, criteriaFunc) {
  console.log(`\n🔍 Fetching all records from ${tableName}...`);
  
  let records = [];
  let from = 0;
  const limit = 1000;
  
  while (true) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + limit - 1)
      .order('created_at', { ascending: true })
      .order('id', { ascending: true });
      
    if (error) {
      console.error(`Error fetching from ${tableName}:`, error);
      return;
    }
    
    if (!data || data.length === 0) break;
    
    records = records.concat(data);
    if (data.length < limit) break;
    from += limit;
  }

  console.log(`Fetched ${records.length} records from ${tableName}.`);

  const duplicates = [];
  const seen = new Set();

  records.forEach(record => {
    const key = criteriaFunc(record);
    if (!key) return;

    if (seen.has(key)) {
      duplicates.push(record.id);
    } else {
      seen.add(key);
    }
  });

  console.log(`Found ${duplicates.length} duplicate records in ${tableName}.`);

  if (duplicates.length > 0) {
    if (process.argv.includes('--execute')) {
      console.log(`Deleting ${duplicates.length} duplicates from ${tableName}...`);
      for (let i = 0; i < duplicates.length; i += 100) {
        const batch = duplicates.slice(i, i + 100);
        const { error: delError } = await supabase
          .from(tableName)
          .delete()
          .in('id', batch);
        if (delError) {
          console.error(`Error deleting batch from ${tableName}:`, delError);
        } else {
          console.log(`Deleted batch ${Math.floor(i / 100) + 1} from ${tableName}`);
        }
      }
    } else {
      console.log(`[DRY RUN] Would delete ${duplicates.length} duplicates from ${tableName}.`);
    }
  }
}

async function run() {
  const isExecute = process.argv.includes('--execute');
  if (!isExecute) {
    console.log("=== DRY RUN MODE ===");
  } else {
    console.log("=== EXECUTION MODE ===");
  }

  // 1. Deduplicate victoria_leads
  await cleanTable('victoria_leads', (record) => {
    if (!record.created_at) return null;
    const dateSec = new Date(record.created_at).toISOString().slice(0, 19); // YYYY-MM-DDTHH:mm:ss
    const identifier = record.phone || record.visitor_uuid || '';
    if (!identifier) return null;
    return `${identifier}_${record.status}_${dateSec}`;
  });

  // 2. Deduplicate unified_orders
  await cleanTable('unified_orders', (record) => {
    if (!record.created_at) return null;
    const dateSec = new Date(record.created_at).toISOString().slice(0, 19);
    const identifier = record.customer_id || record.visitor_uuid || '';
    if (!identifier) return null;
    return `${identifier}_${record.status}_${dateSec}`;
  });

  if (!isExecute) {
    console.log("\n💡 To execute deletion, run: node tests/deduplicate.js --execute");
  }
}

run().catch(console.error);
