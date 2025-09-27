import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const duration = parseInt(formData.get('duration') as string || '0');
    const category = formData.get('category') as string;
    const isPremium = formData.get('isPremium') === 'true';
    const tags = JSON.parse(formData.get('tags') as string || '[]');
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!title || !description || !category) {
      return NextResponse.json(
        { success: false, error: 'Title, description, and category are required' },
        { status: 400 }
      );
    }

    // Step 1: Upload file to Vercel Blob
    const timestamp = Date.now();
    const sanitizedFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '-');
    const filename = `${timestamp}-${sanitizedFilename}`;
    const path = `meditations/${filename}`;

    const blob = await put(path, file, {
      access: 'public',
      contentType: file.type,
    });

    // Step 2: Save metadata to backend database
    const backendUrl = 'https://hope-backend-2.onrender.com';
    const meditationData = {
      title,
      description,
      duration,
      audioUrl: blob.url,
      category,
      isPremium,
      tags
    };

    const backendResponse = await fetch(`${backendUrl}/meditation`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meditationData)
    });

    if (!backendResponse.ok) {
      console.error('Backend save failed:', backendResponse.status, backendResponse.statusText);
      // File is already uploaded to Vercel Blob, but metadata save failed
      return NextResponse.json({
        success: false,
        error: 'File uploaded but failed to save meditation metadata'
      }, { status: 500 });
    }

    const savedMeditation = await backendResponse.json();

    return NextResponse.json({
      success: true,
      data: {
        meditation: savedMeditation,
        fileInfo: {
          url: blob.url,
          filename: filename,
          size: file.size,
          contentType: file.type,
        }
      }
    });

  } catch (error) {
    console.error('Error uploading meditation:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload meditation' },
      { status: 500 }
    );
  }
}