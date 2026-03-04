import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import { generateText } from '@/services/ai-service';
import { validateTemplate, buildRetryPrompt } from '@/utils/templateValidator';

const router: RouterType = Router();

// ─── Zod Schemas ────────────────────────────────────────────────────────────

const requestSchema = z.object({
  prompt: z.string().min(1),
  model: z.string().optional(),
});

const VALID_NODE_TYPES = [
  'textPrompt',
  'imageUpload',
  'videoUpload',
  'templatePreset',
  'promptEnhancer',
  'styleConfig',
  'imageToText',
  'translateText',
  'backgroundRemover',
  'faceCrop',
  'objectRemover',
  'backgroundReplacer',
  'styleTransfer',
  'videoRepainting',
  'videoExtension',
  'imageGenerator',
  'videoGenerator',
  'inpainting',
  'imageUpscaler',
  'textOverlay',
  'frameBorder',
  'stickerLayer',
  'colorFilter',
  'collageLayout',
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

const SYSTEM_PROMPT = `You are an expert pipeline architect for ADIS AI — an Indonesian AI content-creation platform for social media (Instagram, TikTok, WhatsApp). Users create pipelines to make Eid greetings, memes, stickers, avatars, viral video clips, and more.

Your task: design a RICH, CREATIVE, multi-step pipeline based on the user's description. Use as many relevant node types as you can to create a polished, production-quality result.

═══════════════════════════════════════════════════════
PORT TYPES — data that flows through edges
═══════════════════════════════════════════════════════
- text   → plain text / prompt string
- image  → image URL (PNG / JPG / WEBP)
- video  → video URL (MP4)
- style  → visual style object (artStyle, mood, palette)
- media  → accepts EITHER image OR video (only preview/export use this)

CRITICAL TYPE RULES — violating these will BREAK the pipeline and cause nodes to disconnect:
✗ You CANNOT connect a video output to an image input port — EVER
✗ You CANNOT connect an image output to a video input port — EVER
✗ text, style, image, video are NOT interchangeable except where explicitly marked as "media"
✗ The ONLY nodes that accept "media" (image or video) are: preview, export
✗ After a video pipeline, go DIRECTLY to preview/export — NO compose nodes in between
✗ NEVER place colorFilter, stickerLayer, frameBorder, textOverlay, collageLayout after any video-producing node

CRITICAL HANDLE ID RULES — the handle IDs are NOT the same as port types:
✗ imageGenerator, videoGenerator, inpainting all have their text input as "prompt" — targetHandle MUST be "prompt", NEVER "text"
✓ CORRECT:   { source: "enh1", target: "gen1", sourceHandle: "prompt", targetHandle: "prompt" }
✗ INCORRECT: { source: "enh1", target: "gen1", sourceHandle: "prompt", targetHandle: "text" }
✓ CORRECT:   { source: "txt1", target: "gen1", sourceHandle: "text",   targetHandle: "prompt" }
✗ INCORRECT: { source: "txt1", target: "gen1", sourceHandle: "text",   targetHandle: "text" }

═══════════════════════════════════════════════════════
NODE CATALOG — inputs → outputs with exact handle IDs
═══════════════════════════════════════════════════════

── INPUT NODES (no inputs, produce data) ──────────────

textPrompt
  outputs: text→"text"
  → User types a prompt, caption, or greeting text

imageUpload
  outputs: image→"image"
  → User supplies a photo (PNG/JPG/WEBP, max 10MB)
  ⚠ IMAGE ONLY — its output can only go to image input ports

videoUpload
  outputs: video→"video"
  → User supplies a source video file (MP4/MOV/WEBM, max 50MB)
  ⚠ VIDEO ONLY — its output can only go to video input ports

templatePreset
  outputs: text→"text", style→"style"
  → Pre-built occasion starter (Eid, meme, etc.)

── UTILITY / TRANSFORM NODES ──────────────────────────

styleConfig
  inputs: (none)
  outputs: style→"style"
  → Define visual style: art style, color palette, mood, cultural theme
  ✓ Used to feed style into imageGenerator, videoGenerator, promptEnhancer

promptEnhancer
  inputs: text→"text" (required), style→"style" (optional)
  outputs: text→"prompt"
  → Enrich a raw prompt into a vivid AI prompt
  ⚠ Output handle is "prompt" (not "text") — use "prompt" in sourceHandle

imageToText
  inputs: image→"image" (required)
  outputs: text→"text"
  → Caption / describe an image in text
  ⚠ IMAGE ONLY input

translateText
  inputs: text→"text" (required)
  outputs: text→"text"
  → Translate text between languages (Indonesian, English, Arabic, Chinese)

── IMAGE TRANSFORM NODES ──────────────────────────────
These ALL require an image input and produce an image output.
⚠ NONE of these accept video. Do NOT wire a video into these nodes.

backgroundRemover
  inputs: image→"image" (required)
  outputs: image→"image"
  → Remove background, isolate subject with transparent BG

faceCrop
  inputs: image→"image" (required)
  outputs: image→"image"
  → Detect face and crop/zoom tight

objectRemover
  inputs: image→"image" (required)
  outputs: image→"image"
  → Erase a named object from the image

backgroundReplacer
  inputs: image→"image" (required), image→"bgImage" (optional — a second image for the new background)
  outputs: image→"image"
  → Swap the background with AI-generated or provided BG

styleTransfer
  inputs: image→"image" (required), image→"styleImage" (optional — a reference image for the style)
  outputs: image→"image"
  → Apply an artistic style to the image

── VIDEO TRANSFORM NODES ──────────────────────────────
These require video input and produce video output.
⚠ NONE of these accept image as main media. Image is only an optional reference.

videoRepainting
  inputs: text→"prompt" (required), video→"video" (required), image→"image" (optional — reference subject to transplant)
  outputs: video→"video"
  → Repaint video with new style using pose/depth/sketch control (wan2.1-vace-plus)
  → Great for: turning realistic footage into anime, watercolor, ink art
  → Source video must come from videoUpload or videoGenerator
  ✓ Wire: videoUpload→"video" or videoGenerator→"video" to videoRepainting→"video"

videoExtension
  inputs: text→"prompt" (required), video→"video" (optional), image→"image" (optional)
  outputs: video→"video" (always 5 seconds)
  → Extend a clip OR animate a single image into a 5-second video (wan2.1-vace-plus)
  → AT LEAST ONE of video or image must be provided
  → To animate an image: wire imageGenerator→"image" or imageUpload→"image" to videoExtension→"image"
  → To extend a clip: wire videoGenerator→"video" or videoUpload→"video" to videoExtension→"video"

── GENERATE NODES ─────────────────────────────────────

imageGenerator
  inputs: text→"prompt" (required), style→"style" (optional), image→"image" (optional — reference for img2img)
  outputs: image→"image"
  → Text-to-image or img2img generation (Wanx / Flux / Stable Diffusion)
  ⚠ Outputs IMAGE — cannot feed into video nodes directly (except videoExtension via "image" port)
  ⚠ HANDLE NAME: the text input handle is "prompt" — targetHandle MUST be "prompt", NOT "text"

videoGenerator
  inputs: text→"prompt" (required), style→"style" (optional), image→"image" (optional — first frame), image→"lastFrame" (optional — last frame)
  outputs: video→"video"
  → Generate a video from text or guided by reference frames
  ⚠ Outputs VIDEO — cannot feed into image-only compose nodes
  ⚠ HANDLE NAME: the text input handle is "prompt" — targetHandle MUST be "prompt", NOT "text"

inpainting
  inputs: image→"image" (required), text→"prompt" (required)
  outputs: image→"image"
  → Edit a specific region of an image via text instruction
  ⚠ IMAGE ONLY
  ⚠ HANDLE NAME: the text input handle is "prompt" — targetHandle MUST be "prompt", NOT "text"

imageUpscaler
  inputs: image→"image" (required)
  outputs: image→"image"
  → Upscale image to 2x or 4x HD resolution
  ⚠ IMAGE ONLY

── COMPOSE NODES (IMAGE ONLY — FORBIDDEN AFTER VIDEO NODES) ─────
⚠⚠⚠ ALL COMPOSE NODES ONLY WORK ON IMAGE DATA — NEVER VIDEO ⚠⚠⚠
NEVER wire videoGenerator, videoExtension, videoRepainting, or videoUpload output into any compose node.
These nodes are EXCLUSIVELY for post-processing images. A video output will make the edge invalid.
In a VIDEO pipeline: videoXxx → preview → export (skip all compose nodes entirely)

textOverlay
  inputs: image→"image" (required), text→"text" (optional)
  outputs: image→"image"
  → Add caption, greeting, or meme text on top of an image

frameBorder
  inputs: image→"image" (required)
  outputs: image→"image"
  → Add decorative frame: Islamic, floral, neon, polaroid, torn-paper

stickerLayer
  inputs: image→"image" (required)
  outputs: image→"image"
  → Overlay emoji/sticker packs (Ramadan, meme, sparkles)

colorFilter
  inputs: image→"image" (required)
  outputs: image→"image"
  → Apply mood filter: warm, vintage, eid-gold, sahur, cool, vibrant

collageLayout
  inputs: image→"image1" (required), image→"image2" (required), image→"image3" (optional), image→"image4" (optional)
  outputs: image→"image"
  → Combine 2–4 images into a grid or mosaic collage
  ⚠ NEEDS at least 2 image sources (run 2 imageGenerators in parallel, or use imageUpload + imageGenerator)

── OUTPUT NODES ───────────────────────────────────────

preview
  inputs: media→"media" (required — accepts image OR video)
  outputs: media→"media"
  → Preview result in the browser canvas
  ✓ Can accept image or video

export
  inputs: media→"media" (required — accepts image OR video)
  outputs: (none)
  → Download or share the final result
  ✓ Can accept image or video

═══════════════════════════════════════════════════════
PIPELINE PATTERNS — reference these when designing
═══════════════════════════════════════════════════════

IMAGE PIPELINE (photo/greeting/meme):
  Input(s) → [backgroundRemover/faceCrop] → imageGenerator or inpainting
  → colorFilter → frameBorder → stickerLayer → textOverlay → preview → export

VIDEO PIPELINE (animate or transform):
  ✓ VALID: textPrompt → promptEnhancer → imageGenerator → videoExtension → preview → export
  ✓ VALID: videoUpload + textPrompt → videoRepainting → preview → export
  ✓ VALID: imageGenerator → videoExtension → preview → export
  ✓ VALID: textPrompt → promptEnhancer → videoGenerator → videoExtension → preview → export
  ✗ INVALID: ...videoXxx → colorFilter → preview  (colorFilter is image-only, NEVER after video)
  ✗ INVALID: ...videoXxx → stickerLayer → preview  (stickerLayer is image-only, NEVER after video)
  ✗ INVALID: ...videoXxx → frameBorder → preview  (frameBorder is image-only, NEVER after video)
  ✗ INVALID: ...videoXxx → textOverlay → preview  (textOverlay is image-only, NEVER after video)

COLLAGE PIPELINE:
  textPrompt → promptEnhancer → imageGenerator (×2 in parallel, different styles)
  Both imageGenerators → collageLayout → frameBorder → textOverlay → preview → export

BILINGUAL PIPELINE:
  textPrompt → translateText → promptEnhancer → imageGenerator → textOverlay → preview → export

═══════════════════════════════════════════════════════
DESIGN PRINCIPLES
═══════════════════════════════════════════════════════
1. Use 4–12 nodes. Input → prepare → generate → compose → output.
2. Always add promptEnhancer before imageGenerator or videoGenerator.
3. Layer compose nodes (colorFilter → frameBorder → stickerLayer → textOverlay) for polished IMAGE results only — NEVER after video nodes.
4. Add styleConfig when mood matters (festive, dark, vintage, neon, etc.).
5. For photo pipelines: backgroundRemover or faceCrop first.
6. Fan-out is allowed — one output can feed multiple targets.
7. For video pipelines: ONLY use preview/export after video nodes. No compose nodes on video.
8. videoExtension is the bridge between image world and video world.

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
      "id": "<short unique id e.g. txt1, img2, gen3>",
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
      "sourceHandle": "<exact output handle id from catalog above>",
      "targetHandle": "<exact input handle id from catalog above>",
      "animated": true
    }
  ]
}
3. Use ONLY the exact node types listed. Any unknown type is rejected.
4. Use ONLY the exact handle IDs listed in the catalog (e.g. "prompt" not "text" for promptEnhancer output).
5. NEVER connect a video→ to an image port, or image→ to a video port.
6. Layout: inputs at x≈50, each column +380px right; parallel branches offset +280px on y-axis. Nodes in the same column share the same x; nodes in parallel branches are spaced at least 280px apart on y-axis.
   Example x positions for a linear pipeline: 50 → 430 → 810 → 1190 → 1570 → 1950 → 2330
   Example y positions for parallel branches at the same column: 100, 380, 660
7. Every pipeline MUST end with preview and/or export.
8. PRE-FILL node configs with meaningful values — do NOT leave all configs as empty {}:
   - textPrompt → set config.text to a concrete, vivid prompt derived from the user's description (this is the actual content prompt that will drive generation, NOT a meta description of the pipeline)
   - styleConfig → set config.artStyle, config.mood, config.culturalTheme based on the pipeline theme
   - promptEnhancer → set config.contentType (wishes/meme/character/avatar/general) and config.tone (formal/casual/funny/heartfelt)
   - textOverlay → set config.text to a relevant greeting or caption in the right language
   - translateText → set config.targetLang to the appropriate target language
   - videoRepainting → set config.control_condition and config.strength appropriately
   - videoExtension → set config.direction (forward/backward)
   - Other nodes: leave config as {} if no meaningful defaults to set`;

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

      const VIDEO_OUT = new Set([
        'videoGenerator',
        'videoExtension',
        'videoRepainting',
        'videoUpload',
      ]);
      const IMAGE_ONLY = new Set([
        'colorFilter',
        'stickerLayer',
        'frameBorder',
        'textOverlay',
        'collageLayout',
        'backgroundRemover',
        'faceCrop',
        'objectRemover',
        'backgroundReplacer',
        'styleTransfer',
        'inpainting',
        'imageUpscaler',
        'imageToText',
      ]);
      const nodeTypeMap = new Map(injectedNodes.map((n) => [n.id, n.type]));
      const sanitizedEdges = template.edges.filter((edge) => {
        const st = nodeTypeMap.get(edge.source);
        const tt = nodeTypeMap.get(edge.target);
        if (st && VIDEO_OUT.has(st) && tt && IMAGE_ONLY.has(tt)) {
          console.warn(`[aiTemplateRoutes] Stripped invalid edge ${edge.id}: ${st}→${tt}`);
          return false;
        }
        return true;
      });

      sendResult({ ...template, nodes: injectedNodes, edges: sanitizedEdges });
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
