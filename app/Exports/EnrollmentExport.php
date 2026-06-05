<?php

namespace App\Exports;

use App\Models\Enrollment;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\ShouldAutoSize;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Alignment;
use PhpOffice\PhpSpreadsheet\Style\Border;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class EnrollmentExport implements FromCollection, WithHeadings, WithStyles, WithColumnWidths, WithTitle, ShouldAutoSize
{
    protected $filters;

    public function __construct($filters = [])
    {
        $this->filters = $filters;
    }

    public function collection()
    {
        try {
            $query = Enrollment::with(['user', 'course', 'order'])
                              ->orderBy('enrolled_at', 'desc');

            // Apply filters
            if (!empty($this->filters['search'])) {
                $search = $this->filters['search'];
                $query->whereHas('user', function($q) use ($search) {
                    $q->where('first_name', 'like', "%{$search}%")
                      ->orWhere('last_name', 'like', "%{$search}%")
                      ->orWhere('email', 'like', "%{$search}%");
                })->orWhereHas('course', function($q) use ($search) {
                    $q->where('title', 'like', "%{$search}%");
                });
            }

            if (!empty($this->filters['status'])) {
                $query->where('status', $this->filters['status']);
            }

            if (!empty($this->filters['course'])) {
                $query->where('course_id', $this->filters['course']);
            }

            if (!empty($this->filters['date_range'])) {
                switch ($this->filters['date_range']) {
                    case 'today':
                        $query->whereDate('enrolled_at', today());
                        break;
                    case 'week':
                        $query->whereBetween('enrolled_at', [now()->startOfWeek(), now()->endOfWeek()]);
                        break;
                    case 'month':
                        $query->whereMonth('enrolled_at', now()->month)
                              ->whereYear('enrolled_at', now()->year);
                        break;
                    case 'year':
                        $query->whereYear('enrolled_at', now()->year);
                        break;
                }
            }

            $enrollments = $query->get();
            
            \Log::info('Export data collected', ['count' => $enrollments->count()]);

            return $enrollments->map(function($enrollment) {
                try {
                    return [
                        'ID' => $enrollment->id ?? '',
                        'Nama Siswa' => $enrollment->user ? trim("{$enrollment->user->first_name} {$enrollment->user->last_name}") : 'N/A',
                        'Email Siswa' => $enrollment->user->email ?? 'N/A',
                        'Nama Pelatihan' => $enrollment->course->title ?? 'N/A',
                        'Status' => ucfirst($enrollment->status ?? 'unknown'),
                        'Progress (%)' => $enrollment->progress_percentage ?? 0,
                        'Waktu Belajar (Menit)' => $enrollment->total_time_spent ? round($enrollment->total_time_spent / 60) : 0,
                        'Tanggal Daftar' => $enrollment->enrolled_at ? $enrollment->enrolled_at->format('d/m/Y H:i') : '-',
                        'Tanggal Selesai' => $enrollment->completed_at ? $enrollment->completed_at->format('d/m/Y H:i') : '-',
                        'Tanggal Berakhir' => $enrollment->expires_at ? $enrollment->expires_at->format('d/m/Y') : '-',
                        'Terakhir Akses' => $enrollment->last_accessed_at ? $enrollment->last_accessed_at->format('d/m/Y H:i') : '-',
                        'Order ID' => $enrollment->order_id ?? '-',
                        'Harga Pelatihan' => ($enrollment->course && isset($enrollment->course->price)) ? 'Rp ' . number_format($enrollment->course->price, 0, ',', '.') : '-',
                    ];
                } catch (\Exception $e) {
                    \Log::error('Error processing enrollment row', [
                        'enrollment_id' => $enrollment->id ?? 'unknown',
                        'error' => $e->getMessage()
                    ]);
                    
                    // Return a safe fallback row
                    return [
                        'ID' => $enrollment->id ?? '',
                        'Nama Siswa' => 'Error',
                        'Email Siswa' => 'Error',
                        'Nama Pelatihan' => 'Error',
                        'Status' => 'Error',
                        'Progress (%)' => 0,
                        'Waktu Belajar (Menit)' => 0,
                        'Tanggal Daftar' => '-',
                        'Tanggal Selesai' => '-',
                        'Tanggal Berakhir' => '-',
                        'Terakhir Akses' => '-',
                        'Order ID' => '-',
                        'Harga Pelatihan' => '-',
                    ];
                }
            });
        } catch (\Exception $e) {
            \Log::error('Error in export collection method', [
                'error' => $e->getMessage(),
                'filters' => $this->filters
            ]);
            
            // Return empty collection as fallback
            return collect([]);
        }
    }

    public function headings(): array
    {
        return [
            'ID',
            'Nama Siswa',
            'Email Siswa',
            'Nama Pelatihan',
            'Status',
            'Progress (%)',
            'Waktu Belajar (Menit)',
            'Tanggal Daftar',
            'Tanggal Selesai',
            'Tanggal Berakhir',
            'Terakhir Akses',
            'Order ID',
            'Harga Pelatihan',
        ];
    }

    public function styles(Worksheet $sheet)
    {
        // Header styling
        $sheet->getStyle('A1:M1')->applyFromArray([
            'font' => [
                'bold' => true,
                'color' => ['argb' => 'FFFFFF'],
                'size' => 12,
            ],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['argb' => '4F46E5'], // Indigo color
            ],
            'alignment' => [
                'horizontal' => Alignment::HORIZONTAL_CENTER,
                'vertical' => Alignment::VERTICAL_CENTER,
            ],
            'borders' => [
                'allBorders' => [
                    'borderStyle' => Border::BORDER_THIN,
                    'color' => ['argb' => '000000'],
                ],
            ],
        ]);

        // Data rows styling
        $lastRow = $sheet->getHighestRow();
        if ($lastRow > 1) {
            $sheet->getStyle("A2:M{$lastRow}")->applyFromArray([
                'borders' => [
                    'allBorders' => [
                        'borderStyle' => Border::BORDER_THIN,
                        'color' => ['argb' => 'CCCCCC'],
                    ],
                ],
                'alignment' => [
                    'vertical' => Alignment::VERTICAL_CENTER,
                ],
            ]);

            // Alternate row colors
            for ($row = 2; $row <= $lastRow; $row++) {
                if ($row % 2 == 0) {
                    $sheet->getStyle("A{$row}:M{$row}")->applyFromArray([
                        'fill' => [
                            'fillType' => Fill::FILL_SOLID,
                            'startColor' => ['argb' => 'F8FAFC'],
                        ],
                    ]);
                }
            }

            // Progress column alignment
            $sheet->getStyle("F2:F{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            
            // Time column alignment
            $sheet->getStyle("G2:G{$lastRow}")->getAlignment()->setHorizontal(Alignment::HORIZONTAL_CENTER);
            
            // Status column styling
            $sheet->getStyle("E2:E{$lastRow}")->applyFromArray([
                'alignment' => [
                    'horizontal' => Alignment::HORIZONTAL_CENTER,
                ],
                'font' => [
                    'bold' => true,
                ],
            ]);
        }

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,   // ID
            'B' => 20,  // Nama Siswa
            'C' => 25,  // Email Siswa
            'D' => 30,  // Nama Pelatihan
            'E' => 12,  // Status
            'F' => 12,  // Progress
            'G' => 18,  // Waktu Belajar
            'H' => 18,  // Tanggal Daftar
            'I' => 18,  // Tanggal Selesai
            'J' => 18,  // Tanggal Berakhir
            'K' => 18,  // Terakhir Akses
            'L' => 12,  // Order ID
            'M' => 18,  // Harga Pelatihan
        ];
    }

    public function title(): string
    {
        return 'Riwayat Pendaftaran';
    }
}