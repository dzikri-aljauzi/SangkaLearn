# PDF Viewer - Testing Guide

## Quick Status Check

✅ **Implementation Complete**
- Worker file: `public/js/pdf.worker.min.mjs` (1022K, v5.4.296)
- PDFViewer integrated into Student Learn page
- All CORS and version errors resolved
- Build successful
- Ready for testing

---

## Before Testing: Preparation

### 1. Hard Refresh Browser
**CRITICAL**: Clear old cached assets

**Windows/Linux**:
```
Ctrl + Shift + R
```

**Mac**:
```
Cmd + Shift + R
```

### 2. Open Browser DevTools (Optional but Recommended)
```
Press F12 or right-click → Inspect
```

Keep DevTools open during testing to monitor:
- **Console tab**: Check for errors
- **Network tab**: Verify worker loads correctly

---

## Test Scenarios

### Scenario 1: Basic PDF Display ✅

**Steps**:
1. Login as student
2. Enroll in course with PDF lessons
3. Click on a lesson with type "Document"
4. Wait for PDF to load

**Expected Results**:
- ✅ PDF displays immediately inline (no download prompt)
- ✅ Loading spinner shows briefly during load
- ✅ PDF renders with all pages visible
- ✅ No error messages
- ✅ Console: NO red errors
- ✅ Network tab: Worker loads from `localhost:8000/js/pdf.worker.min.mjs`

**If Failed**:
- Check console for errors
- Verify worker file exists: `ls -lh public/js/pdf.worker.min.mjs`
- Try hard refresh again

---

### Scenario 2: Viewer Controls ✅

**Steps**:
1. Load a PDF with multiple pages (3+ pages recommended)
2. Test each control button

**A. Page Navigation**:
- Click "Next Page" button (right arrow) → Page counter increases
- Click "Previous Page" button (left arrow) → Page counter decreases
- Verify page counter shows: "1 / X" (where X = total pages)

**B. Zoom Controls**:
- Click "Zoom In" button (+) → PDF enlarges
- Click "Zoom Out" button (-) → PDF shrinks
- Verify zoom percentage shows (e.g., "100%", "120%")

**C. Fullscreen Toggle**:
- Click fullscreen button (expand icon)
- PDF viewer should fill entire screen
- Click again to exit fullscreen

**Expected Results**:
- ✅ All navigation buttons work smoothly
- ✅ Zoom changes PDF size correctly
- ✅ Fullscreen mode works without errors
- ✅ Page counter updates accurately

---

### Scenario 3: Security Features ✅

**Steps**:
1. Load a PDF
2. Test each security restriction

**A. Right-Click Protection**:
- Right-click anywhere on PDF
- Expected: Context menu should NOT appear (right-click disabled)

**B. Print Protection**:
- Try pressing `Ctrl+P` (Windows/Linux) or `Cmd+P` (Mac)
- Expected: Print dialog should NOT open (keyboard shortcut blocked)

**C. No Download Button**:
- Look for download button in viewer
- Expected: NO download button visible

**D. Protection Notice**:
- Scroll to bottom of viewer
- Expected: See yellow notice: "🔒 Dokumen ini dilindungi..."

**Expected Results**:
- ✅ Right-click disabled
- ✅ Print shortcuts blocked
- ✅ No download button
- ✅ Protection notice visible

---

### Scenario 4: Error Handling ✅

**Steps**:
1. Test with invalid PDF (if possible)

**Expected Results**:
- ✅ Shows error message: "Error Loading PDF"
- ✅ Red error icon displayed
- ✅ User-friendly error text
- ✅ No white screen or crash

---

### Scenario 5: Console Verification (Technical) 🔧

**Steps**:
1. Open DevTools (F12)
2. Go to Console tab
3. Load a PDF lesson

**Expected Results**:
- ✅ NO red errors
- ✅ NO CORS errors (like "blocked by CORS policy")
- ✅ NO version mismatch warnings (like "API version does not match Worker version")
- ✅ NO react-pdf warnings (like "Options prop changed")

**What You SHOULD NOT See**:
```
❌ Access to script at 'https://unpkg.com/...' has been blocked by CORS policy
❌ UnknownErrorException: The API version "5.4.296" does not match the Worker version "5.4.449"
❌ Warning: Options prop passed to <Document /> changed
❌ GET https://cdnjs.cloudflare.com/... 404 (Not Found)
```

**What You SHOULD See**:
```
✅ No errors (clean console)
✅ Maybe some info logs (harmless)
```

---

### Scenario 6: Network Verification (Technical) 🔧

**Steps**:
1. Open DevTools (F12)
2. Go to Network tab
3. Clear network log (trash icon)
4. Load a PDF lesson
5. Filter by: "pdf.worker"

**Expected Results**:
- ✅ Request to: `localhost:8000/js/pdf.worker.min.mjs`
- ✅ Status: `200 OK` (or `304 Not Modified` if cached)
- ✅ Size: ~1MB (1022K)
- ✅ Type: `application/javascript` or `text/javascript`

**What You SHOULD NOT See**:
```
❌ Requests to: unpkg.com
❌ Requests to: cdnjs.cloudflare.com
❌ Status: 404 Not Found
❌ Status: Failed (CORS error)
```

---

## Common Issues & Solutions

### Issue 1: PDF Still Shows Download Button
**Symptom**: Old download button instead of viewer

