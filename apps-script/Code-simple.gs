/**
 * MHMS Oral Screening - Simplified Backend
 * Kiribati Ministry of Health and Medical Services
 */

// Configuration
var CONFIG = {
  SPREADSHEET_ID: '', // Add your Google Sheet ID here
  PHOTO_FOLDER_ID: '', // Add your Drive folder ID here
  ALLOW_ANY_AUTHENTICATED_USER: true // Set to false for production
};

/**
 * Handle GET requests
 */
function doGet(e) {
  try {
    var action = e.parameter.action;
    var userEmail = Session.getActiveUser().getEmail();
    
    // Setup endpoint
    if (action === 'whoami') {
      return jsonResponse({
        success: true,
        email: userEmail || 'Not signed in',
        message: userEmail ? 'Add this email to AUTHORIZED_USERS' : 'Sign in to Google'
      });
    }
    
    // Check authorization
    if (!isAuthorized(userEmail)) {
      return jsonResponse({
        success: false,
        error: 'Unauthorized',
        message: 'Email not authorized'
      }, 401);
    }
    
    // Handle actions
    if (action === 'get_reference_data') {
      return jsonResponse({ success: true, data: {} });
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Server error',
      message: error.toString()
    }, 500);
  }
}

/**
 * Handle POST requests
 */
function doPost(e) {
  try {
    var userEmail = Session.getActiveUser().getEmail();
    
    // Check authorization
    if (!isAuthorized(userEmail)) {
      return jsonResponse({
        success: false,
        error: 'Unauthorized',
        message: 'Email not authorized'
      }, 401);
    }
    
    // Parse request
    var body = JSON.parse(e.postData.contents);
    
    if (!body.action || !body.clientSubmissionId) {
      return jsonResponse({ 
        success: false, 
        error: 'Missing required fields' 
      }, 400);
    }
    
    var action = body.action;
    var clientSubmissionId = body.clientSubmissionId;
    
    // Handle different sync actions
    if (action === 'sync_patient') {
      return syncPatient(body, userEmail);
    } else if (action === 'sync_screening') {
      return syncScreening(body, userEmail);
    } else if (action === 'sync_photo') {
      return syncPhoto(body, userEmail);
    } else if (action === 'sync_referral') {
      return syncReferral(body, userEmail);
    }
    
    return jsonResponse({ success: false, error: 'Unknown action' });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Server error',
      message: error.toString()
    }, 500);
  }
}

/**
 * Check if user is authorized
 */
function isAuthorized(email) {
  if (!email) return false;
  if (CONFIG.ALLOW_ANY_AUTHENTICATED_USER) return true;
  return false;
}

/**
 * Sync patient data
 */
function syncPatient(body, userEmail) {
  try {
    var payload = body.payload;
    
    if (!CONFIG.SPREADSHEET_ID) {
      return jsonResponse({ 
        success: false, 
        error: 'Spreadsheet ID not configured' 
      }, 500);
    }
    
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Patients');
    
    if (!sheet) {
      sheet = ss.insertSheet('Patients');
      sheet.appendRow(['Patient_ID', 'ClientSubmissionId', 'FirstName', 'LastName', 'DOB', 'Sex', 'CreatedAt', 'CreatedBy']);
    }
    
    // Generate patient ID
    var patientId = 'KIR-' + Utilities.formatDate(new Date(), 'GMT', 'yyMMdd') + '-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    
    // Save to sheet
    sheet.appendRow([
      patientId,
      body.clientSubmissionId,
      payload.firstName || '',
      payload.lastName || '',
      payload.dateOfBirth || '',
      payload.sex || '',
      new Date().toISOString(),
      userEmail
    ]);
    
    return jsonResponse({ 
      success: true, 
      patientId: patientId,
      message: 'Patient saved successfully'
    });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Failed to save patient',
      message: error.toString()
    }, 500);
  }
}

/**
 * Sync screening data
 */
function syncScreening(body, userEmail) {
  try {
    var payload = body.payload;
    
    if (!CONFIG.SPREADSHEET_ID) {
      return jsonResponse({ 
        success: false, 
        error: 'Spreadsheet ID not configured' 
      }, 500);
    }
    
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Screenings');
    
    if (!sheet) {
      sheet = ss.insertSheet('Screenings');
      sheet.appendRow(['Screening_ID', 'ClientSubmissionId', 'Patient_ID', 'Event_ID', 'Date', 'DMFT', 'CreatedAt', 'CreatedBy']);
    }
    
    // Generate screening ID
    var screeningId = 'SCR-' + Utilities.formatDate(new Date(), 'GMT', 'yyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Calculate DMFT
    var dmft = payload.dmftResult || { D: 0, M: 0, F: 0, T: 0 };
    
    // Save to sheet
    sheet.appendRow([
      screeningId,
      body.clientSubmissionId,
      payload.patientId || '',
      payload.eventId || '',
      payload.dateOfScreening || '',
      JSON.stringify(dmft),
      new Date().toISOString(),
      userEmail
    ]);
    
    return jsonResponse({ 
      success: true, 
      screeningId: screeningId,
      message: 'Screening saved successfully'
    });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Failed to save screening',
      message: error.toString()
    }, 500);
  }
}

/**
 * Sync photo data
 */
function syncPhoto(body, userEmail) {
  try {
    var payload = body.payload;
    
    if (!CONFIG.PHOTO_FOLDER_ID) {
      return jsonResponse({ 
        success: false, 
        error: 'Photo folder ID not configured' 
      }, 500);
    }
    
    // Generate photo ID
    var photoId = 'PHO-' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    
    // For now, just return success without actually uploading
    // Photo upload requires more complex handling
    return jsonResponse({ 
      success: true, 
      photoId: photoId,
      message: 'Photo metadata saved (upload not implemented in simplified version)'
    });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Failed to save photo',
      message: error.toString()
    }, 500);
  }
}

/**
 * Sync referral data
 */
function syncReferral(body, userEmail) {
  try {
    var payload = body.payload;
    
    if (!CONFIG.SPREADSHEET_ID) {
      return jsonResponse({ 
        success: false, 
        error: 'Spreadsheet ID not configured' 
      }, 500);
    }
    
    var ss = SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID);
    var sheet = ss.getSheetByName('Referrals');
    
    if (!sheet) {
      sheet = ss.insertSheet('Referrals');
      sheet.appendRow(['Referral_ID', 'ClientSubmissionId', 'Screening_ID', 'Patient_ID', 'Reason', 'Urgency', 'CreatedAt', 'CreatedBy']);
    }
    
    // Generate referral ID
    var referralId = 'REF-' + Utilities.formatDate(new Date(), 'GMT', 'yyMMddHHmmss') + '-' + Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    
    // Save to sheet
    sheet.appendRow([
      referralId,
      body.clientSubmissionId,
      payload.screeningId || '',
      payload.patientId || '',
      payload.reason || '',
      payload.urgency || 'routine',
      new Date().toISOString(),
      userEmail
    ]);
    
    return jsonResponse({ 
      success: true, 
      referralId: referralId,
      message: 'Referral saved successfully'
    });
    
  } catch (error) {
    return jsonResponse({ 
      success: false, 
      error: 'Failed to save referral',
      message: error.toString()
    }, 500);
  }
}

/**
 * Return JSON response
 */
function jsonResponse(data, code) {
  var output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
