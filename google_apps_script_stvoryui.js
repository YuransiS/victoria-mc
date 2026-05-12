/**
 * Google Apps Script for the /stvoryui landing page
 * Handles form submissions, WayForPay callbacks, and CRM Dashboard actions
 */

function doGet(e) {
  var API_KEY = "secret_booking_token_2026";
  if (e.parameter.api_key !== API_KEY) return createErrorResponse("Unauthorized");
  
  var action = e.parameter.action;
  if (action === 'get_admin_data') {
    return getAdminData();
  }
  return createErrorResponse("Invalid action");
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000);
  if (!success) {
    return createErrorResponse("Lock timeout");
  }

  try {
    var rawData = e.postData.contents;
    var data = null;
    try {
      if (rawData) data = JSON.parse(rawData);
    } catch (parseError) { }

    if (!data) return createErrorResponse("No data provided");

    // Security check
    var API_KEY = "secret_booking_token_2026";
    var providedKey = data.api_key || data.apiKey;
    if (providedKey !== API_KEY) return createErrorResponse("Unauthorized");

    var action = data.action;

    // 1. CRM Dashboard Actions
    if (action === 'get_admin_data') return getAdminData();
    if (action === 'log_traffic') return logTraffic(data);
    if (action === 'update_status') return updateLeadField(data, "status");
    if (action === 'update_comment') return updateLeadField(data, "comment");

    // 2. Original Logic
    // Check if it's a WayForPay callback
    if (data.orderReference && data.transactionStatus) {
      return handleWayForPayCallback(data);
    } 
    // Otherwise it's a form submit
    else {
      return handleFormSubmit(data);
    }
  } catch (error) {
    try {
      var ss = SpreadsheetApp.getActiveSpreadsheet();
      var errSheet = ss.getSheetByName("Errors") || ss.insertSheet("Errors");
      errSheet.appendRow([new Date(), "doPost Error", error.message || String(error), error.stack || ""]);
    } catch(e) {}
    return createErrorResponse(String(error));
  } finally {
    lock.releaseLock();
  }
}

/**
 * Logs traffic data to "Traffic" sheet
 */
function logTraffic(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Traffic") || ss.insertSheet("Traffic");
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Дата та час", "Visitor ID", "Шлях", "IP", "User Agent", "UTM Source", "UTM Medium", "UTM Campaign"]);
    sheet.setFrozenRows(1);
  }
  sheet.appendRow([
    Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss"),
    data.visitorId || "",
    data.path || "",
    data.ip || "",
    data.userAgent || "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || ""
  ]);
  return createSuccessResponse("Traffic logged");
}

/**
 * Aggregates leads and traffic for dashboard with normalization
 */
