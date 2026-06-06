# Certificate System - Quick Test Guide

## 🚀 Quick Start Testing

Semua fixes telah diterapkan. Ikuti langkah-langkah ini untuk testing cepat.

---

## 📋 Pre-Test Checklist

```bash
# 1. Clear browser cache
Ctrl + Shift + Delete → Cached images and files → Clear

# 2. Verify routes
php artisan route:list | grep "certificates.*preview"

# Should show:
# GET  admin/certificates/{id}/preview      → preview
# GET  admin/certificates/{id}/preview-pdf  → previewPdf

# 3. Check image sizes
ls -lh public/images/blockxlab.png
ls -lh public/images/probisdi.png

# Should be:
# ~25 KB blockxlab.png
# ~38 KB probisdi.png
```

---

## ✅ Test 1: "Generate Auto" Button (Most Important!)

**URL:** `http://localhost:8000/admin/certificates`

**Steps:**
1. Login as admin
2. Go to Admin → Certificates
3. Find enrollment dengan 100% completion
4. Click "**Generate Auto**" button

**✅ Expected Result:**
```
✓ Browser navigates to Preview page
✓ Page shows form with certificate data fields
✓ NO raw PDF code (like %PDF-1.7...)
✓ "Lihat PDF" button visible in header
✓ Can edit data if needed
```

**❌ If you see raw PDF code:**
```
Problem: Old cache atau browser cached response
Fix: Hard refresh (Ctrl + Shift + R) atau Incognito mode
```

---

## ✅ Test 2: "Lihat PDF" Button

**From:** Preview page (from Test 1)

**Steps:**
1. On the Preview page
2. Click "**Lihat PDF**" button (top right)

**✅ Expected Result:**
```
✓ Opens new tab
✓ PDF displays in browser PDF viewer
✓ NO raw PDF code
✓ Certificate shows:
  - 3 logos (PROBISDI top-left, LNA top-right, BlockXLab bottom-left)
  - Student name
  - Course title
  - 7 Unit Kompetensi (custom or default values)
  - Certificate number
  - Date
  - Signatures
```

**❌ If PDF not showing:**
```
Check:
1. New tab opened? (not same tab)
2. Browser has PDF viewer enabled?
3. Try download and open manually
```

---

## ✅ Test 3: Direct URL Access

### Test 3A: Preview Page
```
URL: http://localhost:8000/admin/certificates/13/preview
Expected: Inertia Preview page with form ✓
```

### Test 3B: PDF Stream
```
URL: http://localhost:8000/admin/certificates/13/preview-pdf
Expected: PDF viewer ✓
```

*(Replace `13` with actual enrollment ID)*

---

## ✅ Test 4: Certificate Queue Flow

**URL:** `http://localhost:8000/admin/certificate-queue`

**Steps:**
1. Go to Admin → Certificate Queue
2. Find pending certificate
3. Click "**🤖 Generate Certificate Now**"
4. Wait for success message
5. Click "**💾 Download Preview**"

**✅ Expected Result:**
```
✓ Success message: "Certificate generated successfully!"
✓ PDF opens in new tab
✓ PDF shows in browser viewer
✓ NO raw PDF code
✓ Certificate layout correct
```

---

## ✅ Test 5: Course Form (Unit Kompetensi)

**URL:** `http://localhost:8000/admin/courses/create`

**Steps:**
1. Go to Admin → Courses → Create Course
2. Scroll to "Informasi Pelatihan" section
3. Look for "Unit Kompetensi" fields

**✅ Expected Result:**
```
✓ 7 input fields labeled "Unit Kompetensi 1" through "Unit Kompetensi 7"
✓ Each has placeholder showing default value
✓ Can enter custom values
✓ Values save to database
✓ Values appear in generated certificate
```

---

## 🔧 Quick Troubleshooting

### Issue: Raw PDF Code Still Appears

**Quick Fix:**
```bash
# 1. Hard refresh
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 2. Clear browser cache
Ctrl + Shift + Delete

# 3. Try Incognito mode
Ctrl + Shift + N (Chrome)
Ctrl + Shift + P (Firefox)
```

### Issue: Memory Error

**Quick Fix:**
```bash
# Check image sizes
ls -lh public/images/blockxlab.png
# Should be ~25 KB

# If too large:
php resize_certificate_logos.php
```

### Issue: Routes Not Found

**Quick Fix:**
```bash
# Clear and recache routes
php artisan route:clear
php artisan route:cache

# Verify
php artisan route:list | grep preview
```

### Issue: Changes Not Showing

**Quick Fix:**
```bash
# Clear all Laravel caches
php artisan optimize:clear

# Rebuild frontend
npm run build
```

---

## 📊 Success Indicators

You'll know everything works when:

