import { Env } from '../index';

interface SignupBody {
  email: string;
  role: string;
  visitor_id: string;
  variant: string;
  utm_source?: string;
  utm_campaign?: string;
}

const VALID_ROLES = ['ai_product', 'dev_tool', 'exploring'];

export async function handleSignup(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<SignupBody>();

    if (!body.email || !body.role || !body.visitor_id || !body.variant) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!body.email.includes('@') || body.email.length > 320) {
      return Response.json({ error: 'Invalid email' }, { status: 400 });
    }

    if (!VALID_ROLES.includes(body.role)) {
      return Response.json({ error: 'Invalid role' }, { status: 400 });
    }

    const result = await env.DB.prepare(
      `INSERT INTO signups (visitor_id, email, role, variant, utm_source, utm_campaign, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.visitor_id,
      body.email,
      body.role,
      body.variant,
      body.utm_source || null,
      body.utm_campaign || null,
      new Date().toISOString()
    ).run();

    return Response.json({ success: true, signup_id: result.meta.last_row_id });
  } catch (e) {
    console.error('Signup error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
