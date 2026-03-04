import type { ReactNode } from 'react';
import {
  Blend,
  Brush,
  Crop,
  Download,
  Eraser,
  Eye,
  Frame,
  Image,
  ImageUp,
  Languages,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  PenTool,
  Replace,
  ScanFace,
  ScanText,
  SlidersHorizontal,
  Sparkles,
  Star,
  TextCursorInput,
  Trash2,
  Type,
  Video,
  Wand2,
  ZoomIn,
} from 'lucide-react';
import type { CustomNodeType } from '../types/node-types';

type IconOptions = {
  size?: number;
  className?: string;
};

export function renderNodeTypeIcon(nodeType: CustomNodeType, options: IconOptions = {}): ReactNode {
  const { size = 18, className = 'text-white/85' } = options;

  switch (nodeType) {
    // Input
    case 'textPrompt':
      return <Type size={size} className={className} />;
    case 'imageUpload':
      return <ImageUp size={size} className={className} />;
    case 'templatePreset':
      return <LayoutTemplate size={size} className={className} />;

    // Transform
    case 'promptEnhancer':
      return <Sparkles size={size} className={className} />;
    case 'styleConfig':
      return <SlidersHorizontal size={size} className={className} />;
    case 'imageToText':
      return <ScanText size={size} className={className} />;
    case 'translateText':
      return <Languages size={size} className={className} />;
    case 'backgroundRemover':
      return <Eraser size={size} className={className} />;
    case 'faceCrop':
      return <ScanFace size={size} className={className} />;
    case 'objectRemover':
      return <Trash2 size={size} className={className} />;
    case 'backgroundReplacer':
      return <Replace size={size} className={className} />;
    case 'styleTransfer':
      return <Wand2 size={size} className={className} />;

    // Generate
    case 'imageGenerator':
      return <Image size={size} className={className} />;
    case 'videoGenerator':
      return <Video size={size} className={className} />;
    case 'inpainting':
      return <Brush size={size} className={className} />;
    case 'imageUpscaler':
      return <ZoomIn size={size} className={className} />;

    // Compose
    case 'textOverlay':
      return <TextCursorInput size={size} className={className} />;
    case 'frameBorder':
      return <Frame size={size} className={className} />;
    case 'stickerLayer':
      return <Star size={size} className={className} />;
    case 'colorFilter':
      return <Blend size={size} className={className} />;
    case 'collageLayout':
      return <LayoutGrid size={size} className={className} />;

    // Output
    case 'preview':
      return <Eye size={size} className={className} />;
    case 'export':
      return <Download size={size} className={className} />;
    case 'manualEditor':
      return <PenTool size={size} className={className} />;

    default:
      return <Layers size={size} className={className} />;
  }
}
