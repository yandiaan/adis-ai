import { useRef, useState, useEffect, useCallback } from 'react';
import { useReactFlow, useEdges } from '@xyflow/react';
import { Pencil, Type, MousePointer, Trash2, X, Plus } from 'lucide-react';
import type { ManualEditorData, ManualEditorTool, ManualEditorConfig } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData } from '../../types/port-types';
import { useCanvasEditor, getFontFamily } from '../../hooks/useCanvasEditor';
import { ColorInput } from '../../ui/ColorInput';

type Props = {
  nodeId: string;
  data: ManualEditorData;
};

const TOOLS: { id: ManualEditorTool; label: string; icon: typeof Pencil; hint: string }[] = [
  { id: 'draw', label: 'Draw', icon: Pencil, hint: 'Click and drag to draw' },
  { id: 'text', label: 'Text', icon: Type, hint: 'Type and click Add' },
  { id: 'select', label: 'Select', icon: MousePointer, hint: 'Click to select, drag to move, double-click to edit' },
];

const FONTS = [
  { value: 'inter', label: 'Inter' },
  { value: 'impact', label: 'Impact' },
  { value: 'comic-neue', label: 'Comic Neue' },
  { value: 'arabic-display', label: 'Arabic' },
];

export function ManualEditorPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const edges = useEdges();
  const config = data.config;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inlineInputRef = useRef<HTMLTextAreaElement>(null);
  const [newText, setNewText] = useState('');

  // Inline edit state: stores the current text being edited in the overlay
  const [inlineEditValue, setInlineEditValue] = useState('');

  // ── Ref to always read the latest config without adding it as a dependency ──
  const configRef = useRef<ManualEditorConfig>(config);
  configRef.current = config;

  // Stable ref for updateNodeData so effects never re-fire just because the function identity changed
  const updateNodeDataRef = useRef(updateNodeData);
  updateNodeDataRef.current = updateNodeData;

  // Get upstream image
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;
  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;

  // FIX: Use both refs so this callback is stable and never causes re-renders
  const updateConfig = useCallback(
    (updates: Partial<ManualEditorConfig>) => {
      updateNodeDataRef.current(nodeId, { config: { ...configRef.current, ...updates } });
    },
    [nodeId]
  );

  // ── Composite export: draw background + overlay, store as separate data field ──
  // Cache the loaded background image to avoid re-fetching from remote URL on every edit.
  const bgImageCacheRef = useRef<{ url: string; img: HTMLImageElement } | null>(null);

  // Load and cache the background image only when the source URL changes
  useEffect(() => {
    if (!imageUrl) {
      bgImageCacheRef.current = null;
      return;
    }
    // Already cached for this URL
    if (bgImageCacheRef.current?.url === imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      bgImageCacheRef.current = { url: imageUrl, img };
    };
    img.onerror = () => {
      // If image fails to load, still proceed with composite (draw annotations without background)
      console.warn(`Failed to load background image: ${imageUrl}`);
      bgImageCacheRef.current = null;
    };
    img.src = imageUrl;
  }, [imageUrl]);

  // Re-compose when drawings, text layers, or source image change
  // Note: Don't include composeExport in deps to avoid stale closure cycle
  useEffect(() => {
    const timerId = setTimeout(() => {
      try {
        if (!canvasRef.current) return;

        const cached = bgImageCacheRef.current;
        const canvas = document.createElement('canvas');
        
        if (cached) {
          canvas.width = cached.img.naturalWidth || 1024;
          canvas.height = cached.img.naturalHeight || 1024;
        } else {
          canvas.width = canvasRef.current?.width || 1024;
          canvas.height = canvasRef.current?.height || 1024;
        }
        
        const ctx = canvas.getContext('2d')!;

        if (cached) {
          ctx.drawImage(cached.img, 0, 0, canvas.width, canvas.height);
        }

        if (canvasRef.current) {
          ctx.drawImage(canvasRef.current, 0, 0, canvas.width, canvas.height);
        }

        const dataUrl = canvas.toDataURL('image/png');
        updateNodeDataRef.current(nodeId, { exportDataUrl: dataUrl });
      } catch {
        // ignore errors
      }
    }, 500);
    
    return () => clearTimeout(timerId);
  // updateNodeData intentionally omitted — we use the ref to avoid re-firing on every render
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageUrl, config.drawings, config.textLayers, nodeId]);

  const {
    startDrawing,
    draw,
    stopDrawing,
    handleDoubleClick,
    clearDrawings,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    selectedTextId,
    setSelectedTextId,
    editingTextId,
    setEditingTextId,
  } = useCanvasEditor({
    canvasRef,
    config,
    onConfigChange: updateConfig,
  });

  // When entering edit mode, populate the textarea with current text
  useEffect(() => {
    if (editingTextId) {
      const layer = config.textLayers.find((l) => l.id === editingTextId);
      if (layer) {
        setInlineEditValue(layer.text);
        setTimeout(() => inlineInputRef.current?.focus(), 30);
      }
    }
  }, [editingTextId]);

  // Commit inline edit to config
  const commitInlineEdit = () => {
    if (!editingTextId) return;
    if (inlineEditValue.trim()) {
      updateTextLayer(editingTextId, { text: inlineEditValue.trim() });
    }
    setEditingTextId(null);
  };

  const handleAddText = () => {
    if (newText.trim()) {
      addTextLayer(newText);
      setNewText('');
    }
  };

  // Calculate screen position of a text layer for the inline input overlay
  const getLayerScreenPosition = (layerId: string): { left: number; top: number; fontSize: number } | null => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return null;
    const layer = config.textLayers.find((l) => l.id === layerId);
    if (!layer) return null;

    const canvasRect = canvas.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const scaleX = canvasRect.width / canvas.width;
    const scaleY = canvasRect.height / canvas.height;

    return {
      left: (layer.x * scaleX) + (canvasRect.left - containerRect.left),
      top: (layer.y * scaleY) + (canvasRect.top - containerRect.top),
      fontSize: layer.fontSize * scaleX,
    };
  };

  const editingLayer = editingTextId ? config.textLayers.find((l) => l.id === editingTextId) : null;
  const editingPos = editingTextId ? getLayerScreenPosition(editingTextId) : null;

  return (
    <>
      {/* Canvas Editor */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Editor Canvas
          {config.activeTool === 'select' && (
            <span className="ml-2 normal-case tracking-normal font-normal text-white/25">
              · drag text to reposition · double-click to edit
            </span>
          )}
        </label>
        <div ref={containerRef} className="relative w-full rounded-xl overflow-hidden border border-white/10 bg-[#1a1a24]">
          {/* Background image layer */}
          {imageUrl && (
            <img
              src={imageUrl}
              alt="Source"
              className="absolute inset-0 w-full h-full object-contain pointer-events-none select-none"
              draggable={false}
            />
          )}
          {/* Drawing canvas layer — transparent, on top */}
          <canvas
            ref={canvasRef}
            width={400}
            height={300}
            className="relative w-full h-auto"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            onDoubleClick={handleDoubleClick}
            style={{
              cursor:
                config.activeTool === 'draw'
                  ? 'crosshair'
                  : config.activeTool === 'select'
                    ? 'default'
                    : 'default',
              display: 'block',
            }}
          />

          {/* Inline text edit overlay */}
          {editingTextId && editingPos && editingLayer && (
            <textarea
              ref={inlineInputRef}
              value={inlineEditValue}
              onChange={(e) => setInlineEditValue(e.target.value)}
              onBlur={commitInlineEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  commitInlineEdit();
                }
                if (e.key === 'Escape') {
                  setEditingTextId(null);
                }
              }}
              className="absolute z-10 resize-none outline-none border border-[#60a5fa] rounded-sm bg-black/60 text-white overflow-hidden"
              style={{
                left: editingPos.left,
                top: editingPos.top,
                fontSize: editingPos.fontSize,
                fontFamily: getFontFamily(editingLayer.font),
                color: editingLayer.color,
                lineHeight: 1.2,
                padding: '2px 4px',
                minWidth: 80,
                rows: 1,
              } as React.CSSProperties}
              rows={1}
              autoFocus
            />
          )}

          {!imageUrl && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="text-white/30 text-sm">Connect an image to edit</span>
            </div>
          )}
        </div>
      </div>

      {/* Tool Selection */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Tools
        </label>
        <div className="flex gap-1.5">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            const isActive = config.activeTool === tool.id;
            return (
              <button
                key={tool.id}
                onClick={() => updateConfig({ activeTool: tool.id })}
                className={`motion-lift motion-press focus-ring-orange flex-1 flex items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl border cursor-pointer text-[11px] transition-colors ${
                  isActive
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] text-white'
                    : 'border-white/10 bg-white/5 hover:bg-white/7 text-white/60'
                }`}
              >
                <Icon size={14} />
                {tool.label}
              </button>
            );
          })}
        </div>
        {/* Tool hint */}
        <p className="text-[10px] text-white/25">
          {TOOLS.find((t) => t.id === config.activeTool)?.hint}
        </p>
      </div>

      {/* Draw Tool Controls */}
      {config.activeTool === 'draw' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Brush Settings
          </label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="block text-white/40 text-[10px] mb-1.5">Color</label>
              <div className="flex items-center gap-2">
                <ColorInput
                  value={config.brushColor}
                  onChange={(v) => updateConfig({ brushColor: v })}
                  className="w-10 h-8 border-none cursor-pointer rounded-md"
                />
                <span className="text-[11px] text-white/50 font-mono">{config.brushColor}</span>
              </div>
            </div>
            <div className="flex-1">
              <label className="block text-white/40 text-[10px] mb-1.5">
                Size: {config.brushSize}px
              </label>
              <input
                type="range"
                min={1}
                max={30}
                value={config.brushSize}
                onChange={(e) => updateConfig({ brushSize: Number(e.target.value) })}
                className="w-full accent-[var(--editor-accent)] cursor-pointer"
              />
            </div>
          </div>
          <button
            onClick={clearDrawings}
            disabled={config.drawings.length === 0}
            className="motion-lift motion-press focus-ring-orange mt-2 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 text-[11px] cursor-pointer hover:bg-red-400/15 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Trash2 size={12} />
            Clear All Drawings ({config.drawings.length})
          </button>
        </div>
      )}

      {/* Text Tool Controls */}
      {config.activeTool === 'text' && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Add Text
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddText()}
              placeholder="Enter text..."
              className="flex-1 p-2.5 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
            />
            <button
              onClick={handleAddText}
              disabled={!newText.trim()}
              className="motion-lift motion-press focus-ring-orange px-3 rounded-xl border border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] text-white cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Plus size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            <div>
              <label className="block text-white/40 text-[10px] mb-1.5">Font</label>
              <select
                value={config.textFont}
                onChange={(e) => updateConfig({ textFont: e.target.value })}
                className="w-full p-2 bg-black/30 border border-white/10 rounded-xl text-white text-[11px] outline-none cursor-pointer focus:border-[var(--editor-accent-65)]"
              >
                {FONTS.map((f) => (
                  <option key={f.value} value={f.value}>
                    {f.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-white/40 text-[10px] mb-1.5">
                Size: {config.textSize}px
              </label>
              <input
                type="range"
                min={12}
                max={72}
                value={config.textSize}
                onChange={(e) => updateConfig({ textSize: Number(e.target.value) })}
                className="w-full accent-[var(--editor-accent)] cursor-pointer"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div>
              <label className="block text-white/40 text-[10px] mb-1.5">Text Color</label>
              <ColorInput
                value={config.textColor}
                onChange={(v) => updateConfig({ textColor: v })}
                className="w-10 h-8 border-none cursor-pointer rounded-md"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white/40 text-[10px] mb-1.5">Stroke</label>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => updateConfig({ textStroke: !config.textStroke })}
                  className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-xl border cursor-pointer text-[11px] transition-colors ${
                    config.textStroke
                      ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] text-white'
                      : 'border-white/10 bg-white/5 text-white/60'
                  }`}
                >
                  {config.textStroke ? 'ON' : 'OFF'}
                </button>
                {config.textStroke && (
                  <ColorInput
                    value={config.textStrokeColor}
                    onChange={(v) => updateConfig({ textStrokeColor: v })}
                    className="w-8 h-6 border-none cursor-pointer rounded-md"
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Text Layers List */}
      {config.textLayers.length > 0 && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Text Layers ({config.textLayers.length})
          </label>
          <div className="flex flex-col gap-1.5 max-h-[150px] overflow-y-auto">
            {config.textLayers.map((layer) => (
              <div
                key={layer.id}
                onClick={() => {
                  setSelectedTextId(layer.id);
                  updateConfig({ activeTool: 'select' });
                }}
                className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-colors ${
                  selectedTextId === layer.id
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/7'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-sm border border-white/20 flex-shrink-0"
                  style={{ backgroundColor: layer.color }}
                />
                <span className="flex-1 text-[11px] text-white/80 truncate">{layer.text}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeTextLayer(layer.id);
                  }}
                  className="p-1 rounded-md hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors cursor-pointer"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected text style edit (no position inputs — use canvas drag instead) */}
      {selectedTextId && config.activeTool === 'select' && !editingTextId && (() => {
        const layer = config.textLayers.find((l) => l.id === selectedTextId);
        if (!layer) return null;
        return (
          <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]">
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/60">
                Selected Text Style
              </label>
              <span className="text-[9px] text-white/30">double-click on canvas to edit text</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-white/40 text-[10px] mb-1.5">Font</label>
                <select
                  value={layer.font}
                  onChange={(e) => updateTextLayer(layer.id, { font: e.target.value })}
                  className="w-full p-2 bg-black/30 border border-white/10 rounded-xl text-white text-[11px] outline-none cursor-pointer"
                >
                  {FONTS.map((f) => (
                    <option key={f.value} value={f.value}>
                      {f.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-white/40 text-[10px] mb-1.5">
                  Size: {layer.fontSize}px
                </label>
                <input
                  type="range"
                  min={12}
                  max={72}
                  value={layer.fontSize}
                  onChange={(e) => updateTextLayer(layer.id, { fontSize: Number(e.target.value) })}
                  className="w-full accent-[var(--editor-accent)] cursor-pointer"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div>
                <label className="block text-white/40 text-[10px] mb-1.5">Color</label>
                <ColorInput
                  value={layer.color}
                  onChange={(v) => updateTextLayer(layer.id, { color: v })}
                  className="w-10 h-8 border-none cursor-pointer rounded-md"
                />
              </div>
              <div className="flex-1">
                <label className="block text-white/40 text-[10px] mb-1.5">Stroke</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateTextLayer(layer.id, { stroke: !layer.stroke })}
                    className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-xl border cursor-pointer text-[11px] transition-colors ${
                      layer.stroke
                        ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] text-white'
                        : 'border-white/10 bg-white/5 text-white/60'
                    }`}
                  >
                    {layer.stroke ? 'ON' : 'OFF'}
                  </button>
                  {layer.stroke && (
                    <ColorInput
                      value={layer.strokeColor}
                      onChange={(v) => updateTextLayer(layer.id, { strokeColor: v })}
                      className="w-8 h-6 border-none cursor-pointer rounded-md"
                    />
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => removeTextLayer(selectedTextId)}
              className="mt-1 flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-xl border border-red-400/30 bg-red-400/10 text-red-200 text-[11px] cursor-pointer hover:bg-red-400/15"
            >
              <Trash2 size={11} /> Delete This Layer
            </button>
          </div>
        );
      })()}

      {/* Info */}
      <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-300/80 text-xs">
        <div className="font-medium mb-1 flex items-center gap-1.5">
          <Pencil size={12} /> Tips
        </div>
        <div className="text-blue-300/60 space-y-0.5">
          <div>• <b>Draw</b>: paint freely on the image</div>
          <div>• <b>Text</b>: type and click + to add a text layer</div>
          <div>• <b>Select</b>: click text to select, drag to move, double-click to edit content</div>
        </div>
      </div>
    </>
  );
}
