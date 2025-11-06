import { NextRequest } from 'next/server';
import { corsHeaders, preflight } from '../_shared/cors';

export const config = { runtime: 'edge' };

export default async function handler(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (req.method === 'OPTIONS') {
    return preflight(req);
  }

  const fName = req.nextUrl.pathname.split('/').pop() || '';
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const anon = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';

  if (!fName || !base || !anon) {
    const headers = corsHeaders(origin);
    return new Response(JSON.stringify({ error: 'missing_configuration' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }

  const target = `${base.replace(/\/$/, '')}/functions/v1/${fName}`;
  const hasBody = !['GET', 'HEAD'].includes(req.method);
  const body = hasBody ? await req.text() : undefined;

  try {
    const upstream = await fetch(target, {
      method: req.method,
      body,
      headers: {
        ...(origin ? { Origin: origin } : {}),
        'Content-Type': req.headers.get('content-type') || 'application/json',
        Authorization: `Bearer ${anon}`,
        apikey: anon,
        ...(req.headers.get('x-client-info') ? { 'x-client-info': req.headers.get('x-client-info')! } : {}),
      },
    });

    const text = await upstream.text();
    const headers = corsHeaders(origin);
    return new Response(text, {
      status: upstream.status,
      headers: {
        'Content-Type': upstream.headers.get('content-type') || 'application/json',
        ...headers,
      },
    });
  } catch (error) {
    const headers = corsHeaders(origin);
    const message = error instanceof Error ? error.message : 'fetch_failed';
    return new Response(JSON.stringify({ error: 'upstream_error', details: { message } }), {
      status: 502,
      headers: { 'Content-Type': 'application/json', ...headers },
    });
  }
}
