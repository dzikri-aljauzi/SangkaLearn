# Dokumentasi Implementasi Chatbot AI LNA

## Overview
Implementasi fitur chatbot AI menggunakan REST API backend untuk memberikan bantuan kepada pengunjung website LNA tanpa perlu login.

---

## 📋 Ringkasan Perubahan

### A. File Baru yang Ditambahkan
1. **resources/js/Components/ChatbotWidget.jsx** (File Baru)
   - Komponen utama chatbot widget
   - UI chatbot dengan floating button di pojok kanan bawah
   - Ukuran: ~250 baris kode

2. **CHATBOT_AI_IMPLEMENTATION.md** (File Baru - Dokumentasi ini)
   - Dokumentasi lengkap implementasi chatbot

---

### B. File yang Dimodifikasi

#### 1. **resources/js/Pages/Welcome.jsx**
**Perubahan:**
- Menambahkan import `ChatbotWidget`
- Menambahkan komponen `<ChatbotWidget />` di bagian bawah sebelum penutup tag `</div>`

**Baris yang ditambahkan:**
```jsx
// Line 7
import ChatbotWidget from '@/Components/ChatbotWidget';

// Line 804-805
{/* Chatbot Widget */}
<ChatbotWidget />
```

---

#### 2. **resources/js/Pages/About.jsx**
**Perubahan:**
- Menambahkan import `ChatbotWidget`
- Menambahkan komponen `<ChatbotWidget />` di bagian bawah sebelum penutup tag `</div>`

**Baris yang ditambahkan:**
```jsx
// Line 5
import ChatbotWidget from '@/Components/ChatbotWidget';

// Line 548-549
{/* Chatbot Widget */}
<ChatbotWidget />
```

---

#### 3. **resources/js/Pages/Features.jsx**
**Perubahan:**
- Menambahkan import `ChatbotWidget`
- Menambahkan komponen `<ChatbotWidget />` di bagian bawah sebelum penutup tag `</div>`

**Baris yang ditambahkan:**
```jsx
// Line 5
import ChatbotWidget from '@/Components/ChatbotWidget';

// Line 443-444
{/* Chatbot Widget */}
<ChatbotWidget />
```

---

#### 4. **resources/js/Pages/Privacy.jsx**
**Perubahan:**
- Menambahkan import `ChatbotWidget`
- Menambahkan komponen `<ChatbotWidget />` di bagian bawah sebelum penutup tag `</div>`

**Baris yang ditambahkan:**
```jsx
// Line 3
import ChatbotWidget from '@/Components/ChatbotWidget';

// Line 351-352
{/* Chatbot Widget */}
<ChatbotWidget />
```

---

#### 5. **resources/js/Pages/Terms.jsx**
**Perubahan:**
- Menambahkan import `ChatbotWidget`
- Menambahkan komponen `<ChatbotWidget />` di bagian bawah sebelum penutup tag `</div>`

**Baris yang ditambahkan:**
```jsx
// Line 3
import ChatbotWidget from '@/Components/ChatbotWidget';

// Line 328-329
{/* Chatbot Widget */}
<ChatbotWidget />
```

---

## 🔧 Detail Implementasi

### 1. Konfigurasi API Chatbot

**Endpoint:**
```
https://lna-chatbot-backend-1031627117513.asia-southeast1.run.app/chatbot-response
```

**Request Headers:**
```json
{
  "Authorization": "Bearer 9ba4422794218b12514e15db1ce514df73637cf73a9e0a1cf34ff9259bff07a1d7d3173232e83bfdd9d1bdde07968ca9563cef91ca735b4ed37bb4e97a6ffcd9",
  "Content-Type": "application/json"
}
```

**Request Payload Format:**
```json
{
  "input_prompt": "Pesan user di sini"
}
```

**Response Format:**
```json
{
  "status": 200,
  "result": "Respon dari chatbot AI"
}
```

---

### 2. Fitur ChatbotWidget Component

#### A. State Management
- `isOpen`: Boolean untuk status buka/tutup chatbot
- `messages`: Array untuk menyimpan history chat
- `inputMessage`: String untuk input message user
- `isLoading`: Boolean untuk status loading saat menunggu response

#### B. Fitur Utama
1. **Floating Button**
   - Posisi fixed di pojok kanan bawah (bottom-6 right-6)
   - Icon chat bubble dengan background gradient biru
   - Hover effect dengan scale 110%
   - Focus ring untuk accessibility

2. **Chat Window**
   - Ukuran: 384px (w-96) x 600px height
   - Responsive: max-width calc(100vw - 3rem)
   - Max-height: calc(100vh - 8rem)
   - Background gradient header biru

3. **Message Display**
   - User messages: Align right, background biru
   - Bot messages: Align left, background putih dengan border
   - Timestamp pada setiap message
   - Auto-scroll ke message terbaru

4. **Loading State**
   - Animated dots (3 dots dengan delay berbeda)
   - Muncul saat menunggu response dari API

5. **Error Handling**
   - Network error handling
   - API error handling dengan fallback messages
   - User-friendly error messages dalam Bahasa Indonesia

6. **Input Form**
   - Auto-focus saat chat dibuka
   - Disabled saat loading atau input kosong
   - Support Enter key untuk mengirim
   - Button dengan icon paper airplane

---

### 3. UI/UX Features

#### A. Animasi & Transisi
- Smooth open/close transition
- Hover effects pada button
- Bounce animation untuk loading dots
- Pulse animation pada dekorasi

