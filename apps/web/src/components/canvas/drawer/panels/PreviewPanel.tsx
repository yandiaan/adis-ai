import { useReactFlow, useEdges, useNodesData } from '@xyflow/react';
import type { PreviewData, PreviewPreset, FitMode } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { ColorInput } from '../../ui/ColorInput';

type Props = {
  nodeId: string;
  data: PreviewData;
};

const PRESETS: { value: PreviewPreset; label: string; w: number; h: number }[] = [
  { value: 'ig-square', label: 'IG Square', w: 1080, h: 1080 },
  { value: 'ig-story', label: 'IG Story', w: 1080, h: 1920 },
  { value: 'tiktok', label: 'TikTok', w: 1080, h: 1920 },
  { value: 'twitter', label: 'Twitter', w: 1200, h: 675 },
  { value: 'whatsapp-status', label: 'WA Status', w: 1080, h: 1920 },
  { value: 'custom', label: 'Custom', w: 0, h: 0 },
];

const FIT_MODES: FitMode[] = ['cover', 'contain', 'fill'];

export function PreviewPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const { getNodeState } = useExecutionContext();
  const edges = useEdges();
  const incomingEdge = edges.find(e => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  // useNodesData is reactive — re-renders when upstream node's data changes
  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamExportUrl = (upstreamNodesData?.[0]?.data as Record<string, unknown>)?.exportDataUrl as string | null | undefined;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  // upstreamExportUrl (manual editor composite) has highest priority — it is the edited result
  const mediaUrl = upstreamExportUrl ?? imageUrl ?? videoUrl;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const selectPreset = (preset: PreviewPreset) => {
    const p = PRESETS.find((pr) => pr.value === preset);
    if (p && preset !== 'custom') {
      updateConfig({ preset, width: p.w, height: p.h });
    } else {
      updateConfig({ preset });
    }
  };

  return (
    <>
      {/* Live preview */}
      {mediaUrl && (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Preview</label>
          <div
            className="w-full rounded-xl overflow-hidden border border-white/10 flex items-center justify-center"
            style={{ backgroundColor: config.backgroundColor, maxHeight: 220 }}
          >
            {videoUrl && !imageUrl && !upstreamExportUrl ? (
              <video
                src={videoUrl}
                className="w-full max-h-[220px]"
                style={{ objectFit: config.fit }}
                controls
                playsInline
              />
            ) : (
              <img
                src={mediaUrl}
                alt="Output preview"
                className="w-full max-h-[220px]"
                style={{ objectFit: config.fit }}
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Platform Preset</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => selectPreset(p.value)}
              className={`motion-lift motion-press focus-ring-orange py-2.5 px-1 rounded-xl border text-white cursor-pointer text-[11px] text-center transition-colors ${config.preset === p.value ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]' : 'border-white/10 bg-white/5 hover:bg-white/7'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-2">Dimensions</label>
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-white/40 text-[10px] mb-1">Width</label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => updateConfig({ width: Number(e.target.value), preset: 'custom' })}
              className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
            />
          </div>
          <div className="flex-1">
            <label className="block text-white/40 text-[10px] mb-1">Height</label>
            <input
              type="number"
              value={config.height}
              onChange={(e) => updateConfig({ height: Number(e.target.value), preset: 'custom' })}
              className="w-full p-3 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Fit</label>
        <div className="flex gap-2">
          {FIT_MODES.map((fit) => (
            <button
              key={fit}
              onClick={() => updateConfig({ fit })}
              className={`motion-lift motion-press focus-ring-orange flex-1 p-2 rounded-xl border text-white cursor-pointer text-xs transition-colors ${config.fit === fit ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]' : 'border-white/10 bg-white/5 hover:bg-white/7'}`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Background Color</label>
        <ColorInput
          value={config.backgroundColor}
          onChange={(v) => updateConfig({ backgroundColor: v })}
          className="w-12 h-8 border-none cursor-pointer rounded-md"
        />
      </div>
    </>
  );
}
