<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Preview Sertifikat - {{ $course_title ?? 'Program Pelatihan' }}</title>
    <style>
        /* --- RESET & WEB WRAPPER STYLE --- */
        * { margin: 0; padding: 0; box-sizing: border-box; }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: #F2F3F1;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .preview-controls {
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 1000;
            display: flex;
            gap: 10px;
            background: white;
            padding: 12px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }

        .preview-badge {
            background: #0D5C63;
            color: white;
            padding: 8px 16px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: bold;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .btn {
            background: #6B716E;
            color: white;
            padding: 8px 16px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
        }
        .btn:hover { background: #565C59; }

        /* --- CONTAINER KERTAS A4 (WEB SIMULATION) --- */
        .certificate-wrapper {
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: inline-block;
            margin-top: 80px;
        }

        .certificate-container {
            width: 1122px;  /* Lebar A4 dalam pixel */
            height: 794px;  /* Tinggi A4 dalam pixel */
            padding: 0;     /* Hilangkan padding luar */
            margin: 0;
            background: white;
            box-sizing: border-box;
        }

        .certificate {
            width: 100%;
            height: 100%;
            background: white;
            position: relative; /* KUNCI UTAMA: Menahan elemen absolute di dalam */
            overflow: hidden;
            font-family: 'Times New Roman', Times, serif; /* Kembalikan font ke PDF style */
            color: #000;
            border: 1px solid #ddd; /* Bingkai tipis penanda kertas */
        }

        /* --- LAYOUT INTERNAL (SAMA PERSIS DENGAN PDF) --- */
        
        /* Watermark diubah jadi absolute agar diam di dalam bingkai .certificate */
        .watermark-bg {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0; /* Diubah ke 0 agar preview notice tetap kelihatan */
            object-fit: cover;
        }

        /* Tanda Tangan diubah jadi absolute agar menempel di bawah bingkai .certificate */
        .footer-signature {
            position: absolute;
            bottom: 10mm; 
            left: 15mm;
            right: 15mm;
            z-index: 10;
        }

        .sig-table { width: 100%; border-collapse: collapse; }
        .sig-td { width: 50%; vertical-align: bottom; padding: 0; }
        .sig-box { width: 65%; text-align: left; }
        .sig-box.right { margin-left: auto; }
        
        .barcode-space { width: 100%; height: 24mm; } 
        .sig-line { border-bottom: 1px solid #000; margin-bottom: 1mm; }
        .sig-name { font-size: 11pt; font-weight: bold; margin: 0; }
        .sig-title { font-size: 11pt; margin: 0; }

        .content-wrapper {
            position: relative; /* Agar berada di atas watermark */
            padding: 5mm 15mm 0 15mm; 
            z-index: 1;
        }

        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
        .header-table td { padding: 0; vertical-align: top; }
        .logo-left { max-height: 14mm; } 
        .logo-right { max-height: 14mm; float: right; } 

        .text-center { text-align: center; }
        
        .main-title { font-size: 24pt; font-weight: bold; letter-spacing: 1px; margin: 2mm 0 2mm 0; }
        .subtitle { font-size: 14pt; margin: 0 0 3mm 0; }

        .student-box { width: 65%; margin: 0 auto; border-bottom: 1px solid #000; padding-bottom: 1mm; }
        .student-name { font-size: 28pt; font-weight: normal; margin: 0; }
        .cert-number { font-size: 11pt; margin: 2mm 0 4mm 0; }

        .text-normal { font-size: 12pt; margin: 0 0 1mm 0; }
        .text-bold { font-size: 12pt; font-weight: bold; margin: 0 0 3mm 0; }
        .course-title { font-size: 14pt; font-weight: bold; margin: 0 0 3mm 0; }

        .kompetensi-title { font-size: 11pt; font-weight: bold; margin-bottom: 2mm; text-align: center; }
        .kompetensi-table { margin: 0 auto 3mm auto; border-collapse: collapse; }
        .kompetensi-table td { font-size: 11pt; vertical-align: top; padding: 1mm 10mm; text-align: left; }

        .date-section { font-size: 11pt; font-weight: bold; line-height: 1.2; margin-top: 4mm; }

        /* Preview Notice Label */
        .preview-notice {
            position: absolute;
            bottom: 10px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(245, 158, 11, 0.9);
            color: white;
            padding: 6px 16px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: bold;
            z-index: 100; /* Paling atas */
            font-family: 'Arial', sans-serif; /* Kembalikan ke Arial untuk notice */
        }

        /* --- RESPONSIVE ZOOM --- */
        @media (max-width: 1200px) { .certificate-wrapper { transform: scale(0.8); transform-origin: top center; } }
        @media (max-width: 960px) { .certificate-wrapper { transform: scale(0.6); transform-origin: top center; } }
        @media (max-width: 720px) { .certificate-wrapper { transform: scale(0.45); transform-origin: top center; } }
    </style>
</head>
<body>
    
    <div class="preview-controls">
        <div class="preview-badge">
            <span>👁️</span>
            <span>Preview Sertifikat</span>
        </div>
        <a href="{{ $back_url ?? '#' }}" class="btn">
            ← Kembali ke Pelatihan
        </a>
    </div>

    <div class="certificate-wrapper">
        <div class="certificate-container">
            <div class="certificate">

                <div class="footer-signature">
                    <table class="sig-table">
                        <tr>
                            <td class="sig-td" style="text-align: left;">
                                <div class="sig-box">
                                    <div class="barcode-space"></div>
                                    <div class="sig-line"></div>
                                    <p class="sig-name">{{ $instructor_name ?? '[ Nama Pengajar ]' }}</p>
                                    <p class="sig-title">Pengajar</p>
                                </div>
                            </td>
                            <td class="sig-td" style="text-align: right;">
                                <div class="sig-box right">
                                    <div class="barcode-space"></div>
                                    <div class="sig-line"></div>
                                    <p class="sig-name">Dian Kusuma Wardani, M.M.</p>
                                    <p class="sig-title">Direktur</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </div>

                <div class="content-wrapper">
                    <table class="header-table">
                        <tr>
                            <td><span class="logo-left" style="font-family: Arial, Helvetica, sans-serif; font-size: 16pt; font-weight: bold; color: #0D5C63;">Sangka<span style="color: #17181A;">Learn</span></span></td>
                            <td style="text-align: right;"><span class="logo-right" style="font-family: Arial, Helvetica, sans-serif; font-size: 9pt; color: #565C59;">Sangkala Technology</span></td>
                        </tr>
                    </table>

                    <div class="text-center">
                        <h1 class="main-title">SERTIFIKAT PROGRAM PELATIHAN</h1>
                        <p class="subtitle">Dengan ini Menyatakan</p>
                        
                        <div class="student-box">
                            <h2 class="student-name">{{ $student_name ?? '[ Nama Peserta ]' }}</h2>
                        </div>
                        <p class="cert-number">No. Sertifikat : {{ $certificate_number ?? '[ Akan diisi setelah lulus ]' }}</p>

                        <p class="text-normal">Telah Mengikuti Kegiatan</p>
                        <p class="course-title">{{ $course_title ?? '[ Judul Program Pelatihan ]' }}</p>

                        <p class="text-normal">Diselenggarakan Oleh:</p>
                        <p class="text-bold">Sangkala Technology</p>

                        <p class="text-normal">Narasumber/Pengajar:</p>
                        <p class="text-bold">{{ $instructor_name ?? '[ Nama Pengajar ]' }}</p>
                    </div>

                    @if(isset($certificate_unit_kompetensi) && is_array($certificate_unit_kompetensi) && count($certificate_unit_kompetensi) > 0)
                    <div class="kompetensi-title">Unit Kompetensi:</div>
                    <table class="kompetensi-table">
                        @php
                            $units = array_values(array_filter($certificate_unit_kompetensi));
                            $total = count($units);
                            $half = ceil($total / 2);
                        @endphp
                        @for($i = 0; $i < $half; $i++)
                        <tr>
                            <td>&bull; {{ $units[$i] ?? '' }}</td>
                            <td>
                                @if(isset($units[$i + $half]))
                                    &bull; {{ $units[$i + $half] }}
                                @endif
                            </td>
                        </tr>
                        @endfor
                    </table>
                    @endif

                    <div class="text-center date-section">
                        Tanggal: {{ $completion_date ?? '[ Tanggal Kelulusan ]' }}<br>
                        Sangkala Technology
                    </div>
                </div>
                
                <div class="preview-notice">
                    ⚠️ Ini adalah preview - Sertifikat asli akan diberikan setelah menyelesaikan pelatihan
                </div>

            </div>
        </div>
    </div>

</body>
</html>