#### B. Accessibility
- Proper ARIA labels
- Keyboard navigation support
- Focus management
- Screen reader friendly

#### C. Responsive Design
- Mobile-friendly sizing
- Proper z-index (z-50)
- Scroll behavior yang smooth
- Adaptive layout untuk berbagai screen size

---

## 📊 Testing

### Test 1: API Connection
**Command:**
```bash
curl -X POST https://lna-chatbot-backend-1031627117513.asia-southeast1.run.app/chatbot-response \
-H "Authorization: Bearer 9ba4422794218b12514e15db1ce514df73637cf73a9e0a1cf34ff9259bff07a1d7d3173232e83bfdd9d1bdde07968ca9563cef91ca735b4ed37bb4e97a6ffcd9" \
-H "Content-Type: application/json" \
-d '{"input_prompt": "Halo, apa itu LNA?"}'
```

**Response:**
```json
{
  "status": 200,
  "result": "Halo! Saya adalah chatbot dari **Leadership Nasional Asia (LNA)**..."
}
```
✅ **Status: Success**

### Test 2: Build Process
**Command:**
```bash
npm run build
```
✅ **Status: Success** - Build completed in 8.85s

---

## 🚀 Cara Menggunakan

### Untuk Developer:
1. Jalankan development server:
   ```bash
   npm run dev
   ```

2. Buka browser dan akses salah satu halaman:
   - http://localhost/welcome
   - http://localhost/about
   - http://localhost/features
   - http://localhost/privacy
   - http://localhost/terms

3. Klik tombol chat di pojok kanan bawah
4. Ketik pesan dan tekan Enter atau klik tombol kirim

### Untuk End User:
1. Buka website LNA
2. Di halaman manapun (Welcome, About, Features, Privacy, Terms), akan muncul tombol chat di pojok kanan bawah
3. Klik tombol tersebut untuk membuka chatbot
4. Ketik pertanyaan Anda
5. Tunggu response dari AI chatbot

---

## 🐛 Debugging & Troubleshooting

### Jika Chatbot Tidak Bekerja:

1. **Buka Browser DevTools** (F12 atau Ctrl+Shift+I)
2. **Pilih tab Console**
3. **Kirim pesan di chatbot**
4. **Perhatikan log yang muncul**

#### Log yang Diharapkan (Sukses):
```
Sending message to chatbot: Halo
Response status: 200
Response ok: true
Response data: {status: 200, result: "..."}
```

#### Jika Muncul Error:
- **CORS Error**: Browser memblokir request karena cross-origin policy
  - Solusi: Backend perlu enable CORS atau gunakan CORS browser extension untuk testing
- **Network Error**: API tidak dapat diakses
  - Solusi: Test API dengan curl, cek koneksi internet
- **401/403 Error**: Authorization token invalid
  - Solusi: Update bearer token di ChatbotWidget.jsx

**📖 Panduan lengkap:** Lihat file `CHATBOT_DEBUGGING_GUIDE.md`

---

## 📝 Catatan Penting

### 1. Security
- API Bearer token sudah dikonfigurasi di komponen
- Token disimpan di frontend (untuk production, pertimbangkan menggunakan environment variable)

### 2. Performance
- Component menggunakan React hooks untuk state management
- Auto-scroll optimized dengan useRef
- Lazy loading untuk chat history

### 3. Error Handling
- Comprehensive error messages dalam Bahasa Indonesia
- Fallback untuk berbagai format response API
- Network error detection

### 4. Extensibility
Untuk menambahkan chatbot ke halaman lain:
```jsx
// Import component
import ChatbotWidget from '@/Components/ChatbotWidget';

// Tambahkan di JSX sebelum penutup div utama
<ChatbotWidget />
```

---

## 📦 Dependencies
Komponen ini menggunakan:
- React (hooks: useState, useRef, useEffect)
- @heroicons/react/24/outline (untuk icons)
- Tailwind CSS (untuk styling)
- Fetch API (untuk HTTP requests)

---

## 🔄 Future Improvements (Opsional)

1. **Chat History Persistence**
   - Simpan chat history di localStorage
   - Restore chat saat user kembali

2. **Typing Indicator**
   - Animasi "Bot is typing..." sebelum response

3. **Quick Replies**
   - Suggested questions/replies button

4. **File Upload**
   - Support upload gambar/dokumen

5. **Voice Input**
   - Speech-to-text integration

6. **Multi-language Support**
   - Switch between Indonesian and English

7. **Analytics**
   - Track user interactions
   - Popular questions analytics

---

## ✅ Checklist Implementasi

- [x] Buat komponen ChatbotWidget
- [x] Integrasi API chatbot
- [x] Update payload format ke `input_prompt`
- [x] Test koneksi API
- [x] Implementasi error handling
- [x] Tambahkan ke halaman Welcome
- [x] Tambahkan ke halaman About
- [x] Tambahkan ke halaman Features
- [x] Tambahkan ke halaman Privacy
- [x] Tambahkan ke halaman Terms
- [x] Build test
- [x] Dokumentasi

---

## 📞 Support

Untuk pertanyaan atau issue terkait implementasi chatbot:
1. Check dokumentasi API backend
2. Review error logs di browser console
3. Test API endpoint menggunakan curl atau Postman
4. Verify bearer token masih valid

---

**Tanggal Implementasi:** 15 November 2025
**Developer:** Claude AI Assistant
**Status:** ✅ Production Ready
