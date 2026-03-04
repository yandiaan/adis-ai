import { useReactFlow, type Node } from '@xyflow/react';
import { NODE_TYPE_CONFIGS, NODE_CATEGORIES } from '../config/nodeCategories';
import type { CustomNodeType, CustomNodeData } from '../types/node-types';
import { Trash2, X } from 'lucide-react';
import { renderNodeTypeIcon } from '../icons/nodeTypeIcon';

// Panel imports
import { TextPromptPanel } from './panels/TextPromptPanel';
import { ImageUploadPanel } from './panels/ImageUploadPanel';
import { TemplatePresetPanel } from './panels/TemplatePresetPanel';
import { PromptEnhancerPanel } from './panels/PromptEnhancerPanel';
import { StyleConfigPanel } from './panels/StyleConfigPanel';
import { ImageToTextPanel } from './panels/ImageToTextPanel';
import { TranslateTextPanel } from './panels/TranslateTextPanel';
import { BackgroundRemoverPanel } from './panels/BackgroundRemoverPanel';
import { FaceCropPanel } from './panels/FaceCropPanel';
import { ObjectRemoverPanel } from './panels/ObjectRemoverPanel';
import { BackgroundReplacerPanel } from './panels/BackgroundReplacerPanel';
import { StyleTransferPanel } from './panels/StyleTransferPanel';
import { ImageGeneratorPanel } from './panels/ImageGeneratorPanel';
import { VideoGeneratorPanel } from './panels/VideoGeneratorPanel';
import { VideoUploadPanel } from './panels/VideoUploadPanel';
import { VideoRepaintingPanel } from './panels/VideoRepaintingPanel';
import { VideoExtensionPanel } from './panels/VideoExtensionPanel';
import { InpaintingPanel } from './panels/InpaintingPanel';
import { ImageUpscalerPanel } from './panels/ImageUpscalerPanel';
import { TextOverlayPanel } from './panels/TextOverlayPanel';
import { FrameBorderPanel } from './panels/FrameBorderPanel';
import { StickerLayerPanel } from './panels/StickerLayerPanel';
import { ColorFilterPanel } from './panels/ColorFilterPanel';
import { CollageLayoutPanel } from './panels/CollageLayoutPanel';
import { PreviewPanel } from './panels/PreviewPanel';
import { ExportPanelNew } from './panels/ExportPanelNew';

type Props = {
  selectedNode: Node<CustomNodeData> | null;
  onClose: () => void;
  closing?: boolean;
};

export function NodeDetailDrawer({ selectedNode, onClose, closing = false }: Props) {
  const { deleteElements } = useReactFlow();

  if (!selectedNode) return null;

  const nodeType = selectedNode.type as CustomNodeType;
  const nodeConfig = NODE_TYPE_CONFIGS.find((c) => c.type === nodeType);
  const category = nodeConfig ? NODE_CATEGORIES[nodeConfig.category] : null;

  const handleDelete = () => {
    deleteElements({ nodes: [{ id: selectedNode.id }] });
    onClose();
  };

  const renderPanel = () => {
    switch (nodeType) {
      case 'textPrompt':
        return <TextPromptPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'imageUpload':
        return <ImageUploadPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'templatePreset':
        return <TemplatePresetPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'promptEnhancer':
        return <PromptEnhancerPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'styleConfig':
        return <StyleConfigPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'imageGenerator':
        return <ImageGeneratorPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'videoGenerator':
        return <VideoGeneratorPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'videoUpload':
        return <VideoUploadPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'videoRepainting':
        return <VideoRepaintingPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'videoExtension':
        return <VideoExtensionPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'textOverlay':
        return <TextOverlayPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'preview':
        return <PreviewPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'export':
        return <ExportPanelNew nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'imageToText':
        return <ImageToTextPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'translateText':
        return <TranslateTextPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'backgroundRemover':
        return <BackgroundRemoverPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'faceCrop':
        return <FaceCropPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'objectRemover':
        return <ObjectRemoverPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'backgroundReplacer':
        return <BackgroundReplacerPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'styleTransfer':
        return <StyleTransferPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'inpainting':
        return <InpaintingPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'imageUpscaler':
        return <ImageUpscalerPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'frameBorder':
        return <FrameBorderPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'stickerLayer':
        return <StickerLayerPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'colorFilter':
        return <ColorFilterPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      case 'collageLayout':
        return <CollageLayoutPanel nodeId={selectedNode.id} data={selectedNode.data as any} />;
      default:
        return <div className="text-white/50">Unknown node type</div>;
    }
  };

  return (
    <div
      className={`fixed top-0 right-0 bottom-0 z-[1000] flex flex-col bg-background border-l border-white/10 shadow-2xl ${
        closing ? 'pointer-events-none animate-panel-out-right' : 'animate-panel-in-right'
      }`}
      style={{
        width: 'clamp(320px, 34vw, 420px)',
        maxWidth: '92vw',
      }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: `1px solid ${category?.borderColor || 'rgba(255,255,255,0.12)'}` }}
      >
        <div className="flex items-center gap-3">
          <span className="grid place-items-center w-10 h-10 rounded-xl bg-white/5 border border-white/10">
            {renderNodeTypeIcon(nodeType, { size: 22 })}
          </span>
          <div>
            <div className="flex items-center gap-2">
              <div className="text-[15px] font-semibold" style={{ color: category?.color }}>
                {nodeConfig?.label || 'Node'}
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide border"
                style={{
                  borderColor: category?.borderColor || 'rgba(255,255,255,0.14)',
                  color: 'rgba(255,255,255,0.65)',
                  background: 'rgba(255,255,255,0.04)',
                }}
              >
                {nodeType}
              </span>
            </div>
            <div className="text-[11px] text-white/50 mt-1 leading-snug">
              {nodeConfig?.description}
            </div>
          </div>
        </div>
        <button
          onClick={onClose}
          className="motion-lift motion-press focus-ring-orange grid place-items-center w-10 h-10 rounded-xl border border-white/10 bg-white/5 text-white/70 hover:text-white cursor-pointer transition-colors"
          aria-label="Close inspector"
        >
          <X size={18} />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-3 py-3 flex flex-col gap-2.5">{renderPanel()}</div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-white/10 flex gap-3">
        <button
          onClick={handleDelete}
          className="motion-lift motion-press focus-ring-orange flex-1 py-3 px-4 bg-red-400/10 border border-red-400/30 rounded-xl text-red-200 text-[13px] font-medium cursor-pointer hover:bg-red-400/15 flex items-center justify-center gap-2"
        >
          <Trash2 size={16} className="text-red-200" />
          Delete Node
        </button>
      </div>
    </div>
  );
}
