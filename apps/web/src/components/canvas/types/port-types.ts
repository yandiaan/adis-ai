// Port data types for the content pipeline
export type PortDataType = 'text' | 'prompt' | 'image' | 'video' | 'style' | 'media';

// Port definition on each node
export interface PortDefinition {
  id: string;
  type: PortDataType;
  label: string;
  required: boolean;
}

// Node port schema — declares what ports a node type has
export interface NodePortSchema {
  inputs: PortDefinition[];
  outputs: PortDefinition[];
}

// --- Typed data containers ---

export interface TextData {
  text: string;
}

export interface PromptData {
  prompt: string;
  negativePrompt?: string;
}

export interface ImageData {
  url: string;
  width: number;
  height: number;
  blob?: Blob;
}

export interface VideoData {
  url: string;
  duration: number;
  width: number;
  height: number;
}

export interface StyleData {
  artStyle: string;
  colorPalette: string[];
  mood: string;
  culturalTheme: string | null;
}

// Union of all data payloads
export type PortPayload = TextData | PromptData | ImageData | VideoData | StyleData;

// Cache metadata for PromptEnhancer to avoid re-running with same input
export interface PromptEnhancerCacheMeta {
  inputText: string;
  configHash: string;
}

// Node output — carries typed data through edges
export interface NodeOutput {
  type: PortDataType;
  data: PortPayload;
  timestamp: number;
  // Internal cache metadata (not part of the port payload)
  _cacheMeta?: PromptEnhancerCacheMeta;
}