1. ✅ Click "Generate Auto" → Shows form page (NOT PDF)
2. ✅ Click "Lihat PDF" → Opens PDF in new tab
3. ✅ PDF displays all 3 logos correctly
4. ✅ PDF shows 7 Unit Kompetensi
5. ✅ No raw PDF code anywhere
6. ✅ No memory errors in log
7. ✅ Course form shows 7 unit kompetensi fields

---

## 🎯 Critical Points to Remember

### What Changed:

**Before:**
```
Click "Generate Auto" → Raw PDF code ❌
```

**After:**
```
Click "Generate Auto" → Preview form ✅
Click "Lihat PDF" → PDF viewer ✅
```

### Two Different Routes Now:

| Route | Purpose | Returns |
|-------|---------|---------|
| `/certificates/{id}/preview` | Navigation | Inertia form page |
| `/certificates/{id}/preview-pdf` | PDF viewing | PDF stream |

### Two Different Buttons:

| Button | Location | Action |
|--------|----------|--------|
| "Generate Auto" | Certificates Index | Navigate to form |
| "Lihat PDF" | Preview Page | Open PDF viewer |

---

## 📝 Test Result Template

Copy this template to report results:

```
## Test Results - [Date]

### Test 1: Generate Auto Button
- URL: http://localhost:8000/admin/certificates
- Result: [ ] PASS / [ ] FAIL
- Notes:

### Test 2: Lihat PDF Button
- Location: Preview page
- Result: [ ] PASS / [ ] FAIL
- Notes:

### Test 3: Direct URL Access
- Preview URL: [ ] PASS / [ ] FAIL
- PDF URL: [ ] PASS / [ ] FAIL
- Notes:

### Test 4: Certificate Queue
- Generate: [ ] PASS / [ ] FAIL
- Download: [ ] PASS / [ ] FAIL
- Notes:

### Test 5: Course Form
- Fields visible: [ ] PASS / [ ] FAIL
- Can save: [ ] PASS / [ ] FAIL
- Notes:

### Overall Status
- [ ] All tests passed ✅
- [ ] Some tests failed ❌
- Issues found:

### Browser Tested
- [ ] Chrome
- [ ] Firefox
- [ ] Edge
- [ ] Safari
```

---

## 🆘 If All Else Fails

Run this complete reset sequence:

```bash
# 1. Clear ALL caches
php artisan optimize:clear

# 2. Verify routes
php artisan route:list | grep certificate

# 3. Check migration
php artisan migrate:status

# 4. Rebuild frontend
npm run build

# 5. Check logs for errors
tail -f storage/logs/laravel.log

# 6. Restart dev server (if using)
# Kill current server, then:
php artisan serve
```

Then:
- Clear browser cache completely
- Close ALL browser tabs
- Open fresh incognito window
- Test again from step 1

---

## 📞 Need Help?

If tests still fail after following this guide:

1. **Check Laravel Log:**
   ```bash
   tail -n 50 storage/logs/laravel.log
   ```

2. **Check Browser Console:**
   - F12 → Console tab
   - Look for errors

3. **Verify Files Modified:**
   - `app/Http/Controllers/Admin/CertificateController.php` (has previewPdf method?)
   - `routes/web.php` (has preview-pdf route?)
   - `resources/js/Pages/Admin/Certificates/Preview.jsx` (has "Lihat PDF" button?)

4. **Check Documentation:**
   - `CERTIFICATE_RAW_PDF_FINAL_FIX.md` - Detailed fix explanation
   - `CERTIFICATE_COMPLETE_SOLUTION_SUMMARY.md` - All changes summary
   - `CERTIFICATE_FINAL_TESTING_GUIDE.md` - Comprehensive testing

---

## ✨ Quick Reference

### Important Files:

```
Controllers:
  app/Http/Controllers/Admin/CertificateController.php

Routes:
  routes/web.php (line 564)

Frontend:
  resources/js/Pages/Admin/Certificates/Preview.jsx

Template:
  resources/views/certificates/template.blade.php

Service:
  app/Services/CertificateGeneratorService.php
```

### Important Commands:

```bash
# Clear cache
php artisan optimize:clear

# Rebuild frontend
npm run build

# Check routes
php artisan route:list | grep certificate

# Check logs
tail -f storage/logs/laravel.log
```

### Important URLs:

```
Certificates Index:
  http://localhost:8000/admin/certificates

Certificate Queue:
  http://localhost:8000/admin/certificate-queue

Preview Page:
  http://localhost:8000/admin/certificates/{id}/preview

PDF Stream:
  http://localhost:8000/admin/certificates/{id}/preview-pdf
```

---

**Status:** ✅ All fixes applied and ready for testing

**Last Updated:** November 27, 2025

**Start Testing Now! 🚀**
