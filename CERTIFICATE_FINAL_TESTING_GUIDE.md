# Certificate System - Final Testing Guide

## Tanggal: 27 November 2025

## Status: ✅ All Fixes Applied

Semua perbaikan telah diterapkan dan siap untuk testing.

---

## Summary of All Fixes Applied

### 1. ✅ Template Update
- Certificate template redesigned dengan 3 logos
- 7 Unit Kompetensi fields dengan default values
- Professional layout landscape A4

### 2. ✅ Memory Optimization
- Logo images resized (99.5% reduction)
- Memory limit increased to 512MB during PDF generation
- DPI optimized to 96 for efficiency

### 3. ✅ Preview Fix
- Preview method now streams PDF directly
- No more Inertia page rendering

### 4. ✅ Download/Display Fix
- Proper HTTP headers (Content-Type, Content-Disposition)
- PDF displays inline in browser viewer
- No more raw PDF code

### 5. ✅ All Caches Cleared
- Configuration cache cleared
- Application cache cleared
- Routes cache cleared
- Views cache cleared
- Optimization cache cleared

---

## Files Modified (Complete List)

1. ✅ `resources/views/certificates/template.blade.php`
2. ✅ `app/Models/Course.php`
3. ✅ `app/Services/CertificateGeneratorService.php`
4. ✅ `resources/js/Components/CourseTrainingFields.jsx`
5. ✅ `app/Http/Controllers/Admin/CertificateController.php`
6. ✅ `app/Http/Controllers/Admin/CertificateQueueController.php`
7. ✅ `public/images/blockxlab.png` (resized)
8. ✅ `public/images/probisdi.png` (resized)
9. ✅ `database/migrations/2025_11_27_001036_add_unit_kompetensi_to_courses_table.php` (created)

---

## Testing Instructions

### Prerequisites
1. Clear browser cache (Ctrl + Shift + Delete)
2. Hard refresh (Ctrl + Shift + R or Cmd + Shift + R)
3. Ensure you have a course with completed student

---

### Test 1: Preview Certificate (via URL)

**Steps:**
1. Go to: Admin → Certificates
2. Find enrollment with 100% completion
3. Click preview link or navigate to:
   ```
   http://localhost:8000/admin/certificates/{enrollment_id}/preview
   ```

**Expected Result:**
- ✅ PDF displays in browser PDF viewer
- ✅ No raw PDF code
- ✅ All logos visible (PROBISDI, LNA, BlockXLab)
- ✅ 7 Unit Kompetensi displayed
- ✅ Student name, course title, date correct

**If you see raw PDF code:**
- Hard refresh browser (Ctrl + Shift + R)
- Clear browser cache
- Try different browser

---

### Test 2: Auto Generate Certificate

**Steps:**
1. Go to: Admin → Certificate Queue
2. Select a certificate queue entry
3. Click "🤖 Generate Certificate Now" button
4. Wait for success message
5. Click "💾 Download Preview" button

**Expected Result:**
- ✅ Success message: "Certificate generated successfully!"
- ✅ PDF file created in storage
- ✅ Download preview displays PDF in browser
- ✅ No memory errors
- ✅ No raw PDF code

**If you see error:**
- Check Laravel log: `storage/logs/laravel.log`
- Verify images are resized (< 100KB each)
- Ensure memory_limit in php.ini is adequate

---

### Test 3: Download Certificate

**Steps:**
1. After generating certificate (Test 2)
2. Click "💾 Download Preview"

**Expected Result:**
- ✅ PDF opens in new tab/viewer
- ✅ PDF displays inline (not forced download)
- ✅ Certificate shows correct layout
- ✅ All elements visible and properly positioned

---

### Test 4: Approve & Send Certificate

**Steps:**
1. After generating certificate
2. Verify preview looks correct
3. Click "✅ Approve & Send to Student"
4. Confirm approval

**Expected Result:**
- ✅ Success message displayed
- ✅ Student receives email notification
- ✅ Certificate status = "approved"
- ✅ Student can download from their dashboard

---

## Troubleshooting Guide

### Issue: Still Getting Raw PDF Code

**Solution 1: Clear Browser Cache**
```
Windows: Ctrl + Shift + Delete
Mac: Cmd + Shift + Delete
Select: "Cached images and files"
Time range: "All time"
```

**Solution 2: Hard Refresh**
```
Windows: Ctrl + Shift + R
Mac: Cmd + Shift + R
```

**Solution 3: Try Different Browser**
- Chrome (Incognito mode)
- Firefox (Private window)
- Edge

**Solution 4: Clear Laravel Cache Again**
```bash
php artisan optimize:clear
```

---

### Issue: Memory Exhausted Error

**Verify Image Sizes:**
```bash
ls -lh public/images/blockxlab.png
ls -lh public/images/probisdi.png
ls -lh public/images/logo-lna.jpeg
```

**Expected:**
- blockxlab.png: ~25 KB ✅
- probisdi.png: ~38 KB ✅
- logo-lna.jpeg: ~86 KB ✅

**If images are still large:**
```bash
php resize_certificate_logos.php
```

