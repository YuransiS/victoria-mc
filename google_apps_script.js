/**
 * Unified CRM Script for Victoria MC
 * Handles: Lead logging, Status/Comment updates, Traffic logging, and Data aggregation
 */

function doGet(e) {
  const API_KEY = "secret_booking_token_2026";
  if (e.parameter.api_key !== API_KEY) return createErrorResponse("Unauthorized");
  
  var action = e.parameter.action;
  if (action === 'get_admin_data') {
    return getAdminData();
  }
  
  return createErrorResponse("Invalid action");
}

function doPost(e) {
  const API_KEY = "secret_booking_token_2026";
  
  try {
    const data = JSON.parse(e.postData.contents);
    const providedKey = data.api_key || data.apiKey;
    
    if (providedKey !== API_KEY) return createErrorResponse("Unauthorized");

    const action = data.action;

    if (action === 'get_admin_data') return getAdminData();
    if (action === 'log_traffic') return logTraffic(data);
    if (action === 'update_status') return updateLeadField(data, "status");
    if (action === 'update_comment') return updateLeadField(data, "comment");
    if (action === 'update_global_user') return updateGlobalUser(data);
    if (action === 'update_payment_status') return updatePaymentStatus(data);

    return handleLegacyLeadLogging(data);

  } catch (error) {
    try {
      const ss = SpreadsheetApp.getActiveSpreadsheet();
      let errSheet = ss.getSheetByName("Errors") || ss.insertSheet("Errors");
      errSheet.appendRow([new Date(), "doPost Error", error.message, error.stack]);
    } catch(e) {}
    return createErrorResponse(error.message);
  }
}

function normalizePhone(phone) {
  if (!phone) return "";
  return phone.toString().replace(/\D/g, "");
}

function normalizeTg(tg) {
  if (!tg) return "";
  let val = tg.toString().trim().toLowerCase();
  if (val.startsWith("http")) {
    const parts = val.split("/");
    val = parts[parts.length - 1];
  }
  if (val.startsWith("@")) val = val.substring(1);
  return val;
}

function getOrCreateUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Global_Users");
  if (!sheet) {
    sheet = ss.insertSheet("Global_Users");
    sheet.appendRow(["UUID", "Created", "LastActive", "Name", "Phones", "Telegrams", "VisitorIDs", "Comment", "Sales_Status"]);
    sheet.setFrozenRows(1);
  }

  const p = normalizePhone(data.phone || data.Телефон || data["Телефон"]);
  const tg = normalizeTg(data.telegram || data.Telegram || data.Телеграм || data.social);
  const vid = (data.visitorId || data.visitor_id || "").toString().trim();
  const name = (data.name || data["Ім'я"] || data.fio || "").toString().trim();

  if (!p && !tg && !vid) {
    return Utilities.getUuid();
  }

  const rangeData = sheet.getDataRange().getValues();
  let matchedRowIndex = -1;
  let matchedUser = null;

  for (let i = 1; i < rangeData.length; i++) {
    const row = rangeData[i];
    const rPhones = (row[4] || "").toString().split(",").filter(Boolean);
    const rTgs = (row[5] || "").toString().split(",").filter(Boolean);
    const rVids = (row[6] || "").toString().split(",").filter(Boolean);

    let match = false;
    if (p && rPhones.includes(p)) match = true;
    if (tg && rTgs.includes(tg)) match = true;
    if (vid && rVids.includes(vid)) match = true;

    if (match) {
      matchedRowIndex = i;
      matchedUser = row;
      break;
    }
  }

  const now = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");

  if (matchedRowIndex !== -1) {
    let newPhones = new Set((matchedUser[4] || "").toString().split(",").filter(Boolean));
    let newTgs = new Set((matchedUser[5] || "").toString().split(",").filter(Boolean));
    let newVids = new Set((matchedUser[6] || "").toString().split(",").filter(Boolean));

    let updated = false;
    if (p && !newPhones.has(p)) { newPhones.add(p); updated = true; }
    if (tg && !newTgs.has(tg)) { newTgs.add(tg); updated = true; }
    if (vid && !newVids.has(vid)) { newVids.add(vid); updated = true; }
    
    let newName = matchedUser[3] || name;
    if (name && !matchedUser[3]) updated = true;

    sheet.getRange(matchedRowIndex + 1, 3).setValue(now); 
    
    if (updated) {
      sheet.getRange(matchedRowIndex + 1, 4).setValue(newName);
      sheet.getRange(matchedRowIndex + 1, 5).setValue(Array.from(newPhones).join(","));
      sheet.getRange(matchedRowIndex + 1, 6).setValue(Array.from(newTgs).join(","));
      sheet.getRange(matchedRowIndex + 1, 7).setValue(Array.from(newVids).join(","));
    }
    return matchedUser[0];
  } else {
    const uuid = Utilities.getUuid();
    sheet.appendRow([uuid, now, now, name, p, tg, vid, "", "Новий"]);
    return uuid;
  }
}

