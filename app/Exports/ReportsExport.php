<?php

namespace App\Exports;

use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\Payment;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Maatwebsite\Excel\Concerns\FromCollection;
use Maatwebsite\Excel\Concerns\WithMultipleSheets;
use Maatwebsite\Excel\Concerns\WithTitle;
use Maatwebsite\Excel\Concerns\WithHeadings;
use Maatwebsite\Excel\Concerns\WithStyles;
use Maatwebsite\Excel\Concerns\WithColumnWidths;
use PhpOffice\PhpSpreadsheet\Worksheet\Worksheet;
use PhpOffice\PhpSpreadsheet\Style\Color;
use PhpOffice\PhpSpreadsheet\Style\Fill;

class ReportsExport implements WithMultipleSheets
{
    private $dateRange;
    private $period;

    public function __construct($dateRange, $period = 'monthly')
    {
        $this->dateRange = $dateRange;
        $this->period = $period;
    }

    public function sheets(): array
    {
        return [
            'Ringkasan' => new SummarySheet($this->dateRange, $this->period),
            'Pendapatan' => new RevenueSheet($this->dateRange),
            'Pendaftaran' => new EnrollmentSheet($this->dateRange),
            'Pelatihan Terlaris' => new CoursesSheet($this->dateRange),
            'Detail Pembayaran' => new PaymentDetailsSheet($this->dateRange),
            'Data Pengguna' => new UsersSheet($this->dateRange),
        ];
    }
}

class SummarySheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;
    private $period;

    public function __construct($dateRange, $period)
    {
        $this->dateRange = $dateRange;
        $this->period = $period;
    }

    public function collection()
    {
        $totalRevenue = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->sum('amount');

        $totalOrders = Order::where('status', 'completed')
            ->whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->count();

        $totalEnrollments = Enrollment::whereBetween('enrolled_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->count();

        $newUsers = User::whereBetween('created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->count();

        $activeCourses = Course::where('status', 'published')->count();

        return collect([
            [
                'metrik' => 'Periode Laporan',
                'nilai' => ucfirst($this->period),
                'satuan' => '',
                'keterangan' => $this->dateRange['start']->format('d M Y') . ' - ' . $this->dateRange['end']->format('d M Y')
            ],
            [
                'metrik' => 'Total Pendapatan',
                'nilai' => number_format($totalRevenue, 0, ',', '.'),
                'satuan' => 'IDR',
                'keterangan' => 'Pendapatan dari pembayaran yang telah dikonfirmasi'
            ],
            [
                'metrik' => 'Total Pesanan',
                'nilai' => number_format($totalOrders, 0, ',', '.'),
                'satuan' => 'pesanan',
                'keterangan' => 'Pesanan yang telah selesai dan dikonfirmasi'
            ],
            [
                'metrik' => 'Total Pendaftaran',
                'nilai' => number_format($totalEnrollments, 0, ',', '.'),
                'satuan' => 'siswa',
                'keterangan' => 'Siswa yang mendaftar di pelatihan pada periode ini'
            ],
            [
                'metrik' => 'Pengguna Baru',
                'nilai' => number_format($newUsers, 0, ',', '.'),
                'satuan' => 'pengguna',
                'keterangan' => 'Pengguna yang mendaftar pada periode ini'
            ],
            [
                'metrik' => 'Pelatihan Aktif',
                'nilai' => number_format($activeCourses, 0, ',', '.'),
                'satuan' => 'pelatihan',
                'keterangan' => 'Pelatihan yang sedang aktif dan dapat dibeli'
            ],
            [
                'metrik' => 'Rata-rata Transaksi',
                'nilai' => $totalOrders > 0 ? number_format($totalRevenue / $totalOrders, 0, ',', '.') : '0',
                'satuan' => 'IDR',
                'keterangan' => 'Rata-rata nilai per transaksi'
            ]
        ]);
    }

    public function headings(): array
    {
        return [
            'Metrik',
            'Nilai',
            'Satuan',
            'Keterangan'
        ];
    }

    public function title(): string
    {
        return 'Ringkasan';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:D1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '4F46E5']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 25,
            'B' => 20,
            'C' => 15,
            'D' => 50,
        ];
    }
}

class RevenueSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Payment::select(
                'payments.paid_at as tanggal_bayar',
                'orders.order_number as nomor_pesanan',
                'users.first_name as nama_depan',
                'users.last_name as nama_belakang',
                'users.email',
                'payments.payment_method as metode_pembayaran',
                'payments.amount as jumlah',
                'payments.currency as mata_uang',
                'payments.transaction_id as id_transaksi'
            )
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->where('payments.status', 'completed')
            ->whereBetween('payments.paid_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->orderBy('payments.paid_at', 'desc')
            ->get()
            ->map(function ($payment) {
                return [
                    'tanggal_bayar' => Carbon::parse($payment->tanggal_bayar)->format('d/m/Y H:i'),
                    'nomor_pesanan' => $payment->nomor_pesanan,
                    'nama_lengkap' => trim($payment->nama_depan . ' ' . $payment->nama_belakang),
                    'email' => $payment->email,
                    'metode_pembayaran' => ucfirst($payment->metode_pembayaran),
                    'jumlah' => number_format($payment->jumlah, 0, ',', '.'),
                    'mata_uang' => $payment->mata_uang,
                    'id_transaksi' => $payment->id_transaksi
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Tanggal Bayar',
            'Nomor Pesanan',
            'Nama Lengkap',
            'Email',
            'Metode Pembayaran',
            'Jumlah',
            'Mata Uang',
            'ID Transaksi'
        ];
    }

    public function title(): string
    {
        return 'Pendapatan';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '059669']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 18,
            'B' => 18,
            'C' => 25,
            'D' => 30,
            'E' => 20,
            'F' => 18,
            'G' => 12,
            'H' => 20,
        ];
    }
}

class EnrollmentSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Enrollment::select(
                'enrollments.enrolled_at as tanggal_daftar',
                'users.first_name as nama_depan',
                'users.last_name as nama_belakang',
                'users.email',
                'courses.title as nama_pelatihan',
                'courses.price as harga_pelatihan',
                'enrollments.status',
                'enrollments.progress_percentage as progress',
                'enrollments.total_time_spent as waktu_belajar',
                'enrollments.completed_at as tanggal_selesai'
            )
            ->join('users', 'enrollments.user_id', '=', 'users.id')
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->whereBetween('enrollments.enrolled_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->orderBy('enrollments.enrolled_at', 'desc')
            ->get()
            ->map(function ($enrollment) {
                return [
                    'tanggal_daftar' => Carbon::parse($enrollment->tanggal_daftar)->format('d/m/Y H:i'),
                    'nama_lengkap' => trim($enrollment->nama_depan . ' ' . $enrollment->nama_belakang),
                    'email' => $enrollment->email,
                    'nama_pelatihan' => $enrollment->nama_pelatihan,
                    'harga_pelatihan' => 'Rp ' . number_format($enrollment->harga_pelatihan, 0, ',', '.'),
                    'status' => ucfirst($enrollment->status),
                    'progress' => $enrollment->progress . '%',
                    'waktu_belajar' => $this->formatTime($enrollment->waktu_belajar),
                    'tanggal_selesai' => $enrollment->tanggal_selesai 
                        ? Carbon::parse($enrollment->tanggal_selesai)->format('d/m/Y H:i') 
                        : '-'
                ];
            });
    }

    private function formatTime($seconds)
    {
        if (!$seconds) return '0 menit';
        
        $hours = floor($seconds / 3600);
        $minutes = floor(($seconds % 3600) / 60);
        
        if ($hours > 0) {
            return $hours . ' jam ' . $minutes . ' menit';
        }
        
        return $minutes . ' menit';
    }

    public function headings(): array
    {
        return [
            'Tanggal Daftar',
            'Nama Lengkap',
            'Email',
            'Nama Pelatihan',
            'Harga Pelatihan',
            'Status',
            'Progress',
            'Waktu Belajar',
            'Tanggal Selesai'
        ];
    }

    public function title(): string
    {
        return 'Pendaftaran';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '7C3AED']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 18,
            'B' => 25,
            'C' => 30,
            'D' => 35,
            'E' => 18,
            'F' => 12,
            'G' => 12,
            'H' => 18,
            'I' => 18,
        ];
    }
}

class CoursesSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Course::select('courses.*')
            ->selectSub(function ($query) {
                $query->from('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', 'completed')
                    ->whereBetween('orders.created_at', [$this->dateRange['start'], $this->dateRange['end']])
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->selectRaw('COUNT(*)');
            }, 'sales_count')
            ->selectSub(function ($query) {
                $query->from('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', 'completed')
                    ->whereBetween('orders.created_at', [$this->dateRange['start'], $this->dateRange['end']])
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->selectRaw('COALESCE(SUM(order_items.total_price), 0)');
            }, 'revenue')
            ->selectSub(function ($query) {
                $query->from('enrollments')
                    ->whereBetween('enrolled_at', [$this->dateRange['start'], $this->dateRange['end']])
                    ->whereColumn('enrollments.course_id', 'courses.id')
                    ->selectRaw('COUNT(*)');
            }, 'enrollments_count')
            ->orderBy('revenue', 'desc')
            ->get()
            ->map(function ($course) {
                return [
                    'nama_pelatihan' => $course->title,
                    'harga' => 'Rp ' . number_format($course->price, 0, ',', '.'),
                    'jumlah_terjual' => number_format($course->sales_count, 0, ',', '.'),
                    'jumlah_pendaftar' => number_format($course->enrollments_count, 0, ',', '.'),
                    'total_pendapatan' => 'Rp ' . number_format($course->revenue, 0, ',', '.'),
                    'status' => ucfirst($course->status),
                    'tanggal_dibuat' => Carbon::parse($course->created_at)->format('d/m/Y'),
                    'instruktur' => $course->instructor_name ?? '-'
                ];
            });
    }

    public function headings(): array
    {
        return [
            'Nama Pelatihan',
            'Harga',
            'Jumlah Terjual',
            'Jumlah Pendaftar',
            'Total Pendapatan',
            'Status',
            'Tanggal Dibuat',
            'Instruktur'
        ];
    }

    public function title(): string
    {
        return 'Pelatihan Terlaris';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:H1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'EA580C']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 40,
            'B' => 18,
            'C' => 18,
            'D' => 18,
            'E' => 20,
            'F' => 12,
            'G' => 18,
            'H' => 25,
        ];
    }
}

class PaymentDetailsSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return Payment::select(
                'payments.paid_at as tanggal',
                'orders.order_number',
                'users.first_name',
                'users.last_name',
                'users.email',
                'payments.amount',
                'payments.payment_method',
                'payments.transaction_id',
                'payments.status'
            )
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->where('payments.status', 'completed')
            ->whereBetween('payments.paid_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->orderBy('payments.paid_at', 'desc')
            ->get()
            ->map(function ($payment, $index) {
                return [
                    'no' => $index + 1,
                    'tanggal' => Carbon::parse($payment->tanggal)->format('d/m/Y H:i:s'),
                    'nomor_pesanan' => $payment->order_number,
                    'nama_customer' => trim($payment->first_name . ' ' . $payment->last_name),
                    'email' => $payment->email,
                    'jumlah_bayar' => number_format($payment->amount, 0, ',', '.'),
                    'metode_bayar' => ucfirst(str_replace('_', ' ', $payment->payment_method)),
                    'id_transaksi' => $payment->transaction_id,
                    'status' => ucfirst($payment->status)
                ];
            });
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal Bayar',
            'Nomor Pesanan',
            'Nama Customer',
            'Email',
            'Jumlah Bayar (IDR)',
            'Metode Bayar',
            'ID Transaksi',
            'Status'
        ];
    }

    public function title(): string
    {
        return 'Detail Pembayaran';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:I1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => 'DC2626']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 20,
            'C' => 18,
            'D' => 25,
            'E' => 30,
            'F' => 20,
            'G' => 18,
            'H' => 22,
            'I' => 12,
        ];
    }
}

class UsersSheet implements FromCollection, WithHeadings, WithTitle, WithStyles, WithColumnWidths
{
    private $dateRange;

    public function __construct($dateRange)
    {
        $this->dateRange = $dateRange;
    }

    public function collection()
    {
        return User::select(
                'users.created_at as tanggal_daftar',
                'users.first_name',
                'users.last_name',
                'users.email',
                'roles.name as role'
            )
            ->join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->whereBetween('users.created_at', [$this->dateRange['start'], $this->dateRange['end']])
            ->orderBy('users.created_at', 'desc')
            ->get()
            ->map(function ($user, $index) {
                return [
                    'no' => $index + 1,
                    'tanggal_daftar' => Carbon::parse($user->tanggal_daftar)->format('d/m/Y H:i'),
                    'nama_lengkap' => trim($user->first_name . ' ' . $user->last_name),
                    'email' => $user->email,
                    'role' => ucfirst($user->role),
                    'status' => 'Aktif'
                ];
            });
    }

    public function headings(): array
    {
        return [
            'No',
            'Tanggal Daftar',
            'Nama Lengkap',
            'Email',
            'Role',
            'Status'
        ];
    }

    public function title(): string
    {
        return 'Data Pengguna';
    }

    public function styles(Worksheet $sheet)
    {
        $sheet->getStyle('A1:F1')->applyFromArray([
            'font' => ['bold' => true, 'color' => ['rgb' => 'FFFFFF']],
            'fill' => [
                'fillType' => Fill::FILL_SOLID,
                'startColor' => ['rgb' => '0891B2']
            ]
        ]);

        return [];
    }

    public function columnWidths(): array
    {
        return [
            'A' => 8,
            'B' => 20,
            'C' => 25,
            'D' => 35,
            'E' => 15,
            'F' => 12,
        ];
    }
}