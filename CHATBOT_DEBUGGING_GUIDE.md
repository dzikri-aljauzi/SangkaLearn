# Panduan Debugging Chatbot AI

## Masalah yang Ditemukan
Chatbot menampilkan error: "Maaf, terjadi kesalahan dalam menghubungi server. Silakan periksa koneksi internet Anda dan coba lagi."

## Solusi yang Sudah Diterapkan

### 1. Enhanced Error Logging
Telah ditambahkan console.log yang detail untuk membantu debugging:

```javascript
// Log saat mengirim pesan
console.log('Sending message to chatbot:', inputMessage);

// Log status response
console.log('Response status:', response.status);
console.log('Response ok:', response.ok);

// Log data response
console.log('Response data:', data);

// Log error detail
console.error('Error sending message:', error);
console.error('Error details:', error.message);
console.error('Error type:', error.name);
```

### 2. Improved Error Handling
Error handling sekarang lebih spesifik:

```javascript
let errorText = 'Maaf, terjadi kesalahan dalam menghubungi server.';

if (error.name === 'TypeError' && error.message.includes('fetch')) {
    errorText = 'Maaf, tidak dapat terhubung ke server chatbot. Kemungkinan ada masalah CORS atau jaringan. Error: ' + error.message;
} else if (error instanceof SyntaxError) {
    errorText = 'Maaf, terjadi kesalahan dalam membaca respon dari server.';
} else {
    errorText = 'Maaf, terjadi kesalahan: ' + error.message;
}
```

---

## Cara Debugging

### Langkah 1: Buka Browser DevTools
1. Buka aplikasi di browser (Chrome/Firefox/Edge recommended)
2. Tekan `F12` atau `Ctrl+Shift+I` untuk membuka DevTools
3. Pilih tab **Console**

### Langkah 2: Test Chatbot
1. Klik tombol chatbot di pojok kanan bawah
2. Ketik pesan, misalnya: "Halo"
3. Klik send atau tekan Enter

### Langkah 3: Periksa Console Logs
Perhatikan log yang muncul di console:

#### A. Jika Muncul Log Normal (Sukses):
```
Sending message to chatbot: Halo
Response status: 200
Response ok: true
Response data: {status: 200, result: "Halo! Saya adalah chatbot..."}
```
✅ **Chatbot berfungsi normal**

#### B. Jika Muncul CORS Error:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```
❌ **Masalah: CORS Issue**

**Solusi:**
- Backend API perlu mengaktifkan CORS untuk domain Anda
- Atau gunakan proxy server untuk development

#### C. Jika Muncul Network Error:
```
Error sending message: TypeError: Failed to fetch
Error details: Failed to fetch
Error type: TypeError
```
❌ **Masalah: Network/Connection Issue**

**Kemungkinan Penyebab:**
1. Tidak ada koneksi internet
2. API backend sedang down
3. CORS policy blocking request
4. Firewall/antivirus blocking request

### Langkah 4: Test API Langsung dari Browser Console
Jalankan kode ini di console browser:

```javascript
fetch('https://lna-chatbot-backend-1031627117513.asia-southeast1.run.app/chatbot-response', {
    method: 'POST',
    headers: {
        'Authorization': 'Bearer 9ba4422794218b12514e15db1ce514df73637cf73a9e0a1cf34ff9259bff07a1d7d3173232e83bfdd9d1bdde07968ca9563cef91ca735b4ed37bb4e97a6ffcd9',
        'Content-Type': 'application/json',
    },
    body: JSON.stringify({
        input_prompt: 'Halo, apa itu LNA?'
    })
})
.then(res => res.json())
.then(data => console.log('Direct API test:', data))
.catch(err => console.error('Direct API error:', err));
```

---

## Kemungkinan Masalah dan Solusi

### 1. **CORS Issue** (Paling Sering Terjadi)

**Gejala:**
```
Access to fetch at '...' from origin 'http://localhost' has been blocked by CORS policy
```

**Penyebab:**
Browser memblokir request dari domain berbeda karena keamanan.

