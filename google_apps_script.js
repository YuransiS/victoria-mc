function doPost(e) {
  const DEFAULT_SHEET_NAME = "Лиды";
  const TIMEZONE = "Europe/Kiev";
  const TIMESTAMP_FORMAT = "dd.MM.yyyy HH:mm:ss";
  const API_KEY = "secret_booking_token_2026"; 

  try {
    const data = JSON.parse(e.postData.contents);
    if (data.api_key !== API_KEY) return createErrorResponse("Unauthorized");

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet;

    // Support target_sheet_name for auto-creation
    if (data.target_sheet_name) {
      sheet = ss.getSheetByName(data.target_sheet_name);
      if (!sheet) {
        sheet = ss.insertSheet(data.target_sheet_name);
        // Add headers for new sheet
        sheet.appendRow([
          "Дата", "Ім'я", "Телефон", "Source", "Medium", "Campaign", 
          "Content", "Term", "URL", "Тариф", "Сума", "OrderID", "Статус"
        ]);
        sheet.setFrozenRows(1);
      }
    } else if (data.target_sheet_id) {
      const sheets = ss.getSheets();
      sheet = sheets.find(s => s.getSheetId().toString() === data.target_sheet_id.toString());
    }
    
    if (!sheet) sheet = ss.getSheetByName(DEFAULT_SHEET_NAME) || ss.getSheets()[0];

    // Ensure we have OrderID as string
    const order_id = (data.order_id || "").toString().trim();

    const dataRange = sheet.getDataRange().getValues();
    let rowToUpdate = -1;

    // Smart Match: checking column 12 (Index 11) - Only if order_id is provided
    if (order_id) {
      for (let i = 1; i < dataRange.length; i++) {
        let cellValue = (dataRange[i][11] || "").toString().trim();
        if (cellValue === order_id) {
          rowToUpdate = i + 1;
          break;
        }
      }

      // GLOBAL SEARCH FALLBACK: if not found in target sheet, look in ALL sheets
      if (rowToUpdate === -1) {
        const allSheets = ss.getSheets();
        for (let s = 0; s < allSheets.length; s++) {
          const currentSheet = allSheets[s];
          if (currentSheet.getName() === sheet.getName()) continue;
          
          const currentRange = currentSheet.getDataRange().getValues();
          for (let i = 1; i < currentRange.length; i++) {
            let cellValue = (currentRange[i][11] || "").toString().trim();
            if (cellValue === order_id) {
              sheet = currentSheet; // Important: update sheet reference for the actual update call
              rowToUpdate = i + 1;
              break;
            }
          }
          if (rowToUpdate !== -1) break;
        }
      }
    }

    if (rowToUpdate !== -1) {
      // UPDATE: Found existing lead
      if (data.status) {
        sheet.getRange(rowToUpdate, 13).setValue(data.status);
      }
      return createSuccessResponse("Status updated for " + order_id);
    } else {
      // ONLY APPEND IF IT'S A NEW LEAD (containing name/phone)
      if (data.name || data.phone) {
        const now = new Date();
        const timestamp = Utilities.formatDate(now, TIMEZONE, TIMESTAMP_FORMAT);
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
          data.status || (order_id ? "Pending" : "")
        ]);
        return createSuccessResponse("New lead logged");
      } else {
        // It was a callback, but we couldn't find the lead. 
        // We log error but don't add garbage row.
        return createSuccessResponse("OrderID not found, skipping ghost row");
      }
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
