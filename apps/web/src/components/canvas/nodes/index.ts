// Node components exports and registry
import type { ComponentType } from 'react';
import type { NodeProps } from '@xyflow/react';

// Import all node components
import { TextPromptNode } from './input/TextPromptNode';
import { ImageUploadNode } from './input/ImageUploadNode';
import { VideoUploadNode } from './input/VideoUploadNode';
import { TemplatePresetNode } from './input/TemplatePresetNode';
import { PromptEnhancerNode } from './transform/PromptEnhancerNode';
import { StyleConfigNode } from './transform/StyleConfigNode';
import { ImageToTextNode } from './transform/ImageToTextNode';
import { TranslateTextNode } from './transform/TranslateTextNode';
import { BackgroundRemoverNode } from './transform/BackgroundRemoverNode';
import { FaceCropNode } from './transform/FaceCropNode';
import { ObjectRemoverNode } from './transform/ObjectRemoverNode';
import { BackgroundReplacerNode } from './transform/BackgroundReplacerNode';
import { StyleTransferNode } from './transform/StyleTransferNode';
import { VideoRepaintingNode } from './transform/VideoRepaintingNode';
import { VideoExtensionNode } from './transform/VideoExtensionNode';
import { ImageGeneratorNode } from './generate/ImageGeneratorNode';
import { VideoGeneratorNode } from './generate/VideoGeneratorNode';
import { InpaintingNode } from './generate/InpaintingNode';
import { ImageUpscalerNode } from './generate/ImageUpscalerNode';
import { TextOverlayNode } from './compose/TextOverlayNode';
import { FrameBorderNode } from './compose/FrameBorderNode';
import { StickerLayerNode } from './compose/StickerLayerNode';
import { ColorFilterNode } from './compose/ColorFilterNode';
import { CollageLayoutNode } from './compose/CollageLayoutNode';
import { PreviewNode } from './output/PreviewNode';
import { ExportNode } from './output/ExportNodeNew';

import type { CustomNodeType }from '../types/node-types';

// Re-export components
export { TextPromptNode } from './input/TextPromptNode';
export { ImageUploadNode } from './input/ImageUploadNode';
export { VideoUploadNode } from './input/VideoUploadNode';
export { TemplatePresetNode } from './input/TemplatePresetNode';
export { PromptEnhancerNode } from './transform/PromptEnhancerNode';
export { StyleConfigNode } from './transform/StyleConfigNode';
export { ImageToTextNode } from './transform/ImageToTextNode';
export { TranslateTextNode } from './transform/TranslateTextNode';
export { BackgroundRemoverNode } from './transform/BackgroundRemoverNode';
export { FaceCropNode } from './transform/FaceCropNode';
export { ObjectRemoverNode } from './transform/ObjectRemoverNode';
export { BackgroundReplacerNode } from './transform/BackgroundReplacerNode';
export { StyleTransferNode } from './transform/StyleTransferNode';
export { VideoRepaintingNode } from './transform/VideoRepaintingNode';
export { VideoExtensionNode } from './transform/VideoExtensionNode';
export { ImageGeneratorNode } from './generate/ImageGeneratorNode';
export { VideoGeneratorNode } from './generate/VideoGeneratorNode';
export { InpaintingNode } from './generate/InpaintingNode';
export { ImageUpscalerNode } from './generate/ImageUpscalerNode';
export { TextOverlayNode } from './compose/TextOverlayNode';
export { FrameBorderNode } from './compose/FrameBorderNode';
export { StickerLayerNode } from './compose/StickerLayerNode';
export { ColorFilterNode } from './compose/ColorFilterNode';
export { CollageLayoutNode } from './compose/CollageLayoutNode';
export { PreviewNode } from './output/PreviewNode';
export { ExportNode } from './output/ExportNodeNew';
export { CompactNode } from './CompactNode';

// Node types registry for ReactFlow

export const nodeTypes: Record<CustomNodeType, ComponentType<NodeProps<any>>> = {
  textPrompt: TextPromptNode,
  imageUpload: ImageUploadNode,
  videoUpload: VideoUploadNode,
  templatePreset: TemplatePresetNode,
  promptEnhancer: PromptEnhancerNode,
  styleConfig: StyleConfigNode,
  imageToText: ImageToTextNode,
  translateText: TranslateTextNode,
  backgroundRemover: BackgroundRemoverNode,
  faceCrop: FaceCropNode,
  objectRemover: ObjectRemoverNode,
  backgroundReplacer: BackgroundReplacerNode,
  styleTransfer: StyleTransferNode,
  videoRepainting: VideoRepaintingNode,
  videoExtension: VideoExtensionNode,
  imageGenerator: ImageGeneratorNode,
  videoGenerator: VideoGeneratorNode,
  inpainting: InpaintingNode,
  imageUpscaler: ImageUpscalerNode,
  textOverlay: TextOverlayNode,
  frameBorder: FrameBorderNode,
  stickerLayer: StickerLayerNode,
  colorFilter: ColorFilterNode,
  collageLayout: CollageLayoutNode,
  preview: PreviewNode,
  export: ExportNode,
};

// Type guard for custom node types
export function isCustomNodeType(type: string): type is CustomNodeType {
  return type in nodeTypes;
}
