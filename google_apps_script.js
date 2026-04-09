function doPost(e) {
  const DEFAULT_SHEET_NAME = "Лиды";
  const TIMEZONE = "Europe/Kiev";
  const TIMESTAMP_FORMAT = "dd.MM.yyyy HH:mm:ss";
  const API_KEY = "secret_booking_token_2026"; 

  try {
    const data = JSON.parse(e.postData.contents);
    
    if (data.api_key !== API_KEY) {
      return createErrorResponse("Unauthorized access");
    }

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;
    
    if (data.target_sheet_id) {
      const sheets = ss.getSheets();
      sheet = sheets.find(s => s.getSheetId().toString() === data.target_sheet_id.toString());
    }
    if (!sheet) sheet = ss.getSheetByName(DEFAULT_SHEET_NAME) || ss.getSheets()[0];

    const now = new Date();
    const timestamp = Utilities.formatDate(now, TIMEZONE, TIMESTAMP_FORMAT);
    const order_id = data.order_id || "";

    // 1. Search for existing order
    let rowToUpdate = -1;
    if (order_id) {
      const dataRange = sheet.getDataRange().getValues();
      for (let i = 1; i < dataRange.length; i++) {
        // OrderID is in Col 12 (Index 11)
        if (dataRange[i][11] === order_id) {
          rowToUpdate = i + 1;
          break;
        }
      }
    }

    if (rowToUpdate !== -1) {
      // 2. UPDATE existing row (Col 13 for Status)
      if (data.status) {
        sheet.getRange(rowToUpdate, 13).setValue(data.status);
      }
      return createSuccessResponse("Status updated for " + order_id);
    } else {
      // 3. APPEND new lead
      sheet.appendRow([
        timestamp,
        data.name || "",
        data.phone || "",
        data.utm_source || "",
        data.utm_medium || "",
        data.utm_campaign || "",
        data.utm_content || "",
        data.utm_term || "",
        data.full_url || "",
        data.tariff || "",
        data.amount || "",
        order_id,
        data.status || "Pending" // Col 13
      ]);
      return createSuccessResponse("New lead added");
    }

  } catch (error) {
    return createErrorResponse(error.message);
  }
}

function createSuccessResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({status: "success", message: message}))
    .setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({status: "error", message: message}))
    .setMimeType(ContentService.MimeType.JSON);
}
