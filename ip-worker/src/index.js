/* Returns the request metadata every server receives anyway — IP, network
   operator, approximate location, connection details — so /workshops can
   show visitors what they give away on a plain page load.
   Stateless: no storage, no logging, no cookies. */

const ALLOWED_ORIGINS = new Set(['https://sgr.ski', 'https://www.sgr.ski']);

export default {
  async fetch(request) {
    const origin = request.headers.get('Origin');
    const cors = ALLOWED_ORIGINS.has(origin)
      ? { 'Access-Control-Allow-Origin': origin, 'Vary': 'Origin' }
      : { 'Vary': 'Origin' };

    if (request.method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: { ...cors, 'Access-Control-Allow-Methods': 'GET', 'Access-Control-Max-Age': '86400' }
      });
    }
    if (request.method !== 'GET') {
      return new Response('Method Not Allowed', { status: 405, headers: { ...cors, 'Allow': 'GET, OPTIONS' } });
    }

    const cf = request.cf || {};
    const body = {
      ip: request.headers.get('CF-Connecting-IP'),
      asn: cf.asn ?? null,
      provider: cf.asOrganization ?? null,
      city: cf.city ?? null,
      region: cf.region ?? null,
      postalCode: cf.postalCode ?? null,
      country: cf.country ?? null,
      latitude: cf.latitude ?? null,
      longitude: cf.longitude ?? null,
      timezone: cf.timezone ?? null,
      httpProtocol: cf.httpProtocol ?? null,
      tlsVersion: cf.tlsVersion ?? null,
      colo: cf.colo ?? null
    };

    return new Response(JSON.stringify(body), {
      headers: {
        ...cors,
        'Content-Type': 'application/json; charset=utf-8',
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'no-referrer'
      }
    });
  }
};
