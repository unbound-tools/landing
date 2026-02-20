import { handleRouting } from './router';
import { handleSignup } from './api/signup';
import { handleSurvey } from './api/survey';
import { handleEvent } from './api/event';

export interface Env {
  DB: D1Database;
  ASSETS: Fetcher;
}

function corsHeaders(): HeadersInit {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const { pathname } = url;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders() });
    }

    // API routes
    if (request.method === 'POST') {
      let response: Response;
      if (pathname === '/api/signup') {
        response = await handleSignup(request, env);
      } else if (pathname === '/api/survey') {
        response = await handleSurvey(request, env);
      } else if (pathname === '/api/event') {
        response = await handleEvent(request, env);
      } else {
        return new Response('Not Found', { status: 404 });
      }
      // Add CORS headers to API responses
      for (const [key, value] of Object.entries(corsHeaders())) {
        response.headers.set(key, value);
      }
      return response;
    }

    // Static asset passthrough
    if (pathname.startsWith('/assets/')) {
      return env.ASSETS.fetch(request);
    }

    // A/B routing for core URLs
    if (pathname === '/' || pathname === '/get-started') {
      return handleRouting(request, env, url);
    }

    // Direct variant access (with tracking)
    if (pathname === '/start' || pathname === '/start/') {
      return handleRouting(request, env, url, 'A');
    }
    if (pathname === '/build' || pathname === '/build/') {
      return handleRouting(request, env, url, 'B');
    }

    // Thank-you page
    if (pathname === '/thanks' || pathname === '/thanks/') {
      const assetUrl = new URL(request.url);
      assetUrl.pathname = '/thanks/index.html';
      return env.ASSETS.fetch(assetUrl.toString());
    }

    return new Response('Not Found', { status: 404 });
  },
};
