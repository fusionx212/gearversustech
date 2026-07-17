import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import type { APIContext } from 'astro';
import { STUDIO_RECOMMENDATIONS } from '../../../lib/studio-catalog';
import { resolveStudioRecommendations } from '../../../lib/studio-catalog-server';
import { buildAnalysisPrompt, buildImagePrompt, buildReviewPrompt, normaliseRecommendedSlots, SPACE_LABELS, STUDIO_PROMPT_VERSION } from '../../../lib/studio-prompt-engine';

export const prerender = false;

const IMAGE_MODEL = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-kontext-pro';
const AI_MODEL = process.env.REPLICATE_STUDIO_AI_MODEL || 'qwen/qwen3-7-plus';
const MAX_BODY_CHARS = 12_000_000;
const WORKFLOW_TTL_MS = 20 * 60 * 1000;
const MAX_ANALYSES_PER_HOUR = 3;
const IS_PRODUCTION = process.env.CONTEXT === 'production' || process.env.NODE_ENV === 'production';
const SAMPLE_IMAGES: Record<string, string> = {
  'gaming-room': 'https://gearversustech.com/images/rooms/desk-setup.jpg',
  'man-cave': 'https://gearversustech.com/images/rooms/cave.jpg',
  'garden-office': 'https://gearversustech.com/images/rooms/desk.jpg',
  'shed-gym': 'https://gearversustech.com/images/rooms/garage.jpg',
};

const allowed = {
  space: new Set(['gaming-room', 'man-cave', 'garden-office', 'shed-gym']),
  mode: new Set(['style', 'fill', 'reimagine']),
  style: new Set(['AI decides', 'Dark studio', 'Warm industrial', 'Clean minimal', 'Retro arcade', 'Quiet luxury', 'Natural workspace']),
  budget: new Set(['under-500', '500-1000', '1000-2500', '2500-plus']),
};

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }

type WorkflowClaims = { id: string; exp: number; space: string; mode: string; style: string; budget: string };
type WorkflowSession = { id: string; expires: number; remaining: number };

function workflowSecret() { return process.env.STUDIO_SIGNING_SECRET || process.env.TURNSTILE_SECRET_KEY || (IS_PRODUCTION ? '' : 'gvt-local-studio-only'); }
function workflowSignature(payload: string, secret: string) { return createHmac('sha256', secret).update(payload).digest('base64url'); }
function createWorkflowToken(claims: WorkflowClaims, secret: string) {
  const payload = Buffer.from(JSON.stringify(claims)).toString('base64url');
  return `${payload}.${workflowSignature(payload, secret)}`;
}
function readWorkflowToken(token: string, secret: string): WorkflowClaims | null {
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !secret) return null;
  const expected = workflowSignature(payload, secret);
  const receivedBuffer = Buffer.from(signature); const expectedBuffer = Buffer.from(expected);
  if (receivedBuffer.length !== expectedBuffer.length || !timingSafeEqual(receivedBuffer, expectedBuffer)) return null;
  try {
    const claims = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as WorkflowClaims;
    return claims.id && Number.isFinite(claims.exp) && claims.exp > Date.now() ? claims : null;
  } catch { return null; }
}

async function verifyTurnstile(secret: string, token: string, remoteip?: string) {
  const body = new URLSearchParams({ secret, response: token });
  if (remoteip) body.set('remoteip', remoteip);
  const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', { method: 'POST', body });
  const result = await response.json().catch(() => ({})) as { success?: boolean };
  return response.ok && result.success === true;
}

function firstOutput(output: unknown): string | null {
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return output.map(firstOutput).find(Boolean) || null;
  if (output && typeof output === 'object') {
    const value = (output as { url?: (() => string) | string; href?: string }).url;
    if (typeof value === 'function') return value();
    if (typeof value === 'string') return value;
    if (typeof (output as { href?: string }).href === 'string') return (output as { href: string }).href;
  }
  return null;
}

