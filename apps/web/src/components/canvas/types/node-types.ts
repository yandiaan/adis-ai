import type { Node } from '@xyflow/react';
import type { NodePortSchema } from './port-types';

// Node categories
export type NodeCategory = 'input' | 'transform' | 'generate' | 'compose' | 'output';

// All custom node type identifiers
export type CustomNodeType =
  | 'textPrompt'
  | 'imageUpload'
  | 'templatePreset'
  | 'colorPalette'
  | 'promptEnhancer'
  | 'styleConfig'
  | 'imageToText'
  | 'translateText'
  | 'backgroundRemover'
  | 'faceCrop'
  | 'imageGenerator'
  | 'videoGenerator'
  | 'inpainting'
  | 'imageUpscaler'
  | 'textOverlay'
  | 'frameBorder'
  | 'stickerLayer'
  | 'colorFilter'
  | 'collageLayout'
  | 'preview'
  | 'export'
  | 'watermark';

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

export type ColorPaletteMode = 'preset' | 'custom' | 'extract';
export type ColorPalettePreset = 'ramadan' | 'lebaran' | 'pastel' | 'neon' | 'monochrome' | 'earth';

export interface ColorPaletteConfig {
  mode: ColorPaletteMode;
  palette: string[];
  presetName: ColorPalettePreset;
}

