import { NextRequest, NextResponse } from 'next/server';

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'https://hope-backend-2.onrender.com';

export async function middleware(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const method = request.method;
  const path = pathname.replace('/api/community', ''); // preserve the leading /
  const url = `${BACKEND_API_URL}/community${path}${search}`;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  const token = request.headers.get('authorization');
  if (token) headers['Authorization'] = token;

  let response;
  if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
    response = await fetch(url, { method, headers });
  } else {
    const body = await request.text();
    response = await fetch(url, { method, headers, body });
  }
  const data = await response.text();
  const contentType = response.headers.get('content-type') || '';
  return new NextResponse(data, {
    status: response.status,
    headers: { 'content-type': contentType },
  });
}

export const GET = middleware;
export const POST = middleware;
export const PATCH = middleware;
export const PUT = middleware;
export const DELETE = middleware;
export const OPTIONS = middleware;
export const HEAD = middleware;
