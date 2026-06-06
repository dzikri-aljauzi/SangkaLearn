# Static QRIS Payment Implementation

## Gambaran Umum

Implementasi sistem pembayaran Static QRIS yang memungkinkan pengguna untuk melakukan pembayaran menggunakan QR Code statis yang sudah disediakan dalam bentuk PDF. Sistem ini menggunakan validasi manual untuk konfirmasi pembayaran.

## Fitur Utama

### 1. **Static QR Code Display**
- QR Code disimpan dalam file PDF di `public/images/staticqris.pdf`
- User dapat membuka PDF untuk melihat QR Code
- Mendukung semua aplikasi e-wallet yang mendukung QRIS (GoPay, OVO, DANA, dll)

### 2. **Manual Payment Confirmation**
- User memasukkan jumlah yang dibayarkan secara manual
- Sistem memvalidasi apakah jumlah sesuai dengan harga course
- Tolerance 1 IDR untuk mengatasi perbedaan kecil

### 3. **Amount Validation**
- Pembayaran berhasil jika jumlah transfer sesuai dengan harga course
- Pembayaran gagal jika jumlah tidak sesuai
- Sistem mencatat alasan kegagalan

### 4. **Auto Enrollment**
- Setelah pembayaran dikonfirmasi, user otomatis terdaftar di course
- Enrollment record dibuat dengan status "active"

## Komponen Implementasi

### 1. Database

#### Migration: `add_static_qris_support_to_payments_table`
```php
// Menambahkan field baru ke tabel payments
$table->timestamp('confirmed_at')->nullable(); // Waktu konfirmasi manual
$table->decimal('confirmed_amount', 15, 2)->nullable(); // Jumlah yang dikonfirmasi
```

#### Payment Model Updates
```php
// Field yang dapat diisi
'confirmed_amount', 'confirmed_at'

// Cast untuk data types
'confirmed_amount' => 'decimal:2',
'confirmed_at' => 'datetime',

// Helper methods
isStaticQris() // Cek apakah payment adalah static QRIS
isManuallyConfirmed() // Cek apakah sudah dikonfirmasi manual
getEffectiveAmount() // Dapatkan jumlah efektif pembayaran
isAmountValid($paidAmount, $tolerance) // Validasi jumlah pembayaran
```

### 2. Controller

#### PaymentController Methods

**createStaticQRISPayment(Request $request)**
- Membuat transaksi pembayaran static QRIS
- Menyimpan order dan order items
- Membuat payment record dengan status "pending"
- Return data untuk display QR Code

**confirmStaticQRISPayment(Request $request)**
- Mengkonfirmasi pembayaran secara manual
- Validasi jumlah yang dibayarkan
- Update status pembayaran
- Handle course enrollment

### 3. Routes

```php
Route::post('/payment/static-qris/create', [PaymentController::class, 'createStaticQRISPayment']);
Route::post('/payment/static-qris/confirm', [PaymentController::class, 'confirmStaticQRISPayment']);
```

### 4. Frontend Component

#### StaticQRISPayment.jsx
- Display QR Code PDF preview
- Form untuk memasukkan jumlah pembayaran
- Modal konfirmasi pembayaran
- Timer countdown
- Status tracking
- Instructions untuk pembayaran

## Flow Pembayaran

### 1. **Inisiasi Pembayaran**
1. User memilih course dan klik checkout
2. User memilih metode pembayaran "Static QRIS"
3. Sistem membuat order dan payment record
4. User diarahkan ke halaman pembayaran static QRIS

### 2. **Proses Pembayaran**
1. User melihat QR Code dengan klik "Lihat QR Code"
2. User scan QR Code dengan aplikasi e-wallet
3. User transfer sesuai nominal yang tercantum
4. User klik "Saya Sudah Transfer"
5. User memasukkan jumlah yang ditransfer
6. User klik "Konfirmasi"

### 3. **Validasi & Enrollment**
1. Sistem validasi jumlah pembayaran
2. Jika sesuai: status → "completed", enrollment otomatis
3. Jika tidak sesuai: status → "failed", tampilkan pesan error
4. User dapat mengakses course jika pembayaran berhasil

## Payment Statuses

- **pending**: Menunggu konfirmasi pembayaran
- **completed**: Pembayaran berhasil dikonfirmasi
- **failed**: Pembayaran gagal (jumlah tidak sesuai)
- **expired**: Waktu pembayaran habis (30 menit)

## Error Handling

### 1. **Amount Mismatch**
```json
{
  "success": false,
  "message": "Jumlah pembayaran tidak sesuai. Expected: 299.000, Paid: 250.000",
  "expected_amount": 299000,
  "paid_amount": 250000,
  "status": "failed"
}
```

### 2. **Invalid Payment Method**
```json
{
  "success": false,
  "message": "Invalid payment method"
}
```

### 3. **Already Processed**
```json
{
  "success": false,
  "message": "Payment already processed",
  "current_status": "completed"
}
```

## Security Features

### 1. **User Authorization**
- Payment hanya bisa dikonfirmasi oleh pemilik
- Validasi user_id di setiap request

### 2. **Amount Validation**
- Validasi strict untuk jumlah pembayaran
- Tolerance kecil (1 IDR) untuk mengatasi rounding

### 3. **Status Protection**
- Payment yang sudah diproses tidak bisa diubah
- Logging untuk semua aktivitas pembayaran

## Configuration

### Environment Variables
```env
# Tidak perlu konfigurasi tambahan untuk static QRIS
# File QR Code langsung disimpan di public/images/staticqris.pdf
```

### File Requirements
- `public/images/staticqris.pdf` - File PDF berisi QR Code QRIS statis

## Testing

### Test File: `test_static_qris_payment.php`
- Route validation
- File existence check
- Model compatibility
- Amount validation logic
- Controller method verification
- Component file check

### Manual Testing Steps
1. Akses halaman checkout
2. Pilih metode pembayaran Static QRIS
3. Verifikasi tampilan QR Code PDF
4. Test konfirmasi dengan berbagai nominal:
   - Nominal tepat (seharusnya berhasil)
   - Nominal lebih tinggi (seharusnya gagal)
   - Nominal lebih rendah (seharusnya gagal)
   - Nominal 0 atau negatif (seharusnya gagal)
5. Verifikasi enrollment otomatis setelah pembayaran berhasil

## Maintenance

### 1. **Update QR Code**
- Replace file `public/images/staticqris.pdf` dengan QR Code baru
- Tidak perlu restart aplikasi

### 2. **Monitoring**
- Check log file untuk error pembayaran
- Monitor payment records dengan status "failed"
- Track enrollment success rate

### 3. **Database Cleanup**
- Expired payments dapat dihapus atau diarsipkan
- Failed payments dapat dianalisis untuk improvement

## Kesimpulan

Implementasi Static QRIS Payment telah selesai dengan fitur lengkap:

✅ **Completed Features:**
- Static QR Code display system
- Manual payment confirmation flow  
- Amount validation with tolerance
- Automatic course enrollment
- Payment status tracking
- User interface components
- Database schema updates
- Error handling & security
- Comprehensive testing

Sistem siap digunakan dan telah ditest untuk memastikan semua komponen bekerja dengan baik.