function textOutput(output: unknown): string {
  if (typeof output === 'string') return output;
  if (Array.isArray(output)) return output.map(textOutput).join('');
  return '';
}

function parsedObject(output: unknown): Record<string, unknown> | null {
  const text = textOutput(output).replace(/```(?:json)?/gi, '').replace(/```/g, '').trim();
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

function shortList(value: unknown, limit = 4) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string').map((item) => item.trim().slice(0, 160)).filter(Boolean).slice(0, limit) : [];
}

function normalisePlan(value: Record<string, unknown> | null, input: { space: string; style: string }, recommendations = STUDIO_RECOMMENDATIONS) {
  const palette = shortList(value?.palette, 5).filter((colour) => /^#[0-9a-f]{6}$/i.test(colour));
  const recommendedSlots = normaliseRecommendedSlots(value?.recommended_slots, input.space);
  const sourceQuality = value?.source_quality && typeof value.source_quality === 'object' ? value.source_quality as Record<string, unknown> : null;
  return {
    title: String(value?.title || `${SPACE_LABELS[input.space]} concept`).slice(0, 80),
    style: String(value?.style || (input.style === 'AI decides' ? 'AI-selected direction' : input.style)).slice(0, 80),
    summary: String(value?.summary || 'A practical room concept built around the space, its purpose and the working budget.').slice(0, 420),
    palette: palette.length ? palette : ['#0c0f12', '#e5a318', '#e8ecf0'],
    preserve: shortList(value?.preserve),
    improve: shortList(value?.improve),
    sourceQuality: { usable: sourceQuality?.usable !== false, reason: String(sourceQuality?.reason || 'The source provides enough room context for a concept.').slice(0, 240) },
    designPrompt: String(value?.design_prompt || `Preserve the real ${SPACE_LABELS[input.space]} architecture and camera angle. Create a coherent, physically plausible ${input.style === 'AI decides' ? 'premium' : input.style} setup with realistic scale, circulation and layered lighting.`).slice(0, 3000),
    recommendedSlots,
    shoppingPlan: recommendedSlots.map((slot) => {
      const recommendation = recommendations[slot];
      return { slot, category: recommendation.pick, reason: recommendation.reason, href: recommendation.compare, source: recommendation.source, score: recommendation.comparisonScore };
    }),
  };
}

function normaliseReview(value: Record<string, unknown> | null) {
  const corrections = shortList(value?.corrections, 5);
  const reportedScore = Math.max(0, Math.min(100, Number(value?.score) || 0));
  const score = corrections.length ? Math.min(77, reportedScore) : reportedScore;
  return {
    score,
    pass: score >= 78 && value?.pass === true && corrections.length === 0,
    summary: String(value?.summary || 'The automated quality check could not verify every visual detail.').slice(0, 320),
    corrections,
  };
}

async function createPrediction(token: string, model: string, input: Record<string, unknown>) {
  const response = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60', 'Cancel-After': '90s' },
    body: JSON.stringify({ input }),
  });
  const result = await response.json().catch(() => ({}));
  return { response, result };
}

