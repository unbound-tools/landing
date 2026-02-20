import { Env } from '../index';

interface EventBody {
  visitor_id: string;
  event_type: string;
  variant: string;
  page?: string;
  value?: string;
  utm_source?: string;
  utm_campaign?: string;
}

const VALID_EVENTS = ['page_view', 'scroll_depth', 'cta_click', 'time_on_page', 'share_click'];

export async function handleEvent(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<EventBody>();

    if (!body.visitor_id || !body.event_type || !body.variant) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (!VALID_EVENTS.includes(body.event_type)) {
      return Response.json({ error: 'Invalid event_type' }, { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO events (visitor_id, event_type, variant, page, value, utm_source, utm_campaign, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.visitor_id,
      body.event_type,
      body.variant,
      body.page || null,
      body.value || null,
      body.utm_source || null,
      body.utm_campaign || null,
      new Date().toISOString()
    ).run();

    return Response.json({ success: true });
  } catch (e) {
    console.error('Event error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
