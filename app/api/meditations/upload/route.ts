import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const path = `meditations/${filename}`;

    // Upload to Vercel Blob
    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      data: {
        url: blob.url,
        filename: filename,
        size: file.size,
        contentType: file.type,
      }
    });

  } catch (error) {
    console.error('Error uploading meditation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload meditation file' },
      { status: 500 }
    );
  }
}