function logGlobalAction(uuid, actionType, source, data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Global_Actions");
  if (!sheet) {
    sheet = ss.insertSheet("Global_Actions");
    sheet.appendRow(["UUID", "Timestamp", "Action", "Source", "Amount", "Status", "Details"]);
    sheet.setFrozenRows(1);
  }
  const now = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");
  
  let safeData = {};
  for(let key in data) {
     if(typeof data[key] === 'string' || typeof data[key] === 'number') {
         safeData[key] = data[key];
     }
  }
  sheet.appendRow([uuid, now, actionType, source || "", data.amount || "", data.status || data.transactionStatus || "", JSON.stringify(safeData)]);
}

function logTraffic(data) {
  const uuid = getOrCreateUser(data);
  logGlobalAction(uuid, "Traffic", data.path || "Website", data);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName("Traffic");
  if (!sheet) {
    sheet = ss.insertSheet("Traffic");
    sheet.appendRow(["Дата та час", "Visitor ID", "Шлях", "IP", "User Agent", "UTM Source", "UTM Medium", "UTM Campaign", "UUID"]);
    sheet.setFrozenRows(1);
  }
  
  const timestamp = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");
  
  sheet.appendRow([
    timestamp,
    data.visitorId || "",
    data.path || "",
    data.ip || "",
    data.userAgent || "",
    data.utm_source || "",
    data.utm_medium || "",
    data.utm_campaign || "",
    uuid
  ]);
  
  return createSuccessResponse("Traffic logged");
}

