import type { Node } from '@xyflow/react';
import type { NodePortSchema } from './port-types';
import { getDefaultModel } from '../config/modelOptions';

// Node categories
export type NodeCategory =
  | 'input'
  | 'textStyle'
  | 'imageEdit'
  | 'videoEdit'
  | 'generate'
  | 'compose'
  | 'output';

// All custom node type identifiers
export type CustomNodeType =
  | 'textPrompt'
  | 'imageUpload'
  | 'videoUpload'
  | 'templatePreset'
  | 'promptEnhancer'
  | 'styleConfig'
  | 'imageToText'
  | 'translateText'
  | 'backgroundRemover'
  | 'faceCrop'
  | 'objectRemover'
  | 'backgroundReplacer'
  | 'styleTransfer'
  | 'videoRepainting'
  | 'videoExtension'
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
  | 'manualEditor';

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

export interface VideoUploadConfig {
  previewUrl: string | null;
  fileName: string | null;
  fileSizeMB: number | null;
  maxSizeMB: number;
}

export interface VideoUploadData extends BaseNodeData {
  config: VideoUploadConfig;
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
  model?: string;
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
  model?: string;
}

export interface ImageToTextData extends BaseNodeData {
  config: ImageToTextConfig;
}

export type TranslateLang = 'auto' | 'id' | 'en' | 'ar' | 'zh';

export interface TranslateTextConfig {
  sourceLang: TranslateLang;
  targetLang: Exclude<TranslateLang, 'auto'>;
  model?: string;
}

export interface TranslateTextData extends BaseNodeData {
  config: TranslateTextConfig;
}

export type BgOutputType = 'transparent' | 'white' | 'blur';

export interface BackgroundRemoverConfig {
  outputType: BgOutputType;
  model?: string;
}

export interface BackgroundRemoverData extends BaseNodeData {
  config: BackgroundRemoverConfig;
}

export type FaceCropFormat = 'square' | 'portrait';

export interface FaceCropConfig {
  margin: number;
  format: FaceCropFormat;
  model?: string;
}

export interface FaceCropData extends BaseNodeData {
  config: FaceCropConfig;
}

// --- NEW TRANSFORM NODES ---

export interface ObjectRemoverConfig {
  target: string;
  mode: 'auto' | 'describe';
  model?: string;
}
export interface ObjectRemoverData extends BaseNodeData {
  config: ObjectRemoverConfig;
}

export type BgReplacementType = 'blur' | 'solid-color' | 'ai-generated';
export interface BackgroundReplacerConfig {
  replacementType: BgReplacementType;
  color: string;
  backgroundPrompt: string;
  model?: string;
}
export interface BackgroundReplacerData extends BaseNodeData {
  config: BackgroundReplacerConfig;
}

export type StyleStrength = 'subtle' | 'moderate' | 'strong';
export interface StyleTransferConfig {
  stylePrompt: string;
  strength: StyleStrength;
  model?: string;
}
export interface StyleTransferData extends BaseNodeData {
  config: StyleTransferConfig;
}

export type VideoRepaintingCondition = 'posebodyface' | 'posebody' | 'depth' | 'scribble';

export interface VideoRepaintingConfig {
  control_condition: VideoRepaintingCondition;
  strength: number;
  prompt_extend: boolean;
}

export interface VideoRepaintingData extends BaseNodeData {
  config: VideoRepaintingConfig;
}

export type VideoExtensionDirection = 'forward' | 'backward';

export interface VideoExtensionConfig {
  direction: VideoExtensionDirection;
  prompt_extend: boolean;
}

export interface VideoExtensionData extends BaseNodeData {
  config: VideoExtensionConfig;
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
  model?: string;
  imageEditModel?: string;
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
  model?: string;
  imageVideoModel?: string;
}

export interface VideoGeneratorData extends BaseNodeData {
  config: VideoGeneratorConfig;
}

export type InpaintingMode = 'auto' | 'manual';

export interface InpaintingConfig {
  mode: InpaintingMode;
  strength: number;
  model?: string;
}

export interface InpaintingData extends BaseNodeData {
  config: InpaintingConfig;
}

export type UpscaleScale = 2 | 4;

export interface ImageUpscalerConfig {
  scale: UpscaleScale;
  enhanceFaces: boolean;
  model?: string;
}

export interface ImageUpscalerData extends BaseNodeData {
  config: ImageUpscalerConfig;
}

// --- COMPOSE NODES ---

export type TextPosition =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right';
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
  model?: string;
}

export interface TextOverlayData extends BaseNodeData {
  config: TextOverlayConfig;
}

export type FrameStyle = 'islamic' | 'floral' | 'polaroid' | 'neon' | 'torn-paper' | 'none';

export interface FrameBorderConfig {
  style: FrameStyle;
  thickness: number;
  color: string;
  model?: string;
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
  model?: string;
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
  model?: string;
}

export interface ColorFilterData extends BaseNodeData {
  config: ColorFilterConfig;
}

export type CollageLayoutStyle = '2-horizontal' | '2-vertical' | '3-grid' | '4-grid' | 'mosaic';

