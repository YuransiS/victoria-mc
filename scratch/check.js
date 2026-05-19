const url = "https://script.google.com/macros/s/AKfycbxjsrlWjzaSoy9MP31BVXwjcpmUoMW0AwtV46E6itWN4dsrK5wSlKAsRMRzcrHb1Uc4/exec";

async function main() {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'get_admin_data',
      api_key: 'secret_booking_token_2026'
    })
  });
  const data = await res.json();
  
  console.log("Total leads fetched:", data.leads.length);
  
  // Let's see how many leads have empty phone/name or don't have 'traff'
  let emptyNameOrPhone = 0;
  let traffLeads = 0;
  let nonTraffLeads = 0;
  
  data.leads.forEach(l => {
    const name = (l.name || '').toString().trim();
    const phone = (l.phone || '').toString().trim();
    const utm = (l.utm_source || '').toString().toLowerCase().trim();
    
    if (!name && !phone) {
      emptyNameOrPhone++;
    }
    
    if (utm.includes('traff')) {
      traffLeads++;
    } else {
      nonTraffLeads++;
    }
  });
  
  console.log("Leads with completely empty name AND phone:", emptyNameOrPhone);
  console.log("Leads with 'traff' in utm_source:", traffLeads);
  console.log("Leads without 'traff' in utm_source:", nonTraffLeads);
  
  // Let's print some leads where name/phone are empty
  const emptyLeads = data.leads.filter(l => !(l.name || '').toString().trim() && !(l.phone || '').toString().trim());
  console.log("\nSample empty leads:", JSON.stringify(emptyLeads.slice(0, 5), null, 2));

  // Let's check date strings formats in leads
  const dateFormats = {};
  data.leads.forEach(l => {
    const dStr = (l.date || l["Дата та час"] || l["Дата"] || l.created_at || '').toString();
    const match = dStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    const format = match ? "DD.MM.YYYY" : (dStr.includes('T') ? "ISO" : "Other");
    dateFormats[format] = (dateFormats[format] || 0) + 1;
  });
  console.log("\nLead Date Formats:", dateFormats);
  
  const trafficDateFormats = {};
  data.traffic.forEach(t => {
    const dStr = (t.date || '').toString();
    const match = dStr.match(/^(\d{2})\.(\d{2})\.(\d{4})/);
    const format = match ? "DD.MM.YYYY" : (dStr.includes('T') ? "ISO" : "Other");
    trafficDateFormats[format] = (trafficDateFormats[format] || 0) + 1;
  });
  console.log("Traffic Date Formats:", trafficDateFormats);
}

main().catch(console.error);