**Solution**:
1. Hard refresh: `Ctrl+Shift+R`
2. Clear browser cache completely
3. Restart development server if needed

---

### Issue 2: CORS Error in Console
**Symptom**: "blocked by CORS policy" error

**Solution**:
1. Verify worker file exists:
   ```bash
   ls -lh public/js/pdf.worker.min.mjs
   ```
2. Should show: `1022K` file size
3. If missing, copy again:
   ```bash
   cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/js/pdf.worker.min.mjs
   ```
4. Hard refresh browser

---

### Issue 3: Version Mismatch Error
**Symptom**: "API version does not match Worker version"

**Solution**:
1. Check worker file size:
   ```bash
   ls -lh public/js/pdf.worker.min.mjs
   ```
2. Should be: `1022K` (NOT 1.1MB)
3. If wrong size, delete and copy correct version:
   ```bash
   rm public/js/pdf.worker.min.mjs
   cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/js/pdf.worker.min.mjs
   ```
4. Hard refresh browser

---

### Issue 4: PDF Doesn't Load (White/Blank)
**Symptom**: Loading spinner forever or blank space

**Solution**:
1. Check console for errors (F12)
2. Verify PDF file exists in storage:
   ```bash
   ls storage/app/public/documents/
   ```
3. Check network tab for 404 errors
4. Try different PDF file

---

### Issue 5: Worker 404 Error
**Symptom**: Network tab shows "404 Not Found" for worker

**Solution**:
1. Verify file in public directory:
   ```bash
   ls public/js/pdf.worker.min.mjs
   ```
2. If missing, copy worker:
   ```bash
   mkdir -p public/js
   cp node_modules/react-pdf/node_modules/pdfjs-dist/build/pdf.worker.min.mjs public/js/pdf.worker.min.mjs
   ```
3. Hard refresh browser

---

## Test Report Template

Use this template to report test results:

```
## PDF Viewer Test Report
Date: [TODAY]
Browser: [Chrome/Firefox/Edge/Safari]
OS: [Windows/Mac/Linux]

### Scenario 1: Basic PDF Display
- [ ] PDF loads inline: YES/NO
- [ ] No errors in console: YES/NO
- [ ] Worker loads from localhost: YES/NO
Issues: [None or describe]

### Scenario 2: Viewer Controls
- [ ] Page navigation works: YES/NO
- [ ] Zoom in/out works: YES/NO
- [ ] Fullscreen works: YES/NO
Issues: [None or describe]

### Scenario 3: Security Features
- [ ] Right-click disabled: YES/NO
- [ ] Print blocked: YES/NO
- [ ] No download button: YES/NO
Issues: [None or describe]

### Scenario 4: Console Check
- [ ] No CORS errors: YES/NO
- [ ] No version mismatch: YES/NO
- [ ] No react-pdf warnings: YES/NO
Issues: [None or describe]

### Overall Result: PASS/FAIL
Additional Notes: [Any observations]
```

---

## Success Criteria

**All tests PASS if**:
✅ PDF displays inline without download
✅ All viewer controls work (navigation, zoom, fullscreen)
✅ Security features active (right-click, print disabled)
✅ Console has NO red errors
✅ Worker loads from localhost (not CDN)
✅ No version mismatch warnings
✅ No CORS errors

**If ANY test fails**: Report to development team with:
1. Which scenario failed
2. Console error messages (screenshot)
3. Network tab screenshot
4. Browser and OS information

---

## Quick Verification Commands

Run these commands to verify implementation:

```bash
# 1. Check worker file exists and has correct size
ls -lh public/js/pdf.worker.min.mjs
# Expected output: 1022K (1,046,528 bytes)

# 2. Verify worker file is staged in git
git status public/js/pdf.worker.min.mjs
# Expected: "A  public/js/pdf.worker.min.mjs" or "M  public/js/pdf.worker.min.mjs"

# 3. Check build was successful
npm run build
# Should complete without errors

# 4. Verify PDFViewer component exists
ls resources/js/Components/PDFViewer.jsx
# Should exist

# 5. Test worker URL in browser
# Open: http://localhost:8000/js/pdf.worker.min.mjs
# Should download/display the worker file (not 404)
```

---

## Performance Expectations

**First Load** (worker from server):
- Initial load: ~500-1000ms
- Worker fetch: ~50-100ms
- PDF render: ~200-500ms (small PDFs)

**Subsequent Loads** (worker cached):
- Initial load: ~200-400ms
- Worker fetch: 0ms (cached)
- PDF render: ~200-500ms

**Page Navigation**:
- Next/Previous page: < 100ms (instant)

**Zoom**:
- Zoom in/out: < 200ms (smooth)

If slower than this, check:
- PDF file size (large PDFs take longer)
- Server performance
- Network connection

---

## Deployment Checklist

Before deploying to production:

- [ ] Worker file committed to git: `git status public/js/pdf.worker.min.mjs`
- [ ] All tests passed locally
- [ ] Build successful: `npm run build`
- [ ] Console errors: None
- [ ] CORS errors: None
- [ ] Version match: API 5.4.296 = Worker 5.4.296

---

**Status**: ✅ Ready for Testing
**Date**: 2025-12-05
**Implementation**: Complete
**Documentation**: Complete

**Next Step**: Run test scenarios and report results
