import type { Node } from '@xyflow/react';
import type { NodePortSchema } from './port-types';

// Node categories
export type NodeCategory = 'input' | 'transform' | 'generate' | 'compose' | 'output';

// All custom node type identifiers
export type CustomNodeType =
  | 'textPrompt'
  | 'imageUpload'
  | 'templatePreset'
  | 'promptEnhancer'
  | 'styleConfig'
  | 'imageGenerator'
  | 'videoGenerator'
  | 'textOverlay'
  | 'preview'
  | 'export';

// Base node data interface
export interface BaseNodeData extends Record<string, unknown> {
  label: string;
}

// --- INPUT NODES ---

export interface TextPromptConfig {
  text: string;
  maxLength: number;
  placeholder: string;
}

export interface TextPromptData extends BaseNodeData {
  config: TextPromptConfig;
}

export interface ImageUploadConfig {
  previewUrl: string | null;
  fileName: string | null;
  fileSizeMB: number | null;
  maxSizeMB: number;
}

export interface ImageUploadData extends BaseNodeData {
  config: ImageUploadConfig;
}

export type TemplateId = 'ramadan-wishes' | 'holiday-meme' | 'ai-pet' | 'custom-avatar' | 'blank';

export interface TemplatePresetConfig {
  template: TemplateId;
  locale: 'id' | 'en';
}

export interface TemplatePresetData extends BaseNodeData {
  config: TemplatePresetConfig;
}

// --- TRANSFORM NODES ---

export type CreativityLevel = 'precise' | 'balanced' | 'creative';
export type ContentType = 'wishes' | 'meme' | 'character' | 'avatar' | 'general';
export type ToneType = 'formal' | 'casual' | 'funny' | 'heartfelt';

export interface PromptEnhancerConfig {
  creativity: CreativityLevel;
  contentType: ContentType;
  tone: ToneType;
  language: 'id' | 'en' | 'mixed';
}

export interface PromptEnhancerData extends BaseNodeData {
  config: PromptEnhancerConfig;
}

export type ArtStyle =
  | 'realistic'
  | 'cartoon'
  | 'anime'
  | 'watercolor'
  | 'pixel-art'
  | 'islamic-art'
  | 'pop-art'
  | 'minimalist';

export type MoodType = 'warm' | 'cool' | 'playful' | 'elegant' | 'spiritual' | 'funny' | 'cute';

export type CulturalTheme = 'ramadan' | 'lebaran' | 'natal' | 'imlek' | 'general' | null;

export interface StyleConfigConfig {
  artStyle: ArtStyle;
  colorPalette: string[];
  mood: MoodType;
  culturalTheme: CulturalTheme;
}

export interface StyleConfigData extends BaseNodeData {
  config: StyleConfigConfig;
}

// --- GENERATE NODES ---

export type ImageGenMode = 'text2img' | 'img2img';
export type ImageDimension =
  | 'square-1024'
  | 'portrait-768x1024'
  | 'landscape-1024x768'
  | 'story-576x1024';

export interface ImageGeneratorConfig {
  mode: ImageGenMode;
  dimensions: ImageDimension;
  prompt_extend?: boolean;
  seed: number | null;
}

export interface ImageGeneratorData extends BaseNodeData {
  config: ImageGeneratorConfig;
}

export type VideoGenMode = 'text2video' | 'img2video';
export type VideoResolution = '480P' | '720P' | '1080P';

export interface VideoGeneratorConfig {
  mode: VideoGenMode;
  duration: number;
  resolution: VideoResolution;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
}

export interface VideoGeneratorData extends BaseNodeData {
  config: VideoGeneratorConfig;
}

// --- COMPOSE NODES ---

export type TextPosition = 'top' | 'center' | 'bottom' | 'custom';
export type FontFamily = 'inter' | 'impact' | 'arabic-display' | 'comic-neue';
export type TextEffect = 'none' | 'shadow' | 'glow' | 'gradient';

export interface TextOverlayConfig {
  text: string;
  position: TextPosition;
  font: FontFamily;
  fontSize: number;
  fontColor: string;
  stroke: boolean;
  effect: TextEffect;
}

export interface TextOverlayData extends BaseNodeData {
  config: TextOverlayConfig;
}

// --- OUTPUT NODES ---

export type PreviewPreset =
  | 'ig-square'
  | 'ig-story'
  | 'tiktok'
  | 'twitter'
  | 'whatsapp-status'
  | 'custom';
export type FitMode = 'cover' | 'contain' | 'fill';

export interface PreviewConfig {
  preset: PreviewPreset;
  width: number;
  height: number;
  backgroundColor: string;
  fit: FitMode;
}

export interface PreviewData extends BaseNodeData {
  config: PreviewConfig;
}

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'mp4' | 'gif';
export type ShareTarget = 'download' | 'whatsapp' | 'clipboard';

export interface ExportConfig {
  format: ExportFormat;
  quality: number;
  shareTarget: ShareTarget;
}

export interface ExportData extends BaseNodeData {
  config: ExportConfig;
}

