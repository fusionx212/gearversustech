export const prerender = false;

const MODEL = process.env.REPLICATE_MODEL || 'black-forest-labs/flux-kontext-pro';
const MAX_BODY_CHARS = 12_000_000;
const SAMPLE_IMAGE = 'https://gearversustech.com/hero_00001_.png';

const allowed = {
  space: new Set(['gaming-room', 'man-cave', 'garden-office', 'shed-gym']),
  mode: new Set(['style', 'fill', 'reimagine']),
  style: new Set(['Dark studio', 'Warm industrial', 'Clean minimal', 'Retro arcade', 'Quiet luxury', 'Natural workspace']),
  budget: new Set(['under-500', '500-1000', '1000-2500', '2500-plus']),
};

const labels: Record<string, string> = {
  'gaming-room': 'gaming room', 'man-cave': 'man cave', 'garden-office': 'garden office', 'shed-gym': 'shed gym',
  style: 'style this existing room while preserving its architecture',
  fill: 'furnish this space with practical equipment and furniture',
  reimagine: 'reimagine this room with a bold but believable complete setup',
};

function json(data: unknown, status = 200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } }); }

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

function promptFor(input: { space: string; mode: string; style: string; budget: string; instructions: string }) {
  return [
    `Transform this real ${labels[input.space] || 'room'} into a premium, believable GVT concept.`,
    `${labels[input.mode] || labels.style}.`,
    `Use a ${input.style} direction. Working budget: ${input.budget}.`,
    'Preserve the existing camera angle, walls, windows, ceiling height and fixed architecture. Do not invent extra doors or windows. Keep the composition useful and physically plausible.',
    'Show a considered arrangement with clear circulation, realistic scale, layered lighting and restrained styling. Avoid readable logos, fake text, impossible furniture, excessive RGB lighting and visual clutter.',
    input.instructions ? `Customer constraints: ${input.instructions}` : '',
    'This is a concept visualisation, not a claim that exact product SKUs are present. Make the space feel ready to compare and shop.',
  ].filter(Boolean).join(' ');
}

export async function POST({ request }: { request: Request }) {
  const token = process.env.REPLICATE_API_TOKEN;
  const raw = await request.text();
  if (raw.length > MAX_BODY_CHARS) return json({ error: 'Image payload is too large.' }, 413);
  let body: Record<string, unknown>;
  try { body = JSON.parse(raw); } catch { return json({ error: 'Invalid request.' }, 400); }

  const space = String(body.space || 'gaming-room');
  const mode = String(body.mode || 'style');
  const style = String(body.style || 'Dark studio');
  const budget = String(body.budget || '500-1000');
  const instructions = String(body.instructions || '').trim().slice(0, 420);
  const image = typeof body.image === 'string' && body.image.startsWith('data:image/') ? body.image : SAMPLE_IMAGE;
  if (!allowed.space.has(space) || !allowed.mode.has(mode) || !allowed.style.has(style) || !allowed.budget.has(budget)) return json({ error: 'Choose a valid studio direction.' }, 400);
  if (body.image && (typeof body.image !== 'string' || body.image.length > 11_000_000)) return json({ error: 'Uploaded image is too large.' }, 413);

  if (!token) return json({ demo: true, imageUrl: '/images/kits/gaming-room-build-kit.png', error: 'Replicate is not configured yet.' }, 503);

  const response = await fetch(`https://api.replicate.com/v1/models/${MODEL}/predictions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', Prefer: 'wait=60', 'Cancel-After': '90s' },
    body: JSON.stringify({ input: { prompt: promptFor({ space, mode, style, budget, instructions }), input_image: image, aspect_ratio: 'match_input_image', output_format: 'jpg', safety_tolerance: 2, prompt_upsampling: false } }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: result.detail || result.error || 'Replicate rejected the generation.' }, response.status);
  const imageUrl = firstOutput(result.output);
  if (!imageUrl && ['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Generation ${result.status}.` }, 502);
  if (!imageUrl && result.id) return json({ predictionId: result.id, status: result.status }, 202);
  if (!imageUrl) return json({ error: 'Replicate returned no image.' }, 502);
  return json({ imageUrl, predictionId: result.id, status: result.status });
}

export async function GET({ request }: { request: Request }) {
  const token = process.env.REPLICATE_API_TOKEN;
  const id = new URL(request.url).searchParams.get('id');
  if (!token || !id || !/^[a-z0-9]+$/i.test(id)) return json({ error: 'Prediction not found.' }, 400);
  const response = await fetch(`https://api.replicate.com/v1/predictions/${id}`, { headers: { Authorization: `Bearer ${token}` } });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) return json({ error: result.detail || result.error || 'Could not read prediction.' }, response.status);
  const imageUrl = firstOutput(result.output);
  if (imageUrl) return json({ imageUrl, predictionId: result.id, status: result.status });
  if (['failed', 'canceled'].includes(result.status)) return json({ error: result.error || `Generation ${result.status}.` }, 502);
  return json({ predictionId: result.id, status: result.status }, 202);
}
