import type { Node, Edge } from '@xyflow/react';
import { NODE_PORT_SCHEMAS, RUNNABLE_NODE_TYPES } from '../types/node-types';
import type { CustomNodeType } from '../types/node-types';
import { topologySort } from './topology';
import { NODE_TYPE_CONFIGS } from '../config/nodeCategories';

export interface ValidationIssue {
  nodeId: string;
  nodeLabel: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}

/** Get display-friendly label for a node. */
function getNodeLabel(node: Node): string {
  const data = node.data as Record<string, unknown>;
  if (typeof data?.label === 'string') return data.label;
  const config = NODE_TYPE_CONFIGS.find((c) => c.type === node.type);
  return config?.label ?? node.type ?? 'Unknown';
}

/**
 * Validate the pipeline before execution.
 * Returns a list of human-readable issues the user must fix.
 */
export function validatePipeline(nodes: Node[], edges: Edge[]): ValidationResult {
  const issues: ValidationIssue[] = [];

  if (nodes.length === 0) {
    return { valid: false, issues: [] };
  }

  // Build incoming-edge sets per node+port
  const incomingEdges = new Map<string, Set<string>>();
  for (const edge of edges) {
    if (!edge.targetHandle) continue;
    const key = `${edge.target}:${edge.targetHandle}`;
    if (!incomingEdges.has(key)) incomingEdges.set(key, new Set());
    incomingEdges.get(key)!.add(edge.source);
  }

  // Check required inputs on runnable nodes
  for (const node of nodes) {
    const nodeType = node.type as CustomNodeType;
    if (!RUNNABLE_NODE_TYPES.includes(nodeType)) continue;

    const schema = NODE_PORT_SCHEMAS[nodeType];
    const nodeLabel = getNodeLabel(node);

    for (const input of schema.inputs) {
      if (!input.required) continue;
      const key = `${node.id}:${input.id}`;
      const hasIncoming = (incomingEdges.get(key)?.size ?? 0) > 0;
      if (!hasIncoming) {
        issues.push({
          nodeId: node.id,
          nodeLabel,
          message: `"${nodeLabel}" memerlukan koneksi input: ${input.label}`,
          severity: 'error',
        });
      }
    }
  }

  // Check for input nodes that have no outgoing edges (orphaned inputs)
  const nodeIdsWithOutgoing = new Set(edges.map((e) => e.source));
  for (const node of nodes) {
    const nodeType = node.type as CustomNodeType;
    const schema = NODE_PORT_SCHEMAS[nodeType];
    const nodeLabel = getNodeLabel(node);
    // Node has outputs but none are connected
    if (schema.outputs.length > 0 && !nodeIdsWithOutgoing.has(node.id)) {
      issues.push({
        nodeId: node.id,
        nodeLabel,
        message: `"${nodeLabel}" tidak terhubung ke blok lain`,
        severity: 'warning',
      });
    }
  }

  // Check for circular dependencies
  try {
    topologySort(nodes, edges);
  } catch {
    issues.push({
      nodeId: '',
      nodeLabel: '',
      message:
        'Pipeline memiliki koneksi melingkar (loop). Periksa koneksi antar blok.',
      severity: 'error',
    });
  }

  // Check imageUpload / videoUpload nodes have a file
  for (const node of nodes) {
    const nodeType = node.type as CustomNodeType;
    const config = (node.data as Record<string, unknown>)?.config as
      | Record<string, unknown>
      | undefined;
    const nodeLabel = getNodeLabel(node);

    if (nodeType === 'imageUpload' && !config?.previewUrl) {
      issues.push({
        nodeId: node.id,
        nodeLabel,
        message: `"${nodeLabel}" belum ada gambar yang di-upload`,
        severity: 'error',
      });
    }

    if (nodeType === 'videoUpload' && !config?.previewUrl) {
      issues.push({
        nodeId: node.id,
        nodeLabel,
        message: `"${nodeLabel}" belum ada video yang di-upload`,
        severity: 'error',
      });
    }

    if (nodeType === 'textPrompt') {
      const text = (config?.text as string) ?? '';
      if (!text.trim()) {
        issues.push({
          nodeId: node.id,
          nodeLabel,
          message: `"${nodeLabel}" belum diisi — tulis prompt terlebih dahulu`,
          severity: 'error',
        });
      }
    }
  }

  const hasErrors = issues.some((i) => i.severity === 'error');
  return { valid: !hasErrors, issues };
}