function handleLegacyLeadLogging(data) {
  // Safeguard: Don't log "ghost" leads that have no identifying info
  const hasIdentity = data.name || data.phone || data.telegram || data.social || data.orderId || data.order_id || data.orderReference || data["Ім'я"] || data["Телефон"];
  if (!hasIdentity) {
    return createSuccessResponse("Ignored empty lead");
  }

  const uuid = getOrCreateUser(data);
  data.UUID = uuid;
  
  const rawSheetName = data.sheetName || data.target_sheet_name || data.target_sheet || data.sheet_name;
  const targetGid = data.sheet_id || data.gid || data.target_sheet_id;
  
  logGlobalAction(uuid, "Lead", rawSheetName || targetGid || "Unknown", data);

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet;

  // Try to find by GID first if provided
  if (targetGid) {
    const allSheets = ss.getSheets();
    for (let i = 0; i < allSheets.length; i++) {
      if (allSheets[i].getSheetId().toString() === targetGid.toString()) {
        sheet = allSheets[i];
        break;
      }
    }
  }

  // Fallback to searching by name
  if (!sheet && rawSheetName) {
    sheet = ss.getSheetByName(rawSheetName);
    if (!sheet) {
      sheet = ss.insertSheet(rawSheetName);
      if (rawSheetName === 'VSL 1 етап') {
        sheet.appendRow(["Дата", "Ім'я", "Телефон", "Social", "Source", "Medium", "Campaign", "Content", "Term", "UUID"]);
      } else if (rawSheetName === 'VSL Форма') {
        sheet.appendRow(["Дата", "Ім'я", "Телефон", "Social", "Ніша", "Source", "Medium", "Campaign", "Content", "Term", "OrderID", "UUID"]);
      } else if (rawSheetName === 'Практикум' || rawSheetName === 'Бронювання') {
        sheet.appendRow(["Дата", "Ім'я", "Телефон", "Telegram", "Source", "Medium", "Campaign", "Content", "Term", "URL", "Тариф", "Сума", "OrderID", "Статус", "Коментар", "UUID", "TG_Msg_ID"]);
      } else {
        sheet.appendRow(["Дата", "Ім'я", "Телефон", "Telegram", "Source", "Medium", "Campaign", "UUID", "RawData"]);
      }
      sheet.setFrozenRows(1);
    }
  }
  if (!sheet) {
    sheet = ss.getSheetByName("Unsorted_Leads") || ss.insertSheet("Unsorted_Leads");
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(["Дата", "Ім'я", "Телефон", "Telegram", "Source", "Medium", "Campaign", "UUID", "RawData"]);
      sheet.setFrozenRows(1);
    }
  }
  
  const currentSheetName = sheet.getName();
  const orderId = (data.order_id || data.orderId || data.orderReference || "").toString().trim();
  const dataRange = sheet.getDataRange().getValues();
  const headers = dataRange[0];
  
  let orderIdIdx = -1;
  let statusIdx = -1;
  headers.forEach((h, i) => {
    const lowH = h.toString().toLowerCase();
    if (lowH.includes("orderid") || lowH.includes("номер замовлення") || lowH.includes("номер заказу")) orderIdIdx = i;
    if (lowH.includes("статус")) statusIdx = i;
  });

  let rowToUpdate = -1;
  let foundTgMsgId = "";
  
  // Search for the order in ALL sheets to be sure, and capture TG_Msg_ID
  const sheets = ss.getSheets();
  for (let s = 0; s < sheets.length; s++) {
    const currentSheet = sheets[s];
    const sheetName = currentSheet.getName();
    if (sheetName === "System_Logs" || sheetName === "Errors") continue;
    
    const dataRange = currentSheet.getDataRange().getValues();
    const headers = dataRange[0];
    let orderIdIdx = -1, statusIdx = -1, tgMsgIdIdx = -1;
    
    headers.forEach((h, i) => {
      const lowH = h.toString().toLowerCase().trim();
      if (lowH.includes("orderid") || lowH.includes("номер замовлення")) orderIdIdx = i;
      if (lowH.includes("статус")) statusIdx = i;
      if (lowH === "tg_msg_id" || lowH === "tg msg id") tgMsgIdIdx = i;
    });
    
    if (orderIdIdx === -1) continue;
    
    for (let i = 1; i < dataRange.length; i++) {
      if ((dataRange[i][orderIdIdx] || "").toString().trim() === orderId) {
        if (statusIdx !== -1) {
          const finalStatus = formatStatus(data.status || data.transactionStatus, sheetName, data.amount);
          currentSheet.getRange(i + 1, statusIdx + 1).setValue(finalStatus);
          rowToUpdate = i + 1;
        }
        if (tgMsgIdIdx !== -1) {
          const msgIdVal = (dataRange[i][tgMsgIdIdx] || "").toString().trim();
          if (msgIdVal) foundTgMsgId = msgIdVal;
        }
      }
    }
  }

  if (rowToUpdate !== -1) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "success", 
      message: "Status updated", 
      tg_msg_id: foundTgMsgId,
      uuid: uuid
    })).setMimeType(ContentService.MimeType.JSON);
  }
  
  const timestamp = Utilities.formatDate(new Date(), "Europe/Kiev", "dd.MM.yyyy HH:mm:ss");
  const isFreeLection = (currentSheetName === 'VSL 1 етап' || String(targetGid) === '43961418');

  const headerMap = {
    "дата": timestamp, "date": timestamp,
    "ім'я": data.name || "", "name": data.name || "",
    "телефон": data.phone || "", "phone": data.phone || "",
    "telegram": data.social || data.telegram || "", "social": data.social || data.telegram || "",
    "source": data.utm_source || "", "utm source": data.utm_source || "", "utm_source": data.utm_source || "",
    "medium": data.utm_medium || "", "utm medium": data.utm_medium || "", "utm_medium": data.utm_medium || "",
    "campaign": data.utm_campaign || "", "utm campaign": data.utm_campaign || "", "utm_campaign": data.utm_campaign || "",
    "content": data.utm_content || "", "utm content": data.utm_content || "", "utm_content": data.utm_content || "",
    "term": data.utm_term || "", "utm term": data.utm_term || "", "utm_term": data.utm_term || "",
    "url": data.full_url || data.url || "",
    "ніша": data.niche || "", "niche": data.niche || "",
    "тариф": data.tariff || "", "сума": data.amount || "", "ціна": data.amount || "",
    "orderid": orderId, "номер заказу": orderId, "номер замовлення": orderId,
    "статус": isFreeLection ? "" : formatStatus(data.status || data.transactionStatus || "", rawSheetName, data.amount),
    "uuid": uuid,
    "tg_msg_id": data.tg_msg_id || ""
  };

  const newRow = new Array(headers.length).fill("");
  for (let i = 0; i < headers.length; i++) {
    const h = (headers[i] || "").toString().toLowerCase().trim();
    for (const [key, val] of Object.entries(headerMap)) {
      if (h.includes(key) || h === key) {
        if (!newRow[i] && val) newRow[i] = val;
      }
    }
  }
  
  sheet.appendRow(newRow);
  return ContentService.createTextOutput(JSON.stringify({status: "success", result: "success", message: "New legacy lead logged", uuid: uuid})).setMimeType(ContentService.MimeType.JSON);
}

