import { useReactFlow } from '@xyflow/react';

import type { PreviewData, PreviewPreset, FitMode } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';

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
  const execState = getNodeState(nodeId);
  const output = execState?.output ?? null;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  const mediaUrl = imageUrl ?? videoUrl;

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
        <div className="flex flex-col gap-3">
          <label className="block text-white/70 text-xs font-medium mb-2">Preview</label>
          <div
            className="w-full rounded-xl overflow-hidden border border-white/10 flex items-center justify-center"
            style={{ backgroundColor: config.backgroundColor, maxHeight: 220 }}
          >
            {imageUrl ? (
              <img
                src={imageUrl}
                alt="Output preview"
                className="w-full max-h-[220px]"
                style={{ objectFit: config.fit }}
              />
            ) : (
              <video
                src={videoUrl!}
                className="w-full max-h-[220px]"
                style={{ objectFit: config.fit }}
                controls
                playsInline
              />
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-3">
        <label className="block text-white/70 text-xs font-medium mb-2">Platform Preset</label>
        <div className="grid grid-cols-3 gap-1.5">
          {PRESETS.map((p) => (
            <button
              key={p.value}
              onClick={() => selectPreset(p.value)}
              className={`py-2.5 px-1 rounded-md border text-white cursor-pointer text-[11px] text-center ${config.preset === p.value ? 'border-red-400 bg-red-400/15' : 'border-white/10 bg-white/5'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="block text-white/70 text-xs font-medium mb-2">Width</label>
            <input
              type="number"
              value={config.width}
              onChange={(e) => updateConfig({ width: Number(e.target.value), preset: 'custom' })}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none box-border"
            />
          </div>
          <div className="flex-1">
            <label className="block text-white/70 text-xs font-medium mb-2">Height</label>
            <input
              type="number"
              value={config.height}
              onChange={(e) => updateConfig({ height: Number(e.target.value), preset: 'custom' })}
              className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm outline-none box-border"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block text-white/70 text-xs font-medium mb-2">Fit</label>
        <div className="flex gap-2">
          {FIT_MODES.map((fit) => (
            <button
              key={fit}
              onClick={() => updateConfig({ fit })}
              className={`flex-1 p-2 rounded-md border text-white cursor-pointer text-xs ${config.fit === fit ? 'border-red-400 bg-red-400/15' : 'border-white/10 bg-white/5'}`}
            >
              {fit}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="block text-white/70 text-xs font-medium mb-2">Background Color</label>
        <input
          type="color"
          value={config.backgroundColor}
          onChange={(e) => updateConfig({ backgroundColor: e.target.value })}
          className="w-12 h-8 border-none cursor-pointer rounded-md"
        />
      </div>
    </>
  );
}
