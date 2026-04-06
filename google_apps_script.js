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
      // Falback to first sheet or create new
      sheet = ss.getSheets()[0];
    }
    
    // Parse incoming data
    const data = JSON.parse(e.postData.contents);
    const name = data.name || "";
    const phone = data.phone || "";
    const telegram = data.telegram || "";
    
    // Create timestamp
    const now = new Date();
    const timestamp = Utilities.formatDate(now, TIMEZONE, TIMESTAMP_FORMAT);
    
    // Append row
    sheet.appendRow([timestamp, name, phone, telegram]);
    
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
  return ContentService.createTextOutput(JSON.stringify({"status": "ok"}))
    .setMimeType(ContentService.MimeType.JSON);
}
