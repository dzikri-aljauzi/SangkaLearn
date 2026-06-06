# Quick Start Guide - Lesson Content System

## 🚀 Instalasi & Setup (5 menit)

### 1. Install Dependencies
```bash
npm install react-pdf pdfjs-dist
```

### 2. Run Migration
```bash
php artisan migrate
```

Itu saja! Sistem sudah siap digunakan ✅

---

## 📖 Penggunaan Cepat

### **Scenario 1: Upload PDF Lesson**
```
1. Admin Panel → Courses → Pilih Course → Content
2. Add Lesson → Pilih Type: "Document"
3. Upload PDF file
4. Save
5. ✅ PDF tampil dengan secure viewer
```

### **Scenario 2: Embed Google Drive Video**
```
1. Upload video ke Google Drive
2. Share → Copy link
3. Admin Panel → Add Lesson → Type: "Video"
4. Paste Google Drive URL di "Video URL"
5. Save
6. ✅ Video embed otomatis tanpa download button
```

### **Scenario 3: Create Content with Text + Images**
```
1. Admin Panel → Add Lesson → Type: "Reading"
2. Klik "Tambah Text" → Tulis konten
3. Klik "Tambah Gambar" → Upload image
4. Klik "Tambah Text" lagi untuk text berikutnya
5. Reorder dengan arrow buttons
6. Klik "Live Preview" untuk lihat hasil
7. Save
8. ✅ Content tersusun rapi dengan text & images
```

---

## 🎯 Features Quick Reference

| Feature | Admin Action | Student View |
|---------|-------------|--------------|
| **PDF Lesson** | Upload PDF file | Secure viewer, no download |
| **Drive Video** | Paste Drive URL | Embedded player, no download |
| **Text + Images** | Use Content Builder | Clean sequential layout |
| **Protection** | Automatic | Right-click disabled, print disabled |

---

## 🔥 Pro Tips

### **For Best Results with Google Drive Videos:**
1. Set video sharing to "Anyone with the link"
2. Use supported formats: MP4, MOV, AVI
3. Keep file size under 2GB for best performance
4. URL format: `https://drive.google.com/file/d/YOUR_FILE_ID/view`

### **For PDF Lessons:**
1. Keep file size under 50MB
2. Use compressed PDFs
3. Optimize for web viewing
4. Test in viewer before publishing

### **For Content Builder:**
1. Start with text, then add images
2. Keep text blocks focused (1 topic per block)
3. Add captions to images for context
4. Use Live Preview frequently
5. Think mobile-first for layout

---

## ⚡ Common Actions

### Switch PDF to Drive Video
```
1. Edit Lesson
2. Change Type: "Document" → "Video"
3. Remove old document_file
4. Add video_url with Drive link
5. Save
```

### Add Images to Existing Text Lesson
```
1. Edit Lesson
2. Content Builder automatically loads
3. Add image blocks where needed
4. Reorder blocks
5. Save
```

### Convert Old Lesson to New Content Builder
```
Old system (content + content_images) tetap works!
No migration needed - backward compatible
```

---

## 🐛 Quick Fixes

| Problem | Solution |
|---------|----------|
| PDF not showing | Check file size < 50MB, verify upload success |
| Drive video not playing | Verify sharing is "Anyone with link", check URL format |
| Image not uploading | Check max upload size in php.ini |
| Content Builder blank | Clear browser cache, refresh page |
| Protection not working | Clear cache, check if JavaScript enabled |

---

## 📱 Mobile Testing

Test these on mobile:
- [ ] PDF viewer (zoom, navigate)
- [ ] Drive video playback
- [ ] Content blocks layout
- [ ] Right-click protection
- [ ] Navigation buttons

---

## 🎓 Training Users

### For Admins (5 min)
1. Show content type selection
2. Demo PDF upload
3. Demo Drive video embed
4. Demo Content Builder
5. Show Live Preview

### For Students (2 min)
1. Show how to navigate lessons
2. Demo PDF viewer controls
3. Show video controls
4. Explain protection features

---

## 📞 Need Help?

1. **Check Documentation**: `LESSON_CONTENT_SYSTEM_DOCUMENTATION.md`
2. **Check Browser Console**: F12 → Console tab
3. **Check PHP Logs**: `storage/logs/laravel.log`
4. **Test in Incognito**: Rule out cache issues

---

## ✅ Post-Installation Checklist

- [ ] Dependencies installed (`npm install`)
- [ ] Migration run (`php artisan migrate`)
- [ ] Test PDF upload
- [ ] Test Drive video embed
- [ ] Test Content Builder
- [ ] Test on mobile device
- [ ] Train admin users
- [ ] Document custom configurations

---

**That's it! You're ready to create amazing lesson content! 🎉**

For detailed documentation, see `LESSON_CONTENT_SYSTEM_DOCUMENTATION.md`
