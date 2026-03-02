import type { ReactNode } from 'react';
import { Inbox, Layers, Plus, Send, Sparkles, Wand2 } from 'lucide-react';
import type { NodeCategory } from '../types/node-types';

type IconOptions = {
  size?: number;
  className?: string;
};

export function renderNodeCategoryIcon(
  categoryId: NodeCategory,
  options: IconOptions = {},
): ReactNode {
  const { size = 18, className = 'text-current' } = options;

  switch (categoryId) {
    case 'input':
      return <Inbox size={size} className={className} />;
    case 'transform':
      return <Wand2 size={size} className={className} />;
    case 'generate':
      return <Sparkles size={size} className={className} />;
    case 'compose':
      return <Layers size={size} className={className} />;
    case 'output':
      return <Send size={size} className={className} />;
    default:
      return <Plus size={size} className={className} />;
  }
}
