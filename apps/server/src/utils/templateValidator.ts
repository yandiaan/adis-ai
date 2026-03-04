// ─── Template Validator ────────────────────────────────────────────────────────
// Checks that AI-generated pipeline templates have valid node types and
// edge type-compatibility before sending to the client (or retrying with AI).

export interface TemplateValidationError {
  ref: string; // edge id, or 'pipeline' for structural issues
  message: string;
}

export interface TemplateValidationResult {
  valid: boolean;
  errors: TemplateValidationError[];
}

interface TemplateNode {
  id: string;
  type: string;
}

interface TemplateEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Nodes whose primary output is video
const VIDEO_OUTPUT_TYPES = new Set([
  'videoGenerator',
  'videoExtension',
  'videoRepainting',
  'videoUpload',
]);

// Nodes that ONLY accept image data — cannot receive video
const IMAGE_ONLY_INPUT_TYPES = new Set([
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

// Nodes whose primary output is image
const IMAGE_OUTPUT_TYPES = new Set([
  'imageGenerator',
  'imageUpload',
  'backgroundRemover',
  'faceCrop',
  'objectRemover',
  'backgroundReplacer',
  'styleTransfer',
  'inpainting',
  'imageUpscaler',
  'colorFilter',
  'stickerLayer',
  'frameBorder',
  'textOverlay',
  'collageLayout',
]);

export function validateTemplate(template: {
  nodes: TemplateNode[];
  edges: TemplateEdge[];
}): TemplateValidationResult {
  const errors: TemplateValidationError[] = [];
  const nodeMap = new Map<string, string>(template.nodes.map((n) => [n.id, n.type]));

  for (const edge of template.edges) {
    // 1. Both endpoints must exist
    if (!nodeMap.has(edge.source)) {
      errors.push({ ref: edge.id, message: `Source node "${edge.source}" does not exist in nodes array` });
      continue;
    }
    if (!nodeMap.has(edge.target)) {
      errors.push({ ref: edge.id, message: `Target node "${edge.target}" does not exist in nodes array` });
      continue;
    }

    const srcType = nodeMap.get(edge.source)!;
    const tgtType = nodeMap.get(edge.target)!;

    // 2. Video output → image-only node = INVALID
    if (VIDEO_OUTPUT_TYPES.has(srcType) && IMAGE_ONLY_INPUT_TYPES.has(tgtType)) {
      errors.push({
        ref: edge.id,
        message: `INVALID TYPE: "${srcType}" outputs VIDEO but "${tgtType}" only accepts IMAGE. Remove this edge — compose nodes (colorFilter, stickerLayer, frameBorder, textOverlay, collageLayout, backgroundRemover, etc.) cannot process video. In a video pipeline, go directly to preview/export after video nodes.`,
      });
    }

    // 3. Image output → videoRepainting "video" port = INVALID
    if (IMAGE_OUTPUT_TYPES.has(srcType) && tgtType === 'videoRepainting' && edge.targetHandle === 'video') {
      errors.push({
        ref: edge.id,
        message: `INVALID HANDLE: "${srcType}" produces IMAGE but is wired to videoRepainting "video" port (which requires VIDEO). Use the optional "image" port on videoRepainting for image references.`,
      });
    }

    // 4. promptEnhancer output handle must be "prompt"
    if (srcType === 'promptEnhancer' && edge.sourceHandle && edge.sourceHandle !== 'prompt') {
      errors.push({
        ref: edge.id,
        message: `WRONG HANDLE: promptEnhancer output sourceHandle must be "prompt", got "${edge.sourceHandle}". Fix sourceHandle to "prompt".`,
      });
    }

    // 5. imageGenerator / videoGenerator text input handle must be "prompt", not "text"
    if (
      (tgtType === 'imageGenerator' || tgtType === 'videoGenerator' || tgtType === 'inpainting') &&
      edge.targetHandle === 'text'
    ) {
      errors.push({
        ref: edge.id,
        message: `WRONG HANDLE: "${tgtType}" has NO input handle named "text". Its text input handle is called "prompt". Change targetHandle from "text" to "prompt".`,
      });
    }
  }

  // 5. Every pipeline must end with at least one output node
  const hasOutput = template.nodes.some((n) => n.type === 'preview' || n.type === 'export');
  if (!hasOutput) {
    errors.push({
      ref: 'pipeline',
      message: 'Pipeline has no output node. Add a "preview" or "export" node at the end of the pipeline.',
    });
  }

  return { valid: errors.length === 0, errors };
}

export function buildRetryPrompt(
  originalPrompt: string,
  errors: TemplateValidationError[],
  attempt: number,
): string {
  const errorLines = errors.map((e, i) => `${i + 1}. [${e.ref}] ${e.message}`).join('\n');
  return `${originalPrompt}

⚠ VALIDATION ERRORS FROM ATTEMPT ${attempt} — YOU MUST FIX ALL OF THESE BEFORE RESPONDING:
${errorLines}

Regenerate the COMPLETE pipeline JSON fixing every error above. Do NOT repeat the same mistakes.`;
}
