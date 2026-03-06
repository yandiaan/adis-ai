import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { generateText } from '@/services/ai-service';
import { validateTemplate, buildRetryPrompt, sanitizeEdges } from '@/utils/templateValidator';

const router: RouterType = Router();

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const requestSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
});

const VALID_NODE_TYPES = [
  // Input
  'textPrompt',
  'imageUpload',
  'templatePreset',
  // Utility
  'promptEnhancer',
  'styleConfig',
  // Image transform (beginner-safe)
  'backgroundRemover',
  'faceCrop',
  'colorFilter',
  'textOverlay',
  'frameBorder',
  'stickerLayer',
  'imageUpscaler',
  // Generate
  'imageGenerator',
  'videoGenerator',
  'videoExtension',
  // Output
  'preview',
  'export',
] as const;

const nodeSchema = z.object({
  id: z.string(),
  type: z.enum(VALID_NODE_TYPES),
  position: z.object({ x: z.number(), y: z.number() }),
  data: z
    .object({
      label: z.string(),
      config: z.record(z.unknown()).optional(),
    })
    .passthrough(),
});

const edgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  sourceHandle: z.string().optional(),
  targetHandle: z.string().optional(),
  animated: z.boolean().optional(),
});

const templateResponseSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  thumbnail: z.string(),
  category: z.string(),
  nodes: z.array(nodeSchema),
  edges: z.array(edgeSchema),
});

// ─── System Prompt ───────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a beginner-friendly pipeline designer for ADIS AI — an Indonesian AI content-creation tool for social media (Instagram, TikTok, WhatsApp). Users create automated pipelines to generate Eid greetings, memes, avatars, viral clips, and more.

Your task: design the SIMPLEST working pipeline that achieves the user's goal.
BEGINNER FIRST — a short, fully-connected 3–5 node pipeline that works is infinitely better than a complex 10-node pipeline where some nodes are orphaned or disconnected.

═══════════════════════════════════════════════════════
CONNECTIVITY RULES — READ FIRST
═══════════════════════════════════════════════════════
✅ EVERY node MUST be connected to at least one other node via an edge
✅ Pipelines must flow from inputs → (optional middle) → output nodes
✅ Every edge MUST use the exact handle IDs listed in the catalog below
✗ ZERO orphaned/floating nodes — if you add a node, you MUST wire it in
✗ You CANNOT connect a video output to an image input port — EVER
✗ You CANNOT connect an image output to a video input port — EVER
✗ preview and export ONLY accept "media" — targetHandle MUST be "media", NEVER "image" or "video"
✗ After any video-producing node (videoGenerator, videoExtension) go DIRECTLY to preview/export — NO compose nodes
✗ imageGenerator/videoGenerator text input handle is "prompt" — targetHandle MUST be "prompt", NOT "text"
✗ promptEnhancer INPUT handle is "text" — use targetHandle: "text" when wiring INTO promptEnhancer
✗ promptEnhancer OUTPUT handle is "prompt" — use sourceHandle: "prompt" when wiring OUT of promptEnhancer

CRITICAL HANDLE QUICK-REFERENCE:
  textPrompt → promptEnhancer:   sourceHandle:"text",   targetHandle:"text"   ✓
  textPrompt → imageGenerator:   sourceHandle:"text",   targetHandle:"prompt" ✓
  promptEnhancer → imageGenerator: sourceHandle:"prompt", targetHandle:"prompt" ✓
  imageGenerator → preview:      sourceHandle:"image",  targetHandle:"media"  ✓
  videoGenerator → preview:      sourceHandle:"video",  targetHandle:"media"  ✓
  imageGenerator → videoExtension: sourceHandle:"image", targetHandle:"image"  ✓

═══════════════════════════════════════════════════════
NODE CATALOG — exact handle IDs
═══════════════════════════════════════════════════════

── INPUT NODES ──────────────────────────────────────
textPrompt      → outputs: text→"text"
imageUpload     → outputs: image→"image"
templatePreset  → outputs: text→"text", style→"style"

── UTILITY NODES ────────────────────────────────────
styleConfig     → inputs: (none) | outputs: style→"style"
promptEnhancer  → inputs: text→"text" (req), style→"style" (opt) | outputs: text→"prompt"
  ⚠ INPUT is "text", OUTPUT is "prompt" — they are different handles

