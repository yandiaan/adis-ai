import { useReactFlow } from '@xyflow/react';
import { ArrowRight, Image, Type, Video, Volume2 } from 'lucide-react';
import type { VideoGeneratorData, VideoResolution } from '../../types/node-types';
import { ModelPicker } from './ModelPicker';
import { MODEL_OPTIONS } from '../../config/modelOptions';
import { DrawerSection } from '../DrawerSection';

type Props = {
  nodeId: string;
  data: VideoGeneratorData;
};

const ALL_RESOLUTIONS: VideoResolution[] = ['480P', '720P', '1080P'];

export function VideoGeneratorPanel({ nodeId, data }: Props) {
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const isT2V = config.mode === 'text2video';
  const enableAudio = config.enableAudio ?? false;

  // Only show audio-capable models when audio is enabled
  const allModelOptions = isT2V ? MODEL_OPTIONS.textToVideo : MODEL_OPTIONS.imageToVideo;
  const modelOptions = enableAudio ? allModelOptions.filter((m) => m.supportsAudio) : allModelOptions;

  const activeModelId = isT2V ? (config.model ?? 'wan2.1-t2v-turbo') : (config.imageVideoModel ?? 'wan2.1-i2v-turbo');
  const activeModel = allModelOptions.find((m) => m.id === activeModelId);
  const supportedResolutions = activeModel?.supportedResolutions
    ? ALL_RESOLUTIONS.filter((r) => activeModel.supportedResolutions!.includes(r))
    : ALL_RESOLUTIONS;

  const handleModelChange = (key: 'model' | 'imageVideoModel') => (modelId: string) => {
    const model = allModelOptions.find((m) => m.id === modelId);
    const updates: Partial<typeof config> = { [key]: modelId };
    if (model?.supportedResolutions && !model.supportedResolutions.includes(config.resolution)) {
      updates.resolution = model.supportedResolutions[0] as VideoResolution;
    }
    updateConfig(updates);
  };

  const handleToggleAudio = (enabled: boolean) => {
    if (enabled) {
      const currentOpt = allModelOptions.find((m) => m.id === activeModelId);
      if (!currentOpt?.supportsAudio) {
        const audioModel = allModelOptions.find((m) => m.supportsAudio);
        if (audioModel) {
          const key = isT2V ? 'model' : 'imageVideoModel';
          updateConfig({ enableAudio: true, [key]: audioModel.id });
          return;
        }
      }
    }
    updateConfig({ enableAudio: enabled });
  };

  return (
    <>
      {/* === BASIC === */}
      <DrawerSection title="Dasar">
        {/* Mode */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
            Mode
          </label>
          <div className="text-white/55 text-[13px] p-3 bg-white/5 rounded-xl border border-white/10">
            <div className="inline-flex items-center gap-2">
              {config.mode === 'text2video' ? (
                <>
                  <Type size={14} className="text-white/70" />
                  <ArrowRight size={14} className="text-white/40" />
                  <Video size={14} className="text-white/70" />
                  <span>Teks ke Video</span>
                </>
              ) : (
                <>
                  <Image size={14} className="text-white/70" />
                  <ArrowRight size={14} className="text-white/40" />
                  <Video size={14} className="text-white/70" />
                  <span>Gambar ke Video</span>
                </>
              )}
            </div>
            <div className="text-[11px] text-white/30 mt-1">Terdeteksi otomatis dari koneksi</div>
          </div>
        </div>

        {/* Audio toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl border border-white/[0.06] bg-white/[0.025]">
          <div className="flex items-center gap-2.5">
            <Volume2 size={14} className={enableAudio ? 'text-[#22d3ee]' : 'text-white/30'} />
            <div>
              <div className="text-[12px] font-medium" style={{ color: enableAudio ? '#22d3ee' : 'rgba(255,255,255,0.7)' }}>
                Generate Audio
              </div>
              <div className="text-[10px] text-white/35 mt-0.5">
                {enableAudio ? 'Auto dubbing aktif — hanya model audio yang tersedia' : 'Video tanpa audio'}
              </div>
            </div>
          </div>
          <button
            className="w-10 h-5 rounded-full transition-all duration-200 relative cursor-pointer shrink-0"
            style={{ background: enableAudio ? '#22d3ee' : 'rgba(255,255,255,0.12)' }}
            onClick={() => handleToggleAudio(!enableAudio)}
          >
            <div
              className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all duration-200"
              style={{ left: enableAudio ? '22px' : '2px' }}
            />
          </button>
        </div>

        {/* Duration */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-white/40">
              Durasi
            </span>
            <span className="text-[11px] text-white/55 tabular-nums">{config.duration}s</span>
          </div>
          <input
            type="range"
            min="2"
            max="15"
            step="1"
            value={config.duration}
            onChange={(e) => updateConfig({ duration: Number(e.target.value) })}
            className="w-full h-2 rounded bg-white/10 outline-none cursor-pointer"
          />
        </div>

        {/* Resolution */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1.5">
            Resolusi
          </label>
          <div className="flex gap-2">
            {supportedResolutions.map((res) => (
              <button
                key={res}
                onClick={() => updateConfig({ resolution: res })}
                className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-white text-[13px] transition-colors ${
                  config.resolution === res
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/7'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
        </div>

        {/* Model */}
        {isT2V ? (
          <ModelPicker
            options={modelOptions}
            value={config.model ?? 'wan2.1-t2v-turbo'}
            onChange={handleModelChange('model')}
          />
        ) : (
          <ModelPicker
            options={modelOptions}
            value={config.imageVideoModel ?? 'wan2.1-i2v-turbo'}
            onChange={handleModelChange('imageVideoModel')}
          />
        )}
      </DrawerSection>

      {/* === ADVANCED === */}
      <DrawerSection title="Lanjutan" defaultCollapsed accent="advanced">
        {/* Shot Type */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Tipe Shot
          </label>
          <p className="text-[11px] text-white/30 mb-2">
            Single: satu adegan. Multi-shot: beberapa adegan bergantian.
          </p>
          <div className="flex gap-2">
            {(['single', 'multi'] as const).map((type) => (
              <button
                key={type}
                onClick={() => updateConfig({ shot_type: type })}
                className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-white text-[13px] transition-colors ${
                  (config.shot_type ?? 'single') === type
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/7'
                }`}
              >
                {type === 'single' ? 'Single' : 'Multi-shot'}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt Extend */}
        <div>
          <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40 mb-1">
            Prompt Extend
          </label>
          <p className="text-[11px] text-white/30 mb-2">
            AI memperluas prompt untuk detail lebih kaya.
          </p>
          <div className="flex gap-2">
            {([true, false] as const).map((val) => (
              <button
                key={String(val)}
                onClick={() => updateConfig({ prompt_extend: val })}
                className={`motion-lift motion-press focus-ring-orange flex-1 p-2.5 rounded-xl border cursor-pointer text-white text-xs transition-colors ${
                  (config.prompt_extend ?? true) === val
                    ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                    : 'border-white/10 bg-white/5 hover:bg-white/7'
                }`}
              >
                {val ? 'Aktif' : 'Nonaktif'}
              </button>
            ))}
          </div>
        </div>
      </DrawerSection>
    </>
  );
}
