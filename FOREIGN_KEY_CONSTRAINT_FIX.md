# 🎯 FOREIGN KEY CONSTRAINT VIOLATION - RESOLVED

## ❌ **ORIGINAL ERROR:**
```
SQLSTATE[23000]: Integrity constraint violation: 19 FOREIGN KEY constraint failed 
(Connection: sqlite, SQL: insert into "payments" ("order_id", "user_id", ...) values 
(QRIS-1757160932-0007, 7, gopay_qris, pending, ...))
```

## 🔍 **ROOT CAUSE ANALYSIS:**

### Database Schema Issue:
```sql
-- payments table foreign key constraints:
FOREIGN KEY (order_id) REFERENCES orders(id)  -- Expects INTEGER
FOREIGN KEY (user_id) REFERENCES users(id)    -- Expects INTEGER
```

### Problem:
- **payments.order_id** expects **INTEGER** (references orders.id)
- **PaymentController** was sending **STRING** (`QRIS-1757160932-0007`)
- **Result**: Foreign key constraint violation

## ✅ **SOLUTION IMPLEMENTED:**

### 1. **Create Order Record First**
Instead of storing Midtrans order ID directly in payments table, we now:

```php
// Before (❌ WRONG):
Payment::create([
    'order_id' => 'QRIS-1757160932-0007', // STRING - violates FK constraint
    'user_id' => 7,
    // ...
]);

// After (✅ CORRECT):
// 1. Create Order record first
$order = Order::create([
    'order_number' => 'QRIS-1757160932-0007', // Store as order_number
    'user_id' => 7,
    'status' => 'pending',
    'total_amount' => 1000,
    // ...
]);

// 2. Create OrderItems
OrderItem::create([
    'order_id' => $order->id, // Use order.id (INTEGER)
    'course_id' => 5,
    'price' => 1000,
    // ...
]);

// 3. Create Payment with proper foreign key
Payment::create([
    'order_id' => $order->id,  // ✅ INTEGER - satisfies FK constraint
    'user_id' => 7,
    // ...
    'payment_details' => [
        'midtrans_order_id' => 'QRIS-1757160932-0007', // Store Midtrans ID here
        'order_number' => 'QRIS-1757160932-0007'
    ]
]);
```

### 2. **Transaction Safety**
```php
DB::beginTransaction();
try {
    $order = Order::create([...]);
    $orderItem = OrderItem::create([...]);
    $payment = Payment::create([...]);
    DB::commit();
} catch (\Exception $e) {
    DB::rollback();
    throw $e;
}
```

### 3. **Updated Course Enrollment**
```php
// Use order items for enrollment instead of payment details
foreach ($payment->order->items as $orderItem) {
    DB::table('enrollments')->insert([
        'user_id' => $payment->user_id,
        'course_id' => $orderItem->course_id, // From order items
        'order_id' => $payment->order_id,
        // ...
    ]);
}
```

## 📊 **DATABASE RELATIONSHIPS:**

```
orders (id: INTEGER) ←── payments (order_id: INTEGER FK) 
   ↓
order_items (order_id: INTEGER FK)
   ↓
courses (id: INTEGER)

users (id: INTEGER) ←── payments (user_id: INTEGER FK)
```

## 🧪 **TESTING RESULTS:**

### Before Fix:
```
❌ SQLSTATE[23000]: Integrity constraint violation: 19 FOREIGN KEY constraint failed
```

### After Fix:
```
✅ Order created with ID: 8
✅ OrderItem created for course ID: 5  
✅ Payment created with order_id: 8 (INTEGER)
✅ QRIS payment token generated successfully
✅ No foreign key constraint violations
```

## 🔧 **KEY CHANGES:**

### Files Modified:
- ✅ **PaymentController.php** - Added Order creation logic
- ✅ **PaymentController.php** - Updated handleCourseEnrollment method
- ✅ **Database relationships** - Proper FK references maintained

### Response Format:
```json
{
  "success": true,
  "snap_token": "c8aef476-7cf0-4a69-8371-f26c6b4547aa",
  "order_id": "QRIS-1757160932-0007",      // Midtrans order ID
  "order_number": "QRIS-1757160932-0007",  // Our order number  
  "db_order_id": 8,                        // Database order ID (integer)
  "payment_id": 15,
  "total": 1000,
  "message": "QRIS payment token generated successfully"
}
```

## 🚀 **RESULT:**

**✅ FOREIGN KEY CONSTRAINT ISSUE COMPLETELY RESOLVED!**

- No more database constraint violations
- Proper order tracking with Order → OrderItem → Payment relationship
- Course enrollment via proper order items
- Transaction safety with rollback capability
- Clean separation between Midtrans IDs and database IDs

**User sekarang dapat melakukan QRIS payment tanpa error database!** 🎉