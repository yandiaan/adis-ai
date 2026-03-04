import { useReactFlow } from '@xyflow/react';
import type { VideoExtensionData } from '../../types/node-types';

type Props = {
  nodeId: string;
  data: VideoExtensionData;
};

export function VideoExtensionPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  return (
    <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
      <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">Extension Settings</label>

      {/* Direction */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] text-white/40 uppercase tracking-wider">Direction</label>
        <div className="flex gap-1">
          {[
            { value: 'forward', label: '→ Forward', desc: 'Extend end of video' },
            { value: 'backward', label: '← Backward', desc: 'Extend start of video' },
          ].map((opt) => {
            const active = config.direction === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => updateConfig({ direction: opt.value as typeof config.direction })}
                className="flex-1 py-2 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer text-center"
                style={{
                  background: active ? 'rgba(52,211,153,0.12)' : 'rgba(255,255,255,0.03)',
                  border: active ? '1px solid rgba(52,211,153,0.35)' : '1px solid rgba(255,255,255,0.07)',
                  color: active ? '#34d399' : 'rgba(255,255,255,0.4)',
                }}
              >
                <div>{opt.label}</div>
                <div className="text-[9px] opacity-60 mt-0.5">{opt.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Output info */}
      <div className="py-2 px-3 rounded-lg text-[11px]" style={{ background: 'rgba(52,211,153,0.05)', border: '1px solid rgba(52,211,153,0.15)' }}>
        <div className="flex items-center gap-1.5 text-[#34d399]/70">
          <span>⏱</span>
          <span>Always outputs a <strong className="text-[#34d399]">5-second</strong> video clip</span>
        </div>
      </div>

      {/* Prompt Extend Toggle */}
      <div className="flex items-center justify-between py-1">
        <div>
          <div className="text-[11px] text-white/60">Prompt Extend</div>
          <div className="text-[10px] text-white/25">Let AI enhance the prompt automatically</div>
        </div>
        <button
          className="w-10 h-5 rounded-full transition-all duration-150 relative cursor-pointer shrink-0"
          style={{ background: config.prompt_extend ? '#34d399' : 'rgba(255,255,255,0.1)' }}
          onClick={() => updateConfig({ prompt_extend: !config.prompt_extend })}
        >
          <div
            className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all duration-150"
            style={{ left: config.prompt_extend ? '22px' : '2px' }}
          />
        </button>
      </div>
    </div>
  );
}
