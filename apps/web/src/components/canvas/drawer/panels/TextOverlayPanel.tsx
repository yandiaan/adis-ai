import { useReactFlow, useEdges } from '@xyflow/react';

import type { TextOverlayData, TextPosition, FontFamily, TextEffect } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { ColorInput } from '../../ui/ColorInput';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';

type Props = {
  nodeId: string;
  data: TextOverlayData;
};

const POSITION_GRID: TextPosition[][] = [
  ['top-left', 'top-center', 'top-right'],
  ['center-left', 'center', 'center-right'],
  ['bottom-left', 'bottom-center', 'bottom-right'],
];
const FONTS: { value: FontFamily; label: string }[] = [
  { value: 'inter', label: 'Inter' },
  { value: 'impact', label: 'Impact' },
  { value: 'arabic-display', label: 'Arabic Display' },
  { value: 'comic-neue', label: 'Comic Neue' },
];
const EFFECTS: TextEffect[] = ['none', 'shadow', 'glow', 'gradient'];

export function TextOverlayPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const config = data.config;

  // Find the edge connected to the text input port
  const textEdge = edges.find(
    (e) => e.target === nodeId && e.targetHandle === 'text',
  );
  const textPortConnected = !!textEdge;

  // Resolve the actual text from the upstream node's output
  const upstreamState = textEdge ? getNodeState(textEdge.source) : null;
  const upstreamText =
    upstreamState?.status === 'done' && upstreamState.output
      ? upstreamState.output.type === 'text'
        ? (upstreamState.output.data as { text: string }).text
        : upstreamState.output.type === 'prompt'
          ? (upstreamState.output.data as { prompt: string }).prompt
          : null
      : null;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <>
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
          Text
        </label>
        {textPortConnected ? (
          <div className="w-full p-3 bg-black/20 border border-[#4ade80]/20 rounded-xl min-h-[80px]">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[#4ade80]/15 text-[#4ade80] font-semibold">
                CONNECTED
              </span>
              {!upstreamText && (
                <span className="text-[10px] text-white/25 italic">Run the pipeline to preview</span>
              )}
            </div>
            {upstreamText && (
              <p className="text-[11px] text-white/70 leading-relaxed line-clamp-6 whitespace-pre-wrap">
                {upstreamText}
              </p>
            )}
          </div>
        ) : (
          <textarea
            value={config.text}
            onChange={(e) => updateConfig({ text: e.target.value })}
            placeholder="Type text here, or connect a Text node to the input port"
            className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none resize-y min-h-[80px] font-inherit box-border focus:border-[var(--editor-accent-65)] transition-colors"
          />
        )}
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Position</label>
        <div className="grid grid-cols-3 gap-0.5 w-full">
          {POSITION_GRID.flat().map((pos) => (
            <button
              key={pos}
              onClick={() => updateConfig({ position: pos })}
              className="h-7 rounded-sm flex items-center justify-center transition-colors"
              style={{
                backgroundColor: config.position === pos ? 'rgba(248,113,113,0.4)' : 'rgba(255,255,255,0.04)',
                border: config.position === pos ? '1px solid rgba(248,113,113,0.7)' : '1px solid transparent',
              }}
            >
              {config.position === pos && <span className="text-[8px] text-[#f87171] font-bold">T</span>}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Font</label>
        <div className="flex flex-wrap gap-1.5">
          {FONTS.map((f) => (
            <button
              key={f.value}
              onClick={() => updateConfig({ font: f.value })}
              className={`motion-lift motion-press focus-ring-orange px-3 py-1.5 rounded-full border cursor-pointer text-white text-xs transition-colors ${
                config.font === f.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Font Size</span>
            <span className="text-[11px] text-white/55 tabular-nums">{config.fontSize}px</span>
          </div>
          <input
            type="range"
            min="12"
            max="120"
            step="2"
            value={config.fontSize}
            onChange={(e) => updateConfig({ fontSize: Number(e.target.value) })}
            className="w-full h-2 rounded bg-white/10 outline-none cursor-pointer"
          />
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <span className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Color &amp; Stroke</span>
        <div className="flex gap-3 items-center">
          <div>
            <label className="block text-[10px] text-white/40 font-medium mb-1.5">Color</label>
            <ColorInput
              value={config.fontColor}
              onChange={(v) => updateConfig({ fontColor: v })}
              className="w-10 h-8 border-none cursor-pointer rounded-md"
            />
          </div>
          <div>
            <label className="block text-[10px] text-white/40 font-medium mb-1.5">Stroke</label>
            <button
              onClick={() => updateConfig({ stroke: !config.stroke })}
              className={`motion-lift motion-press focus-ring-orange px-3.5 py-1.5 rounded-xl border cursor-pointer text-white text-xs transition-colors ${
                config.stroke ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]' : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {config.stroke ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Effect</label>
        <div className="flex gap-1.5">
          {EFFECTS.map((eff) => (
            <button
              key={eff}
              onClick={() => updateConfig({ effect: eff })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2 rounded-xl border cursor-pointer text-white text-[11px] transition-colors ${
                config.effect === eff
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              {eff}
            </button>
          ))}
        </div>
      </div>

      <ModelPicker
        options={MODEL_OPTIONS.imageEditing}
        value={config.model ?? 'qwen-image-edit-plus'}
        onChange={(model) => updateConfig({ model })}
      />
    </>
  );
}
