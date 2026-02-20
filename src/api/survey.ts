import { Env } from '../index';

interface SurveyBody {
  visitor_id: string;
  signup_id?: number;
  building_what?: string;
  data_sources?: string[];
  current_solution?: string;
  variant: string;
}

const VALID_SOLUTIONS = ['built_own', 'third_party', 'not_started', 'not_worth'];

export async function handleSurvey(request: Request, env: Env): Promise<Response> {
  try {
    const body = await request.json<SurveyBody>();

    if (!body.visitor_id || !body.variant) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (body.current_solution && !VALID_SOLUTIONS.includes(body.current_solution)) {
      return Response.json({ error: 'Invalid current_solution' }, { status: 400 });
    }

    await env.DB.prepare(
      `INSERT INTO survey_responses (visitor_id, signup_id, building_what, data_sources, current_solution, variant, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      body.visitor_id,
      body.signup_id || null,
      body.building_what || null,
      body.data_sources ? JSON.stringify(body.data_sources) : null,
      body.current_solution || null,
      body.variant,
      new Date().toISOString()
    ).run();

    return Response.json({ success: true });
  } catch (e) {
    console.error('Survey error:', e);
    return Response.json({ error: 'Internal error' }, { status: 500 });
  }
}
