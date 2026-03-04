import type { NodeCategory, CustomNodeType } from '../types/node-types';

export interface NodeCategoryConfig {
  id: NodeCategory;
  label: string;
  icon: string;
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface NodeTypeConfig {
  type: CustomNodeType;
  category: NodeCategory;
  label: string;
  icon: string;
  description: string;
}

// Category definitions with colors
export const NODE_CATEGORIES: Record<NodeCategory, NodeCategoryConfig> = {
  input: {
    id: 'input',
    label: 'Input',
    icon: '📥',
    color: '#4ade80',
    bgColor: 'rgba(74, 222, 128, 0.1)',
    borderColor: 'rgba(74, 222, 128, 0.5)',
  },
  textStyle: {
    id: 'textStyle',
    label: 'Text & Style',
    icon: '✨',
    color: '#a78bfa',
    bgColor: 'rgba(167, 139, 250, 0.1)',
    borderColor: 'rgba(167, 139, 250, 0.5)',
  },
  imageEdit: {
    id: 'imageEdit',
    label: 'Image Edit',
    icon: '🖼️',
    color: '#f472b6',
    bgColor: 'rgba(244, 114, 182, 0.1)',
    borderColor: 'rgba(244, 114, 182, 0.5)',
  },
  videoEdit: {
    id: 'videoEdit',
    label: 'Video Edit',
    icon: '🎞️',
    color: '#34d399',
    bgColor: 'rgba(52, 211, 153, 0.1)',
    borderColor: 'rgba(52, 211, 153, 0.5)',
  },
  generate: {
    id: 'generate',
    label: 'Generate',
    icon: '🤖',
    color: '#60a5fa',
    bgColor: 'rgba(96, 165, 250, 0.1)',
    borderColor: 'rgba(96, 165, 250, 0.5)',
  },
  compose: {
    id: 'compose',
    label: 'Compose',
    icon: '🎨',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.1)',
    borderColor: 'rgba(245, 158, 11, 0.5)',
  },
  output: {
    id: 'output',
    label: 'Output',
    icon: '📤',
    color: '#f87171',
    bgColor: 'rgba(248, 113, 113, 0.1)',
    borderColor: 'rgba(248, 113, 113, 0.5)',
  },
};

