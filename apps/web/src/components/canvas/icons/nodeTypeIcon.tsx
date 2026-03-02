import type { ReactNode } from 'react';
import {
  Download,
  Eye,
  Image,
  ImageUp,
  LayoutTemplate,
  SlidersHorizontal,
  Sparkles,
  TextCursorInput,
  Type,
  Video,
} from 'lucide-react';
import type { CustomNodeType } from '../types/node-types';

type IconOptions = {
  size?: number;
  className?: string;
};

export function renderNodeTypeIcon(nodeType: CustomNodeType, options: IconOptions = {}): ReactNode {
  const { size = 18, className = 'text-white/85' } = options;

  switch (nodeType) {
    case 'textPrompt':
      return <Type size={size} className={className} />;
    case 'imageUpload':
      return <ImageUp size={size} className={className} />;
    case 'templatePreset':
      return <LayoutTemplate size={size} className={className} />;
    case 'promptEnhancer':
      return <Sparkles size={size} className={className} />;
    case 'styleConfig':
      return <SlidersHorizontal size={size} className={className} />;
    case 'imageGenerator':
      return <Image size={size} className={className} />;
    case 'videoGenerator':
      return <Video size={size} className={className} />;
    case 'textOverlay':
      return <TextCursorInput size={size} className={className} />;
    case 'preview':
      return <Eye size={size} className={className} />;
    case 'export':
      return <Download size={size} className={className} />;
    default:
      return null;
  }
}