**Check PHP Memory Limit:**
```bash
php -i | grep memory_limit
```
Should be at least 256M (512M recommended)

---

### Issue: Preview Shows 404

**Verify Route:**
```bash
php artisan route:list | grep certificate
```

**Should show:**
```
GET  admin/certificates/{id}/preview
POST admin/certificate-queue/{certificate}/generate
GET  admin/certificate-queue/{certificate}/download
```

**Fix:**
```bash
php artisan route:clear
php artisan route:cache
```

---

### Issue: PDF Generation Fails

**Check Logs:**
```bash
tail -f storage/logs/laravel.log
```

**Common Causes:**
1. Image files missing → Verify images exist
2. Storage not writable → Check permissions
3. DomPDF error → Check template syntax

**Verify Images Exist:**
```bash
ls -la public/images/blockxlab.png
ls -la public/images/probisdi.png
ls -la public/images/logo-lna.jpeg
```

**Check Storage Permissions:**
```bash
# Windows (PowerShell)
icacls storage /grant Everyone:F /T

# Linux/Mac
chmod -R 775 storage
chown -R www-data:www-data storage
```

---

### Issue: Unit Kompetensi Not Showing

**Verify Migration:**
```bash
php artisan migrate:status
```

**Should show:**
```
2025_11_27_001036_add_unit_kompetensi_to_courses_table ... Ran
```

**If not migrated:**
```bash
php artisan migrate
```

**Verify Columns Exist:**
```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'courses'
AND column_name LIKE 'unit_kompetensi%';
```

---

## Verification Checklist

Before marking as complete, verify:

### Backend
- [ ] Migration executed successfully
- [ ] Course model has unit_kompetensi fields in $fillable
- [ ] CertificateGeneratorService has memory optimization
- [ ] Preview method returns PDF stream
- [ ] Download method sets proper headers

### Frontend
- [ ] CourseTrainingFields shows 7 input fields
- [ ] Generate button uses router.post()
- [ ] Frontend assets built (npm run build)

### Files
- [ ] Images resized (blockxlab.png < 30KB)
- [ ] Images resized (probisdi.png < 50KB)
- [ ] Template updated with new layout
- [ ] Backups created (.backup files exist)

### Caches
- [ ] Configuration cache cleared
- [ ] Application cache cleared
- [ ] Route cache cleared
- [ ] View cache cleared
- [ ] Optimization cache cleared

---

## Quick Test Command

Run this to verify image sizes:
```bash
ls -lh public/images/{blockxlab,probisdi,logo-lna}.*
```

Expected output:
```
25K Nov 27 08:08 blockxlab.png        ✅
5.3M Nov 27 08:08 blockxlab.png.backup
38K Nov 27 08:08 probisdi.png         ✅
725K Nov 27 08:08 probisdi.png.backup
86K Aug  4 12:00 logo-lna.jpeg        ✅
```

---

## Success Indicators

You'll know everything works when:

1. ✅ Click "Generate Certificate" → Success message
2. ✅ Click "Download Preview" → PDF opens in browser viewer
3. ✅ PDF shows all 3 logos in correct positions
4. ✅ PDF shows 7 Unit Kompetensi (custom or default)
5. ✅ No raw PDF code displayed anywhere
6. ✅ No memory errors in Laravel log
7. ✅ Student receives email after approval

---

## Important Notes

### About Browser Caching
- Browsers aggressively cache images and PDFs
- Always hard refresh (Ctrl + Shift + R) when testing
- Use incognito/private mode for clean testing

### About Memory Errors
- Old errors in log are from before the fix
- Only check timestamps AFTER you applied fixes
- Look for timestamp > Nov 27 08:08

### About Raw PDF Code
- This happens when Content-Type header is missing
- We fixed this in both controllers
- Clear cache if still seeing it

### About Image Sizes
- Original blockxlab.png was 5.3 MB ❌
- Resized to 25 KB (99.5% smaller) ✅
- Backup files (.backup) kept for safety

---

## Contact & Support

If you encounter issues after following this guide:

1. **Check Laravel Log:**
   ```bash
   tail -n 50 storage/logs/laravel.log
   ```

2. **Check Image Sizes:**
   ```bash
   ls -lh public/images/*.png public/images/*.jpeg
   ```

3. **Verify All Caches Cleared:**
   ```bash
   php artisan optimize:clear
   ```

4. **Try Incognito Mode:**
   - Eliminates browser cache issues
   - Fresh session for testing

---

## Documentation Files

All documentation created:

1. `CERTIFICATE_TEMPLATE_UPDATE_DOCUMENTATION.md` - Master documentation
2. `CERTIFICATE_PREVIEW_FIX_SUMMARY.md` - Preview fix details
3. `CERTIFICATE_MEMORY_EXHAUSTED_FIX.md` - Memory optimization details
4. `CERTIFICATE_PDF_DISPLAY_FIX.md` - PDF display fix details
5. `CERTIFICATE_FINAL_TESTING_GUIDE.md` - This file

---

**Status:** ✅ **ALL FIXES APPLIED - READY FOR TESTING**

**Last Updated:** November 27, 2025

**Next Step:** Follow testing instructions above
