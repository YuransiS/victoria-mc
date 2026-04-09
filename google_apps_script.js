function doPost(e) {
  // Config
  const DEFAULT_SHEET_NAME = "Лиды";
  const TIMEZONE = "Europe/Kiev";
  const TIMESTAMP_FORMAT = "dd.MM.yyyy HH:mm:ss";
  
  // Basic security: Check for API Key if you want to restrict access
  // Define this in your script properties or hardcode here
  const API_KEY = "secret_booking_token_2026"; 

  try {
    const data = JSON.parse(e.postData.contents);
    
    // Security check
    if (data.api_key !== API_KEY) {
      return createErrorResponse("Unauthorized access");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;

    // Support targeting by sheetId (gid)
    if (data.target_sheet_id) {
      const sheets = ss.getSheets();
      sheet = sheets.find(s => s.getSheetId().toString() === data.target_sheet_id.toString());
    }
    
    // Fallback to sheet name
    if (!sheet && data.target_sheet_name) {
      sheet = ss.getSheetByName(data.target_sheet_name);
    }

    // Ultimate fallback
    if (!sheet) {
      sheet = ss.getSheetByName(DEFAULT_SHEET_NAME) || ss.getSheets()[0];
    }

    // Prepare data
    const name = data.name || "";
    const phone = data.phone || "";
    const tariff = data.tariff || "";
    const amount = data.amount || "";
    const order_id = data.order_id || ""; // To link with payments
    const utm_source = data.utm_source || "";
    const utm_medium = data.utm_medium || "";
    const utm_campaign = data.utm_campaign || "";
    const utm_content = data.utm_content || "";
    const utm_term = data.utm_term || "";
    const full_url = data.full_url || "";

    const now = new Date();
    const timestamp = Utilities.formatDate(now, TIMEZONE, TIMESTAMP_FORMAT);

    // Dynamic columns to avoid shifting: 
    // Date, Name, Phone, Source, Medium, Campaign, Content, Term, URL, Tariff, Amount, OrderID
    sheet.appendRow([
      timestamp,
      name,
      phone,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      full_url,
      tariff,
      amount,
      order_id
    ]);

    return createSuccessResponse("Data successfully written to sheet: " + sheet.getName());

  } catch (error) {
    return createErrorResponse(error.message);
  }
}

function createSuccessResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "success",
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "error",
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// CORS preflight (OPTIONS)
function doOptions(e) {
  return ContentService.createTextOutput(JSON.stringify({ "status": "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
