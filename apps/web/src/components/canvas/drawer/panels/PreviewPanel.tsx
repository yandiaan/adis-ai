import { useReactFlow, useEdges, useNodesData } from '@xyflow/react';
import type { PreviewData, PreviewPreset, FitMode } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { ColorInput } from '../../ui/ColorInput';
import { resolveMediaUrl } from '../../../../utils/runtimeUrl';

type Props = {
  nodeId: string;
  data: PreviewData;
};

const PRESETS: { value: PreviewPreset; label: string; w: number; h: number; ratio: string }[] = [
  { value: 'ig-square',       label: 'IG Square', w: 1080, h: 1080, ratio: '1:1' },
  { value: 'ig-story',        label: 'IG Story',  w: 1080, h: 1920, ratio: '9:16' },
  { value: 'tiktok',          label: 'TikTok',    w: 1080, h: 1920, ratio: '9:16' },
  { value: 'twitter',         label: 'Twitter',   w: 1200, h: 675,  ratio: '16:9' },
  { value: 'whatsapp-status', label: 'WA Status', w: 1080, h: 1920, ratio: '9:16' },
  { value: 'custom',          label: 'Custom',    w: 0,    h: 0,    ratio: 'custom' },
];

const PRESET_ASPECT: Record<PreviewPreset, [number, number]> = {
  'ig-square':       [1, 1],
  'ig-story':        [9, 16],
  'tiktok':          [9, 16],
  'twitter':         [16, 9],
  'whatsapp-status': [9, 16],
  'custom':          [16, 9],
};

const FIT_MODES: FitMode[] = ['cover', 'contain', 'fill'];

export function PreviewPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const { getNodeState } = useExecutionContext();
  const edges = useEdges();
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  // useNodesData is reactive — re-renders when upstream node's data changes
  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamExportUrl = (upstreamNodesData?.[0]?.data as Record<string, unknown>)
    ?.exportDataUrl as string | null | undefined;

  const [aw, ah] = PRESET_ASPECT[config.preset] ?? [16, 9];
  const previewMaxH = 240;
  const previewW = `min(100%, ${Math.round(aw * previewMaxH / ah)}px)`;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  // upstreamExportUrl (manual editor composite) has highest priority — it is the edited result
  const mediaUrl = upstreamExportUrl ?? imageUrl ?? videoUrl;

  const resolvedUpstreamExportUrl = resolveMediaUrl(upstreamExportUrl);
  const resolvedImageUrl = resolveMediaUrl(imageUrl);
  const resolvedVideoUrl = resolveMediaUrl(videoUrl);
  const resolvedMediaUrl = resolvedUpstreamExportUrl ?? resolvedImageUrl ?? resolvedVideoUrl;

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

  const currentPreset = PRESETS.find(p => p.value === config.preset);

  return (
    <>
      {/* Live preview — aspect-ratio enforced */}
      {resolvedMediaUrl ? (
        <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Preview</label>
            <span className="text-[10px] text-white/30">
              {currentPreset?.label} · {currentPreset?.ratio ?? `${config.width}×${config.height}`}
            </span>
          </div>
          <div className="flex justify-center">
            <div
              className="rounded-xl overflow-hidden border border-white/10"
              style={{
                width: previewW,
                aspectRatio: `${aw} / ${ah}`,
                backgroundColor: config.backgroundColor,
                maxHeight: previewMaxH,
              }}
            >
              {videoUrl && !imageUrl && !upstreamExportUrl ? (
                <video
                  src={resolvedVideoUrl ?? videoUrl}
                  className="w-full h-full"
                  style={{ objectFit: config.fit }}
                  controls
                  playsInline
                />
              ) : (
                <img
                  src={resolvedMediaUrl}
                  alt="Output preview"
                  className="w-full h-full"
                  style={{ objectFit: config.fit }}
                />
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025] text-center">
          <p className="text-[11px] text-white/25">Connect a node to see preview</p>
        </div>
      )}

      {/* Platform Preset */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">Platform</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => selectPreset(p.value)}
              className={`motion-lift motion-press focus-ring-orange py-2 px-1 rounded-xl border text-white cursor-pointer text-center transition-colors ${config.preset === p.value ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]' : 'border-white/10 bg-white/5 hover:bg-white/7'}`}
            >
              <div className="text-[11px] font-medium">{p.label}</div>
              <div className="text-[9px] text-white/35 mt-0.5">{p.ratio}</div>
            </button>
          ))}
        </div>

        {/* Custom dimensions — only shown when preset is custom */}
        {config.preset === 'custom' && (
          <div className="flex gap-2 mt-1">
            <div className="flex-1">
              <label className="block text-white/35 text-[10px] mb-1">Width</label>
              <input
                type="number"
                value={config.width}
                onChange={(e) => updateConfig({ width: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
              />
            </div>
            <div className="flex-1">
              <label className="block text-white/35 text-[10px] mb-1">Height</label>
              <input
                type="number"
                value={config.height}
                onChange={(e) => updateConfig({ height: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-black/30 border border-white/10 rounded-xl text-white text-sm outline-none box-border focus:border-[var(--editor-accent-65)] transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      {/* Display settings — Fit + Background in one card */}
      <div className="flex flex-col gap-3 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">Display</label>
        <div>
          <label className="block text-white/35 text-[10px] mb-1.5">Fit Mode</label>
          <div className="flex gap-2">
            {FIT_MODES.map((fit) => (
              <button
                key={fit}
                onClick={() => updateConfig({ fit })}
                className={`motion-lift motion-press focus-ring-orange flex-1 py-2 rounded-xl border text-white cursor-pointer text-xs transition-colors ${config.fit === fit ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] font-semibold' : 'border-white/10 bg-white/5 hover:bg-white/7'}`}
              >
                {fit}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between">
          <label className="text-white/35 text-[10px]">Background</label>
          <ColorInput
            value={config.backgroundColor}
            onChange={(v) => updateConfig({ backgroundColor: v })}
            className="w-10 h-7 border-none cursor-pointer rounded-md"
          />
        </div>
      </div>
    </>
  );
}