function getAdminData() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var result = {
    leads: [],
    traffic: []
  };
  
  // Header normalization map from Economica project
  var headerMap = {
    "дата": "date", "дата та час": "date", "час": "date",
    "ім'я": "name", "имя": "name", "fio": "name", "фіо": "name", "name": "name", "f.i.o": "name",
    "телефон": "phone", "номер телефона": "phone", "тел": "phone", "mob": "phone", "phone": "phone", "phone_raw": "phone", "контакт": "phone",
    "телеграм": "telegram", "telegram": "telegram", "телега": "telegram", "тг": "telegram", "social": "telegram", "инста": "telegram", "інста": "telegram",
    "тариф": "tariff", "пакет": "tariff", "tariff": "tariff", "план": "tariff",
    "номер замовлення": "orderId", "номер заказу": "orderId", "id замовлення": "orderId", "order id": "orderId", "order_id": "orderId", "orderreference": "orderId", "visitor id": "orderId", "номер заказу": "orderId",
    "статус оплати": "status", "статус": "status", "статус броні": "status", "status": "status", "transactionstatus": "status",
    "visitor id": "visitorId", "visitor_id": "visitorId", "visitorid": "visitorId",
    "customer journey": "journey", "journey": "journey",
    "коментар": "comment", "комментарий": "comment", "comment": "comment", "заметка": "comment",
    "сума": "amount", "цена": "amount", "ціна": "amount", "amount": "amount", "price": "amount",
    "utm source": "utm_source", "utm_source": "utm_source", "source": "utm_source",
    "utm medium": "utm_medium", "utm_medium": "utm_medium", "medium": "utm_medium",
    "utm campaign": "utm_campaign", "utm_campaign": "utm_campaign", "campaign": "utm_campaign",
    "utm content": "utm_content", "utm_content": "utm_content", "content": "utm_content",
    "utm term": "utm_term", "utm_term": "utm_term", "term": "utm_term",
    "niche": "niche", "ніша": "niche", "ниша": "niche",
    "difficulties": "difficulties", "труднощі": "difficulties",
    "request": "request", "запит": "request",
    "goal": "goal", "ціль": "goal",
    "variant_name": "variant", "social": "telegram", "socials": "telegram"
  };

  var sheets = ss.getSheets();
  sheets.forEach(function(s) {
    var name = s.getName();
    if (name === "System_Logs" || name === "Errors") return;
    
    var data = s.getDataRange().getValues();
    if (data.length < 1) return;
    
    var headers = data[0];
    
    if (name === "Traffic" || name === "Traffic_Logs") {
      var startRow = Math.max(1, data.length - 1000); 
      for (var i = startRow; i < data.length; i++) {
        var obj = {};
        headers.forEach((h, j) => {
          var hStr = (h || "").toString().toLowerCase().trim();
          var key = headerMap[hStr] || hStr;
          if (key) obj[key] = data[i][j];
        });
        if (obj.visitorId || obj.path) result.traffic.push(obj);
      }
    } else {
      for (var i = 1; i < data.length; i++) {
        var obj = { _sheet: name, _originalData: {} };
        var isTest = false;
        headers.forEach((h, j) => {
          var val = (data[i][j] || "").toString().toLowerCase();
          if (val.includes("тест") || val.includes("test")) isTest = true;

          var hStr = (h || "").toString().toLowerCase().trim();
          var key = headerMap[hStr] || hStr;
          if (key) obj[key] = data[i][j];
          obj._originalData[h] = data[i][j];
        });
        
        if (!isTest && (obj.phone || obj.name || obj.telegram || obj.orderId || obj.visitorId)) {
          result.leads.push(obj);
        }
      }
    }
  });
  
  return createJsonResponse(result);
}

/**
 * Updates status or comment in stvoryui spreadsheet
 */
function updateLeadField(data, fieldType) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var orderId = (data.orderId || "").toString().trim();
  if (!orderId) return createErrorResponse("No ID");

  var found = false;
  var sheets = ss.getSheets();
  for (var s = 0; s < sheets.length; s++) {
    var sheet = sheets[s];
    var dataRange = sheet.getDataRange().getValues();
    var headers = dataRange[0];
    
    var idIdx = headers.indexOf('Order ID');
    if (idIdx === -1) idIdx = headers.indexOf('Visitor ID');
    
    var statusIdx = headers.indexOf('Status');
    var commentIdx = headers.indexOf('Коментар');
    if (commentIdx === -1) commentIdx = headers.indexOf('Comment');

    if (idIdx === -1) continue;

    for (var i = 1; i < dataRange.length; i++) {
      if (String(dataRange[i][idIdx]).trim() === orderId) {
        if (fieldType === "status" && statusIdx !== -1) {
          sheet.getRange(i + 1, statusIdx + 1).setValue(data.status);
          found = true;
        } else if (fieldType === "comment") {
          if (commentIdx === -1) {
            sheet.getRange(1, headers.length + 1).setValue("Коментар");
            commentIdx = headers.length;
          }
          sheet.getRange(i + 1, commentIdx + 1).setValue(data.comment);
          found = true;
        }
        if (found) break;
      }
    }
    if (found) break;
  }
  return found ? createSuccessResponse("Updated") : createErrorResponse("Not found");
}

