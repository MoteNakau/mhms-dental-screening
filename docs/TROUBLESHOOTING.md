# Troubleshooting Guide

## Issues You're Experiencing

### 1. Blank Screen When Opening Web App
**Cause**: The backend URL is not configured in localStorage.

**Solution**: 
- The app now shows a setup screen automatically when the backend URL is missing
- Enter your Google Apps Script Web App URL
- Click "Test & Save" to verify the connection
- The app will then load normally

### 2. "7 item(s) failed to sync" Error
**Cause**: The backend URL is not configured, or the backend is not deployed/accessible.

**Solution**:
1. Click the menu (☰) in the top right
2. Click "⚙️ Settings"
3. Enter your Google Apps Script Web App URL
4. Click "Test & Save"
5. Return to the app and click "🔄 Sync Now"

---

## Step-by-Step Setup Guide

### Step 1: Deploy Google Apps Script

1. Open your Google Apps Script project
2. Make sure `Code.gs` has these IDs configured:
   ```javascript
   const CONFIG = {
     SPREADSHEET_ID: '1vK8Vc1VpDZstwUoXicPTNY7pwk_8hITPUsnyVRVK1V8',
     PHOTO_FOLDER_ID: '1kLKMCsErr4E9aZA_KkRbAgZOcUK5hlws',
     ALLOW_ANY_AUTHENTICATED_USER: true
   };
   ```

3. Click **Deploy** → **New deployment**
4. Click the gear icon (⚙️) next to "Select type"
5. Select **Web app**
6. Fill in:
   - **Description**: MHMS Oral Screening Backend
   - **Execute as**: Me (your email)
   - **Who has access**: Anyone
7. Click **Deploy**
8. **Authorize** the script when prompted
9. **Copy the Web app URL** (looks like: `https://script.google.com/macros/s/AKfycbx.../exec`)

### Step 2: Configure Frontend

1. Open your web app (the React app)
2. You should see the **Setup Screen** automatically
3. Paste your Web App URL into the "Backend URL" field
4. Click **Test & Save**
5. Wait for the success message
6. The app will load normally

### Step 3: Sync Your Data

1. Click the menu (☰) in the top right
2. Click **🔄 Sync Now**
3. Wait for sync to complete
4. The "7 items failed" message should disappear

---

## Verifying the Setup

### Test the Backend

Open your Web App URL in a browser with `?action=whoami`:
```
https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec?action=whoami
```

You should see:
```json
{
  "success": true,
  "email": "your.email@gmail.com",
  "authorized": true,
  "message": "..."
}
```

If you see this, your backend is working correctly!

### Check Google Sheets

Open your Google Sheet (ID: `1vK8Vc1VpDZstwUoXicPTNY7pwk_8hITPUsnyVRVK1V8`)

After syncing, you should see:
- **Patients** tab with patient data
- **Screenings** tab with screening data
- **Photos** tab with photo metadata

### Check Google Drive

Open your Drive folder (ID: `1kLKMCsErr4E9aZA_KkRbAgZOcUK5hlws`)

After syncing photos, you should see:
- Photos named like: `MoteNakauM/44.jpg`
- All files set to **Private** access

---

## Common Issues

### Issue: "Unauthorized" Error
**Cause**: Your Google account is not authorized.

**Solution**:
- The backend is set to `ALLOW_ANY_AUTHENTICATED_USER: true`
- Make sure you're signed into a Google account
- Try signing out and back in

### Issue: "Spreadsheet ID not configured"
**Cause**: The CONFIG in Code.gs is missing the Spreadsheet ID.

**Solution**:
- Open Code.gs in Apps Script
- Make sure `SPREADSHEET_ID` is set to: `1vK8Vc1VpDZstwUoXicPTNY7pwk_8hITPUsnyVRVK1V8`
- Save and redeploy

### Issue: "Photo folder ID not configured"
**Cause**: The CONFIG in Code.gs is missing the Photo Folder ID.

**Solution**:
- Open Code.gs in Apps Script
- Make sure `PHOTO_FOLDER_ID` is set to: `1kLKMCsErr4E9aZA_KkRbAgZOcUK5hlws`
- Save and redeploy

### Issue: Photos Not Uploading
**Cause**: Drive folder permissions or invalid photo data.

**Solution**:
- Check that the Drive folder exists and you have edit access
- Make sure photos are valid JPEG/PNG files
- Check browser console for error messages

### Issue: Data Not Syncing
**Cause**: Backend URL not set or backend not deployed.

**Solution**:
1. Go to Settings (☰ → ⚙️ Settings)
2. Verify the backend URL is correct
3. Click "Test & Save"
4. Try syncing again

---

## Offline Mode

If you don't have a backend set up yet, you can still use the app in **offline mode**:

1. On the setup screen, click **"Skip (offline mode only)"**
2. The app will work normally
3. All data is saved locally in your browser
4. **Warning**: Data will be lost if you clear browser data

You can configure the backend later:
1. Click ☰ → ⚙️ Settings
2. Enter the backend URL
3. Click "Test & Save"
4. Click 🔄 Sync Now to upload all local data

---

## Getting Help

If you're still having issues:

1. **Check browser console** (F12 → Console tab) for error messages
2. **Check Apps Script logs** (View → Logs) for backend errors
3. **Verify Google Sheet access** - make sure you can open the sheet
4. **Verify Drive folder access** - make sure you can upload to the folder
5. **Redeploy the script** - sometimes changes don't take effect until redeployed

---

## Quick Reference

### Your Configuration
- **Sheet ID**: `1vK8Vc1VpDZstwUoXicPTNY7pwk_8hITPUsnyVRVK1V8`
- **Drive Folder ID**: `1kLKMCsErr4E9aZA_KkRbAgZOcUK5hlws`

### Menu Options
- ☰ → 🆕 New Screening - Start a new screening
- ☰ → 📋 Manage Events - Create/archive/delete events
- ☰ → 🔄 Sync Now - Sync data to backend
- ☰ → ⚙️ Settings - Configure backend URL

### Sync Status Indicators
- 🟢 Green = Synced successfully
- 🟡 Yellow = Saved locally, not synced
- 🔴 Red = Sync failed
- 🔵 Blue = Currently syncing

---

## Next Steps

Once everything is working:

1. ✅ Test creating a patient
2. ✅ Test conducting a screening
3. ✅ Test taking a photo
4. ✅ Test syncing data
5. ✅ Verify data appears in Google Sheets
6. ✅ Verify photos appear in Google Drive with correct labels

**Build Status**: ✅ Successful (207.59 kB / 60.85 kB gzipped)
