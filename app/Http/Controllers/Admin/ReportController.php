<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Enrollment;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\User;
use App\Exports\ReportsExport;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;

class ReportController extends Controller
{
    /**
     * Get year extraction SQL based on database driver
     */
    private function getYearSql($column)
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            return "EXTRACT(YEAR FROM {$column})";
        }

        // MySQL/MariaDB
        return "YEAR({$column})";
    }

    /**
     * Get month extraction SQL based on database driver
     */
    private function getMonthSql($column)
    {
        $driver = DB::connection()->getDriverName();

        if ($driver === 'pgsql') {
            return "EXTRACT(MONTH FROM {$column})";
        }

        // MySQL/MariaDB
        return "MONTH({$column})";
    }

    /**
     * Display reports dashboard
     */
    public function index(Request $request)
    {
        $dateRange = $this->getDateRange($request->get('period', 'monthly'));
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        if ($customStart && $customEnd) {
            $dateRange = [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay()
            ];
        }

        $reports = [
            'summary' => $this->getSummaryStats($dateRange),
            'revenue' => $this->getRevenueData($dateRange),
            'enrollments' => $this->getEnrollmentData($dateRange),
            'courses' => $this->getCoursesData($dateRange),
            'period' => $request->get('period', 'monthly'),
            'date_range' => $dateRange,
        ];

        return Inertia::render('Admin/Reports/Index', $reports);
    }

    /**
     * Get users report
     */
    public function users(Request $request)
    {
        $dateRange = $this->getDateRange($request->get('period', 'monthly'));
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        if ($customStart && $customEnd) {
            $dateRange = [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay()
            ];
        }

        $usersData = $this->getUsersData($dateRange);

        return Inertia::render('Admin/Reports/Users', [
            'users_data' => $usersData,
            'period' => $request->get('period', 'monthly'),
            'date_range' => $dateRange,
        ]);
    }

    /**
     * Get courses report
     */
    public function courses(Request $request)
    {
        $dateRange = $this->getDateRange($request->get('period', 'monthly'));
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        if ($customStart && $customEnd) {
            $dateRange = [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay()
            ];
        }

        $coursesData = $this->getDetailedCoursesData($dateRange);

        return Inertia::render('Admin/Reports/Courses', [
            'courses_data' => $coursesData,
            'period' => $request->get('period', 'monthly'),
            'date_range' => $dateRange,
        ]);
    }

    /**
     * Get revenue report
     */
    public function revenue(Request $request)
    {
        $dateRange = $this->getDateRange($request->get('period', 'monthly'));
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        if ($customStart && $customEnd) {
            $dateRange = [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay()
            ];
        }

        $revenueData = $this->getDetailedRevenueData($dateRange);

        return Inertia::render('Admin/Reports/Revenue', [
            'revenue_data' => $revenueData,
            'period' => $request->get('period', 'monthly'),
            'date_range' => $dateRange,
        ]);
    }

    /**
     * Export reports to Excel
     */
    public function export(Request $request)
    {
        $dateRange = $this->getDateRange($request->get('period', 'monthly'));
        $customStart = $request->get('start_date');
        $customEnd = $request->get('end_date');

        if ($customStart && $customEnd) {
            $dateRange = [
                'start' => Carbon::parse($customStart)->startOfDay(),
                'end' => Carbon::parse($customEnd)->endOfDay()
            ];
        }

        $period = $request->get('period', 'monthly');
        $filename = 'Laporan_LMS_' . $period . '_' . Carbon::now()->format('Y-m-d_His') . '.xlsx';

        return Excel::download(new ReportsExport($dateRange, $period), $filename);
    }

    /**
     * Get date range based on period
     */
    private function getDateRange($period)
    {
        $now = Carbon::now();
        
        switch ($period) {
            case 'today':
                return [
                    'start' => $now->copy()->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'yesterday':
                return [
                    'start' => $now->copy()->subDay()->startOfDay(),
                    'end' => $now->copy()->subDay()->endOfDay()
                ];
            case 'weekly':
                return [
                    'start' => $now->copy()->startOfWeek(),
                    'end' => $now->copy()->endOfWeek()
                ];
            case 'monthly':
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
            case 'quarterly':
                return [
                    'start' => $now->copy()->startOfQuarter(),
                    'end' => $now->copy()->endOfQuarter()
                ];
            case 'yearly':
                return [
                    'start' => $now->copy()->startOfYear(),
                    'end' => $now->copy()->endOfYear()
                ];
            case 'last_7_days':
                return [
                    'start' => $now->copy()->subDays(7)->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'last_30_days':
                return [
                    'start' => $now->copy()->subDays(30)->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            case 'last_90_days':
                return [
                    'start' => $now->copy()->subDays(90)->startOfDay(),
                    'end' => $now->copy()->endOfDay()
                ];
            default:
                return [
                    'start' => $now->copy()->startOfMonth(),
                    'end' => $now->copy()->endOfMonth()
                ];
        }
    }

    /**
     * Get summary statistics
     */
    private function getSummaryStats($dateRange)
    {
        // Revenue from completed payments
        $paymentRevenue = Payment::where('status', 'completed')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->sum('amount');

        // Revenue from direct/manual enrollments (siswa spesial)
        $directEnrollmentRevenue = Enrollment::join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->where('enrollments.enrollment_type', 'manual')
            ->where('enrollments.status', 'active')
            ->whereBetween('enrollments.enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->sum(DB::raw('CASE
                WHEN courses.is_free = true THEN 0
                WHEN courses.discount_price IS NOT NULL AND courses.discount_expires_at > enrollments.enrolled_at THEN courses.discount_price
                ELSE courses.price
            END'));

        return [
            'total_revenue' => $paymentRevenue + $directEnrollmentRevenue,
            'payment_revenue' => $paymentRevenue,
            'direct_enrollment_revenue' => $directEnrollmentRevenue,
            'total_orders' => Order::where('status', 'completed')
                ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'total_enrollments' => Enrollment::whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'direct_enrollments' => Enrollment::where('enrollment_type', 'manual')
                ->whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'paid_enrollments' => Enrollment::whereNotNull('order_id')
                ->whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'new_users' => User::whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
                ->count(),
            'active_courses' => Course::where('status', 'published')->count(),
        ];
    }

    /**
     * Get revenue data with trends
     */
    private function getRevenueData($dateRange)
    {
        // Revenue from payments by day
        $paymentsByDay = Payment::select(
                DB::raw('DATE(paid_at) as date'),
                DB::raw('SUM(amount) as payment_total'),
                DB::raw('COUNT(*) as payment_transactions')
            )
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Revenue from direct enrollments by day
        $directEnrollmentsByDay = Enrollment::join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->select(
                DB::raw('DATE(enrollments.enrolled_at) as date'),
                DB::raw('SUM(CASE
                    WHEN courses.is_free = true THEN 0
                    WHEN courses.discount_price IS NOT NULL AND courses.discount_expires_at > enrollments.enrolled_at THEN courses.discount_price
                    ELSE courses.price
                END) as direct_total'),
                DB::raw('COUNT(*) as direct_transactions')
            )
            ->where('enrollments.enrollment_type', 'manual')
            ->where('enrollments.status', 'active')
            ->whereBetween('enrollments.enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        // Combine both revenue streams by date
        $allDates = collect($paymentsByDay->pluck('date'))
            ->merge($directEnrollmentsByDay->pluck('date'))
            ->unique()
            ->sort()
            ->values();

        $revenueByDay = $allDates->map(function ($date) use ($paymentsByDay, $directEnrollmentsByDay) {
            $payment = $paymentsByDay->firstWhere('date', $date);
            $direct = $directEnrollmentsByDay->firstWhere('date', $date);
            
            $paymentTotal = $payment ? $payment->payment_total : 0;
            $directTotal = $direct ? $direct->direct_total : 0;
            $paymentTransactions = $payment ? $payment->payment_transactions : 0;
            $directTransactions = $direct ? $direct->direct_transactions : 0;
            
            return (object) [
                'date' => $date,
                'total' => $paymentTotal + $directTotal,
                'payment_total' => $paymentTotal,
                'direct_total' => $directTotal,
                'transactions' => $paymentTransactions + $directTransactions,
                'payment_transactions' => $paymentTransactions,
                'direct_transactions' => $directTransactions,
            ];
        });

        // Revenue by payment method (only for actual payments)
        $revenueByMethod = Payment::select('payment_method', DB::raw('SUM(amount) as total'))
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('payment_method')
            ->get();

        // Add direct enrollments as a "method"
        $directEnrollmentTotal = $directEnrollmentsByDay->sum('direct_total');
        if ($directEnrollmentTotal > 0) {
            $revenueByMethod->push((object) [
                'payment_method' => 'Direct Enrollment',
                'total' => $directEnrollmentTotal
            ]);
        }

        $totalRevenue = $revenueByDay->sum('total');
        $totalTransactions = $revenueByDay->sum('transactions');

        return [
            'daily_revenue' => $revenueByDay,
            'payment_methods' => $revenueByMethod,
            'total_revenue' => $totalRevenue,
            'payment_revenue' => $paymentsByDay->sum('payment_total'),
            'direct_enrollment_revenue' => $directEnrollmentsByDay->sum('direct_total'),
            'average_transaction' => $totalTransactions > 0 ? $totalRevenue / $totalTransactions : 0,
        ];
    }

    /**
     * Get enrollment data
     */
    private function getEnrollmentData($dateRange)
    {
        $enrollmentsByDay = Enrollment::select(
                DB::raw('DATE(enrolled_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $enrollmentsByStatus = Enrollment::select('status', DB::raw('COUNT(*) as total'))
            ->whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('status')
            ->get();

        return [
            'daily_enrollments' => $enrollmentsByDay,
            'status_breakdown' => $enrollmentsByStatus,
            'total_enrollments' => $enrollmentsByDay->sum('total'),
        ];
    }

    /**
     * Get courses data
     */
    private function getCoursesData($dateRange)
    {
        $topCourses = Course::select('courses.*')
            ->join('order_items', 'courses.id', '=', 'order_items.course_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('courses.id')
            ->selectRaw('courses.*, COUNT(order_items.id) as sales_count, SUM(order_items.total_price) as revenue')
            ->orderBy('sales_count', 'desc')
            ->limit(10)
            ->get();

        $coursesByCategory = Course::select('categories.name as category_name', DB::raw('COUNT(*) as total'))
            ->join('categories', 'courses.category_id', '=', 'categories.id')
            ->join('order_items', 'courses.id', '=', 'order_items.course_id')
            ->join('orders', 'order_items.order_id', '=', 'orders.id')
            ->where('orders.status', 'completed')
            ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('categories.name')
            ->get();

        return [
            'top_selling_courses' => $topCourses,
            'sales_by_category' => $coursesByCategory,
        ];
    }

    /**
     * Get detailed users data
     */
    private function getUsersData($dateRange)
    {
        $usersByDay = User::select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(*) as total')
            )
            ->whereBetween('created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $usersByRole = User::join('user_roles', 'users.id', '=', 'user_roles.user_id')
            ->join('roles', 'user_roles.role_id', '=', 'roles.id')
            ->select('roles.name as role_name', DB::raw('COUNT(*) as total'))
            ->whereBetween('users.created_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('roles.name')
            ->get();

        $topStudents = User::select('users.*')
            ->join('enrollments', 'users.id', '=', 'enrollments.user_id')
            ->whereBetween('enrollments.enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('users.id')
            ->selectRaw('users.*, COUNT(enrollments.id) as enrollments_count')
            ->orderBy('enrollments_count', 'desc')
            ->limit(10)
            ->get();

        return [
            'daily_registrations' => $usersByDay,
            'users_by_role' => $usersByRole,
            'top_students' => $topStudents,
            'total_new_users' => $usersByDay->sum('total'),
        ];
    }

    /**
     * Get detailed courses data
     */
    private function getDetailedCoursesData($dateRange)
    {
        $courseSales = Course::select('courses.*')
            ->selectSub(function ($query) use ($dateRange) {
                $query->from('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', 'completed')
                    ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->selectRaw('COUNT(*)');
            }, 'sales_count')
            ->selectSub(function ($query) use ($dateRange) {
                $query->from('order_items')
                    ->join('orders', 'order_items.order_id', '=', 'orders.id')
                    ->where('orders.status', 'completed')
                    ->whereBetween('orders.created_at', [$dateRange['start'], $dateRange['end']])
                    ->whereColumn('order_items.course_id', 'courses.id')
                    ->selectRaw('COALESCE(SUM(order_items.total_price), 0)');
            }, 'revenue')
            ->selectSub(function ($query) use ($dateRange) {
                $query->from('enrollments')
                    ->whereBetween('enrolled_at', [$dateRange['start'], $dateRange['end']])
                    ->whereColumn('enrollments.course_id', 'courses.id')
                    ->selectRaw('COUNT(*)');
            }, 'enrollments_count')
            ->orderBy('revenue', 'desc')
            ->get();

        return [
            'course_performance' => $courseSales,
        ];
    }

    /**
     * Get detailed revenue data
     */
    private function getDetailedRevenueData($dateRange)
    {
        // Payment transactions
        $paymentTransactions = Payment::select(
                'payments.*',
                'orders.order_number',
                'users.first_name',
                'users.last_name',
                'users.email',
                DB::raw("'Payment' as revenue_type")
            )
            ->join('orders', 'payments.order_id', '=', 'orders.id')
            ->join('users', 'payments.user_id', '=', 'users.id')
            ->where('payments.status', 'completed')
            ->whereBetween('payments.paid_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('payments.paid_at', 'desc')
            ->get();

        // Direct enrollment transactions
        $directEnrollments = Enrollment::select(
                'enrollments.id',
                'enrollments.enrolled_at as paid_at',
                DB::raw('CASE
                    WHEN courses.is_free = true THEN 0
                    WHEN courses.discount_price IS NOT NULL AND courses.discount_expires_at > enrollments.enrolled_at THEN courses.discount_price
                    ELSE courses.price
                END as amount'),
                DB::raw("'Direct Enrollment' as revenue_type"),
                DB::raw("'direct' as payment_method"),
                DB::raw("'completed' as status"),
                'courses.title as course_title',
                'users.first_name',
                'users.last_name',
                'users.email',
                DB::raw("CONCAT('DE-', enrollments.id) as order_number")
            )
            ->join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->join('users', 'enrollments.user_id', '=', 'users.id')
            ->where('enrollments.enrollment_type', 'manual')
            ->where('enrollments.status', 'active')
            ->whereBetween('enrollments.enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->orderBy('enrollments.enrolled_at', 'desc')
            ->get();

        // Combine and sort all transactions
        $allTransactions = collect($paymentTransactions)->merge($directEnrollments)
            ->sortByDesc('paid_at')
            ->values();

        // Monthly revenue breakdown (combined)
        $monthlyPayments = Payment::select(
                DB::raw($this->getYearSql('paid_at') . ' as year'),
                DB::raw($this->getMonthSql('paid_at') . ' as month'),
                DB::raw('SUM(amount) as payment_total'),
                DB::raw('COUNT(*) as payment_transactions')
            )
            ->where('status', 'completed')
            ->whereBetween('paid_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('year', 'month')
            ->get();

        $monthlyDirects = Enrollment::join('courses', 'enrollments.course_id', '=', 'courses.id')
            ->select(
                DB::raw($this->getYearSql('enrollments.enrolled_at') . ' as year'),
                DB::raw($this->getMonthSql('enrollments.enrolled_at') . ' as month'),
                DB::raw('SUM(CASE
                    WHEN courses.is_free = true THEN 0
                    WHEN courses.discount_price IS NOT NULL AND courses.discount_expires_at > enrollments.enrolled_at THEN courses.discount_price
                    ELSE courses.price
                END) as direct_total'),
                DB::raw('COUNT(*) as direct_transactions')
            )
            ->where('enrollments.enrollment_type', 'manual')
            ->where('enrollments.status', 'active')
            ->whereBetween('enrollments.enrolled_at', [$dateRange['start'], $dateRange['end']])
            ->groupBy('year', 'month')
            ->get();

        // Combine monthly data
        $allMonths = collect($monthlyPayments->pluck('year')->zip($monthlyPayments->pluck('month')))
            ->merge($monthlyDirects->pluck('year')->zip($monthlyDirects->pluck('month')))
            ->unique()
            ->map(function ($item) {
                return ['year' => $item[0], 'month' => $item[1]];
            });

        $monthlyBreakdown = $allMonths->map(function ($item) use ($monthlyPayments, $monthlyDirects) {
            $year = $item['year'];
            $month = $item['month'];
            
            $payment = $monthlyPayments->where('year', $year)->where('month', $month)->first();
            $direct = $monthlyDirects->where('year', $year)->where('month', $month)->first();
            
            $paymentTotal = $payment ? $payment->payment_total : 0;
            $directTotal = $direct ? $direct->direct_total : 0;
            $paymentTransactions = $payment ? $payment->payment_transactions : 0;
            $directTransactions = $direct ? $direct->direct_transactions : 0;
            
            return (object) [
                'year' => $year,
                'month' => $month,
                'total' => $paymentTotal + $directTotal,
                'payment_total' => $paymentTotal,
                'direct_total' => $directTotal,
                'transactions' => $paymentTransactions + $directTransactions,
                'payment_transactions' => $paymentTransactions,
                'direct_transactions' => $directTransactions,
            ];
        })->sortByDesc('year')->sortByDesc('month')->values();

        return [
            'payment_transactions' => $paymentTransactions,
            'direct_enrollments' => $directEnrollments,
            'all_transactions' => $allTransactions,
            'monthly_breakdown' => $monthlyBreakdown,
            'revenue_summary' => [
                'payment_revenue' => $paymentTransactions->sum('amount'),
                'direct_enrollment_revenue' => $directEnrollments->sum('amount'),
                'total_revenue' => $allTransactions->sum('amount'),
                'payment_count' => $paymentTransactions->count(),
                'direct_enrollment_count' => $directEnrollments->count(),
                'total_transactions' => $allTransactions->count(),
            ]
        ];
    }
}