function handleFormSubmit(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = null;
  
  var targetGid = data.gid || data.sheet_id;
  if (!targetGid) {
    var rawSheetName = data.sheetName || data.target_sheet;
    if (rawSheetName === 'Ленд 1') targetGid = 487619472;
    else if (rawSheetName === 'Ленд2' || rawSheetName === 'Ленд 2') targetGid = 960636096;
    else if (rawSheetName === 'Ленд 3') targetGid = 1631121908;
  }
  
  if (targetGid) {
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
        if (sheets[i].getSheetId().toString() === targetGid.toString()) {
            sheet = sheets[i];
            break;
        }
    }
  }

  if (!sheet) {
      var targetSheetName = data.sheetName || data.target_sheet || 'Ленд 3';
      sheet = ss.getSheetByName(targetSheetName);
  }
  
  if (!sheet) sheet = ss.insertSheet(data.sheetName || 'Ленд 3');

  var timestamp = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");
  var sheetName = sheet.getName();
  var rawSheetName = data.sheetName || data.target_sheet;
  var isFreeLection = (rawSheetName === 'Ленд 1' || String(targetGid) === '487619472');

  var orderedHeaders = ['Date', 'Name', 'Phone', 'Social', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'Difficulties', 'Request', 'Readiness', 'Goal', 'Order ID', 'Niche', 'Price', 'Status', 'UTM Content'];
  if (sheetName === 'Ленд 2') {
    orderedHeaders = ['Date', 'Name', 'Phone', 'Social', 'UTM Source', 'UTM Medium', 'UTM Campaign', ' ', 'Difficulties', 'Request', 'Readiness', 'Goal', 'Order ID', 'Niche', 'Price', 'Status', 'UTM Content'];
  } else if (isFreeLection) {
    orderedHeaders = ['Date', 'Name', 'Phone', 'Social', 'UTM Source', 'UTM Medium', 'UTM Campaign', 'UTM Content', 'utm_term', 'Status'];
  }

  var processedData = { 
    'Date': timestamp,
    'Status': data.status || (isFreeLection ? 'Новий' : 'Новий лід (Не оплачено)'),
    'Price': data.amount || data.price || '',
    ' ': ''
  };
  
  if (data.orderId || data['Order ID']) processedData['Order ID'] = data.orderId || data['Order ID'];

  for (var key in data) {
    var lowKey = key.toLowerCase();
    var val = data[key];
    var targetKey = '';
    
    if (lowKey === 'name' || lowKey === 'imya') targetKey = "Name";
    else if (lowKey === 'phone' || lowKey === 'phone_raw') targetKey = 'Phone';
    else if (lowKey === 'social' || lowKey === 'instagram') targetKey = 'Social';
    else if (lowKey === 'niche') targetKey = 'Niche';
    else if (lowKey === 'difficulties') targetKey = 'Difficulties';
    else if (lowKey === 'request') targetKey = 'Request';
    else if (lowKey === 'readiness') targetKey = 'Readiness';
    else if (lowKey === 'goal') targetKey = 'Goal';
    else if (lowKey === 'utm_source') targetKey = 'UTM Source';
    else if (lowKey === 'utm_medium') targetKey = 'UTM Medium';
    else if (lowKey === 'utm_campaign') targetKey = 'UTM Campaign';
    else if (lowKey === 'utm_content') targetKey = 'UTM Content';
    else if (lowKey === 'utm_term') targetKey = 'utm_term';
    
    if (targetKey) {
      if (targetKey === 'Phone' && val && String(val).indexOf('+') !== -1) val = "'" + val; 
      processedData[targetKey] = val;
    }
  }

  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
      sheet.appendRow(orderedHeaders);
      lastCol = orderedHeaders.length;
  }
  var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var finalRow = currentHeaders.map(function(h) { return processedData[h] !== undefined ? processedData[h] : ''; });
  sheet.appendRow(finalRow);
  
  return createSuccessResponse("Lead logged");
}

function handleWayForPayCallback(data) {
  const SECRET_KEY = '17addcd05644675231e2fe92b9328a7641dd7553';
  var orderId = data.orderReference;
  var status = data.transactionStatus; 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var found = false;

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) continue;
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var idIdx = headers.indexOf('Order ID');
    var statusIdx = headers.indexOf('Status');
    if (idIdx === -1) continue;
    if (statusIdx === -1) {
      sheet.getRange(1, lastCol + 1).setValue('Status');
      statusIdx = lastCol;
    }
    var idValues = sheet.getRange(2, idIdx + 1, lastRow - 1, 1).getValues();
    for (var r = 0; r < idValues.length; r++) {
      if (String(idValues[r][0]) === String(orderId)) { 
        sheet.getRange(r + 2, statusIdx + 1).setValue(status === 'Approved' ? 'Approved' : 'Failed (' + status + ')');
        found = true;
        break;
      }
    }
    if (found) break;
  }

  var time = Math.round(new Date().getTime() / 1000);
  var signatureBody = data.orderReference + ';accept;' + time;
  var signatureBytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_MD5, signatureBody, SECRET_KEY);
  var signatureHex = signatureBytes.map(function(byte) { return ('0' + (byte & 0xFF).toString(16)).slice(-2); }).join('');
  return createJsonResponse({ orderReference: data.orderReference, status: 'accept', time: time, signature: signatureHex });
}

function createSuccessResponse(msg) { return createJsonResponse({ result: 'success', status: 'success', message: msg }); }
function createErrorResponse(err) { return createJsonResponse({ result: 'error', status: 'error', error: err }); }
function createJsonResponse(obj) { return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON); }
