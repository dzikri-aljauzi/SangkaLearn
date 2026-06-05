# Fix: Update Kategori Target Peserta

**Tanggal:** 5 Juni 2026

## Masalah

Nama kategori target peserta di halaman `/courses` perlu diubah:
- "Mahasiswa" → "Umum"
- "Pemerintah" → "Instansi"

Data berasal dari tabel `course_target_categories`, di-seed oleh `CourseTargetCategorySeeder`.

## Solusi

Buat migration untuk update data, bukan edit seeder. Alasannya:
- Seeder hanya untuk initial setup
- Di production, `migrate:fresh --seed` akan hapus semua data
- Migration aman untuk update data di production tanpa kehilangan data lain

### File yang diubah

| File | Perubahan |
|------|-----------|
| `database/migrations/2026_06_05_080041_update_course_target_categories_names.php` | Migration baru — update name, slug, description |
| `database/seeders/CourseTargetCategorySeeder.php` | Tetap original (Mahasiswa, Pemerintah) sebagai baseline |

### Detail perubahan

| Sebelum | Sesudah |
|---------|---------|
| Mahasiswa | Umum |
| Pelatihan untuk mahasiswa dan peserta individu | Pelatihan untuk peserta umum dan individu |
| Pemerintah | Instansi |
| Pelatihan untuk instansi pemerintah | Pelatihan untuk instansi dan lembaga pemerintah |

### Deploy ke production

```bash
php artisan migrate
```

### Rollback

```bash
php artisan migrate:rollback --step=1
```

Kategori ketiga ("Perusahaan") tidak diubah.