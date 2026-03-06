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

// ─── Port handle registry (mirrors NODE_PORT_SCHEMAS on the frontend) ─────────
// inputs: valid targetHandle values; outputs: valid sourceHandle values

const NODE_HANDLES: Record<string, { inputs: string[]; outputs: string[] }> = {
  textPrompt:        { inputs: [],                                    outputs: ['text'] },
  imageUpload:       { inputs: [],                                    outputs: ['image'] },
  videoUpload:       { inputs: [],                                    outputs: ['video'] },
  templatePreset:    { inputs: [],                                    outputs: ['text', 'style'] },
  promptEnhancer:    { inputs: ['text', 'style'],                     outputs: ['prompt'] },
  styleConfig:       { inputs: [],                                    outputs: ['style'] },
  imageGenerator:    { inputs: ['prompt', 'style', 'image'],          outputs: ['image'] },
  videoGenerator:    { inputs: ['prompt', 'style', 'image', 'lastFrame'], outputs: ['video'] },
  imageToText:       { inputs: ['image'],                             outputs: ['text'] },
  translateText:     { inputs: ['text'],                              outputs: ['text'] },
  backgroundRemover: { inputs: ['image'],                             outputs: ['image'] },
  faceCrop:          { inputs: ['image'],                             outputs: ['image'] },
  objectRemover:     { inputs: ['image'],                             outputs: ['image'] },
  backgroundReplacer:{ inputs: ['image', 'bgImage'],                  outputs: ['image'] },
  styleTransfer:     { inputs: ['image', 'styleImage'],               outputs: ['image'] },
  videoRepainting:   { inputs: ['prompt', 'video', 'image'],          outputs: ['video'] },
  videoExtension:    { inputs: ['prompt', 'video', 'image'],          outputs: ['video'] },
  inpainting:        { inputs: ['image', 'prompt'],                   outputs: ['image'] },
  imageUpscaler:     { inputs: ['image'],                             outputs: ['image'] },
  textOverlay:       { inputs: ['image', 'text'],                     outputs: ['image'] },
  frameBorder:       { inputs: ['image'],                             outputs: ['image'] },
  stickerLayer:      { inputs: ['image'],                             outputs: ['image'] },
  colorFilter:       { inputs: ['image'],                             outputs: ['image'] },
  collageLayout:     { inputs: ['image1', 'image2', 'image3', 'image4'], outputs: ['image'] },
  preview:           { inputs: ['media'],                             outputs: ['media'] },
  export:            { inputs: ['media'],                             outputs: [] },
};

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
    const srcHandles = NODE_HANDLES[srcType];
    const tgtHandles = NODE_HANDLES[tgtType];

    // 2. sourceHandle must exist on the source node's outputs
    if (edge.sourceHandle && srcHandles && !srcHandles.outputs.includes(edge.sourceHandle)) {
      errors.push({
        ref: edge.id,
        message: `INVALID sourceHandle: "${srcType}" has no output handle "${edge.sourceHandle}". Valid outputs are: [${srcHandles.outputs.join(', ')}].`,
      });
    }

    // 3. targetHandle must exist on the target node's inputs
    if (edge.targetHandle && tgtHandles && !tgtHandles.inputs.includes(edge.targetHandle)) {
      errors.push({
        ref: edge.id,
        message: `INVALID targetHandle: "${tgtType}" has no input handle "${edge.targetHandle}". Valid inputs are: [${tgtHandles.inputs.join(', ')}]. Common mistake: preview/export require "media", not "image" or "video". collageLayout requires "image1"/"image2", not "image".`,
      });
    }

    // 4. Video output → image-only node = INVALID
    if (VIDEO_OUTPUT_TYPES.has(srcType) && IMAGE_ONLY_INPUT_TYPES.has(tgtType)) {
      errors.push({
        ref: edge.id,
        message: `INVALID TYPE: "${srcType}" outputs VIDEO but "${tgtType}" only accepts IMAGE. Remove this edge — compose nodes (colorFilter, stickerLayer, frameBorder, textOverlay, collageLayout, backgroundRemover, etc.) cannot process video. In a video pipeline, go directly to preview/export after video nodes.`,
      });
    }

    // 5. Image output → videoRepainting "video" port = INVALID
    if (IMAGE_OUTPUT_TYPES.has(srcType) && tgtType === 'videoRepainting' && edge.targetHandle === 'video') {
      errors.push({
        ref: edge.id,
        message: `INVALID HANDLE: "${srcType}" produces IMAGE but is wired to videoRepainting "video" port (which requires VIDEO). Use the optional "image" port on videoRepainting for image references.`,
      });
    }

    // 6. promptEnhancer output handle must be "prompt"
    if (srcType === 'promptEnhancer' && edge.sourceHandle && edge.sourceHandle !== 'prompt') {
      errors.push({
        ref: edge.id,
        message: `WRONG HANDLE: promptEnhancer output sourceHandle must be "prompt", got "${edge.sourceHandle}". Fix sourceHandle to "prompt".`,
      });
    }

    // 7. imageGenerator / videoGenerator / inpainting text input handle must be "prompt", not "text"
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

  // 8. Every pipeline must end with at least one output node
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

// Standalone input nodes that are valid with no incoming edges
const PURE_INPUT_NODE_TYPES = new Set([
  'textPrompt',
  'imageUpload',
  'videoUpload',
  'templatePreset',
  'styleConfig',
]);

/**
 * Strip edges that have invalid handle IDs, then remove any nodes that
 * become fully orphaned (no edges at all) — except pure input nodes which
 * are valid with only outgoing edges.
 *
 * Used as a last-resort sanitizer when max retry attempts are exhausted.
 */
export function sanitizeEdges(
  nodes: TemplateNode[],
  edges: TemplateEdge[],
): { nodes: TemplateNode[]; edges: TemplateEdge[] } {
  const nodeMap = new Map<string, string>(nodes.map((n) => [n.id, n.type]));

  // Step 1: remove edges with invalid handles or type mismatches
  const validEdges = edges.filter((edge) => {
    const srcType = nodeMap.get(edge.source);
    const tgtType = nodeMap.get(edge.target);
    if (!srcType || !tgtType) return false;

    const srcHandles = NODE_HANDLES[srcType];
    const tgtHandles = NODE_HANDLES[tgtType];

    if (edge.sourceHandle && srcHandles && !srcHandles.outputs.includes(edge.sourceHandle)) return false;
    if (edge.targetHandle && tgtHandles && !tgtHandles.inputs.includes(edge.targetHandle)) return false;
    if (VIDEO_OUTPUT_TYPES.has(srcType) && IMAGE_ONLY_INPUT_TYPES.has(tgtType)) return false;

    return true;
  });

  // Step 2: find which nodes still have at least one valid edge
  const connectedNodeIds = new Set<string>();
  for (const edge of validEdges) {
    connectedNodeIds.add(edge.source);
    connectedNodeIds.add(edge.target);
  }

  // Step 3: keep only connected nodes, OR pure input nodes (they legitimately have no incoming edges)
  const validNodes = nodes.filter(
    (n) => connectedNodeIds.has(n.id) || PURE_INPUT_NODE_TYPES.has(n.type),
  );

  // Step 4: remove edges that reference nodes we just dropped
  const validNodeIds = new Set(validNodes.map((n) => n.id));
  const finalEdges = validEdges.filter(
    (e) => validNodeIds.has(e.source) && validNodeIds.has(e.target),
  );

  return { nodes: validNodes, edges: finalEdges };
}

