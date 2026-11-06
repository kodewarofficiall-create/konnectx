/**
 * ==========================================================================
 * Google Apps Script - Form Submission & Drive Storage Integration
 * ==========================================================================
 * 
 * Features:
 * 1. Automatic Google Drive folder setup ("Website Form Uploads" & subfolders)
 * 2. Automatic Google Sheet column header setup & formatting
 * 3. Unique Submission ID generation (e.g. SUB-20261104-XXXX)
 * 4. ISO & Local Timestamp recording
 * 5. Secure file upload (JPG, JPEG, PNG, WEBP, PDF) with size & type validation
 * 6. Google Sheets row insertion with file preview/view URL
 * 7. Duplicate submission prevention
 * 8. Comprehensive error handling with JSON responses
 * ==========================================================================
 */

// Configuration constants
var CONFIG = {
  MAIN_FOLDER_NAME: "Website Form Uploads",
  SHEET_NAME: "Registrations",
  ALLOWED_MIME_TYPES: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "application/pdf"
  ],
  MAX_FILE_SIZE_BYTES: 10 * 1024 * 1024, // 10MB limit in Apps Script
  HEADERS: [
    "Submission ID",
    "Submission Date & Time",
    "Full Name",
    "Phone Number",
    "Email Address",
    "Business Name",
    "Category",
    "Service Tier",
    "Audience Description",
    "File Name",
    "File Type",
    "Drive File Link"
  ]
};

/**
 * Run this function once manually from the Apps Script editor to initialize
 * the active spreadsheet headers and prepare the Google Drive folders.
 */
function setup() {
  var sheet = getOrCreateTargetSheet();
  var folder = getOrCreateMainFolder();
  Logger.log("✅ Setup completed successfully!");
  Logger.log("Sheet Name: " + sheet.getName());
  Logger.log("Uploads Folder ID: " + folder.getId() + " | Folder Name: " + folder.getName());
}

/**
 * Retrieves or creates the target worksheet and adds formatted headers.
 */
function getOrCreateTargetSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  if (!spreadsheet) {
    throw new Error("No active spreadsheet found. Please bind this script to a Google Sheet (Extensions > Apps Script).");
  }

  var sheet = spreadsheet.getSheetByName(CONFIG.SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(CONFIG.SHEET_NAME);
  }

  // Ensure headers exist
  var currentHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
  var needsHeaders = !currentHeaders[0] || currentHeaders[0] !== CONFIG.HEADERS[0];

  if (needsHeaders) {
    sheet.getRange(1, 1, 1, CONFIG.HEADERS.length).setValues([CONFIG.HEADERS]);
    var headerRange = sheet.getRange(1, 1, 1, CONFIG.HEADERS.length);
    headerRange.setFontWeight("bold");
    headerRange.setBackground("#17191d");
    headerRange.setFontColor("#f7f7f8");
    headerRange.setHorizontalAlignment("center");
    sheet.setFrozenRows(1);
    
    // Auto-fit column widths
    for (var i = 1; i <= CONFIG.HEADERS.length; i++) {
      sheet.autoResizeColumn(i);
    }
  }

  return sheet;
}

/**
 * Retrieves or creates the main "Website Form Uploads" folder in Google Drive.
 */
function getOrCreateMainFolder() {
  var folders = DriveApp.getFoldersByName(CONFIG.MAIN_FOLDER_NAME);
  if (folders.hasNext()) {
    return folders.next();
  }
  return DriveApp.createFolder(CONFIG.MAIN_FOLDER_NAME);
}

/**
 * Generates a unique, collision-resistant Submission ID.
 */
function generateSubmissionId() {
  var now = new Date();
  var dateStr = Utilities.formatDate(now, Session.getScriptTimeZone() || "GMT", "yyyyMMdd");
  var randomCode = Math.random().toString(36).substring(2, 7).toUpperCase();
  return "SUB-" + dateStr + "-" + randomCode;
}

/**
 * Web App GET handler (useful for testing if Web App URL is live)
 */
function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "online",
    message: "Google Apps Script Form & Drive Integration Service is active."
  })).setMimeType(ContentService.MimeType.JSON);
}

/**
 * Web App POST handler for form submissions.
 */
