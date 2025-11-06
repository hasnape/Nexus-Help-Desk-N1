import { corsHeaders, preflight } from '../_shared/cors';

export const config = { runtime: 'edge' };

export default async function handler(req: Request) {
  const origin = req.headers.get('origin');

  if (req.method === 'OPTIONS') {
    return preflight(req);
  }

  const url = new URL(req.url);
  const fName = url.pathname.split('/').pop() || '';
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
  const incomingAuth = req.headers.get('authorization');

  try {
    const upstream = await fetch(target, {
      method: req.method,
      body,
      headers: {
        ...(origin ? { Origin: origin } : {}),
        'Content-Type': req.headers.get('content-type') || 'application/json',
        Authorization: incomingAuth ?? `Bearer ${anon}`,
        apikey: anon,
        ...(req.headers.get('x-client-info') ? { 'x-client-info': req.headers.get('x-client-info')! } : {}),
      },
    });

    const headers = new Headers();
    const forward = ['access-control-allow-origin', 'access-control-allow-methods', 'access-control-allow-headers', 'vary'];
    for (const key of forward) {
      const value = upstream.headers.get(key);
      if (value) {
        headers.set(key, value);
      }
    }

    const contentType = upstream.headers.get('content-type');
    if (contentType) {
      headers.set('content-type', contentType);
    }

    if (!headers.has('access-control-allow-origin') && origin) {
      const fallback = corsHeaders(origin);
      for (const [key, value] of Object.entries(fallback)) {
        headers.set(key, value);
      }
    }

    return new Response(upstream.body, {
      status: upstream.status,
      headers,
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
