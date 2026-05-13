/**
 * Backup Script (Legacy)
 * Simple logging of leads as a secondary storage
 */

function doGet(e) {
  return ContentService.createTextOutput("Backup script active").setMimeType(ContentService.MimeType.TEXT);
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000);
  if (!success) return createJsonResponse({status: "error", message: "Lock timeout"});

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var action = data.action;

    // Only basic update actions for backup
    if (action === 'update_status') return updateLeadField(data, "status");
    if (action === 'update_comment') return updateLeadField(data, "comment");

    // Standard form submission
    return handleFormSubmit(data);
  } catch (error) {
    return createJsonResponse({status: "error", error: String(error)});
  } finally {
    lock.releaseLock();
  }
}

function handleFormSubmit(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var rawSheetName = data.sheetName || data.target_sheet || 'Backup_Leads';
  var sheet = ss.getSheetByName(rawSheetName) || ss.insertSheet(rawSheetName);
  
  var timestamp = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");
  
  // Basic backup header if new
  if (sheet.getLastColumn() === 0) {
    sheet.appendRow(["Date", "Name", "Phone", "Social", "Source", "Medium", "Campaign", "Tariff", "Amount", "OrderID", "Status", "UUID"]);
    sheet.setFrozenRows(1);
  }

  var row = [
    timestamp,
    data.name || data.customerName || "",
    data.phone || data.customerPhone || "",
    data.telegram || data.social || "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || "",
    data.tariff || data.tariffName || "",
    data.amount || "",
    data.orderId || data.orderReference || "",
    data.status || "New",
    data.UUID || ""
  ];
  
  sheet.appendRow(row);
  return createJsonResponse({status: "success", message: "Backup saved"});
}

function updateLeadField(data, fieldType) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderId = (data.orderId || data.orderReference || "").toString().trim();
  if (!orderId) return createJsonResponse({status: "error", message: "No ID"});

  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var dataRange = sheet.getDataRange().getValues();
    var headers = dataRange[0];
    var idIdx = headers.indexOf('OrderID');
    if (idIdx === -1) idIdx = headers.indexOf('Order ID');
    
    if (idIdx === -1) continue;

    for (var i = 1; i < dataRange.length; i++) {
      if (String(dataRange[i][idIdx]).trim() === orderId) {
        var colIdx = -1;
        if (fieldType === "status") colIdx = headers.indexOf('Status');
        if (colIdx !== -1) {
          sheet.getRange(i + 1, colIdx + 1).setValue(data.status);
          return createJsonResponse({status: "success"});
        }
      }
    }
  }
  return createJsonResponse({status: "error", message: "Not found"});
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
