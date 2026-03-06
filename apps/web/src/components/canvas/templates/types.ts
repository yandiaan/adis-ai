import type { Node, Edge } from '@xyflow/react';

export type TemplateDifficulty = 'Pemula' | 'Menengah' | 'Lanjutan';

export interface PipelineTemplate {
  id: string;
  name: string;
  description: string;
  thumbnail: string; // emoji or URL
  category: string;
  nodes: Node[];
  edges: Edge[];
  /** Human-readable difficulty level shown on template card */
  difficulty?: TemplateDifficulty;
  /** Example prompt ideas shown on template selector */
  examplePrompts?: string[];
}