function updateLeadField(data, fieldType) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const targetSheetName = data.targetSheet || data.target_sheet || data.target_sheet_name || data.sheetName || data.sheet_name;
  const orderId = (data.orderId || data.order_id || data.orderReference || "").toString().trim();
  
  if (!orderId) return createErrorResponse("No OrderID provided");
  
  let sheet = ss.getSheetByName(targetSheetName);
  let sheetsToSearch = sheet ? [sheet] : ss.getSheets();
  
  let found = false;
  let uuid = "";
  
  for (let s = 0; s < sheetsToSearch.length; s++) {
    const currentSheet = sheetsToSearch[s];
    const dataRange = currentSheet.getDataRange().getValues();
    const headers = dataRange[0];
    
    let orderIdIdx = -1, statusIdx = -1, commentIdx = -1, uuidIdx = -1;
    headers.forEach((h, i) => {
      const lowH = h.toString().toLowerCase();
      if (lowH.includes("orderid") || lowH.includes("номер замовлення") || lowH.includes("visitor id")) orderIdIdx = i;
      if (lowH.includes("статус")) statusIdx = i;
      if (lowH.includes("коментар") || lowH.includes("comment")) commentIdx = i;
      if (lowH === "uuid") uuidIdx = i;
    });
    
    if (orderIdIdx === -1) continue;
    
    for (let i = 1; i < dataRange.length; i++) {
      if ((dataRange[i][orderIdIdx] || "").toString().trim() === orderId) {
        if(uuidIdx !== -1) uuid = dataRange[i][uuidIdx];
        
        if (fieldType === "status" && statusIdx !== -1) {
          const finalStatus = formatStatus(data.status, currentSheet.getName());
          currentSheet.getRange(i + 1, statusIdx + 1).setValue(finalStatus);
          found = true;
        } else if (fieldType === "comment") {
          if (commentIdx !== -1) {
             currentSheet.getRange(i + 1, commentIdx + 1).setValue(data.comment);
             found = true;
          }
        }
        if (found) break;
      }
    }
    if (found) break;
  }
  
  if(found) {
     if(uuid) logGlobalAction(uuid, fieldType === "status" ? "Status Update" : "Comment Update", targetSheetName, data);
     return createSuccessResponse("Field updated");
  }
  return createErrorResponse("Lead not found");
}

function updateGlobalUser(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const uuid = (data.uuid || "").toString().trim();
  if (!uuid) return createErrorResponse("No UUID provided");

  let sheet = ss.getSheetByName("Global_Users");
  if (!sheet) return createErrorResponse("No Global_Users sheet");

  const dataRange = sheet.getDataRange().getValues();
  const headers = dataRange[0];
  
  let salesStatusIdx = -1, commentIdx = -1;
  headers.forEach((h, i) => {
    const lowH = h.toString().toLowerCase();
    if (lowH === "sales_status" || lowH === "статус продажів") salesStatusIdx = i;
    if (lowH === "comment" || lowH === "коментар") commentIdx = i;
  });

  // If column doesn't exist, create it
  if (salesStatusIdx === -1) {
    salesStatusIdx = headers.length;
    sheet.getRange(1, salesStatusIdx + 1).setValue("Sales_Status");
  }
  
  for (let i = 1; i < dataRange.length; i++) {
    if (dataRange[i][0].toString().trim() === uuid) {
      if (data.sales_status !== undefined) {
        sheet.getRange(i + 1, salesStatusIdx + 1).setValue(data.sales_status);
        logGlobalAction(uuid, "Kanban Update", "Admin", {sales_status: data.sales_status});
      }
      if (data.comment !== undefined && commentIdx !== -1) {
        sheet.getRange(i + 1, commentIdx + 1).setValue(data.comment);
        logGlobalAction(uuid, "Global Comment Update", "Admin", {comment: data.comment});
      }
      return createSuccessResponse("Global User updated");
    }
  }
  return createErrorResponse("User not found");
}

