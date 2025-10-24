# Meditation Upload Testing Checklist

## Pre-Testing Setup

### Backend Server
```bash
cd Hope-backend
npm install  # If needed
npm run dev  # or npm start
```

**Verify Backend is Running:**
- Open: http://localhost:8000/health
- Should return: `{"status":"ok","message":"Server is running"...}`

### Frontend Server
```bash
# In project root
npm install  # If needed
npm run dev
```

**Verify Frontend is Running:**
- Open: http://localhost:3000
- Should load without errors

## Testing Procedure

### Test 1: Small File Upload (Baseline)
**Purpose:** Verify basic functionality still works

**Steps:**
1. Login as admin: knsalee@gmail.com
2. Navigate to `/admin/meditations`
3. Click "Upload New Meditation"
4. Fill in form:
   - Title: "Test Small Meditation"
   - Description: "Test description"
   - Category: Select any
   - File: Upload audio file **< 10MB**
5. Click "Upload"

**Expected Result:**
- ✅ Upload completes successfully
- ✅ Success toast appears
- ✅ Meditation appears in list
- ✅ Upload time: < 10 seconds

**If Failed:**
- ❌ Check browser console for errors
- ❌ Check backend logs
- ❌ Verify authentication

---

### Test 2: Medium File Upload (Previously Failed)
**Purpose:** Verify the fix works for files that previously failed

**Steps:**
1. Use same form as Test 1
2. Fill in form:
   - Title: "Test Medium Meditation"
   - Description: "Testing 50-100MB upload"
   - Category: Select any
   - File: Upload audio file **50-100MB**
3. Click "Upload"
4. **Do not close or refresh page during upload**

**Expected Result:**
- ✅ Upload completes successfully
- ✅ May take 1-3 minutes depending on internet speed
- ✅ Success toast appears
- ✅ Meditation appears in list

**If Failed:**
- ❌ Check error message in toast
- ❌ Check browser console
- ❌ Check backend logs for "fileSize" errors
- ❌ Verify backend was restarted after changes

---

### Test 3: Large File Upload (Maximum Capacity)
**Purpose:** Verify maximum supported file size

**Steps:**
1. Use same form as Test 1
2. Fill in form:
   - Title: "Test Large Meditation"
   - Description: "Testing 150-200MB upload"
   - Category: Select any
   - File: Upload audio file **150-200MB**
3. Click "Upload"
4. **Monitor upload progress** (may take 3-10 minutes)

**Expected Result:**
- ✅ Upload completes successfully
- ✅ May take 3-10 minutes
- ✅ Success toast appears
- ✅ Meditation appears in list

**If Failed:**
- ❌ "Request entity too large" = Backend not restarted
- ❌ "Timeout" = Network issue
- ❌ "Failed to upload to blob" = Check Vercel Blob token

---

### Test 4: Too Large File (Should Fail Gracefully)
**Purpose:** Verify proper error handling

**Steps:**
1. Use same form as Test 1
2. Try to upload file **> 200MB**

**Expected Result:**
- ❌ Upload should fail with clear error message
- ❌ Should NOT crash the application

---

## Monitoring During Upload

### Browser DevTools Network Tab
1. Open DevTools (F12)
2. Go to Network tab
3. Start upload
4. Look for:
   - Request to `/api/meditations/upload`
   - Status should be 200 (or pending during upload)
   - Size should match your file

### Backend Logs
Watch for:
```
Saving meditation metadata to backend: { title: '...', ... }
Meditation saved successfully: { ... }
```

## Common Issues & Solutions

### Issue: "Request entity too large"
**Cause:** Backend body parser limit not updated
**Solution:**
1. Verify `Hope-backend/src/index.ts` has `limit: '200mb'`
2. Restart backend server
3. Clear browser cache

### Issue: "Timeout" or "AbortError"
**Cause:** Network interruption or very slow connection
**Solution:**
1. Check internet speed
2. Try smaller file first
3. Ensure stable network connection
4. If on WiFi, try wired connection

### Issue: "Failed to upload to blob"
**Cause:** Missing or invalid Vercel Blob token
**Solution:**
1. Check `.env.local` has `BLOB_READ_WRITE_TOKEN`
2. Verify token is valid
3. Restart dev server after adding token

### Issue: "Failed to save meditation metadata"
**Cause:** Backend API error
**Solution:**
1. Check backend logs for detailed error
2. Verify backend database connection
3. Check authentication token is valid

### Issue: File uploads but doesn't appear in list
**Cause:** Metadata save failed but file uploaded
**Solution:**
1. Check backend logs
2. File may be in Vercel Blob but not in database
3. Can manually create meditation entry with blob URL

## Success Criteria

✅ **All tests passed if:**
1. Small files (< 10MB) upload successfully
2. Medium files (50-100MB) upload successfully
3. Large files (150-200MB) upload successfully
4. Files > 200MB fail with clear error
5. Uploaded meditations play correctly
6. No console errors
7. No memory leaks (check browser task manager)

## Performance Benchmarks

| File Size | Expected Upload Time (10 Mbps) |
|-----------|---------------------------------|
| 5MB       | < 10 seconds                    |
| 50MB      | 40-60 seconds                   |
| 100MB     | 1-2 minutes                     |
| 200MB     | 3-5 minutes                     |

*Times may vary based on internet speed and server response*

## Post-Testing Cleanup

1. Delete test meditations from admin panel
2. Verify Vercel Blob storage usage
3. Clear browser cache if needed

---

## Need Help?

If all tests fail:
1. Verify all changes were saved correctly
2. Restart both frontend and backend servers
3. Check environment variables are set
4. Try in incognito/private browsing mode
5. Review `MEDITATION_UPLOAD_FIX_SUMMARY.md`

**Files Changed:**
- ✅ `Hope-backend/src/routes/meditation.ts`
- ✅ `Hope-backend/src/index.ts`
- ✅ `app/api/meditations/upload/route.ts`
- ✅ `next.config.mjs`

**Verification Commands:**
```bash
# Backend - check for 200MB limits
grep -n "200.*1024.*1024" Hope-backend/src/routes/meditation.ts
grep -n "200mb" Hope-backend/src/index.ts

# Frontend - check for 200MB limits
grep -n "200mb" app/api/meditations/upload/route.ts
grep -n "200mb" next.config.mjs
```

---
**Last Updated:** October 24, 2025

