# Backend Wake-Up and Meditation Favorites Fix

## Issues Fixed

### 1. Backend Wake-Up Timeout
**Problem:** The backend server (hosted on Render free tier) was timing out after 15 seconds, which wasn't enough time for cold starts.

**Solution:**
- Increased wake-up timeout from 15s to 45s
- Added retry logic (up to 2 attempts with 2s delay between retries)
- Improved logging with attempt tracking
- Backend status now tracked in localStorage

**Files Changed:**
- `lib/utils/backend-wakeup.ts`

### 2. User-Friendly Error Messages
**Problem:** Users were seeing generic "404" errors when the backend was starting up, causing confusion.

**Solution:**
- Added `isBackendOnline()` helper function to check backend status
- Added `getBackendErrorMessage()` to provide context-aware error messages
- Error messages now distinguish between backend startup and actual errors
- Toast notifications include helpful descriptions

**Files Changed:**
- `lib/utils/backend-wakeup.ts`
- `app/meditations/page.tsx`

### 3. Meditation Favorites Error Handling
**Problem:** Favorites API calls were failing with 404 errors and showing confusing error messages.

**Solution:**
- Updated `toggleFavorite()` to show backend-aware error messages
- Updated `loadFavorites()` to silently handle backend offline state
- Updated `checkFavoriteStatus()` to gracefully skip when backend is offline
- Added visual warning banner when backend is starting up

**Files Changed:**
- `app/meditations/page.tsx`

### 4. Backend Server Status
**Problem:** The backend server wasn't running locally, causing all API requests to fail.

**Solution:**
- Started the backend development server with `npm run dev`
- Server now running on `http://localhost:3001`

## New Features

### Backend Status Banner
A visual warning banner now appears at the top of the meditation page when the backend is starting up:
- Shows a spinner and clear message
- Automatically checks backend status after 10 seconds
- Dismisses when backend comes online

### Improved Toast Notifications
- Backend startup messages are friendly and informative
- Include expected wait time ("up to a minute")
- Favorite toggle errors now include context about backend status

## How to Use

### Starting the Backend Server
```bash
cd Hope-backend
npm run dev
```

### Backend Status
The app automatically:
1. Attempts to wake up the backend on page load
2. Caches wake-up status for 10 minutes
3. Retries failed requests
4. Shows user-friendly messages during startup

### Environment Variables
Ensure these are set:
- `NEXT_PUBLIC_BACKEND_API_URL` or `BACKEND_API_URL` (defaults to https://hope-backend-2.onrender.com)
- Backend `.env` file should have:
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `GEMINI_API_KEY`

## Technical Details

### Timeout Configuration
- **Wake-up timeout**: 45 seconds (was 15s)
- **Wake-up retries**: 2 attempts
- **Wake-up cache**: 10 minutes
- **Retry delay**: 2 seconds between attempts

### Backend Status Tracking
- Status stored in `localStorage.backend_status`
- Values: `'online'` | `'offline'`
- Checked before showing error messages

### Error Handling Flow
1. API request fails
2. Check `isBackendOnline()`
3. If offline: Show "Server is starting up..." message
4. If online: Show actual error message
5. Optimistic UI updates are rolled back on error

## Testing

1. **Test backend startup:**
   - Stop the backend server
   - Reload the meditation page
   - You should see the yellow warning banner
   - Start the backend: `cd Hope-backend && npm run dev`
   - Warning should disappear after 10 seconds

2. **Test favorites:**
   - With backend running, click the heart icon on a meditation
   - Should toggle successfully
   - View favorites by clicking the "Favorites" button

3. **Test error handling:**
   - Stop the backend
   - Try to toggle a favorite
   - Should see: "The server is starting up. This may take up to a minute..."
   - Start backend and try again - should work

## Backend Routes Verified

All meditation favorites routes are properly implemented:
- `GET /api/meditations/favorites` - Get user's favorite meditations
- `GET /api/meditations/:id/favorite-status` - Check if meditation is favorited
- `POST /api/meditations/:id/favorite` - Add meditation to favorites
- `DELETE /api/meditations/:id/favorite` - Remove meditation from favorites

## Next Steps

If you continue to see 404 errors:
1. Verify backend server is running: `curl http://localhost:3001/health`
2. Check backend logs for errors
3. Verify MongoDB connection in backend `.env`
4. Check that JWT tokens are being sent correctly
5. Verify CORS settings allow your frontend domain

## Deployment Notes

For production deployment on Render:
- Backend may sleep after 15 minutes of inactivity (free tier)
- First request after sleep will take 30-60 seconds
- The wake-up logic handles this automatically
- Consider upgrading to paid tier for always-on backend

