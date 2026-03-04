import type { PipelineTemplate } from './types';
import { ramadanWishesTemplate } from './ramadan-wishes';
import { holidayMemeTemplate } from './holiday-meme';
import { aiPetTemplate } from './ai-pet';
import { customAvatarTemplate } from './custom-avatar';
import type { Node, Edge } from '@xyflow/react';
import { defaultConfigs, type CustomNodeType } from '../types/node-types';

// Blank canvas template
export const blankTemplate: PipelineTemplate = {
  id: 'blank',
  name: 'Blank Canvas',
  description: 'Start from scratch with an empty canvas',
  thumbnail: '📄',
  category: 'general',
  nodes: [],
  edges: [],
};

// All available templates
export const ALL_TEMPLATES: PipelineTemplate[] = [
  ramadanWishesTemplate,
  holidayMemeTemplate,
  aiPetTemplate,
  customAvatarTemplate,
  blankTemplate,
];

// Template registry by ID
const templateMap = new Map(ALL_TEMPLATES.map((t) => [t.id, t]));

/**
 * Load a template by ID. Returns nodes and edges for the canvas.
 * For AI-generated templates (id prefix 'ai-'), checks localStorage.
 * Returns blank canvas if template not found.
 */
export function loadTemplate(templateId: string): { nodes: Node[]; edges: Edge[] } {
  let template = templateMap.get(templateId);

  if (!template && templateId.startsWith('ai-')) {
    try {
      const stored = localStorage.getItem('ai-generated-templates');
      if (stored) {
        const aiTemplates: PipelineTemplate[] = JSON.parse(stored);
        template = aiTemplates.find((t) => t.id === templateId);
      }
    } catch {
      // ignore storage errors
    }
  }

  const resolved = template ?? blankTemplate;
  const nodes: Node[] = structuredClone(resolved.nodes).map((node) => {
    const defaults = defaultConfigs[node.type as CustomNodeType];
    if (defaults) {
      node.data = {
        ...node.data,
        config: { ...defaults, ...(node.data as { config?: Record<string, unknown> }).config },
      };
    }
    return node;
  });
  return {
    nodes,
    edges: structuredClone(resolved.edges),
  };
}

export { ramadanWishesTemplate, holidayMemeTemplate, aiPetTemplate, customAvatarTemplate };
export type { PipelineTemplate } from './types';
