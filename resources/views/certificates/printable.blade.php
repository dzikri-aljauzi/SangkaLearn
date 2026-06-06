<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Certificate</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            background: #f0f0f0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
        }

        .print-controls {
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 1000;
            display: flex;
            gap: 10px;
        }

        .btn {
            background: #1e40af;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }

        .btn:hover {
            background: #1e3a8a;
        }

        .btn-secondary {
            background: #64748b;
        }

        .btn-secondary:hover {
            background: #475569;
        }

        /* Certificate Container - SUPER COMPACT */
        .certificate-wrapper {
            background: white;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
            display: inline-block;
        }

        .certificate-container {
            width: 1122px;  /* 297mm in pixels at 96 DPI */
            height: 794px;   /* 210mm in pixels at 96 DPI */
            padding: 10px;
            margin: 0;
            position: relative;
            background: white;
            border: 4px solid #1e40af;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        .certificate {
            flex: 1;
            background: white;
            position: relative;
            padding: 12px;
            border: 2px solid #3b82f6;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
        }

        /* Header with All Logos */
        .certificate-header {
            width: 100%;
            margin-bottom: 4px;
        }

        .header-logos {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 4px;
        }

        .logo-left {
            width: 85px;
            height: auto;
        }

        .logo-center {
            width: 120px;
            height: auto;
        }

        .logo-right {
            width: 80px;
            height: auto;
        }

        /* Title Section */
        .certificate-title {
            text-align: center;
            font-size: 34px;
            font-weight: bold;
            color: #1e40af;
            letter-spacing: 4px;
            margin: 4px 0 3px 0;
        }

        .certificate-subtitle {
            text-align: center;
            font-size: 13px;
            color: #333;
            margin-bottom: 4px;
        }

        /* Student Name Section */
        .student-name-wrapper {
            text-align: center;
            margin: 4px 0;
        }

        .student-name {
            text-align: center;
            font-size: 28px;
            font-weight: bold;
            color: #000;
            margin: 4px auto;
            padding-bottom: 3px;
            border-bottom: 3px solid #1e40af;
            display: inline-block;
            min-width: 60%;
        }

        /* Certificate Number */
        .certificate-number {
            text-align: center;
            font-size: 11px;
            color: #333;
            margin: 5px 0;
        }

        /* Description Text */
        .description-text {
            text-align: center;
            font-size: 12px;
            color: #333;
            line-height: 1.4;
            margin: 5px auto;
        }

        .course-title-text {
            text-align: center;
            font-size: 16px;
            font-weight: bold;
            color: #1e40af;
            margin: 5px 0;
        }

        /* Organization Info */
        .organization-info {
            text-align: center;
            margin: 6px 0;
        }

        .org-label {
            font-size: 11px;
            color: #333;
            margin-bottom: 1px;
        }

        .org-name {
            font-size: 12px;
            font-weight: bold;
            color: #000;
        }

        /* Narasumber/Instruktur Section */
        .instructors-section {
            margin: 6px 0;
            text-align: center;
        }

        .instructors-title {
            font-size: 11px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
        }

        .instructor-item {
            text-align: center;
            font-size: 10px;
            color: #333;
            font-weight: 500;
            margin: 0 0;
        }

        /* Competency Units */
        .competency-section {
            margin: 6px auto;
            max-width: 98%;
        }

        .competency-title {
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            color: #000;
            margin-bottom: 2px;
        }

        .competency-table {
            width: 100%;
            border-collapse: collapse;
            margin: 0 auto;
        }

        .competency-table td {
            width: 50%;
            padding: 1px 8px;
            vertical-align: top;
            font-size: 9px;
            color: #333;
            line-height: 1.4;
        }

        .competency-item {
            text-align: left;
        }

        /* Date Section */
        .date-section {
            text-align: center;
            font-size: 11px;
            color: #333;
            margin: 6px 0;
        }

        .date-value {
            font-weight: bold;
        }

        .company-info {
            text-align: center;
            font-size: 11px;
            color: #333;
            margin: 6px 0;
        }

        /* Signature Section */
        .signature-section {
            margin-top: auto;
            padding-top: 4px;
        }

        .signature-table {
            width: 100%;
            border-collapse: collapse;
        }

        .signature-box {
            text-align: center;
            width: 50%;
            padding: 0 12px;
        }

        .signature-line {
            border-top: 2px solid #000;
            margin: 8px auto 4px;
            width: 150px;
        }

        .signature-name {
            font-size: 10px;
            font-weight: bold;
            color: #000;
            margin-bottom: 1px;
        }

        .signature-title {
            font-size: 9px;
            color: #333;
        }

        /* PRINT STYLES - PERFECT, NO WHITESPACE */
        @media print {
            html, body {
                background: white;
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
                display: block;
            }

            body {
                display: block;
            }

            .print-controls {
                display: none !important;
            }

            .certificate-wrapper {
                box-shadow: none;
                display: block;
                width: 100%;
                height: 100%;
                margin: 0;
                padding: 0;
            }

            .certificate-container {
                width: 297mm;
                height: 210mm;
                margin: 0;
                padding: 3mm;
                page-break-after: avoid;
                page-break-inside: avoid;
                page-break-before: avoid;
            }

            .certificate {
                padding: 3mm;
            }

            .logo-left {
                width: 22mm;
            }

            .logo-center {
                width: 32mm;
            }

            .logo-right {
                width: 20mm;
            }

            @page {
                size: A4 landscape;
                margin: 0;
            }
        }
    </style>
</head>
<body>
    <!-- Print Controls -->
    <div class="print-controls">
        <button class="btn" onclick="window.print()">
            📄 Download PDF
        </button>
        <button class="btn btn-secondary" onclick="window.close()">
            ✕ Tutup
        </button>
    </div>

    <!-- Certificate -->
    <div class="certificate-wrapper">
        <div class="certificate-container">
            <div class="certificate">
                <!-- Header with All Logos -->
                <div class="certificate-header">
                    <div class="header-logos">
                        <img src="{{ asset('images/probisdi.png') }}" alt="PROBISDI" class="logo-left">
                        <img src="{{ asset('images/logo-lna.jpeg') }}" alt="LNA" class="logo-center">
                        <img src="{{ asset('images/blockxlab.png') }}" alt="BlockXLab" class="logo-right">
                    </div>
                </div>

                <!-- Title -->
                <div class="certificate-title">SERTIFIKAT PELATIHAN</div>
                <div class="certificate-subtitle">Dengan ini Menyatakan</div>

                <!-- Student Name -->
                <div class="student-name-wrapper">
                    <div class="student-name">{{ $student_name }}</div>
                </div>

                <!-- Certificate Number -->
                <div class="certificate-number">No. Sertifikat: {{ $certificate_number }}</div>

                <!-- Description -->
                <div class="description-text">
                    Telah Mengikuti Kegiatan
                </div>
                <div class="course-title-text">
                    {{ $course_title }}
                </div>

                <!-- Organization -->
                <div class="organization-info">
                    <div class="org-label">Diselenggarakan Oleh:</div>
                    <div class="org-name">PT. Leadership Nasional Asia</div>
                </div>

                <!-- Narasumber/Pembicara -->
                <div class="instructors-section">
                    <div class="instructors-title">Narasumber/Pembicara:</div>
                    <div class="instructor-item">{{ $instructor_name }}</div>
                </div>

                <!-- Unit Kompetensi - Dynamic -->
                @if(isset($certificate_unit_kompetensi) && is_array($certificate_unit_kompetensi) && count($certificate_unit_kompetensi) > 0)
                <div class="competency-section">
                    <div class="competency-title">Unit Kompetensi:</div>
                    <table class="competency-table">
                        @php
                            $units = $certificate_unit_kompetensi;
                            $totalUnits = count($units);
                            $halfCount = ceil($totalUnits / 2);
                        @endphp
                        @for($i = 0; $i < $halfCount; $i++)
                        <tr>
                            <td class="competency-item">
                                {{ $i + 1 }}. {{ $units[$i] ?? '' }}
                            </td>
                            <td class="competency-item">
                                @if(isset($units[$i + $halfCount]))
                                    {{ $i + $halfCount + 1 }}. {{ $units[$i + $halfCount] }}
                                @endif
                            </td>
                        </tr>
                        @endfor
                    </table>
                </div>
                @endif

                <!-- Date -->
                <div class="date-section">
                    <span>Tanggal: </span>
                    <span class="date-value">{{ $completion_date }}</span>
                </div>

                <!-- Company Info -->
                <div class="company-info">
                    <strong>PT. Leadership Nasional Asia (Leadership LNA)</strong>
                </div>

                <!-- Signatures -->
                <div class="signature-section">
                    <table class="signature-table">
                        <tr>
                            <td class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-name">Ferry Hermansyah, GRCE, CIB, CRP, WPPE, CRM, FRM</div>
                                <div class="signature-title">Commissioner</div>
                            </td>
                            <td class="signature-box">
                                <div class="signature-line"></div>
                                <div class="signature-name">Ir. Pipip Sasati, CRP</div>
                                <div class="signature-title">Direktur</div>
                            </td>
                        </tr>
                    </table>
                </div>

            </div>
        </div>
    </div>

    <script>
        // Auto-adjust on load
        window.addEventListener('load', function() {
            console.log('Certificate loaded and ready to print!');
        });

        // Prevent accidental close
        window.addEventListener('beforeprint', function() {
            console.log('Printing certificate...');
        });

        window.addEventListener('afterprint', function() {
            console.log('Print completed!');
        });
    </script>
</body>
</html>
