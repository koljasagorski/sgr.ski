/* MTA-STS policy for sgr.ski (iCloud Custom Email Domain).
   mode: testing — failures are only reported (TLS-RPT), nothing is rejected.
   Switch to "enforce" once the TLS reports stay clean, and bump the id in
   the _mta-sts TXT record. max_age: 1 day while testing, raise to 604800+
   when enforcing. */

const POLICY = [
  'version: STSv1',
  'mode: testing',
  'mx: mx01.mail.icloud.com',
  'mx: mx02.mail.icloud.com',
  'max_age: 86400',
  ''
].join('\r\n');

export default {
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/.well-known/mta-sts.txt') {
      return new Response('Not Found', { status: 404 });
    }
    return new Response(POLICY, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'max-age=3600',
        'X-Content-Type-Options': 'nosniff'
      }
    });
  }
};