**Solusi Sementara (Development):**
1. Gunakan browser extension untuk disable CORS (hanya untuk testing):
   - Chrome: "CORS Unblock" atau "Allow CORS"
   - Firefox: "CORS Everywhere"

2. Atau jalankan Chrome dengan CORS disabled (Windows):
```bash
chrome.exe --user-data-dir="C:/Chrome dev session" --disable-web-security
```

**Solusi Permanen (Production):**
Backend API harus menambahkan CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, GET, OPTIONS
Access-Control-Allow-Headers: Content-Type, Authorization
```

### 2. **Network Error / Timeout**

**Gejala:**
```
TypeError: Failed to fetch
atau
TypeError: NetworkError when attempting to fetch resource
```

**Penyebab:**
- API backend tidak dapat diakses
- Timeout (response terlalu lama)
- Internet connection issue

**Solusi:**
1. Test API menggunakan curl atau Postman
2. Periksa koneksi internet
3. Cek apakah API backend aktif
4. Tambahkan timeout configuration

### 3. **Authorization Error**

**Gejala:**
```
Response status: 401
atau
Response status: 403
```

**Penyebab:**
Bearer token tidak valid atau expired

**Solusi:**
Update bearer token di `ChatbotWidget.jsx` line 55

### 4. **Invalid JSON Response**

**Gejala:**
```
SyntaxError: Unexpected token < in JSON at position 0
```

**Penyebab:**
Server mengembalikan HTML instead of JSON (biasanya error page)

**Solusi:**
Cek response sebelum parse JSON:
```javascript
const text = await response.text();
console.log('Raw response:', text);
const data = JSON.parse(text);
```

---

## Test API Menggunakan Command Line

### Test dengan cURL (Terminal/PowerShell):
```bash
curl -X POST https://lna-chatbot-backend-1031627117513.asia-southeast1.run.app/chatbot-response -H "Authorization: Bearer 9ba4422794218b12514e15db1ce514df73637cf73a9e0a1cf34ff9259bff07a1d7d3173232e83bfdd9d1bdde07968ca9563cef91ca735b4ed37bb4e97a6ffcd9" -H "Content-Type: application/json" -d "{\"input_prompt\": \"Halo\"}"
```

**Expected Response (Sukses):**
```json
{
  "status": 200,
  "result": "Halo! Saya adalah chatbot dari Leadership Nasional Asia (LNA)..."
}
```

---

## Checklist Troubleshooting

- [ ] Buka browser DevTools (F12)
- [ ] Klik tombol chatbot
- [ ] Kirim pesan test
- [ ] Periksa console untuk errors
- [ ] Copy error message lengkap
- [ ] Test API langsung dari console browser
- [ ] Test API menggunakan curl/Postman
- [ ] Periksa Network tab di DevTools
- [ ] Periksa apakah ada CORS error
- [ ] Cek status code response (200, 400, 401, 500, etc)
- [ ] Verify Bearer token masih valid
- [ ] Test dari browser berbeda
- [ ] Disable browser extensions temporarily
- [ ] Cek antivirus/firewall settings

---

## Informasi Tambahan

### File yang Dimodifikasi
- `resources/js/Components/ChatbotWidget.jsx` (Line 49-118)

### Perubahan:
1. Tambah console.log untuk tracking request
2. Tambah console.log untuk tracking response
3. Enhanced error messages dengan detail error type
4. Better error categorization

---

## Contact Support

Jika masalah masih berlanjut setelah mengikuti panduan ini:

1. **Collect Information:**
   - Screenshot error di console
   - Screenshot Network tab di DevTools
   - Browser dan version yang digunakan
   - Operating System
   - Error message lengkap

2. **Test Environment:**
   - Test di browser berbeda (Chrome, Firefox, Edge)
   - Test di device berbeda (PC, laptop, mobile)
   - Test di jaringan berbeda (WiFi, mobile data)

3. **API Status:**
   - Test API menggunakan curl
   - Verify API endpoint masih aktif
   - Check API documentation untuk perubahan

---

**Tanggal Update:** 15 November 2025
**Version:** 1.1.0
**Status:** Debug Mode Active