── IMAGE TRANSFORM NODES (image in → image out) ──────
backgroundRemover → inputs: image→"image" (req) | outputs: image→"image"
faceCrop          → inputs: image→"image" (req) | outputs: image→"image"
colorFilter       → inputs: image→"image" (req) | outputs: image→"image"
textOverlay       → inputs: image→"image" (req), text→"text" (opt) | outputs: image→"image"
frameBorder       → inputs: image→"image" (req) | outputs: image→"image"
stickerLayer      → inputs: image→"image" (req) | outputs: image→"image"
imageUpscaler     → inputs: image→"image" (req) | outputs: image→"image"

── GENERATE NODES ───────────────────────────────────
imageGenerator  → inputs: text→"prompt" (req), style→"style" (opt), image→"image" (opt) | outputs: image→"image"
  ⚠ text input handle is "prompt" NOT "text"
videoGenerator  → inputs: text→"prompt" (req), style→"style" (opt), image→"image" (opt) | outputs: video→"video"
  ⚠ text input handle is "prompt" NOT "text"
videoExtension  → inputs: text→"prompt" (req), image→"image" (opt), video→"video" (opt) | outputs: video→"video"
  ⚠ AT LEAST ONE of image or video must be provided

── OUTPUT NODES ─────────────────────────────────────
preview  → inputs: media→"media" (req — accepts image OR video) | outputs: media→"media"
export   → inputs: media→"media" (req — accepts image OR video) | outputs: (none)
  ⚠ "media" is the ONLY valid targetHandle for both preview and export

═══════════════════════════════════════════════════════
RECOMMENDED STARTER PIPELINES (copy these patterns)
═══════════════════════════════════════════════════════

SIMPLEST IMAGE (default for most requests, 4 nodes):
  textPrompt → imageGenerator → preview → export
  edges: text→prompt, image→media, media→media

WITH PROMPT ENHANCEMENT (5 nodes):
  textPrompt → promptEnhancer → imageGenerator → preview → export
  edges: text→text, prompt→prompt, image→media, media→media

WITH PHOTO INPUT (5 nodes):
  imageUpload → backgroundRemover → imageGenerator → preview → export
  edges: image→image, image→prompt(❌ wrong!) ← see note below
  ⚠ imageUpload→imageGenerator uses sourceHandle:"image" targetHandle:"image" (img2img reference)
  ⚠ Still need a textPrompt→imageGenerator for the "prompt" handle

WITH COLOR FILTER (5 nodes):
  textPrompt → imageGenerator → colorFilter → preview → export

WITH TEXT ON IMAGE (5 nodes):
  textPrompt → imageGenerator → textOverlay → preview → export
  ⚠ For textOverlay, wire textPrompt→textOverlay as well: sourceHandle:"text" targetHandle:"text"

ANIMATE TO VIDEO (5 nodes):
  textPrompt → imageGenerator → videoExtension → preview → export
  ⚠ videoExtension needs a "prompt" handle too — wire textPrompt→videoExtension: sourceHandle:"text" targetHandle:"prompt"

═══════════════════════════════════════════════════════
DESIGN PRINCIPLES
═══════════════════════════════════════════════════════
1. TARGET 3–5 NODES. Never exceed 7 nodes unless the user explicitly asks for multiple effects.
2. LINEAR pipelines only — no parallel branches. One clear left-to-right flow.
3. Only add promptEnhancer if the user's request is vague or short (< 10 words).
4. Only add styleConfig if the user mentions a specific style/mood (festive, vintage, neon, etc.).
5. Only add compose nodes (colorFilter, textOverlay, frameBorder, stickerLayer) if the user explicitly asks for it.
6. For video: imageGenerator → videoExtension → preview → export (simplest path to video).
7. ALWAYS end with preview AND export.
8. If unsure, default to: textPrompt → imageGenerator → preview → export (4 nodes).

