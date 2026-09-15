# Photo Labeling Integration

## Summary
Integrated Google Sheets and Drive IDs into the backend and implemented automatic photo labeling based on patient information.

## Changes Made

### 1. Backend Configuration (Code.gs & Code-simple.gs)
- **Sheet ID**: `1vK8Vc1VpDZstwUoXicPTNY7pwk_8hITPUsnyVRVK1V8`
- **Drive Folder ID**: `1kLKMCsErr4E9aZA_KkRbAgZOcUK5hlws`

Both files have been updated with these IDs in the CONFIG section.

### 2. Photo Labeling System

#### File Naming Format
Photos are now automatically labeled with patient information in this format:
```
FirstNameLastNameSex/Age.jpg
```

**Example**: `MoteNakauM/44.jpg`

#### How It Works

1. **Frontend (App.tsx)**:
   - When saving photos, the system now includes patient information in the sync queue payload:
     - `patientFirstName`
     - `patientLastName`
     - `patientAge` (calculated from date of birth)
     - `patientSex`

2. **Backend (Code.gs)**:
   - The `syncPhoto()` function receives patient information
   - Creates a label by concatenating: FirstName + LastName + Sex (first letter) + "/" + Age
   - Removes any spaces from names
   - Uses this label as the filename when uploading to Google Drive
   - Falls back to photo ID if patient information is not available

#### Implementation Details

**Frontend Changes (src/App.tsx)**:
```typescript
// Calculate patient age
const patientAge = selectedPatient?.dateOfBirth 
  ? calculateAge(selectedPatient.dateOfBirth, screeningDate)
  : 0;

// Include patient info in photo payload
await addToSyncQueue({
  // ... other fields
  payload: { 
    ...photoRecord, 
    dataUrl: await fileToDataUrl(photo),
    patientFirstName: selectedPatient?.firstName || '',
    patientLastName: selectedPatient?.lastName || '',
    patientAge: patientAge,
    patientSex: selectedPatient?.sex || '',
  },
  // ...
});
```

**Backend Changes (Code.gs)**:
```javascript
// Create patient label for filename
let patientLabel = photoId; // Default fallback
if (payload.patientFirstName && payload.patientLastName && 
    payload.patientAge && payload.patientSex) {
  const firstName = payload.patientFirstName.replace(/\s+/g, '');
  const lastName = payload.patientLastName.replace(/\s+/g, '');
  const sex = payload.patientSex.charAt(0).toUpperCase();
  patientLabel = firstName + lastName + sex + '/' + payload.patientAge;
}

// Use label as filename
const fileName = patientLabel + '.jpg';
const blob = Utilities.newBlob(
  Utilities.base64Decode(imageData), 
  payload.mimeType || 'image/jpeg', 
  fileName
);
```

## Testing

### Test Cases
1. **Complete patient info**: Should create label like "MoteNakauM/44.jpg"
2. **Missing patient info**: Should fall back to photo ID like "PHO-123456.jpg"
3. **Names with spaces**: Spaces should be removed (e.g., "Mary Jane" → "MaryJane")
4. **Different sexes**: Should use first letter (M/F/O for Male/Female/Other)

### Verification Steps
1. Create a new patient with known details
2. Take a photo during screening
3. Sync the data
4. Check Google Drive folder for the uploaded photo
5. Verify filename matches the expected format

## Security Notes
- All photos are uploaded to a **private** Google Drive folder
- File sharing permissions are set to PRIVATE
- Only authorized users can access the photos
- Patient information in filenames is for organizational purposes only

## Future Enhancements
- Consider adding timestamp to filename to prevent duplicates
- Add option to include screening ID in filename
- Implement photo metadata in Google Sheets for easier searching
- Add photo preview functionality in the app

## Files Modified
1. `apps-script/Code.gs` - Updated CONFIG and syncPhoto function
2. `apps-script/Code-simple.gs` - Updated CONFIG and syncPhoto function
3. `src/App.tsx` - Updated photo saving to include patient information

## Build Status
✅ Build successful - 204.44 kB (gzip: 59.98 kB)
