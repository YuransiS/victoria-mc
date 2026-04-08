function doPost(e) {
  // Config
  const MAIN_SHEET_NAME = "Лиды"; // or use the first sheet by default
  const TIMEZONE = "Europe/Kiev";
  const TIMESTAMP_FORMAT = "dd.MM.yyyy HH:mm:ss";

  try {
    // Open active spreadsheet
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(MAIN_SHEET_NAME);
    if (!sheet) {
      // Fallback to first sheet or create new
      sheet = ss.getSheets()[0];
    }

    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    const name = data.name || "";
    const phone = data.phone || "";

    // UTM parameters
    const utm_source = data.utm_source || "";
    const utm_medium = data.utm_medium || "";
    const utm_campaign = data.utm_campaign || "";
    const utm_content = data.utm_content || "";
    const utm_term = data.utm_term || "";
    const full_url = data.full_url || "";

    // Create timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, TIMEZONE, TIMESTAMP_FORMAT);

    // Append row: Date, Name, Phone, Source, Medium, Campaign, Content, Term, URL
    sheet.appendRow([
      timestamp,
      name,
      phone,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      full_url
    ]);

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      message: "Data successfully written to sheet"
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.message
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// In order to configure CORS preflight (OPTIONS)
function doOptions(e) {
  return ContentService.createTextOutput(JSON.stringify({ "status": "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}
