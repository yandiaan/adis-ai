import type { Node, Edge } from '@xyflow/react';
import type { ExecutionStore } from './store';
import type { CustomNodeType } from '../types/node-types';
import { RUNNABLE_NODE_TYPES } from '../types/node-types';
import { topologySort } from './topology';
import { collectNodeInputs } from './inputCollector';
import type { PipelineRunResult, NodeRunResponse } from './types';
import type { NodeOutput } from '../types/port-types';
import type { LogEntry } from './logStore';
import { getFingerprint } from '../../../utils/fingerprint';
import { getSessionStartMs } from '../../../utils/sessionContext';

const API_BASE = 'http://localhost:3000/api/node';

export type LogCallback = (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;

/**
 * Convert a non-runnable node's data into a NodeOutput.
 * Input nodes produce outputs from their own config rather than upstream data.
 */
function nodeDataToOutput(
  nodeType: CustomNodeType,
  nodeData: Record<string, unknown>,
): NodeOutput | null {
  const config = nodeData.config as Record<string, unknown> | undefined;
  if (!config) return null;
  const timestamp = Date.now();

  switch (nodeType) {
    case 'textPrompt':
      return {
        type: 'text',
        data: { text: (config.text as string) || '' },
        timestamp,
      };
    case 'imageUpload': {
      const url = config.previewUrl as string | null;
      if (!url) return null;
      return {
        type: 'image',
        data: { url, width: 0, height: 0 },
        timestamp,
      };
    }
    case 'videoUpload': {
      const url = config.previewUrl as string | null;
      if (!url) return null;
      return {
        type: 'video',
        data: { url, duration: 0, width: 0, height: 0 },
        timestamp,
      };
    }
    case 'styleConfig':
      return {
        type: 'style',
        data: {
          artStyle: config.artStyle as string,
          colorPalette: (config.colorPalette as string[]) || [],
          mood: config.mood as string,
          culturalTheme: (config.culturalTheme as string) || null,
        },
        timestamp,
      };
    case 'templatePreset':
      return {
        type: 'text',
        data: { text: `template:${config.template}:${config.locale}` },
        timestamp,
      };
    case 'manualEditor': {
      // ManualEditor stores composited image as exportDataUrl on node data (not inside config)
      const exportUrl = (nodeData as Record<string, unknown>).exportDataUrl as string | null;
      if (!exportUrl) return null;
      return {
        type: 'image',
        data: { url: exportUrl, width: 0, height: 0 },
        timestamp,
      };
    }
    default:
      return null;
  }
}

/**
 * Execute the full pipeline in topological order.
 * Uses a local outputMap to pass results between nodes within a single run,
 * avoiding stale React state closures.
 */
export async function runPipeline(
  nodes: Node[],
  edges: Edge[],
  store: ExecutionStore,
  logger?: LogCallback,
): Promise<PipelineRunResult> {
  const runId = `run-${Date.now()}`;
  const startTime = Date.now();
  store.setPipelineRunning(true, runId);

  logger?.({
    level: 'info',
    nodeId: null,
    nodeType: null,
    nodeLabel: null,
    message: `Pipeline started (${nodes.length} nodes, ${edges.length} edges)`,
  });

  // Local map to track outputs during this run (avoids stale React state reads)
  const outputMap = new Map<string, NodeOutput>();

  try {
    const order = topologySort(nodes, edges);

    for (const nodeId of order) {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) continue;

      const nodeType = node.type as CustomNodeType;

      if (RUNNABLE_NODE_TYPES.includes(nodeType)) {
        // Server-executed node
        store.setNodeState(nodeId, { status: 'running', progress: 0, error: null });

        const nodeLabel = ((node.data as Record<string, unknown>).label as string) || nodeType;
        logger?.({
          level: 'info',
          nodeId,
          nodeType,
          nodeLabel,
          message: `Running node: ${nodeLabel}`,
        });

        try {
          const inputs = collectNodeInputs(nodeId, edges, outputMap);
          const nodeStart = Date.now();
          const response = await executeNodeOnServer(nodeType, node.data, inputs);
          const durationMs = Date.now() - nodeStart;

          store.setNodeState(nodeId, {
            status: 'done',
            output: response.output,
            progress: 100,
            lastRunAt: Date.now(),
          });
          outputMap.set(nodeId, response.output);

          logger?.({
            level: 'success',
            nodeId,
            nodeType,
            nodeLabel,
            message: `${nodeLabel} completed — output type: ${response.output.type}`,
            durationMs,
            details: { output: response.output } as Record<string, unknown>,
          });
        } catch (err) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          store.setNodeState(nodeId, {
            status: 'error',
            error: errorMsg,
            progress: 0,
          });

          logger?.({
            level: 'error',
            nodeId,
            nodeType,
            nodeLabel,
            message: `${nodeLabel} failed: ${errorMsg}`,
            details: { error: errorMsg } as Record<string, unknown>,
          });

          // Stop pipeline on error
          break;
        }
      } else {
        // Non-runnable node — produce output from own data or pass through upstream
        const inputs = collectNodeInputs(nodeId, edges, outputMap);
        const ownOutput = nodeDataToOutput(nodeType, node.data as Record<string, unknown>);
        const firstInput = Object.values(inputs)[0] ?? null;
        const output = ownOutput ?? firstInput;

        store.setNodeState(nodeId, {
          status: 'done',
          output,
          progress: 100,
          lastRunAt: Date.now(),
        });
        if (output) {
          outputMap.set(nodeId, output);
        }
      }
    }

    store.setPipelineRunning(false);

    const totalDuration = Date.now() - startTime;
    logger?.({
      level: 'info',
      nodeId: null,
      nodeType: null,
      nodeLabel: null,
      message: `Pipeline completed in ${(totalDuration / 1000).toFixed(2)}s`,
      durationMs: totalDuration,
    });

    return {
      runId,
      success: true,
      nodeResults: store.nodeStates,
      duration: totalDuration,
    };
  } catch (err) {
    store.setPipelineRunning(false);

    const errorMsg = err instanceof Error ? err.message : 'Pipeline failed';
    logger?.({
      level: 'error',
      nodeId: null,
      nodeType: null,
      nodeLabel: null,
      message: `Pipeline failed: ${errorMsg}`,
    });

    return {
      runId,
      success: false,
      nodeResults: store.nodeStates,
      duration: Date.now() - startTime,
      error: errorMsg,
    };
  }
}