═══════════════════════════════════════════════════════
OUTPUT RULES
═══════════════════════════════════════════════════════
1. Respond with ONLY a raw JSON object — no markdown fences, no commentary.
2. JSON shape:
{
  "id": "ai-<timestamp>",
  "name": "<short creative name>",
  "description": "<one punchy sentence>",
  "thumbnail": "<single relevant emoji>",
  "category": "<general|seasonal|character|meme|video>",
  "nodes": [
    {
      "id": "<short unique id e.g. txt1, img1, gen1, prv1, exp1>",
      "type": "<exact node type>",
      "position": { "x": <number>, "y": <number> },
      "data": { "label": "<descriptive label>", "config": {} }
    }
  ],
  "edges": [
    {
      "id": "e-<source>-<target>",
      "source": "<node id>",
      "target": "<node id>",
      "sourceHandle": "<exact output handle id>",
      "targetHandle": "<exact input handle id>",
      "animated": true
    }
  ]
}
3. Use ONLY the exact node types listed in the catalog. Any unknown type is rejected.
4. Use ONLY the exact handle IDs from the catalog above.
5. Layout: x starts at 50, each step adds 300px. All nodes on same y=200 for linear pipelines.
   Example: txt1 x:50 → gen1 x:350 → prv1 x:650 → exp1 x:950 — all at y:200
6. Every pipeline MUST end with both preview AND export.
7. PRE-FILL node configs with relevant values:
   - textPrompt → set config.text to a vivid, specific prompt for the user's theme
   - promptEnhancer → set config.contentType and config.tone appropriately
   - textOverlay → set config.text to a relevant caption in Indonesian
   - colorFilter → set config.filter to a fitting mood filter
   - Other nodes: leave config as {} if no obvious default`;

// ─── Route: Enhance Prompt ───────────────────────────────────────────────────

const ENHANCE_SYSTEM_PROMPT = `You are a creative director for an AI content-creation platform.
The user gives you a rough pipeline idea. Your job: rewrite it into a vivid, specific, inspiring description that will help the pipeline architect build a richer workflow.

