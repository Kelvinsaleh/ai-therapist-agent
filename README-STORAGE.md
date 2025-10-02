# Storage Configuration for Meditation Uploads

## Overview
The meditation upload system uses **Vercel Blob Storage** for file storage and your **MongoDB backend** for metadata storage.

## Required Environment Variables

Create a `.env.local` file in your project root with:

```env
# Vercel Blob Storage Token (Required for file uploads)
BLOB_READ_WRITE_TOKEN=your_vercel_blob_token_here

# Backend API URL (Already configured)
NEXT_PUBLIC_BACKEND_URL=https://hope-backend-2.onrender.com
```

## How to Get Vercel Blob Token

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Create a new variable: `BLOB_READ_WRITE_TOKEN`
5. Get the token from **Storage** → **Blob** → **Settings**

## Upload Flow

1. **File Upload**: Audio files are uploaded to Vercel Blob Storage
2. **Metadata Storage**: Meditation details are saved to your MongoDB backend
3. **URL Storage**: The Blob URL is stored in MongoDB for playback

## API Endpoints

- `POST /api/meditations/upload` - Upload meditation with metadata
- `GET /api/meditations` - Get all meditations from database
- `GET /api/meditations/search` - Search meditations

## File Storage Structure

```
Vercel Blob Storage:
└── meditations/
    ├── 1234567890-meditation-title.mp3
    ├── 1234567891-another-meditation.mp3
    └── ...
```

## Testing Upload

1. Ensure `BLOB_READ_WRITE_TOKEN` is set
2. Go to `/admin/meditations` (admin page)
3. Upload a meditation file with metadata
4. Check that it appears in `/meditations` page

## Troubleshooting

- **Upload fails**: Check `BLOB_READ_WRITE_TOKEN` is correct
- **Metadata not saved**: Check backend connection at `https://hope-backend-2.onrender.com`
- **Files not playing**: Check audio file format (MP3 recommended) 