/**
 * Generate a hash string from PromptEnhancer config for cache comparison.
 */
function hashPromptEnhancerConfig(config: Record<string, unknown>): string {
  const keys = ['creativity', 'contentType', 'tone', 'language'];
  return keys.map((k) => `${k}:${config[k]}`).join('|');
}

/**
 * Check if PromptEnhancer can use cached result.
 */
function canUsePromptEnhancerCache(
  nodeState: { output: NodeOutput | null; status: string },
  inputs: Record<string, unknown>,
  config: Record<string, unknown>,
): boolean {
  if (nodeState.status !== 'done' || !nodeState.output) {
    return false;
  }

  const textInput = (inputs.text as { type: string; data: { text: string } })?.data?.text || '';
  const currentConfigHash = hashPromptEnhancerConfig(config);

  // Check if the cached metadata matches current inputs
  const cacheMeta = nodeState.output._cacheMeta;
  if (!cacheMeta) return false;

  return cacheMeta.inputText === textInput && cacheMeta.configHash === currentConfigHash;
}

/**
 * Execute a single node on the server.
 */
export async function runNode(
  nodeId: string,
  nodes: Node[],
  edges: Edge[],
  store: ExecutionStore,
): Promise<void> {
  const node = nodes.find((n) => n.id === nodeId);
  if (!node) throw new Error(`Node ${nodeId} not found`);

  const nodeType = node.type as CustomNodeType;
  if (!RUNNABLE_NODE_TYPES.includes(nodeType)) {
    throw new Error(`Node type ${nodeType} is not runnable`);
  }

  // Build outputMap from current store state for single-node runs
  const outputMap = new Map<string, NodeOutput>();
  for (const n of nodes) {
    const output = store.getNodeOutput(n.id);
    if (output) outputMap.set(n.id, output);
  }

  const inputs = collectNodeInputs(nodeId, edges, outputMap);
  const nodeConfig = (node.data as Record<string, unknown>).config as Record<string, unknown>;

  // Check if PromptEnhancer can use cached result
  if (nodeType === 'promptEnhancer') {
    const currentState = store.getNodeState(nodeId);
    if (canUsePromptEnhancerCache(currentState, inputs, nodeConfig)) {
      // Skip API call, use cached output
      store.setNodeState(nodeId, {
        status: 'done',
        output: currentState.output,
        progress: 100,
        lastRunAt: Date.now(),
      });
      // Mark downstream as stale
      store.markDownstreamStale(nodeId, edges);
      return;
    }
  }

  store.setNodeState(nodeId, { status: 'running', progress: 0, error: null });

  try {
    const response = await executeNodeOnServer(nodeType, node.data, inputs);

    // For PromptEnhancer, store cache metadata with the output
    let output = response.output;
    if (nodeType === 'promptEnhancer') {
      const textInput = (inputs.text as { type: string; data: { text: string } })?.data?.text || '';
      const configHash = hashPromptEnhancerConfig(nodeConfig);
      output = {
        ...output,
        _cacheMeta: {
          inputText: textInput,
          configHash,
        },
      };
    }

    store.setNodeState(nodeId, {
      status: 'done',
      output,
      progress: 100,
      lastRunAt: Date.now(),
    });

    // Mark downstream as stale
    store.markDownstreamStale(nodeId, edges);
  } catch (err) {
    store.setNodeState(nodeId, {
      status: 'error',
      error: err instanceof Error ? err.message : 'Unknown error',
      progress: 0,
    });
  }
}

/**
 * Call the server API for a runnable node.
 */
async function executeNodeOnServer(
  nodeType: CustomNodeType,
  nodeData: Record<string, unknown>,
  inputs: Record<string, unknown>,
): Promise<NodeRunResponse> {
  const endpointMap: Partial<Record<CustomNodeType, string>> = {
    promptEnhancer: 'prompt-enhancer',
    imageGenerator: 'image-generator',
    videoGenerator: 'video-generator',
    videoRepainting: 'video-repainting',
    videoExtension: 'video-extension',
    imageToText: 'image-to-text',
    translateText: 'translate-text',
    backgroundRemover: 'background-remover',
    faceCrop: 'face-crop',
    objectRemover: 'object-remover',
    backgroundReplacer: 'background-replacer',
    styleTransfer: 'style-transfer',
    inpainting: 'inpainting',
    imageUpscaler: 'image-upscaler',
    textOverlay: 'text-overlay',
    frameBorder: 'frame-border',
    stickerLayer: 'sticker-layer',
    colorFilter: 'color-filter',
    collageLayout: 'collage-layout',
  };

  const endpoint = endpointMap[nodeType];
  if (!endpoint) throw new Error(`No API endpoint for ${nodeType}`);

  const [fpHash] = await Promise.all([getFingerprint()]);
  const response = await fetch(`${API_BASE}/${endpoint}/run`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-FP-Hash': fpHash,
      'X-Session-Start': String(getSessionStartMs()),
    },
    body: JSON.stringify({ config: nodeData.config, inputs }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Server error: ${error}`);
  }

  return response.json();
}
