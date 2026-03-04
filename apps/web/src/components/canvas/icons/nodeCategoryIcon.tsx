import type { ReactNode } from 'react';
import { Film, ImageIcon, Inbox, Layers, Plus, Send, Sparkles, Type, Wand2 } from 'lucide-react';
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
    case 'textStyle':
      return <Type size={size} className={className} />;
    case 'imageEdit':
      return <ImageIcon size={size} className={className} />;
    case 'videoEdit':
      return <Film size={size} className={className} />;
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