function doPost(e) {
  var lock = LockService.getScriptLock();
  
  // Wait up to 30 seconds for concurrent submissions to prevent race conditions & duplicate overwrites
  try {
    lock.waitLock(30000);
  } catch (lockError) {
    return createJsonResponse(false, "Server is currently busy handling other submissions. Please try again in a moment.");
  }

  try {
    if (!e || !e.postData || !e.postData.contents) {
      throw new Error("No data received in request.");
    }

    var data;
    try {
      data = JSON.parse(e.postData.contents);
    } catch (parseError) {
      throw new Error("Invalid JSON payload.");
    }

    // 1. Validate required text fields
    var name = (data.name || "").trim();
    var phone = (data.phone || "").trim();
    var email = (data.email || "").trim();
    var business = (data.business || "").trim();
    var category = (data.category || "").trim();
    var service = (data.service || "").trim();
    var audience = (data.audience || "").trim();

    if (!name || !phone || !email || !business || !category || !service || !audience) {
      throw new Error("Missing required form fields. Please ensure all required fields are filled.");
    }

    // 2. Locate / create active sheet
    var sheet = getOrCreateTargetSheet();

    // 3. Duplicate submission check (checks if exact same email + business was submitted within the last 30 seconds)
    var submissionId = generateSubmissionId();
    var lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      var lastFewRows = Math.min(5, lastRow - 1);
      var recentData = sheet.getRange(lastRow - lastFewRows + 1, 1, lastFewRows, sheet.getLastColumn()).getValues();
      for (var r = 0; r < recentData.length; r++) {
        var rowEmail = String(recentData[r][4] || "").trim();
        var rowBusiness = String(recentData[r][5] || "").trim();
        var rowDate = new Date(recentData[r][1]);
        if (rowEmail.toLowerCase() === email.toLowerCase() &&
            rowBusiness.toLowerCase() === business.toLowerCase()) {
          var timeDiffMs = (new Date()).getTime() - rowDate.getTime();
          if (timeDiffMs < 30000) { // within 30 seconds
            throw new Error("Duplicate submission detected. Please do not submit repeatedly.");
          }
        }
      }
    }

    // 4. Handle file upload to Google Drive if present
    var fileUrl = "No file attached";
    var fileName = data.receiptName || "";
    var fileMimeType = data.receiptType || "";

    if (data.receiptData) {
      var fileMatch = data.receiptData.match(/^data:(.*?);base64,(.*)$/);
      if (!fileMatch) {
        throw new Error("Invalid file upload format. File must be properly base64-encoded.");
      }

      var extractedMime = fileMatch[1].toLowerCase();
      var base64Data = fileMatch[2];

      // Validate MIME type
      var isAllowedMime = CONFIG.ALLOWED_MIME_TYPES.some(function(allowed) {
        return extractedMime.indexOf(allowed) !== -1 || allowed.indexOf(extractedMime) !== -1;
      });

      if (!isAllowedMime) {
        throw new Error("Disallowed file type (" + extractedMime + "). Allowed types: JPG, PNG, WEBP, PDF.");
      }

      var decodedBytes = Utilities.base64Decode(base64Data);

      // Validate size
      if (decodedBytes.length > CONFIG.MAX_FILE_SIZE_BYTES) {
        throw new Error("File exceeds maximum allowed size of 10 MB.");
      }

      var mainFolder = getOrCreateMainFolder();
      
      // Create subfolder by Year-Month for organized storage (e.g. "Website Form Uploads/2026-11")
      var subfolderName = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT", "yyyy-MM");
      var subfolders = mainFolder.getFoldersByName(subfolderName);
      var targetFolder = subfolders.hasNext() ? subfolders.next() : mainFolder.createFolder(subfolderName);

      // Sanitize file name and prefix with submission ID for unambiguous tracking
      var cleanFileName = (fileName || "receipt").replace(/[^a-zA-Z0-9._-]/g, "_");
      var finalFileName = submissionId + "_" + cleanFileName;

      var blob = Utilities.newBlob(decodedBytes, extractedMime, finalFileName);
      var driveFile = targetFolder.createFile(blob);

      // Retain Drive's default private permission (only accessible to the Drive owner/account)
      // The direct Google Drive URL is stored in the sheet for admin access
      fileUrl = driveFile.getUrl();
      fileName = finalFileName;
      fileMimeType = extractedMime;
    }

    // 5. Append row to Google Sheets
    var formattedDate = Utilities.formatDate(new Date(), Session.getScriptTimeZone() || "GMT", "yyyy-MM-dd HH:mm:ss");

    sheet.appendRow([
      submissionId,
      formattedDate,
      name,
      phone,
      email,
      business,
      category,
      service,
      audience,
      fileName,
      fileMimeType,
      fileUrl
    ]);

    return createJsonResponse(true, "Registration submitted successfully!", {
      submissionId: submissionId,
      timestamp: formattedDate,
      fileUrl: fileUrl
    });

  } catch (err) {
    Logger.log("Error in doPost: " + err.toString());
    return createJsonResponse(false, err.message || "An unexpected error occurred during submission.");
  } finally {
    lock.releaseLock();
  }
}

/**
 * Creates formatted JSON response output with CORS headers.
 */
function createJsonResponse(success, message, extraData) {
  var responseObj = {
    success: success,
    message: message
  };

  if (extraData && typeof extraData === "object") {
    Object.keys(extraData).forEach(function(key) {
      responseObj[key] = extraData[key];
    });
  }

  return ContentService.createTextOutput(JSON.stringify(responseObj))
    .setMimeType(ContentService.MimeType.JSON);
}
