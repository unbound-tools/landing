import { Env } from './index';

function parseCookies(header: string | null): Record<string, string> {
  if (!header) return {};
  return Object.fromEntries(
    header.split(';').map((c) => {
      const [key, ...rest] = c.trim().split('=');
      return [key, rest.join('=')];
    })
  );
}

export async function handleRouting(
  request: Request,
  env: Env,
  url: URL,
  forceVariant?: 'A' | 'B'
): Promise<Response> {
  const cookies = parseCookies(request.headers.get('Cookie'));
  let visitorId = cookies['visitor_id'];
  let variant = cookies['ab_variant'] as 'A' | 'B' | undefined;
  let source: string;
  let isNewVisitor = false;

  if (forceVariant) {
    source = forceVariant === 'A' ? 'direct_start' : 'direct_build';
    if (!visitorId) {
      visitorId = crypto.randomUUID();
      isNewVisitor = true;
    }
    variant = forceVariant;
  } else if (visitorId && variant) {
    source = 'returning';
  } else {
    visitorId = crypto.randomUUID();
    variant = Math.random() < 0.5 ? 'A' : 'B';
    source = 'random';
    isNewVisitor = true;
  }

  // Record assignment for new visitors
  if (isNewVisitor) {
    try {
      await env.DB.prepare(
        `INSERT OR IGNORE INTO assignments (id, variant, source, ip, utm_source, utm_campaign, referrer, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        visitorId,
        variant,
        source,
        request.headers.get('CF-Connecting-IP'),
        url.searchParams.get('utm_source'),
        url.searchParams.get('utm_campaign'),
        request.headers.get('Referer'),
        new Date().toISOString()
      ).run();
    } catch (e) {
      console.error('Failed to record assignment:', e);
    }
  }

  // Fetch the correct variant page
  const pagePath = variant === 'A' ? '/_variants/start.html' : '/_variants/build.html';
  const assetUrl = new URL(request.url);
  assetUrl.pathname = pagePath;
  const pageResponse = await env.ASSETS.fetch(assetUrl.toString());

  const response = new Response(pageResponse.body, {
    status: pageResponse.status,
    headers: new Headers(pageResponse.headers),
  });

  // Set cookies (1 year expiry)
  const maxAge = 365 * 24 * 60 * 60;
  response.headers.append(
    'Set-Cookie',
    `visitor_id=${visitorId}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  );
  response.headers.append(
    'Set-Cookie',
    `ab_variant=${variant}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
  );

  return response;
}
