# GVT Studio / Replicate MVP

```yaml
job: gvt-studio-replicate-mvp
owner_request: build a customer-facing AI room visualiser and write it up to Replicate
business: Gear Versus Tech
brand: gear-versus-tech
audience: gamers and space owners who need help choosing gear for a real room
outcome: autonomously analyse a room photo, create and quality-check a visual concept, then produce a clear route into GVT comparisons, kits and affiliate buying options
art_direction:
  thesis: a dark workshop interface that lets the real room stay visible while the buying decision becomes legible
  first_signal: the customer room and the GVT concept window
  signature_moment: the room image changes after the visitor chooses an intervention mode
  design_variance: 7
  motion_intensity: 3
  visual_density: 6
deliverables:
  - type: website
    format: /studio/ wizard and /api/studio/generate server endpoint
source_plan: customer-uploaded photo plus existing GVT-owned room imagery; Replicate-hosted FLUX.1 Kontext Pro output
approval: credentials and release only; no owner design-review service
stop_conditions: missing Replicate or Turnstile credentials, unsafe upload, exhausted workflow allowance, model failure, or unverified product claims
```

## Environment

Set these in Netlify environment variables; never commit the token:

```text
REPLICATE_API_TOKEN=...
REPLICATE_MODEL=black-forest-labs/flux-kontext-pro
REPLICATE_STUDIO_AI_MODEL=qwen/qwen3-7-plus
PUBLIC_TURNSTILE_SITE_KEY=...
TURNSTILE_SECRET_KEY=...
# Optional: a separate HMAC key; TURNSTILE_SECRET_KEY is used if omitted.
STUDIO_SIGNING_SECRET=...
```

The browser runs an autonomous sequence: analyse the source room, generate the concept, review the source and result together, and automatically generate one correction if the visual score is below 78. Product routes remain deterministic and catalogue-backed so the AI cannot invent products. Production refuses paid calls unless Turnstile is configured. A successful challenge creates a signed 20-minute workflow tied to the selected brief, an Astro/Netlify session and a four-call downstream allowance; each session can start three analyses per hour.

The endpoint uses synchronous `Prefer: wait=60` with polling fallback for this vertical slice. Before high-volume traffic, move to asynchronous predictions with a signed webhook, Supabase job/output records, persistent output storage and a customer credit ledger.

References:

- https://replicate.com/black-forest-labs/flux-kontext-pro
- https://replicate.com/qwen/qwen3-7-plus
- https://replicate.com/docs/topics/predictions/create-a-prediction
- https://replicate.com/docs/topics/webhooks/receive-webhook

The concept image is deliberately separate from product truth. Matching products must come from the GVT catalogue and comparison pages, not from names inferred from pixels.
