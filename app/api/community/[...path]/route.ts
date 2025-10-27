import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

async function handleRequest(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const path = pathname.replace('/api/community', ''); // preserve the leading /
  const url = `${BACKEND_API_URL}/community${path}${search}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  const authHeader = request.headers.get('authorization');
  if (authHeader) {
    headers['Authorization'] = authHeader;
  }

  let response;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    response = await fetch(url, { 
      method, 
      headers,
      cache: 'no-store'
    });
  } else {
    const body = await request.text();
    response = await fetch(url, { method, headers, body });
  }
  
  const data = await response.text();
  const contentType = response.headers.get('content-type') || 'application/json';
  return new NextResponse(data, {
    status: response.status,
    headers: { 
      'content-type': contentType,
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export const GET = handleRequest;
export const POST = handleRequest;
export const PATCH = handleRequest;
export const PUT = handleRequest;
export const DELETE = handleRequest;
export const OPTIONS = handleRequest;
export const HEAD = handleRequest;