// All available node types
export const NODE_TYPE_CONFIGS: NodeTypeConfig[] = [
  // Input nodes
  {
    type: 'textPrompt',
    category: 'input',
    label: 'Text Prompt',
    icon: '📝',
    description: 'Enter text or prompts for content generation',
  },
  {
    type: 'imageUpload',
    category: 'input',
    label: 'Image Upload',
    icon: '🖼️',
    description: 'Upload a reference image',
  },
  {
    type: 'videoUpload',
    category: 'input',
    label: 'Video Upload',
    icon: '🎥',
    description: 'Upload a source video clip for editing or extension',
  },
  {
    type: 'templatePreset',
    category: 'input',
    label: 'Template Preset',
    icon: '📋',
    description: 'Start from a pre-built template',
  },
  // Text & Style nodes
  {
    type: 'promptEnhancer',
    category: 'textStyle',
    label: 'Prompt Enhancer',
    icon: '✨',
    description: 'Enhance prompts with AI (Qwen)',
  },
  {
    type: 'styleConfig',
    category: 'textStyle',
    label: 'Style Config',
    icon: '🎭',
    description: 'Configure art style, mood, and cultural theme',
  },
  {
    type: 'imageToText',
    category: 'textStyle',
    label: 'Image to Text',
    icon: '🔍',
    description: 'Describe an image using AI (Qwen VL)',
  },
  {
    type: 'translateText',
    category: 'textStyle',
    label: 'Translate Text',
    icon: '🌐',
    description: 'Translate text between languages',
  },
  // Image Edit nodes
  {
    type: 'backgroundRemover',
    category: 'imageEdit',
    label: 'Background Remover',
    icon: '✂️',
    description: 'Remove or replace image background with AI',
  },
  {
    type: 'faceCrop',
    category: 'imageEdit',
    label: 'Face Crop',
    icon: '👤',
    description: 'Auto-detect and crop face from image',
  },
  {
    type: 'objectRemover',
    category: 'imageEdit',
    label: 'Object Remover',
    icon: '🗑️',
    description: 'Remove objects or subjects from images with AI',
  },
  {
    type: 'backgroundReplacer',
    category: 'imageEdit',
    label: 'Background Replacer',
    icon: '🖼️',
    description: 'Replace image background with blur, color, or AI-generated scene',
  },
  {
    type: 'styleTransfer',
    category: 'imageEdit',
    label: 'Style Transfer',
    icon: '🎨',
    description: 'Apply artistic style from an image or text description',
  },
  // Video Edit nodes
  {
    type: 'videoRepainting',
    category: 'videoEdit',
    label: 'Video Repainting',
    icon: '🖌️',
    description: 'Repaint video style using pose/depth/sketch with wan2.1-vace-plus',
  },
  {
    type: 'videoExtension',
    category: 'videoEdit',
    label: 'Video Extension',
    icon: '⏩',
    description: 'Extend a short video clip or image into a 5-second video',
  },
  // Generate nodes
  {
    type: 'imageGenerator',
    category: 'generate',
    label: 'Image Generator',
    icon: '🖌️',
    description: 'Generate images with AI (Wan)',
  },
  {
    type: 'videoGenerator',
    category: 'generate',
    label: 'Video Generator',
    icon: '🎬',
    description: 'Generate short videos with AI (Wan)',
  },
  {
    type: 'inpainting',
    category: 'generate',
    label: 'Inpainting',
    icon: '🪄',
    description: 'Erase and regenerate parts of an image with AI',
  },
  {
    type: 'imageUpscaler',
    category: 'generate',
    label: 'Image Upscaler',
    icon: '🔬',
    description: 'Upscale image to 2× or 4× resolution with AI',
  },
  // Compose nodes
  {
    type: 'textOverlay',
    category: 'compose',
    label: 'Text Overlay',
    icon: '🔤',
    description: 'Add styled text on top of images',
  },
  {
    type: 'frameBorder',
    category: 'compose',
    label: 'Frame Border',
    icon: '🖼️',
    description: 'Add decorative frame or border to image',
  },
  {
    type: 'stickerLayer',
    category: 'compose',
    label: 'Sticker Layer',
    icon: '⭐',
    description: 'Add emoji stickers on top of images',
  },
  {
    type: 'colorFilter',
    category: 'compose',
    label: 'Color Filter',
    icon: '🌈',
    description: 'Apply color grading filters to images',
  },
  {
    type: 'collageLayout',
    category: 'compose',
    label: 'Collage Layout',
    icon: '📐',
    description: 'Combine multiple images into a collage',
  },
  // Output nodes
  {
    type: 'preview',
    category: 'output',
    label: 'Preview',
    icon: '👁️',
    description: 'Preview output in social media dimensions',
  },
  {
    type: 'export',
    category: 'output',
    label: 'Export',
    icon: '💾',
    description: 'Export and share your creation',
  },
  {
    type: 'manualEditor',
    category: 'output',
    label: 'Manual Editor',
    icon: '🖌️',
    description: 'Manually edit images with drawing and text tools',
  },
];

// Group node typesby category
export const NODE_TYPES_BY_CATEGORY = NODE_TYPE_CONFIGS.reduce(
  (acc, config) => {
    if (!acc[config.category]) {
      acc[config.category] = [];
    }
    acc[config.category].push(config);
    return acc;
  },
  {} as Record<NodeCategory, NodeTypeConfig[]>,
);

// Get category config for a node type
export function getCategoryForNodeType(nodeType: CustomNodeType): NodeCategoryConfig {
  const config = NODE_TYPE_CONFIGS.find((c) => c.type === nodeType);
  if (!config) {
    return NODE_CATEGORIES.input; // fallback
  }
  return NODE_CATEGORIES[config.category];
}