// Union type of all node data
export type CustomNodeData =
  | TextPromptData
  | ImageUploadData
  | TemplatePresetData
  | PromptEnhancerData
  | StyleConfigData
  | ImageGeneratorData
  | VideoGeneratorData
  | TextOverlayData
  | PreviewData
  | ExportData;

// Typed node definitions
export type TextPromptNode = Node<TextPromptData, 'textPrompt'>;
export type ImageUploadNode = Node<ImageUploadData, 'imageUpload'>;
export type TemplatePresetNode = Node<TemplatePresetData, 'templatePreset'>;
export type PromptEnhancerNode = Node<PromptEnhancerData, 'promptEnhancer'>;
export type StyleConfigNode = Node<StyleConfigData, 'styleConfig'>;
export type ImageGeneratorNode = Node<ImageGeneratorData, 'imageGenerator'>;
export type VideoGeneratorNode = Node<VideoGeneratorData, 'videoGenerator'>;
export type TextOverlayNode = Node<TextOverlayData, 'textOverlay'>;
export type PreviewNode = Node<PreviewData, 'preview'>;
export type ExportNode = Node<ExportData, 'export'>;

// Union of all custom nodes
export type CustomNode =
  | TextPromptNode
  | ImageUploadNode
  | TemplatePresetNode
  | PromptEnhancerNode
  | StyleConfigNode
  | ImageGeneratorNode
  | VideoGeneratorNode
  | TextOverlayNode
  | PreviewNode
  | ExportNode;

// Port schemas for each node type
export const NODE_PORT_SCHEMAS: Record<CustomNodeType, NodePortSchema> = {
  textPrompt: {
    inputs: [],
    outputs: [{ id: 'text', type: 'text', label: 'Text', required: true }],
  },
  imageUpload: {
    inputs: [],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  templatePreset: {
    inputs: [],
    outputs: [
      { id: 'text', type: 'text', label: 'Text', required: true },
      { id: 'style', type: 'style', label: 'Style', required: true },
    ],
  },
  promptEnhancer: {
    inputs: [
      { id: 'text', type: 'text', label: 'Text', required: true },
      { id: 'style', type: 'style', label: 'Style', required: false },
    ],
    outputs: [{ id: 'prompt', type: 'prompt', label: 'Prompt', required: true }],
  },
  styleConfig: {
    inputs: [],
    outputs: [{ id: 'style', type: 'style', label: 'Style', required: true }],
  },
  imageGenerator: {
    inputs: [
      { id: 'prompt', type: 'prompt', label: 'Prompt', required: true },
      { id: 'style', type: 'style', label: 'Style', required: false },
      { id: 'image', type: 'image', label: 'Reference', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  videoGenerator: {
    inputs: [
      { id: 'prompt', type: 'prompt', label: 'Prompt', required: true },
      { id: 'style', type: 'style', label: 'Style', required: false },
      { id: 'image', type: 'image', label: 'Reference', required: false },
    ],
    outputs: [{ id: 'video', type: 'video', label: 'Video', required: true }],
  },
  textOverlay: {
    inputs: [
      { id: 'image', type: 'image', label: 'Image', required: true },
      { id: 'text', type: 'text', label: 'Text', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  preview: {
    inputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
    outputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
  },
  export: {
    inputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
    outputs: [],
  },
};

// Default configs for each node type
export const defaultConfigs: Record<CustomNodeType, Record<string, unknown>> = {
  textPrompt: {
    text: '',
    maxLength: 1000,
    placeholder: 'Describe what you want to create...',
  } satisfies TextPromptConfig,

  imageUpload: {
    previewUrl: null,
    fileName: null,
    fileSizeMB: null,
    maxSizeMB: 10,
  } satisfies ImageUploadConfig,

  templatePreset: {
    template: 'blank',
    locale: 'id',
  } satisfies TemplatePresetConfig,

  promptEnhancer: {
    creativity: 'balanced',
    contentType: 'general',
    tone: 'casual',
    language: 'id',
  } satisfies PromptEnhancerConfig,

  styleConfig: {
    artStyle: 'realistic',
    colorPalette: [],
    mood: 'warm',
    culturalTheme: null,
  } satisfies StyleConfigConfig,

  imageGenerator: {
    mode: 'text2img',
    dimensions: 'square-1024',
    prompt_extend: true,
    seed: null,
  } satisfies ImageGeneratorConfig,

  videoGenerator: {
    mode: 'text2video',
    duration: 5,
    resolution: '720P',
    shot_type: 'single',
    prompt_extend: true,
  } satisfies VideoGeneratorConfig,

  textOverlay: {
    text: '',
    position: 'bottom',
    font: 'inter',
    fontSize: 48,
    fontColor: '#ffffff',
    stroke: true,
    effect: 'shadow',
  } satisfies TextOverlayConfig,

  preview: {
    preset: 'ig-square',
    width: 1080,
    height: 1080,
    backgroundColor: '#000000',
    fit: 'cover',
  } satisfies PreviewConfig,

  export: {
    format: 'png',
    quality: 90,
    shareTarget: 'download',
  } satisfies ExportConfig,
};

// Runnable node types (have a "Run" button)
export const RUNNABLE_NODE_TYPES: CustomNodeType[] = [
  'promptEnhancer',
  'imageGenerator',
  'videoGenerator',
];
