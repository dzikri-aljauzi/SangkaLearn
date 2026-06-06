# Fix PostgreSQL Sequence Error

## Problem
Error: `SQLSTATE[23505]: Unique violation: duplicate key value violates unique constraint`

This error occurs when PostgreSQL sequence values are out of sync with the actual data in tables. This typically happens when:
1. Data is inserted with specific IDs (manual insertion)
2. Database is seeded without properly resetting sequences
3. Database is restored from a backup

## Symptom
When trying to create new records (e.g., messages, users, courses), you get:
```
SQLSTATE[23505]: Unique violation: 7 ERROR: duplicate key value violates unique constraint "messages_pkey"
DETAIL: Key (id)=(1) already exists.
```

## Solution

### Quick Fix (All Tables)
Run this command to fix all sequences at once:
```bash
php artisan postgres:fix-sequences
```

### Fix Specific Table
To fix only a specific table (e.g., messages):
```bash
php artisan postgres:fix-sequences --table=messages
```

### Tables Covered
The command automatically fixes sequences for these tables:
- course_sections
- courses
- users
- enrollments
- lessons
- assignments
- quizzes
- quiz_questions
- categories
- orders
- payments
- reviews
- **messages**
- **conversations**
- **conversation_participants**
- forums
- forum_topics
- forum_posts
- announcements

## When to Run This Command

### Always run after:
1. ✅ Database seeding (`php artisan db:seed`)
2. ✅ Importing data from SQL dumps
3. ✅ Restoring database from backup
4. ✅ Manual data insertion with specific IDs

### Add to your workflow:
```bash
# After fresh migration and seeding
php artisan migrate:fresh --seed
php artisan postgres:fix-sequences
```

## Technical Details

### What the Command Does
1. Checks each table's maximum ID value
2. Compares with current sequence value
3. Updates sequence to `MAX(id) + 1` if needed
4. Logs all changes for verification

### Example Output
```
Checking and fixing PostgreSQL sequences...
Checking table: messages
  Fixing sequence messages_id_seq: 1 -> 2
  ✅ Sequence fixed!

Fixed 1 sequences successfully!
```

## Prevention

### For Developers
If you're creating seeders or importing data, add this at the end:
```php
// In your seeder file
use Illuminate\Support\Facades\Artisan;

public function run()
{
    // ... your seeding code ...

    // Fix sequences after seeding
    Artisan::call('postgres:fix-sequences');
}
```

### For Production
Consider adding this to your deployment script:
```bash
#!/bin/bash
php artisan migrate
php artisan db:seed --class=ProductionSeeder
php artisan postgres:fix-sequences  # Add this line
php artisan cache:clear
```

## Manual Fix (Alternative)

If you prefer to fix manually using SQL:
```sql
-- For messages table
SELECT setval('messages_id_seq', (SELECT MAX(id) FROM messages) + 1);

-- For conversations table
SELECT setval('conversations_id_seq', (SELECT MAX(id) FROM conversations) + 1);

-- For any other table
SELECT setval('TABLE_NAME_id_seq', (SELECT MAX(id) FROM TABLE_NAME) + 1);
```

## Verification

After running the fix command, verify by trying to create a new record:
1. Try to send a new message
2. Try to create a new user
3. Check logs for any sequence errors

## Related Files
- Command: `app/Console/Commands/FixPostgresSequences.php`
- Controller: `app/Http/Controllers/MessageController.php`
- Model: `app/Models/Message.php`

## Status
✅ **FIXED** - All sequences have been synchronized and the messaging system is now working correctly.

## Date Fixed
2025-10-12

## Notes
- This is a PostgreSQL-specific issue (MySQL auto-increment doesn't have this problem)
- Safe to run multiple times (idempotent operation)
- No data loss risk
- Command has built-in error handling
