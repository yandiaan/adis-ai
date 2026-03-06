import { useState } from 'react';
import { useReactFlow, useEdges, useNodesData } from '@xyflow/react';
import { Check, Clipboard, Download, Link, MessageCircle } from 'lucide-react';
import type { ExportData, ExportFormat, ShareTarget } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { resolveMediaUrl } from '../../../../utils/runtimeUrl';

type Props = {
  nodeId: string;
  data: ExportData;
};

const FORMAT_COLOR: Record<string, string> = {
  png: '#60a5fa', jpg: '#34d399', webp: '#a78bfa', mp4: '#f472b6',
};
const FORMATS: ExportFormat[] = ['png', 'jpg', 'webp', 'mp4'];
const SHARE_TARGETS: { value: ShareTarget; Icon: typeof Download; label: string }[] = [
  { value: 'download',  Icon: Download,       label: 'Download' },
  { value: 'whatsapp',  Icon: MessageCircle,  label: 'WhatsApp' },
  { value: 'clipboard', Icon: Clipboard,      label: 'Clipboard' },
  { value: 'copy-url',  Icon: Link,           label: 'Copy URL' },
];

export function ExportPanelNew({ nodeId, data }: Props) {
  const [actionDone, setActionDone] = useState(false);
  const { updateNodeData } = useReactFlow();
  const config = data.config;

  const { getNodeState } = useExecutionContext();
  const edges = useEdges();
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  // useNodesData is reactive — re-renders this component when node data changes
  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamExportUrl = (upstreamNodesData?.[0]?.data as Record<string, unknown>)
    ?.exportDataUrl as string | null | undefined;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  // upstreamExportUrl (manual editor composite) has highest priority
  const mediaUrl = upstreamExportUrl ?? imageUrl ?? videoUrl ?? null;
  const resolvedMediaUrl = (resolveMediaUrl(mediaUrl) ?? mediaUrl) as string | null;
  const resolvedVideoUrl = resolveMediaUrl(videoUrl) ?? videoUrl;

  const isRemoteUrl = resolvedMediaUrl && !resolvedMediaUrl.startsWith('data:');
  const fmtColor = FORMAT_COLOR[config.format] ?? '#f87171';

  const updateConfig = (updates: Partial<typeof config>) => {
    updateNodeData(nodeId, { config: { ...config, ...updates } });
  };

  const handleExport = async () => {
    if (!resolvedMediaUrl) return;

    if (config.shareTarget === 'download') {
      if (resolvedMediaUrl.startsWith('data:')) {
        const res = await fetch(resolvedMediaUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = blobUrl; a.download = `export.${config.format}`; a.click();
        URL.revokeObjectURL(blobUrl);
      } else {
        const a = document.createElement('a');
        a.href = resolvedMediaUrl; a.download = `export.${config.format}`; a.target = '_blank'; a.click();
      }
    } else if (config.shareTarget === 'clipboard') {
      try {
        const res = await fetch(resolvedMediaUrl);
        const blob = await res.blob();
        await navigator.clipboard.write([new ClipboardItem({ [blob.type]: blob })]);
      } catch {
        navigator.clipboard.writeText(resolvedMediaUrl);
      }
    } else if (config.shareTarget === 'whatsapp') {
      window.open(`https://wa.me/?text=${encodeURIComponent(resolvedMediaUrl)}`, '_blank');
    } else if (config.shareTarget === 'copy-url') {
      navigator.clipboard.writeText(resolvedMediaUrl);
    }

    setActionDone(true);
    setTimeout(() => setActionDone(false), 2000);
  };

  const actionLabel = config.shareTarget === 'download' ? 'Download'
    : config.shareTarget === 'clipboard' ? 'Copy to Clipboard'
    : config.shareTarget === 'copy-url' ? 'Copy URL'
    : 'Share to WhatsApp';

  return (
    <>
      {/* Output preview — hero section, always visible */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <div className="flex items-center justify-between">
          <label className="text-[10px] font-semibold uppercase tracking-widest text-white/40">Output</label>
          {resolvedMediaUrl && (
            <span
              className="text-[9px] px-1.5 py-0.5 rounded font-semibold"
              style={{ background: `${fmtColor}18`, color: fmtColor }}
            >
              .{config.format}
            </span>
          )}
        </div>

        {resolvedMediaUrl ? (
          <>
            <div
              className="w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 flex items-center justify-center"
              style={{ maxHeight: 200 }}
            >
              {videoUrl && !imageUrl && !upstreamExportUrl ? (
                <video src={resolvedVideoUrl ?? ''} className="w-full max-h-[200px]" controls playsInline />
              ) : (
                <img src={resolvedMediaUrl} alt="Export preview" className="max-w-full max-h-[200px] object-contain block mx-auto" />
              )}
            </div>
            {isRemoteUrl && (
              <p className="text-[10px] text-yellow-400/60 flex items-center gap-1">
                <span>⚠</span> URL expires in 24h — export now
              </p>
            )}
          </>
        ) : (
          <div className="py-5 flex flex-col items-center gap-2">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-base font-black"
              style={{ background: `${fmtColor}15`, color: fmtColor, border: `1px solid ${fmtColor}30` }}
            >
              {config.format.toUpperCase()}
            </div>
            <p className="text-[11px] text-white/25 text-center">Run the pipeline to generate output</p>
          </div>
        )}

        {/* Export action button */}
        <button
          onClick={handleExport}
          disabled={!resolvedMediaUrl}
          className="motion-lift motion-press focus-ring-orange w-full py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={
            actionDone
              ? { borderColor: '#4ade8065', background: '#4ade8014', color: '#4ade80' }
              : { borderColor: 'var(--editor-accent-65)', background: 'var(--editor-accent-14)', color: 'white' }
          }
        >
          {actionDone ? <><Check size={15} /> Done!</> : actionLabel}
        </button>
      </div>

      {/* Format selector */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">Format</label>
        <div className="flex gap-1.5">
          {FORMATS.map((fmt) => (
            <button
              key={fmt}
              onClick={() => updateConfig({ format: fmt })}
              className={`motion-lift motion-press focus-ring-orange flex-1 px-1 py-2 rounded-xl border cursor-pointer text-white text-xs transition-colors ${
                config.format === fmt
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)] font-semibold'
                  : 'border-white/10 bg-white/5 hover:bg-white/7 font-normal'
              }`}
            >
              .{fmt}
            </button>
          ))}
        </div>
      </div>

      {/* Share target — compact list */}
      <div className="flex flex-col gap-2.5 p-3.5 rounded-xl border border-white/[0.06] bg-white/[0.025]">
        <label className="block text-[10px] font-semibold uppercase tracking-widest text-white/40">Share via</label>
        <div className="flex flex-col gap-1">
          {SHARE_TARGETS.map((target) => (
            <button
              key={target.value}
              onClick={() => updateConfig({ shareTarget: target.value })}
              className={`motion-press focus-ring-orange flex items-center gap-2.5 px-3 py-2.5 rounded-xl border cursor-pointer text-white transition-colors text-left ${
                config.shareTarget === target.value
                  ? 'border-[var(--editor-accent-65)] bg-[var(--editor-accent-14)]'
                  : 'border-white/10 bg-white/5 hover:bg-white/7'
              }`}
            >
              <target.Icon
                size={15}
                className={config.shareTarget === target.value ? 'text-[var(--editor-accent)]' : 'text-white/50'}
              />
              <span className="text-[12px] font-medium">{target.label}</span>
              {config.shareTarget === target.value && (
                <Check size={12} className="ml-auto text-[var(--editor-accent)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