export interface ColorPaletteData extends BaseNodeData {
  config: ColorPaletteConfig;
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

export type DetailLevel = 'brief' | 'detailed' | 'artistic';

export interface ImageToTextConfig {
  detailLevel: DetailLevel;
  language: 'id' | 'en';
}

export interface ImageToTextData extends BaseNodeData {
  config: ImageToTextConfig;
}

export type TranslateLang = 'auto' | 'id' | 'en' | 'ar' | 'zh';

export interface TranslateTextConfig {
  sourceLang: TranslateLang;
  targetLang: Exclude<TranslateLang, 'auto'>;
}

export interface TranslateTextData extends BaseNodeData {
  config: TranslateTextConfig;
}

export type BgOutputType = 'transparent' | 'white' | 'blur';

export interface BackgroundRemoverConfig {
  outputType: BgOutputType;
}

export interface BackgroundRemoverData extends BaseNodeData {
  config: BackgroundRemoverConfig;
}

export type FaceCropFormat = 'square' | 'portrait';

export interface FaceCropConfig {
  margin: number;
  format: FaceCropFormat;
}

export interface FaceCropData extends BaseNodeData {
  config: FaceCropConfig;
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
export type VideoFrameMode = 'first' | 'last' | 'both';
export type VideoResolution = '480P' | '720P' | '1080P';

export interface VideoGeneratorConfig {
  mode: VideoGenMode;
  frameMode?: VideoFrameMode;
  duration: number;
  resolution: VideoResolution;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
}

export interface VideoGeneratorData extends BaseNodeData {
  config: VideoGeneratorConfig;
}

export type InpaintingMode = 'auto' | 'manual';

export interface InpaintingConfig {
  mode: InpaintingMode;
  strength: number;
}

export interface InpaintingData extends BaseNodeData {
  config: InpaintingConfig;
}

export type UpscaleScale = 2 | 4;

export interface ImageUpscalerConfig {
  scale: UpscaleScale;
  enhanceFaces: boolean;
}

export interface ImageUpscalerData extends BaseNodeData {
  config: ImageUpscalerConfig;
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

export type FrameStyle = 'islamic' | 'floral' | 'polaroid' | 'neon' | 'torn-paper' | 'none';

export interface FrameBorderConfig {
  style: FrameStyle;
  thickness: number;
  color: string;
}

export interface FrameBorderData extends BaseNodeData {
  config: FrameBorderConfig;
}

export type StickerPack = 'ramadan' | 'meme' | 'sparkles' | 'custom';

export interface StickerItem {
  emoji: string;
  x: number;
  y: number;
  size: number;
}

export interface StickerLayerConfig {
  pack: StickerPack;
  stickers: StickerItem[];
}

export interface StickerLayerData extends BaseNodeData {
  config: StickerLayerConfig;
}

export type ColorFilterPreset =
  | 'none'
  | 'warm'
  | 'vintage'
  | 'eid-gold'
  | 'sahur'
  | 'cool'
  | 'vibrant';

export interface ColorFilterConfig {
  preset: ColorFilterPreset;
  intensity: number;
}

export interface ColorFilterData extends BaseNodeData {
  config: ColorFilterConfig;
}

export type CollageLayoutStyle = '2-horizontal' | '2-vertical' | '3-grid' | '4-grid' | 'mosaic';

export interface CollageLayoutConfig {
  layout: CollageLayoutStyle;
  gap: number;
  borderRadius: number;
}

export interface CollageLayoutData extends BaseNodeData {
  config: CollageLayoutConfig;
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

export type WatermarkPosition =
  | 'bottom-right'
  | 'bottom-left'
  | 'top-right'
  | 'top-left'
  | 'center';
export type WatermarkStyle = 'text' | 'brand-logo';

export interface WatermarkConfig {
  text: string;
  position: WatermarkPosition;
  opacity: number;
  style: WatermarkStyle;
}

export interface WatermarkData extends BaseNodeData {
  config: WatermarkConfig;
}

// Union type of all node data
export type CustomNodeData =
  | TextPromptData
  | ImageUploadData
  | TemplatePresetData
  | ColorPaletteData
  | PromptEnhancerData
  | StyleConfigData
  | ImageToTextData
  | TranslateTextData
  | BackgroundRemoverData
  | FaceCropData
  | ImageGeneratorData
  | VideoGeneratorData
  | InpaintingData
  | ImageUpscalerData
  | TextOverlayData
  | FrameBorderData
  | StickerLayerData
  | ColorFilterData
  | CollageLayoutData
  | PreviewData
  | ExportData
  | WatermarkData;

// Typed node definitions
export type TextPromptNode = Node<TextPromptData, 'textPrompt'>;
export type ImageUploadNode = Node<ImageUploadData, 'imageUpload'>;
export type TemplatePresetNode = Node<TemplatePresetData, 'templatePreset'>;
export type ColorPaletteNode = Node<ColorPaletteData, 'colorPalette'>;
export type PromptEnhancerNode = Node<PromptEnhancerData, 'promptEnhancer'>;
export type StyleConfigNode = Node<StyleConfigData, 'styleConfig'>;
export type ImageToTextNode = Node<ImageToTextData, 'imageToText'>;
export type TranslateTextNode = Node<TranslateTextData, 'translateText'>;
export type BackgroundRemoverNode = Node<BackgroundRemoverData, 'backgroundRemover'>;
export type FaceCropNode = Node<FaceCropData, 'faceCrop'>;
export type ImageGeneratorNode = Node<ImageGeneratorData, 'imageGenerator'>;
export type VideoGeneratorNode = Node<VideoGeneratorData, 'videoGenerator'>;
export type InpaintingNode = Node<InpaintingData, 'inpainting'>;
export type ImageUpscalerNode = Node<ImageUpscalerData, 'imageUpscaler'>;
export type TextOverlayNode = Node<TextOverlayData, 'textOverlay'>;
export type FrameBorderNode = Node<FrameBorderData, 'frameBorder'>;
export type StickerLayerNode = Node<StickerLayerData, 'stickerLayer'>;
export type ColorFilterNode = Node<ColorFilterData, 'colorFilter'>;
export type CollageLayoutNode = Node<CollageLayoutData, 'collageLayout'>;
export type PreviewNode = Node<PreviewData, 'preview'>;
export type ExportNode = Node<ExportData, 'export'>;
export type WatermarkNode = Node<WatermarkData, 'watermark'>;

// Union of all custom nodes
export type CustomNode =
  | TextPromptNode
  | ImageUploadNode
  | TemplatePresetNode
  | ColorPaletteNode
  | PromptEnhancerNode
  | StyleConfigNode
  | ImageToTextNode
  | TranslateTextNode
  | BackgroundRemoverNode
  | FaceCropNode
  | ImageGeneratorNode
  | VideoGeneratorNode
  | InpaintingNode
  | ImageUpscalerNode
  | TextOverlayNode
  | FrameBorderNode
  | StickerLayerNode
  | ColorFilterNode
  | CollageLayoutNode
  | PreviewNode
  | ExportNode
  | WatermarkNode;

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
    outputs: [{ id: 'prompt', type: 'text', label: 'Enhanced', required: true }],
  },
  styleConfig: {
    inputs: [],
    outputs: [{ id: 'style', type: 'style', label: 'Style', required: true }],
  },
  imageGenerator: {
    inputs: [
      { id: 'prompt', type: 'text', label: 'Prompt', required: true },
      { id: 'style', type: 'style', label: 'Style', required: false },
      { id: 'image', type: 'image', label: 'Reference', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  videoGenerator: {
    inputs: [
      { id: 'prompt', type: 'text', label: 'Prompt', required: true },
      { id: 'style', type: 'style', label: 'Style', required: false },
      { id: 'image', type: 'image', label: 'First Frame', required: false },
      { id: 'lastFrame', type: 'image', label: 'Last Frame', required: false },
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
  colorPalette: {
    inputs: [{ id: 'image', type: 'image', label: 'Source Image', required: false }],
    outputs: [{ id: 'style', type: 'style', label: 'Palette/Style', required: true }],
  },
  imageToText: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'text', type: 'text', label: 'Description', required: true }],
  },
  translateText: {
    inputs: [{ id: 'text', type: 'text', label: 'Text', required: true }],
    outputs: [{ id: 'text', type: 'text', label: 'Translated', required: true }],
  },
  backgroundRemover: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  faceCrop: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Face', required: true }],
  },
  inpainting: {
    inputs: [
      { id: 'image', type: 'image', label: 'Image', required: true },
      { id: 'prompt', type: 'text', label: 'Prompt', required: true },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  imageUpscaler: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'HD Image', required: true }],
  },
  frameBorder: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  stickerLayer: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  colorFilter: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  collageLayout: {
    inputs: [
      { id: 'image1', type: 'image', label: 'Image A', required: true },
      { id: 'image2', type: 'image', label: 'Image B', required: true },
      { id: 'image3', type: 'image', label: 'Image C', required: false },
      { id: 'image4', type: 'image', label: 'Image D', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Collage', required: true }],
  },
  watermark: {
    inputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
    outputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
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
    frameMode: 'first',
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

  colorPalette: {
    mode: 'preset',
    palette: ['#C9A84C', '#8B6914', '#F5DEB3', '#2C1810', '#D4AF37'],
    presetName: 'ramadan',
  } satisfies ColorPaletteConfig,

  imageToText: {
    detailLevel: 'detailed',
    language: 'id',
  } satisfies ImageToTextConfig,

  translateText: {
    sourceLang: 'auto',
    targetLang: 'en',
  } satisfies TranslateTextConfig,

  backgroundRemover: {
    outputType: 'transparent',
  } satisfies BackgroundRemoverConfig,

  faceCrop: {
    margin: 20,
    format: 'square',
  } satisfies FaceCropConfig,

  inpainting: {
    mode: 'auto',
    strength: 75,
  } satisfies InpaintingConfig,

  imageUpscaler: {
    scale: 2,
    enhanceFaces: false,
  } satisfies ImageUpscalerConfig,

  frameBorder: {
    style: 'islamic',
    thickness: 20,
    color: '#C9A84C',
  } satisfies FrameBorderConfig,

  stickerLayer: {
    pack: 'ramadan',
    stickers: [],
  } satisfies StickerLayerConfig,

  colorFilter: {
    preset: 'warm',
    intensity: 60,
  } satisfies ColorFilterConfig,

  collageLayout: {
    layout: '2-horizontal',
    gap: 8,
    borderRadius: 12,
  } satisfies CollageLayoutConfig,

  watermark: {
    text: '© ADIS AI',
    position: 'bottom-right',
    opacity: 60,
    style: 'text',
  } satisfies WatermarkConfig,
};

// Runnable node types (have a "Run" button)
export const RUNNABLE_NODE_TYPES: CustomNodeType[] = [
  'promptEnhancer',
  'imageGenerator',
  'videoGenerator',
  'imageToText',
  'translateText',
  'backgroundRemover',
  'faceCrop',
  'inpainting',
  'imageUpscaler',
  'textOverlay',
  'frameBorder',
  'stickerLayer',
  'colorFilter',
  'collageLayout',
];