function getAdminData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let result = {
    global_users: [],
    global_actions: [],
    leads: [],
    traffic: []
  };
  
  let usersSheet = ss.getSheetByName("Global_Users");
  if (usersSheet) {
    const data = usersSheet.getDataRange().getValues();
    if(data.length > 1) {
       const headers = data[0];
       for(let i=1; i<data.length; i++) {
          let obj = {};
          headers.forEach((h, j) => { obj[h] = data[i][j]; });
          result.global_users.push(obj);
       }
    }
  }

  let actionsSheet = ss.getSheetByName("Global_Actions");
  if (actionsSheet) {
    const data = actionsSheet.getDataRange().getValues();
    if(data.length > 1) {
       const headers = data[0];
       for(let i=1; i<data.length; i++) {
          let obj = {};
          headers.forEach((h, j) => { obj[h] = data[i][j]; });
          result.global_actions.push(obj);
       }
    }
  }

  const headerMap = {
    "дата": "date", "дата та час": "date", "час": "date",
    "ім'я": "name", "имя": "name", "fio": "name", "фіо": "name", "name": "name",
    "телефон": "phone", "тел": "phone", "phone": "phone",
    "телеграм": "telegram", "telegram": "telegram", "тг": "telegram", "social": "telegram",
    "тариф": "tariff", "пакет": "tariff", "tariff": "tariff",
    "номер замовлення": "orderId", "номер заказу": "orderId", "orderid": "orderId",
    "статус оплати": "status", "статус": "status", "status": "status",
    "visitor id": "visitorId", "visitor_id": "visitorId",
    "коментар": "comment", "comment": "comment",
    "сума": "amount", "цена": "amount", "ціна": "amount", "amount": "amount",
    "utm source": "utm_source", "source": "utm_source",
    "utm medium": "utm_medium", "medium": "utm_medium",
    "utm campaign": "utm_campaign", "campaign": "utm_campaign",
    "utm content": "utm_content", "content": "utm_content",
    "utm term": "utm_term", "term": "utm_term",
    "niche": "niche", "ніша": "niche",
    "uuid": "UUID"
  };

  const sheets = ss.getSheets();
  sheets.forEach(function(s) {
    const name = s.getName();
    if (name === "System_Logs" || name === "Errors" || name === "Global_Users" || name === "Global_Actions") return;
    
    const data = s.getDataRange().getValues();
    if (data.length < 1) return;
    
    const headers = data[0];
    
    if (name === "Traffic" || name === "Traffic_Logs") {
      const startRow = Math.max(1, data.length - 1000);
      for (let i = startRow; i < data.length; i++) {
        let obj = {};
        headers.forEach((h, j) => {
          const hStr = (h || "").toString().toLowerCase().trim();
          const key = headerMap[hStr] || hStr;
          if (key) obj[key] = data[i][j];
        });
        if (obj.visitorId || obj.path || obj.UUID) result.traffic.push(obj);
      }
    } else {
      for (let i = 1; i < data.length; i++) {
        let obj = { _sheet: name, _originalData: {} };
        let isTest = false;
        headers.forEach((h, j) => {
          const val = (data[i][j] || "").toString().toLowerCase();
          if (val.includes("тест") || val.includes("test")) isTest = true;

          const hStr = (h || "").toString().toLowerCase().trim();
          const key = headerMap[hStr] || hStr;
          if (key) obj[key] = data[i][j];
          obj._originalData[h] = data[i][j];
        });
        
        // Fix Anonymous: ensure name has a value if some identifying info exists
        if (!isTest && (obj.phone || obj.name || obj.telegram || obj.orderId || obj.UUID)) {
          if (!obj.name || obj.name.toString().trim() === "") {
            obj.name = obj.phone || obj.telegram || obj.orderId || "Анонім";
          }
          result.leads.push(obj);
        }
      }
    }
  });
  
  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function updatePaymentStatus(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const orderId = (data.orderId || data.order_id || data.orderReference || "").toString().trim();
  if (!orderId) return createErrorResponse("No OrderID provided");

  const sheets = ss.getSheets();
  let found = false;
  let uuid = "";
  let foundTgMsgId = "";
  
  for (let s = 0; s < sheets.length; s++) {
    const currentSheet = sheets[s];
    const name = currentSheet.getName();
    if (name === "System_Logs" || name === "Errors" || name === "Global_Users" || name === "Global_Actions" || name === "Traffic") continue;
    
    const dataRange = currentSheet.getDataRange().getValues();
    const headers = dataRange[0];
    
    let orderIdIdx = -1, statusIdx = -1, uuidIdx = -1, tgMsgIdIdx = -1;
    headers.forEach((h, i) => {
      const lowH = h.toString().toLowerCase().trim();
      if (lowH.includes("orderid") || lowH.includes("номер замовлення") || lowH.includes("visitor id")) orderIdIdx = i;
      if (lowH.includes("статус")) statusIdx = i;
      if (lowH === "uuid") uuidIdx = i;
      if (lowH === "tg_msg_id" || lowH === "tg msg id") tgMsgIdIdx = i;
    });
    
    if (orderIdIdx === -1) continue;
    
    for (let i = 1; i < dataRange.length; i++) {
      if ((dataRange[i][orderIdIdx] || "").toString().trim() === orderId) {
        if (statusIdx !== -1) {
          const finalStatus = formatStatus(data.status, name, data.amount);
          currentSheet.getRange(i + 1, statusIdx + 1).setValue(finalStatus);
          found = true;
        }
        if (uuidIdx !== -1 && !uuid) uuid = dataRange[i][uuidIdx];
        
        // Only capture TG_Msg_ID if we don't have one yet, or if this one is not empty
        if (tgMsgIdIdx !== -1) {
          const msgIdVal = (dataRange[i][tgMsgIdIdx] || "").toString().trim();
          if (msgIdVal) foundTgMsgId = msgIdVal;
        }
      }
    }
    // We don't break the outer loop anymore because we want to update status in ALL sheets (backups etc)
  }
  
  if (found) {
     if (uuid) logGlobalAction(uuid, "Payment Update", "System", { orderId: orderId, status: data.status });
  }
  
  if (found) return ContentService.createTextOutput(JSON.stringify({status: "success", result: "success", message: "Payment status updated", tg_msg_id: foundTgMsgId})).setMimeType(ContentService.MimeType.JSON);
  return createErrorResponse("Lead with OrderID not found");
}

