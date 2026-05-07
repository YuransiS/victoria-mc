/**
 * Google Apps Script for the /stvoryui landing page
 * Handles form submissions and WayForPay callbacks
 */

function doPost(e) {
  var lock = LockService.getScriptLock();
  var success = lock.tryLock(10000);
  if (!success) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Lock timeout' }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  try {
    var rawData = e.postData.contents;
    var data = null;
    try {
      if (rawData) {
        data = JSON.parse(rawData);
      }
    } catch (parseError) { }

    if (!data) {
       return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'No data provided' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Security check - Unified and backward compatible
    var API_KEY = "secret_booking_token_2026";
    var providedKey = data.api_key || data.apiKey;
    
    if (providedKey && providedKey !== API_KEY) {
      return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': 'Unauthorized' }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    // Check if it's a WayForPay callback
    if (data.orderReference && data.transactionStatus) {
      return handleWayForPayCallback(data);
    } 
    // Otherwise it's a form submit
    else {
      return handleFormSubmit(data);
    }
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ 'result': 'error', 'error': String(error) }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function handleFormSubmit(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = null;
  
  // 1. Identify Target Sheet
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
  
  if (!sheet) {
      sheet = ss.insertSheet(data.sheetName || 'Ленд 3');
  }

  // 2. Prepare Data Mapping with EXACT Column Order
  var timestamp = Utilities.formatDate(new Date(), "GMT+2", "dd.MM.yyyy HH:mm:ss");
  
  // The exact order requested by user
  var orderedHeaders = [
    'Date', 'Name', 'Phone', 'Social', 'UTM Source', 'UTM Medium', 'UTM Campaign',
    'Difficulties', 'Request', 'Readiness', 'Goal', 'Order ID', 'Niche', 'Price', 'Status', 'UTM Content'
  ];
  
  var processedData = {
    'Date': timestamp,
    'Status': data.status || 'Новий лід (Не оплачено)',
    'Price': data.amount || data.price || ''
  };
  
  if (data.orderId || data['Order ID']) {
      processedData['Order ID'] = data.orderId || data['Order ID'];
  }

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
    
    if (targetKey) {
      if (targetKey === 'Phone' && val && String(val).indexOf('+') !== -1) {
          val = "'" + val; 
      }
      processedData[targetKey] = val;
    }
  }

  // 3. Ensure Headers exist in the requested order
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
      sheet.appendRow(orderedHeaders);
      lastCol = orderedHeaders.length;
  }
  
  var currentHeaders = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  
  // Create final row array matching current sheet headers
  var finalRow = currentHeaders.map(function(h) {
      return processedData[h] !== undefined ? processedData[h] : '';
  });

  sheet.appendRow(finalRow);
  
  return ContentService.createTextOutput(JSON.stringify({ 'result': 'success' }))
    .setMimeType(ContentService.MimeType.JSON);
}

function handleWayForPayCallback(data) {
  const SECRET_KEY = '17addcd05644675231e2fe92b9328a7641dd7553';
  var orderId = data.orderReference;
  var status = data.transactionStatus; 
  var amount = data.amount;
  
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = ss.getSheets();
  var found = false;

  for (var i = 0; i < sheets.length; i++) {
    var sheet = sheets[i];
    var lastRow = sheet.getLastRow();
    var lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) continue;
    
    var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    var orderIdColIdx = headers.indexOf('Order ID');
    var statusColIdx = headers.indexOf('Status');
    
    if (orderIdColIdx === -1) continue;
    if (statusColIdx === -1) {
      sheet.getRange(1, lastCol + 1).setValue('Status');
      statusColIdx = lastCol;
    }

    var orderIdValues = sheet.getRange(2, orderIdColIdx + 1, lastRow - 1, 1).getValues();
    
    for (var r = 0; r < orderIdValues.length; r++) {
      if (orderIdValues[r][0] === orderId || String(orderIdValues[r][0]) === String(orderId)) { 
        if (status === 'Approved') {
          sheet.getRange(r + 2, statusColIdx + 1).setValue('Approved');
        } else {
          sheet.getRange(r + 2, statusColIdx + 1).setValue('Failed (' + status + ')');
        }
        found = true;
        break;
      }
    }
    if (found) break;
  }

  var time = Math.round(new Date().getTime() / 1000);
  var signatureBody = data.orderReference + ';accept;' + time;
  var signatureBytes = Utilities.computeHmacSignature(Utilities.MacAlgorithm.HMAC_MD5, signatureBody, SECRET_KEY);
  var signatureHex = signatureBytes.map(function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
  }).join('');
  
  return ContentService.createTextOutput(JSON.stringify({
    orderReference: data.orderReference,
    status: 'accept',
    time: time,
    signature: signatureHex
  })).setMimeType(ContentService.MimeType.JSON);
}
