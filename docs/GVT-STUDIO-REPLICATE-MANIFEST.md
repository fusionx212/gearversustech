# GVT Studio / Replicate MVP

```yaml
job: gvt-studio-replicate-mvp
owner_request: build a customer-facing AI room visualiser and write it up to Replicate
business: Gear Versus Tech
brand: gear-versus-tech
audience: gamers and space owners who need help choosing gear for a real room
outcome: turn a room photo into a visual concept and a clear route into GVT comparisons, kits and affiliate buying options
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
approval: credentials
stop_conditions: missing Replicate token, unsafe upload, model failure, or unverified product claims
```

## Environment

Set these in Netlify environment variables; never commit the token:

```text
REPLICATE_API_TOKEN=...
REPLICATE_MODEL=black-forest-labs/flux-kontext-pro
```

The endpoint uses synchronous `Prefer: wait=60` mode for this first vertical slice. Before adding paid credits or high-volume traffic, move to asynchronous predictions with a signed webhook, Supabase job/output records, and persistent storage.

References:

- https://replicate.com/black-forest-labs/flux-kontext-pro
- https://replicate.com/docs/topics/predictions/create-a-prediction
- https://replicate.com/docs/topics/webhooks/receive-webhook

The concept image is deliberately separate from product truth. Matching products must come from the GVT catalogue and comparison pages, not from names inferred from pixels.