export interface CollageLayoutConfig {
  layout: CollageLayoutStyle;
  gap: number;
  borderRadius: number;
  model?: string;
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

export type ExportFormat = 'png' | 'jpg' | 'webp' | 'mp4';
export type ShareTarget = 'download' | 'whatsapp' | 'clipboard' | 'copy-url';

export interface ExportConfig {
  format: ExportFormat;
  shareTarget: ShareTarget;
}

export interface ExportData extends BaseNodeData {
  config: ExportConfig;
}

// --- MANUAL EDITOR NODE ---

export type ManualEditorTool = 'draw' | 'text' | 'select';

export interface DrawingPath {
  points: { x: number; y: number }[];
  color: string;
  strokeWidth: number;
}

export interface TextLayer {
  id: string;
  text: string;
  x: number;
  y: number;
  font: string;
  fontSize: number;
  color: string;
  stroke: boolean;
  strokeColor: string;
}

export interface ManualEditorConfig {
  drawings: DrawingPath[];
  textLayers: TextLayer[];
  activeTool: ManualEditorTool;
  brushColor: string;
  brushSize: number;
  textColor: string;
  textFont: string;
  textSize: number;
  textStroke: boolean;
  textStrokeColor: string;
}

export interface ManualEditorData extends BaseNodeData {
  config: ManualEditorConfig;
}

// Union type of all node data
export type CustomNodeData =
  | TextPromptData
  | ImageUploadData
  | VideoUploadData
  | TemplatePresetData
  | PromptEnhancerData
  | StyleConfigData
  | ImageToTextData
  | TranslateTextData
  | BackgroundRemoverData
  | FaceCropData
  | ObjectRemoverData
  | BackgroundReplacerData
  | StyleTransferData
  | VideoRepaintingData
  | VideoExtensionData
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
  | ManualEditorData;

// Typed node definitions
export type TextPromptNode = Node<TextPromptData, 'textPrompt'>;
export type ImageUploadNode = Node<ImageUploadData, 'imageUpload'>;
export type VideoUploadNode = Node<VideoUploadData, 'videoUpload'>;
export type TemplatePresetNode = Node<TemplatePresetData, 'templatePreset'>;
export type PromptEnhancerNode = Node<PromptEnhancerData, 'promptEnhancer'>;
export type StyleConfigNode = Node<StyleConfigData, 'styleConfig'>;
export type ImageToTextNode = Node<ImageToTextData, 'imageToText'>;
export type TranslateTextNode = Node<TranslateTextData, 'translateText'>;
export type BackgroundRemoverNode = Node<BackgroundRemoverData, 'backgroundRemover'>;
export type FaceCropNode = Node<FaceCropData, 'faceCrop'>;
export type ObjectRemoverNode = Node<ObjectRemoverData, 'objectRemover'>;
export type BackgroundReplacerNode = Node<BackgroundReplacerData, 'backgroundReplacer'>;
export type StyleTransferNode = Node<StyleTransferData, 'styleTransfer'>;
export type VideoRepaintingNode = Node<VideoRepaintingData, 'videoRepainting'>;
export type VideoExtensionNode = Node<VideoExtensionData, 'videoExtension'>;
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
export type ManualEditorNode = Node<ManualEditorData, 'manualEditor'>;

// Union of all custom nodes
export type CustomNode =
  | TextPromptNode
  | ImageUploadNode
  | VideoUploadNode
  | TemplatePresetNode
  | PromptEnhancerNode
  | StyleConfigNode
  | ImageToTextNode
  | TranslateTextNode
  | BackgroundRemoverNode
  | FaceCropNode
  | ObjectRemoverNode
  | BackgroundReplacerNode
  | StyleTransferNode
  | VideoRepaintingNode
  | VideoExtensionNode
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
  | ManualEditorNode;

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
  videoUpload: {
    inputs: [],
    outputs: [{ id: 'video', type: 'video', label: 'Video', required: true }],
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
  objectRemover: {
    inputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  backgroundReplacer: {
    inputs: [
      { id: 'image', type: 'image', label: 'Image', required: true },
      { id: 'bgImage', type: 'image', label: 'BG Image', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  styleTransfer: {
    inputs: [
      { id: 'image', type: 'image', label: 'Image', required: true },
      { id: 'styleImage', type: 'image', label: 'Style Image', required: false },
    ],
    outputs: [{ id: 'image', type: 'image', label: 'Image', required: true }],
  },
  videoRepainting: {
    inputs: [
      { id: 'prompt', type: 'text', label: 'Prompt', required: true },
      { id: 'video', type: 'video', label: 'Video', required: true },
      { id: 'image', type: 'image', label: 'Ref Subject', required: false },
    ],
    outputs: [{ id: 'video', type: 'video', label: 'Video', required: true }],
  },
  videoExtension: {
    inputs: [
      { id: 'prompt', type: 'text', label: 'Prompt', required: true },
      { id: 'video', type: 'video', label: 'Video Clip', required: false },
      { id: 'image', type: 'image', label: 'Frame', required: false },
    ],
    outputs: [{ id: 'video', type: 'video', label: 'Video', required: true }],
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
  manualEditor: {
    inputs: [{ id: 'media', type: 'media', label: 'Media', required: true }],
    outputs: [{ id: 'image', type: 'image', label: 'Edited', required: true }],
  },
};

// Default configsfor each node type
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

  videoUpload: {
    previewUrl: null,
    fileName: null,
    fileSizeMB: null,
    maxSizeMB: 50,
  } satisfies VideoUploadConfig,

  templatePreset: {
    template: 'blank',
    locale: 'id',
  } satisfies TemplatePresetConfig,

  promptEnhancer: {
    creativity: 'balanced',
    contentType: 'general',
    tone: 'casual',
    language: 'id',
    model: getDefaultModel('textGeneration'),
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
    model: getDefaultModel('imageGeneration'),
    imageEditModel: getDefaultModel('imageEditing'),
  } satisfies ImageGeneratorConfig,

  videoGenerator: {
    mode: 'text2video',
    frameMode: 'first',
    duration: 5,
    resolution: '720P',
    shot_type: 'single',
    prompt_extend: true,
    model: getDefaultModel('textToVideo'),
    imageVideoModel: getDefaultModel('imageToVideo'),
  } satisfies VideoGeneratorConfig,

  textOverlay: {
    text: '',
    position: 'bottom-center',
    font: 'inter',
    fontSize: 48,
    fontColor: '#ffffff',
    stroke: true,
    effect: 'shadow',
    model: getDefaultModel('imageEditing'),
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
    shareTarget: 'download',
  } satisfies ExportConfig,

  imageToText: {
    detailLevel: 'detailed',
    language: 'id',
    model: getDefaultModel('vision'),
  } satisfies ImageToTextConfig,

  translateText: {
    sourceLang: 'auto',
    targetLang: 'en',
    model: getDefaultModel('textGeneration'),
  } satisfies TranslateTextConfig,

  backgroundRemover: {
    outputType: 'transparent',
    model: getDefaultModel('imageEditing'),
  } satisfies BackgroundRemoverConfig,

  faceCrop: {
    margin: 20,
    format: 'square',
    model: getDefaultModel('imageEditing'),
  } satisfies FaceCropConfig,

  objectRemover: {
    target: '',
    mode: 'auto',
    model: getDefaultModel('imageEditing'),
  } satisfies ObjectRemoverConfig,

  backgroundReplacer: {
    replacementType: 'ai-generated',
    color: '#ffffff',
    backgroundPrompt: '',
    model: getDefaultModel('imageEditing'),
  } satisfies BackgroundReplacerConfig,

  styleTransfer: {
    stylePrompt: '',
    strength: 'moderate',
    model: getDefaultModel('imageEditing'),
  } satisfies StyleTransferConfig,

  videoRepainting: {
    control_condition: 'depth',
    strength: 0.8,
    prompt_extend: false,
  } satisfies VideoRepaintingConfig,

  videoExtension: {
    direction: 'forward',
    prompt_extend: false,
  } satisfies VideoExtensionConfig,

  inpainting: {
    mode: 'auto',
    strength: 75,
    model: getDefaultModel('imageEditing'),
  } satisfies InpaintingConfig,

  imageUpscaler: {
    scale: 2,
    enhanceFaces: false,
    model: getDefaultModel('imageEditing'),
  } satisfies ImageUpscalerConfig,

  frameBorder: {
    style: 'islamic',
    thickness: 20,
    color: '#C9A84C',
    model: getDefaultModel('imageEditing'),
  } satisfies FrameBorderConfig,

  stickerLayer: {
    pack: 'ramadan',
    stickers: [],
    model: getDefaultModel('imageEditing'),
  } satisfies StickerLayerConfig,

  colorFilter: {
    preset: 'warm',
    intensity: 60,
    model: getDefaultModel('imageEditing'),
  } satisfies ColorFilterConfig,

  collageLayout: {
    layout: '2-horizontal',
    gap: 8,
    borderRadius: 12,
    model: getDefaultModel('imageEditing'),
  } satisfies CollageLayoutConfig,

  manualEditor: {
    drawings: [],
    textLayers: [],
    activeTool: 'draw',
    brushColor: '#ff0000',
    brushSize: 4,
    textColor: '#ffffff',
    textFont: 'inter',
    textSize: 32,
    textStroke: true,
    textStrokeColor: '#000000',
  } satisfies ManualEditorConfig,
};

// Runnable node types(have a "Run" button)
export const RUNNABLE_NODE_TYPES: CustomNodeType[] = [
  'promptEnhancer',
  'imageGenerator',
  'videoGenerator',
  'videoRepainting',
  'videoExtension',
  'imageToText',
  'translateText',
  'backgroundRemover',
  'faceCrop',
  'objectRemover',
  'backgroundReplacer',
  'styleTransfer',
  'inpainting',
  'imageUpscaler',
  'textOverlay',
  'frameBorder',
  'stickerLayer',
  'colorFilter',
  'collageLayout',
];