Rules:
- Keep the original intent exactly — do NOT change what the user wants to make.
- Add specific visual details: style, mood, color palette, occasion context, target platform.
- Mention relevant techniques: photo cleanup, background swap, text overlay, filters, stickers, etc. if they fit.
- Keep it to 2–4 sentences. Be concrete, not vague.
- Reply with ONLY the enhanced description — no preamble, no quotes, no explanation.`;

router.post('/enhance-prompt', async (req, res, next) => {
  try {
    const parsed = z.object({ prompt: z.string().min(1) }).safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: 'Bad Request', details: parsed.error.flatten() });
      return;
    }

    let enhanced: string;
    try {
      enhanced = await generateText({
        model: 'qwen-turbo',
        messages: [
          { role: 'system', content: ENHANCE_SYSTEM_PROMPT },
          { role: 'user', content: parsed.data.prompt },
        ],
        temperature: 0.85,
        max_tokens: 300,
      });
    } catch (aiErr) {
      console.error('[aiTemplateRoutes] enhance-prompt AI call failed:', aiErr);
      res.status(502).json({ error: 'Bad Gateway', message: 'AI service unavailable.' });
      return;
    }

    res.json({ enhancedPrompt: enhanced.trim() });
  } catch (err) {
    next(err);
  }
});

// ─── Route: Generate Template (SSE streaming with validation + retry) ──────────

router.post('/generate-template', async (req, res) => {
  // Setup SSE via Express helpers so headersSent is tracked correctly
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.status(200).flushHeaders();

  // Swallow socket errors so they don't become unhandled rejections
  res.on('error', (err) => console.error('[aiTemplateRoutes] socket error:', err));

  let ended = false;
  let closed = false;
  res.on('close', () => {
    closed = true;
  });

  /** Safely write one SSE event; no-op if stream already ended. */
  const send = (data: object): void => {
    if (ended || closed) return;
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      console.error('[aiTemplateRoutes] write error:', e);
      ended = true;
    }
  };

  /** Terminate the response exactly once. */
  const end = (): void => {
    if (ended) return;
    ended = true;
    try {
      res.end();
    } catch (e) {
      console.error('[aiTemplateRoutes] end error:', e);
    }
  };

  const sendStatus = (message: string) => send({ type: 'status', message });
  const sendResult = (template: object) => {
    send({ type: 'result', template });
    end();
  };
  const sendError = (message: string) => {
    send({ type: 'error', message });
    end();
  };

  try {
    const parsed = requestSchema.safeParse(req.body);
    if (!parsed.success) {
      sendError('Bad Request: invalid input');
      return;
    }

    const { prompt, model = 'qwen-max' } = parsed.data;
    const MAX_ATTEMPTS = 3;
    let currentPrompt = prompt;

    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      if (ended || closed) return;

      // ── Status ──────────────────────────────────────
      if (attempt === 1) {
        sendStatus('Analyzing your idea…');
        sendStatus(`Generating pipeline with ${model}…`);
      } else {
        sendStatus(`Retrying generation (attempt ${attempt}/${MAX_ATTEMPTS})…`);
      }

      // ── Call AI ─────────────────────────────────────
      let rawText: string;
      try {
        const aiTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI_TIMEOUT')), 90000),
        );
        rawText = await Promise.race([
          generateText({
            model,
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: currentPrompt },
            ],
            temperature: attempt === 1 ? 0.9 : 0.7,
            max_tokens: 3000,
          }),
          aiTimeout,
        ]);
      } catch (aiErr) {
        const isTimeout = aiErr instanceof Error && aiErr.message === 'AI_TIMEOUT';
        console.error('[aiTemplateRoutes] AI call failed:', aiErr);
        sendError(
          isTimeout
            ? 'AI request timed out. Try switching to qwen-turbo for faster generation.'
            : 'AI service unavailable. Please try again.',
        );
        return;
      }

      if (ended || closed) return;

      // ── Extract JSON ─────────────────────────────────
      const jsonMatch = rawText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        if (attempt < MAX_ATTEMPTS) {
          currentPrompt = `${prompt}\n\n⚠ Previous attempt did not return JSON. Return ONLY a raw JSON object.`;
          continue;
        }
        sendError('AI did not return valid JSON after multiple attempts.');
        return;
      }

      let parsed2: unknown;
      try {
        parsed2 = JSON.parse(jsonMatch[0]);
      } catch {
        if (attempt < MAX_ATTEMPTS) {
          currentPrompt = `${prompt}\n\n⚠ Previous attempt returned malformed JSON. Fix syntax errors.`;
          continue;
        }
        sendError('AI response could not be parsed as JSON.');
        return;
      }

      // ── Schema validation ────────────────────────────
      const validated = templateResponseSchema.safeParse(parsed2);
      if (!validated.success) {
        if (attempt < MAX_ATTEMPTS) {
          const flat = validated.error.flatten();
          currentPrompt = `${prompt}\n\n⚠ SCHEMA ERRORS (attempt ${attempt}):\n${JSON.stringify(flat, null, 2)}\n\nFix all schema errors and regenerate.`;
          continue;
        }
        sendError('AI generated an invalid pipeline structure after multiple attempts.');
        return;
      }

      // ── Semantic validation ──────────────────────────
      sendStatus('Validating node connections…');
      const { valid, errors: valErrors } = validateTemplate(validated.data);

      if (!valid) {
        console.warn(
          `[aiTemplateRoutes] Validation failed (attempt ${attempt}): ${valErrors.length} error(s)`,
        );
        if (attempt < MAX_ATTEMPTS) {
          sendStatus(`Found ${valErrors.length} issue(s) — fixing…`);
          currentPrompt = buildRetryPrompt(prompt, valErrors, attempt);
          continue;
        }
        // Final attempt: sanitize and send anyway
        console.warn('[aiTemplateRoutes] Max attempts reached, sanitizing and proceeding');
      }

      if (ended || closed) return;

      // ── Post-process ─────────────────────────────────
      sendStatus('Finalizing pipeline…');
      const template = validated.data;

      const injectedNodes = template.nodes.map((node) => {
        if (node.type === 'textPrompt') {
          const cfg = (node.data.config ?? {}) as Record<string, unknown>;
          if (!cfg.text || (cfg.text as string).trim() === '') {
            return { ...node, data: { ...node.data, config: { ...cfg, text: prompt } } };
          }
        }
        return node;
      });

      const sanitized = sanitizeEdges(injectedNodes, template.edges);

      sendResult({ ...template, nodes: sanitized.nodes, edges: sanitized.edges });
      return;
    }

    sendError(
      'Could not generate a valid pipeline after multiple attempts. Try a simpler description.',
    );
  } catch (err) {
    console.error('[aiTemplateRoutes] Unexpected error:', err);
    if (!ended && !closed) sendError('Internal server error. Please try again.');
  } finally {
    // Always ensure the HTTP chunked response is properly terminated
    end();
  }
});

export default router;