export async function POST({ request, clientAddress, session }: APIContext) {
  const token = process.env.REPLICATE_API_TOKEN;
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return json({ error: 'Studio requests must come from this site.' }, 403);
  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return json({ error: 'Image payload is too large.' }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400); }

  const action = String(body.action || 'generate');
  const space = String(body.space || 'gaming-room');
  const mode = String(body.mode || 'style');
  const style = String(body.style || 'AI decides');
  const budget = String(body.budget || '500-1000');
  const instructions = String(body.instructions || '').trim().slice(0, 420);
  const designBrief = String(body.designBrief || '').slice(0, 3000);
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : (SAMPLE_IMAGES[space] || SAMPLE_IMAGES['gaming-room']);
  if (!allowed.space.has(space) || !allowed.mode.has(mode) || !allowed.style.has(style) || !allowed.budget.has(budget)) return json({ error: 'Choose a valid studio direction.' }, 400);
  if (body.image && (typeof body.image !== 'string' || body.image.length > 11_000_000)) return json({ error: 'Uploaded image is too large.' }, 413);

  if (!token) {
    if (action === 'analyse') return json({ demo: true, plan: normalisePlan(null, { space, style }) });
    if (action === 'review') return json({ demo: true, review: { score: 0, pass: true, summary: 'Automated review starts when Replicate is connected.', corrections: [] } });
    return json({ demo: true, imageUrl: '/images/kits/gaming-room-build-kit.png', error: 'Replicate is not configured yet.' }, 503);
  }

  const secret = workflowSecret();
  if (!secret || (IS_PRODUCTION && !process.env.TURNSTILE_SECRET_KEY)) return json({ error: 'Studio protection is not configured.' }, 503);

  let workflowToken = String(body.workflowToken || '');
  if (action === 'analyse') {
    const challenge = String(body.turnstileToken || '');
    if (process.env.TURNSTILE_SECRET_KEY && (!challenge || !(await verifyTurnstile(process.env.TURNSTILE_SECRET_KEY, challenge, clientAddress)))) return json({ error: 'Complete the anti-abuse check and try again.' }, 403);
    if (IS_PRODUCTION && !session) return json({ error: 'Studio session protection is unavailable.' }, 503);
    if (session) {
      const now = Date.now();
      const previous = await session.get<number[]>('studio-analysis-times');
      const recent = Array.isArray(previous) ? previous.filter((time) => Number.isFinite(time) && time > now - 60 * 60 * 1000) : [];
      if (recent.length >= MAX_ANALYSES_PER_HOUR) return json({ error: 'Studio limit reached. Try again in an hour.' }, 429);
      session.set('studio-analysis-times', [...recent, now], { ttl: 60 * 60 });
      const claims: WorkflowClaims = { id: randomUUID(), exp: now + WORKFLOW_TTL_MS, space, mode, style, budget };
      session.set('studio-workflow', { id: claims.id, expires: claims.exp, remaining: 4 } satisfies WorkflowSession, { ttl: WORKFLOW_TTL_MS / 1000 });
      workflowToken = createWorkflowToken(claims, secret);
    } else {
      workflowToken = createWorkflowToken({ id: randomUUID(), exp: Date.now() + WORKFLOW_TTL_MS, space, mode, style, budget }, secret);
    }
  } else {
    const claims = readWorkflowToken(workflowToken, secret);
    const matchesRequest = claims && claims.space === space && claims.mode === mode && claims.style === style && claims.budget === budget;
    if (!matchesRequest) return json({ error: 'Start a new protected Studio design.' }, 403);
    if (session) {
      const stored = await session.get<WorkflowSession>('studio-workflow');
      if (!stored || stored.id !== claims.id || stored.expires <= Date.now() || stored.remaining < 1) return json({ error: 'This Studio design has expired or used its generation allowance.' }, 429);
      session.set('studio-workflow', { ...stored, remaining: stored.remaining - 1 }, { ttl: Math.max(1, Math.round((stored.expires - Date.now()) / 1000)) });
    } else if (IS_PRODUCTION) return json({ error: 'Studio session protection is unavailable.' }, 503);
  }

  if (action === 'analyse') {
    const prompt = buildAnalysisPrompt({ space, mode, style, budget, instructions });
    const { response, result } = await createPrediction(token, AI_MODEL, { image: [image], prompt, max_tokens: 1400, temperature: 0.2, top_p: 0.8, system_prompt: 'You are the autonomous GVT room design intelligence. Make practical, premium, physically plausible decisions. Output JSON only.' });
    if (!response.ok) return json({ error: result.detail || result.error || 'The AI room analysis failed.' }, response.status);
    const plan = parsedObject(result.output);
    if (plan) return json({ plan: normalisePlan(plan, { space, style }, await resolveStudioRecommendations()), predictionId: result.id, workflowToken, promptVersion: STUDIO_PROMPT_VERSION, aiModel: AI_MODEL });
    if (['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Analysis ${result.status}.` }, 502);
    if (result.id) return json({ predictionId: result.id, status: result.status, kind: 'plan', workflowToken }, 202);
    return json({ error: 'The AI room analysis returned no plan.' }, 502);
  }

  if (action === 'review') {
    const resultImage = typeof body.resultImage === 'string' && body.resultImage.startsWith('https://replicate.delivery/') ? body.resultImage : '';
    if (!resultImage) return json({ error: 'Generated concept is missing.' }, 400);
    const prompt = buildReviewPrompt({ space, instructions, designBrief, preserve: shortList(body.preserve, 8) });
    const { response, result } = await createPrediction(token, AI_MODEL, { image: [image, resultImage], prompt, max_tokens: 700, temperature: 0.1, top_p: 0.7, system_prompt: 'You are the independent GVT visual quality gate. Be strict, concrete and concise. Output JSON only.' });
    if (!response.ok) return json({ error: result.detail || result.error || 'The visual quality review failed.' }, response.status);
    const review = parsedObject(result.output);
    if (review) return json({ review: normaliseReview(review), predictionId: result.id, promptVersion: STUDIO_PROMPT_VERSION, aiModel: AI_MODEL });
    if (['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Review ${result.status}.` }, 502);
    if (result.id) return json({ predictionId: result.id, status: result.status, kind: 'review' }, 202);
    return json({ error: 'The visual quality review returned no result.' }, 502);
  }

  if (action !== 'generate') return json({ error: 'Unknown Studio action.' }, 400);
  const correction = String(body.correction || '').slice(0, 900);
  const { response, result } = await createPrediction(token, IMAGE_MODEL, { prompt: buildImagePrompt({ space, mode, style, budget, instructions, designBrief, correction }), input_image: image, aspect_ratio: 'match_input_image', output_format: 'jpg', safety_tolerance: 2, prompt_upsampling: false });
  if (!response.ok) return json({ error: result.detail || result.error || 'Replicate rejected the generation.' }, response.status);
  const imageUrl = firstOutput(result.output);
  if (!imageUrl && ['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Generation ${result.status}.` }, 502);
  if (!imageUrl && result.id) return json({ predictionId: result.id, status: result.status, kind: 'image' }, 202);
  if (!imageUrl) return json({ error: 'Replicate returned no image.' }, 502);
  return json({ imageUrl, predictionId: result.id, status: result.status, promptVersion: STUDIO_PROMPT_VERSION, imageModel: IMAGE_MODEL });
}

export async function GET({ request }: { request: Request }) {
  const token = process.env.REPLICATE_API_TOKEN;
  const url = new URL(request.url);
  const id = url.searchParams.get('id');
  const kind = url.searchParams.get('kind') || 'image';
  if (!token || !id || !/^[a-z0-9]+$/i.test(id)) return json({ error: 'Prediction not found.' }, 400);
  const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: result.detail || result.error || 'Could not read prediction.' }, response.status);
  if (kind === 'plan') {
    const value = parsedObject(result.output);
    if (value) return json({ plan: normalisePlan(value, { space: url.searchParams.get('space') || 'gaming-room', style: url.searchParams.get('style') || 'AI decides' }, await resolveStudioRecommendations()), predictionId: result.id, status: result.status, promptVersion: STUDIO_PROMPT_VERSION, aiModel: AI_MODEL });
  } else if (kind === 'review') {
    const value = parsedObject(result.output);
    if (value) return json({ review: normaliseReview(value), predictionId: result.id, status: result.status, promptVersion: STUDIO_PROMPT_VERSION, aiModel: AI_MODEL });
  } else {
    const imageUrl = firstOutput(result.output);
    if (imageUrl) return json({ imageUrl, predictionId: result.id, status: result.status, promptVersion: STUDIO_PROMPT_VERSION, imageModel: IMAGE_MODEL });
  }
  if (['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Generation ${result.status}.` }, 502);
  if (result.status === 'succeeded') return json({ error: 'The AI returned an unreadable result.' }, 502);
  return json({ predictionId: result.id, status: result.status }, 202);
}
