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

async function testTable(tableName, projectSlug, payload) {
  console.log(`\nTesting table: ${tableName} (Project: ${projectSlug})`);
  
  const testPhone = '999' + Math.floor(1000000 + Math.random() * 9000000);
  const testEmail = `test_${Math.random().toString(36).substr(2, 9)}@test.com`;
  
  const insertPayload = {
    ...payload,
    phone: testPhone,
    visitor_uuid: '11111111-2222-3333-4444-555555555555',
    utm_source: 'trigger_test',
    utm_campaign: 'trigger_test_campaign',
    raw_payload: { email: testEmail }
  };
  
  // Try inserting
  console.log(`Inserting test record into ${tableName}...`);
  const { data: inserted, error: insertError } = await supabase
    .from(tableName)
    .insert(insertPayload)
    .select('*')
    .single();
    
  if (insertError) {
    console.error(`❌ Insert error for ${tableName}:`, insertError.message);
    return;
  }
  
  console.log(`Inserted successfully. ID: ${inserted.id}`);
  
  // Wait 1.5 seconds for trigger execution
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Search in unified_customers
  const { data: cust, error: custError } = await supabase
    .from('unified_customers')
    .select('*')
    .eq('phone', testPhone)
    .maybeSingle();
    
  if (custError) {
    console.error(`❌ Error querying unified_customers:`, custError.message);
  } else if (cust) {
    console.log(`✅ Found in unified_customers! Project ID: ${cust.project_id}`);
    
    // Search in unified_orders
    const { data: ord, error: ordError } = await supabase
      .from('unified_orders')
      .select('*')
      .eq('customer_id', cust.id)
      .maybeSingle();
      
    if (ordError) {
      console.error(`❌ Error querying unified_orders:`, ordError.message);
    } else if (ord) {
      console.log(`✅ Found in unified_orders! Project ID: ${ord.project_id}, Status: ${ord.status}, Amount: ${ord.amount}`);
    } else {
      console.log(`❌ Not found in unified_orders.`);
    }
  } else {
    console.log(`❌ Not found in unified_customers.`);
  }
  
  // Clean up
  await supabase.from(tableName).delete().eq('id', inserted.id);
  if (cust) {
    await supabase.from('unified_orders').delete().eq('customer_id', cust.id);
    await supabase.from('unified_customers').delete().eq('id', cust.id);
    console.log("Cleaned up test data.");
  }
}

async function run() {
  await testTable('victoria_leads', 'victoria', {
    name: 'Trigger Test Victoria',
    status: 'Зареєстровано',
    amount: 100
  });

  await testTable('svitlana_leads', 'svitlana', {
    name: 'Trigger Test Svitlana',
    status: 'Зареєстровано',
    amount: 150
  });

  await testTable('valeria_leads', 'valeria', {
    name: 'Trigger Test Valeria',
    status: 'Зареєстровано',
    amount: 200
  });

  await testTable('clean_klinom_leads', 'clean_klinom', {
    name: 'Trigger Test Clean Klinom',
    status: 'Зареєстровано',
    amount: 250
  });
}

run().catch(console.error);
