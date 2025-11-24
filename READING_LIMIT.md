# Daily Reading Limit Feature

## Overview
This feature limits users to **3 readings per day** with robust client-side and server-side validation.

## Architecture

### 1. Client-Side Tracking (`lib/utils/readingLimit.ts`)
- **Storage**: Uses `localStorage` to track readings per day
- **Date Management**: Uses UTC dates (YYYY-MM-DD format) for consistent daily reset
- **Functions**:
  - `canPerformReading()`: Checks if user can perform another reading
  - `getRemainingReadings()`: Returns remaining readings count
  - `recordReading()`: Records a new reading
  - `getTodayReadingCount()`: Gets current day's reading count
  - `formatTimeUntilNextReading()`: Shows time until next reading is available

### 2. Server-Side Validation (`app/api/predict/route.ts`)
- **Storage**: In-memory `Map` (for production, use Redis or database)
- **Identifier**: Uses IP address from request headers
- **Rate Limiting**: Returns HTTP 429 when limit is reached
- **Cleanup**: Automatically removes records older than 1 day

### 3. Frontend Integration (`app/page.tsx`)
- **UI Indicators**: Shows remaining readings count on card drawing screen
- **Error Handling**: Displays warning message when limit is reached
- **Auto-Sync**: Syncs client and server reading counts
- **Daily Reset**: Checks every minute for daily reset

## Features

### ✅ Robust Validation
- **Dual Validation**: Both client and server validate reading limits
- **Prevents Bypass**: Server-side validation prevents localStorage manipulation
- **Consistent Dates**: Uses UTC dates to prevent timezone issues

### ✅ User Experience
- **Clear Feedback**: Shows remaining readings count (e.g., "2 of 3")
- **Error Messages**: Friendly messages when limit is reached
- **Time Display**: Shows time until next reading is available
- **Visual Warning**: Styled warning banner when limit is reached

### ✅ Edge Cases Handled
- **Daily Reset**: Automatically resets at midnight UTC
- **Cache Clearing**: Handles localStorage errors gracefully
- **Network Errors**: Falls back to client-side tracking if server fails
- **Concurrent Requests**: Server prevents race conditions

## Usage

### For Users
1. Users see remaining readings count on the card drawing screen
2. When limit is reached, a warning message appears
3. Reading count resets automatically at midnight UTC

### For Developers

#### Check Reading Limit
```typescript
import { canPerformReading } from '@/lib/utils/readingLimit';

if (canPerformReading()) {
  // Proceed with reading
} else {
  // Show limit message
}
```

#### Record a Reading
```typescript
import { recordReading } from '@/lib/utils/readingLimit';

// After successful API call
recordReading();
```

#### Get Remaining Readings
```typescript
import { getRemainingReadings } from '@/lib/utils/readingLimit';

const remaining = getRemainingReadings(); // Returns 0-3
```

#### Reset for Testing
```typescript
import { resetReadingRecords } from '@/lib/utils/readingLimit';

resetReadingRecords(); // Clears localStorage
```

## Configuration

### Change Daily Limit
Update `MAX_READINGS_PER_DAY` in:
- `lib/utils/readingLimit.ts` (client-side)
- `app/api/predict/route.ts` (server-side)

### Production Considerations

1. **Server Storage**: Replace in-memory `Map` with:
   - **Redis**: For distributed systems
   - **Database**: For persistent storage
   - **Rate Limiting Service**: For advanced features

2. **User Identification**: Consider:
   - User authentication (user ID)
   - Session tokens
   - Device fingerprinting

3. **Monitoring**: Add:
   - Analytics for reading usage
   - Alerts for unusual patterns
   - Logging for debugging

## Testing

### Test Reading Limit
1. Perform 3 readings
2. Verify 4th reading is blocked
3. Check UI shows "0 of 3" remaining
4. Verify error message appears

### Test Daily Reset
1. Perform 3 readings
2. Wait until next day (or manually change date)
3. Verify reading count resets
4. Verify new readings are allowed

### Test Server Validation
1. Clear localStorage
2. Try to perform reading
3. Server should still enforce limit based on IP

## Security Notes

- ⚠️ **Client-side limits can be bypassed**: Always validate on server
- ⚠️ **IP-based tracking**: Can be bypassed with VPN/proxy
- ✅ **Recommended**: Use user authentication for production
- ✅ **Recommended**: Implement rate limiting middleware

## Future Enhancements

- [ ] User authentication for accurate tracking
- [ ] Premium tier with higher limits
- [ ] Reading history per user
- [ ] Admin dashboard for monitoring
- [ ] Analytics and usage reports