/**
 * Maps payment status to human-readable format based on product type
 */
function formatStatus(status, sheetName, amount) {
  if (!status) return "";
  const s = status.toString().toUpperCase();
  const amt = parseFloat(amount) || 0;
  
  // Successful payment detection - must have APPROVED and NOT have DECLINED/FAIL
  const isApproved = s.includes("APPROVED") || s.includes("SETTLED") || s.includes("SUCCESS");
  const isError = s.includes("DECLINED") || s.includes("FAIL") || s.includes("ERROR") || s.includes("REJECT");
  
  const isPaid = isApproved && !isError;
  
  if (isPaid) {
    if (sheetName === "Практикум") return "Купив(-ла) трипвайєр";
    if (amt === 9 || amt === 39) return "Купив(-ла) трипвайєр";
    return "Оплачено " + amt + " USD (" + sheetName + ")";
  }
  
  if (s.includes("PENDING") || s.includes("ОЧІКУЄ")) return "⏳ Очікується оплата";
  
  return status; 
}

function createSuccessResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({status: "success", result: "success", message: message})).setMimeType(ContentService.MimeType.JSON);
}

function createErrorResponse(message) {
  return ContentService.createTextOutput(JSON.stringify({status: "error", result: "error", message: message})).setMimeType(ContentService.MimeType.JSON);
}
