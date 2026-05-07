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
    } catch (parseError) {}

    // Check if it's a WayForPay callback
    if (data && data.orderReference && data.transactionStatus) {
      return handleWayForPayCallback(data);
    } 
    // Otherwise it's a form submit
    else {
      return handleFormSubmit(data || {});
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
      var targetSheetName = data.sheetName || data.target_sheet || 'Ленд 3';
      sheet = ss.insertSheet(targetSheetName);
  }

  var defaultHeaders = ['Date', 'Order ID', 'Status'];
  var timestamp = Utilities.formatDate(new Date(), "GMT+2", "dd.MM.yyyy HH:mm:ss");
  
  var lastCol = sheet.getLastColumn();
  if (lastCol === 0) {
      sheet.appendRow(defaultHeaders);
      lastCol = defaultHeaders.length;
  }
  
  var headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  var initialHeaderCount = headers.length;
  
  var ensureHeader = function(name) {
      var idx = headers.indexOf(name);
      if (idx === -1) {
          headers.push(name);
          return headers.length - 1;
      }
      return idx;
  };

  var excludeKeys = ['gid', 'sheet_id', 'target_sheet', 'sheetName'];
  
  var processedData = {
    'Date': timestamp,
    'Status': data.status || 'Новий лід (Не оплачено)'
  };
  
  if (data.orderId || data['Order ID']) {
      processedData['Order ID'] = data.orderId || data['Order ID'];
  }

  for (var key in data) {
    if (excludeKeys.indexOf(key) !== -1) continue;
    if (key === 'status' || key === 'orderId' || key === 'Order ID' || key === 'Date') continue;
    
    var displayKey = key;
    if (key === 'name' || key === 'imya') displayKey = 'Name';
    else if (key === 'phone' || key === 'phone_raw') displayKey = 'Phone';
    else if (key === 'social') displayKey = 'Social';
    else if (key === 'niche') displayKey = 'Niche';
    else if (key === 'amount') displayKey = 'Price';
    else if (key === 'difficulties') displayKey = 'Difficulties';
    else if (key === 'goal') displayKey = 'Goal';
    else if (key === 'instagram') displayKey = 'Instagram';
    else if (key === 'tg_nick') displayKey = 'TG Nick';
    else if (key === 'participation_type') displayKey = 'Participation Type';
    else if (key === 'country') displayKey = 'Country';
    else if (key === 'utm_source') displayKey = 'UTM Source';
    else if (key === 'utm_medium') displayKey = 'UTM Medium';
    else if (key === 'utm_campaign') displayKey = 'UTM Campaign';
    else if (key === 'utm_content') displayKey = 'UTM Content';

    var val = data[key];
    if (displayKey === 'Phone' && val && String(val).indexOf('+') !== -1) {
        val = "'" + val; 
    }
    processedData[displayKey] = val;
  }
  
  for (var key in processedData) {
      ensureHeader(key);
  }
  
  if (headers.length > initialHeaderCount) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  var rowData = new Array(headers.length).fill('');
  for (var key in processedData) {
      var colIdx = headers.indexOf(key);
      if (colIdx !== -1) {
          rowData[colIdx] = processedData[key];
      }
  }

  sheet.appendRow(rowData);
  
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
      headers.push('Status');
      statusColIdx = headers.length - 1;
      sheet.getRange(1, statusColIdx + 1).setValue('Status');
    }
    var priceColIdx = headers.indexOf('Price');
    if (priceColIdx === -1) {
      headers.push('Price');
      priceColIdx = headers.length - 1;
      sheet.getRange(1, priceColIdx + 1).setValue('Price');
    }

    var orderIdValues = sheet.getRange(2, orderIdColIdx + 1, lastRow - 1, 1).getValues();
    
    for (var r = 0; r < orderIdValues.length; r++) {
      if (orderIdValues[r][0] === orderId || String(orderIdValues[r][0]) === String(orderId)) { 
        if (status === 'Approved') {
          sheet.getRange(r + 2, statusColIdx + 1).setValue('Оплачено');
          if (amount) {
            sheet.getRange(r + 2, priceColIdx + 1).setValue(amount);
          }
        } else {
          sheet.getRange(r + 2, statusColIdx + 1).setValue('Помилка оплати (' + status + ')');
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
  
  var responsePayload = {
    orderReference: data.orderReference,
    status: 'accept',
    time: time,
    signature: signatureHex
  };

  return ContentService.createTextOutput(JSON.stringify(responsePayload))
    .setMimeType(ContentService.MimeType.JSON);
}
