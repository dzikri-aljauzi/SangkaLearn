<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8"/>
    <title>Sertifikat Program Pelatihan</title>
    <style>
        /* 1. KUNCI KERTAS */
        @page {
            size: 297mm 210mm;
            margin: 0;
        }

        body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            font-family: 'Times New Roman', Times, serif;
            color: #000;
        }

        /* 2. WATERMARK FIXED ANTI-SPLIT */
        .watermark-bg {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: -100;
        }

        /* 3. TANDA TANGAN FIXED DI BAWAH */
        .footer-signature {
            position: fixed;
            bottom: 10mm; /* Diturunkan sedikit agar makin mentok bawah */
            left: 15mm;
            right: 15mm;
            z-index: 10;
        }

        .sig-table { width: 100%; border-collapse: collapse; }
        .sig-td { width: 50%; vertical-align: bottom; padding: 0; }
        .sig-box { width: 65%; text-align: left; }
        .sig-box.right { margin-left: auto; }
        
        /* RUANG BARCODE DIPERBESAR MENJADI 24mm */
        .barcode-space { width: 100%; height: 24mm; } 

        .sig-line { border-bottom: 1px solid #000; margin-bottom: 1mm; }
        .sig-name { font-size: 11pt; font-weight: bold; margin: 0; }
        .sig-title { font-size: 11pt; margin: 0; }

        /* 4. KONTEN TENGAH MENGALIR NORMAL */
        .content-wrapper {
            padding: 5mm 15mm 0 15mm; /* Margin atas ditarik naik dari 10mm ke 5mm */
            z-index: 1;
        }

        /* --- HEADER --- */
        .header-table { width: 100%; border-collapse: collapse; margin-bottom: 2mm; }
        .header-table td { padding: 0; vertical-align: top; }
        .logo-left { max-height: 14mm; } /* LOGO DIPERKECIL */
        .logo-right { max-height: 14mm; float: right; } /* LOGO DIPERKECIL */

        /* --- TYPOGRAPHY --- */
        .text-center { text-align: center; }
        
        .main-title { font-size: 24pt; font-weight: bold; letter-spacing: 1px; margin: 2mm 0 2mm 0; }
        .subtitle { font-size: 14pt; margin: 0 0 3mm 0; }

        .student-box { width: 65%; margin: 0 auto; border-bottom: 1px solid #000; padding-bottom: 1mm; }
        .student-name { font-size: 28pt; font-weight: normal; margin: 0; }
        .cert-number { font-size: 11pt; margin: 2mm 0 4mm 0; }

        .text-normal { font-size: 12pt; margin: 0 0 1mm 0; }
        .text-bold { font-size: 12pt; font-weight: bold; margin: 0 0 3mm 0; }
        .course-title { font-size: 14pt; font-weight: bold; margin: 0 0 3mm 0; }

        /* --- TABEL KOMPETENSI --- */
        .kompetensi-title { 
            font-size: 11pt; 
            font-weight: bold; 
            margin-bottom: 2mm; 
            text-align: center;
        }
        .kompetensi-table { 
            margin: 0 auto 3mm auto; 
            border-collapse: collapse; 
        }
        .kompetensi-table td { 
            font-size: 11pt; 
            vertical-align: top; 
            padding: 1mm 10mm; 
            text-align: left; 
        }

        /* --- TANGGAL --- */
        .date-section { 
            font-size: 11pt; 
            font-weight: bold; 
            line-height: 1.2; 
            margin-top: 4mm;
        }
    </style>
</head>
<body>

    <div class="footer-signature">
        <table class="sig-table">
            <tr>
                <td class="sig-td" style="text-align: left;">
                    <div class="sig-box">
                        <div class="barcode-space">
                            </div>
                        <div class="sig-line"></div>
                        <p class="sig-name">{{ $instructor_name }}</p>
                        <p class="sig-title">Pengajar</p>
                    </div>
                </td>
                <td class="sig-td" style="text-align: right;">
                    <div class="sig-box right">
                        <div class="barcode-space">
                            </div>
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
                <h2 class="student-name">{{ $student_name }}</h2>
            </div>
            <p class="cert-number">No. Sertifikat : {{ $certificate_number }}</p>

            <p class="text-normal">Telah Mengikuti Kegiatan</p>
            <p class="course-title">{{ $course_title }}</p>

            <p class="text-normal">Diselenggarakan Oleh:</p>
            <p class="text-bold">Sangkala Technology</p>

            <p class="text-normal">Narasumber/Pengajar:</p>
            <p class="text-bold">{{ $instructor_name }}</p>
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
            Tanggal: {{ $completion_date }}<br>
            Sangkala Technology
        </div>
    </div>

</body>
</html>