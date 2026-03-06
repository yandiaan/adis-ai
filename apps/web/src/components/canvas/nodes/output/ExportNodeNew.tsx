import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId, useEdges, useNodesData } from '@xyflow/react';
import { ArrowDown, Check, Clipboard, Download, Link, Maximize2, MessageCircle, X } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { ExportData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { resolveMediaUrl } from '../../../../utils/runtimeUrl';

const FORMAT_COLOR: Record<string, string> = {
  png: '#60a5fa', jpg: '#34d399', webp: '#a78bfa', mp4: '#f472b6',
};
const SHARE_ICON: Record<string, typeof Download> = {
  download: ArrowDown, whatsapp: MessageCircle, clipboard: Clipboard, 'copy-url': Link,
};

// Thumbnail dimensions: 16:9 container, image fits inside via object-contain
const THUMB_W = 196;
const THUMB_H = 110;

export function ExportNode({ data, selected }: NodeProps<Node<ExportData>>) {
  const [lightbox, setLightbox] = useState(false);
  const [copied, setCopied] = useState(false);
  const { config } = data;
  const nodeId = useNodeId()!;
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamData = upstreamNodesData?.[0]?.data as Record<string, unknown> | undefined;
  const upstreamExportUrl = upstreamData?.exportDataUrl as string | null | undefined;

  // upstreamExportUrl (ManualEditor live edit) has priority over execution output
  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  const rawMediaUrl = upstreamExportUrl ?? imageUrl ?? videoUrl ?? null;
  const resolvedMediaUrl = resolveMediaUrl(rawMediaUrl) ?? rawMediaUrl;
  const resolvedVideoUrl = resolveMediaUrl(videoUrl) ?? videoUrl;

  const fmtColor = FORMAT_COLOR[config.format] ?? '#f87171';
  const ShareIcon = SHARE_ICON[config.shareTarget] ?? ArrowDown;

  const handleQuickSave = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resolvedMediaUrl) return;
    if (resolvedMediaUrl.startsWith('data:')) {
      fetch(resolvedMediaUrl).then(r => r.blob()).then(blob => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = `export.${config.format}`; a.click();
        URL.revokeObjectURL(url);
      });
    } else {
      const a = document.createElement('a');
      a.href = resolvedMediaUrl; a.download = `export.${config.format}`; a.target = '_blank'; a.click();
    }
  };

  const handleQuickCopy = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!resolvedMediaUrl) return;
    navigator.clipboard.writeText(resolvedMediaUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  };

  return (
    <CompactNode nodeType="export" icon="" title={data.label} selected={selected} width={220}>
      {resolvedMediaUrl ? (
        <>
          {/* Thumbnail with lightbox */}
          <div
            className="relative group rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-2 cursor-pointer"
            style={{ width: THUMB_W, height: THUMB_H }}
            onClick={(e) => { e.stopPropagation(); setLightbox(true); }}
          >
            {videoUrl && !imageUrl && !upstreamExportUrl ? (
              <video src={resolvedVideoUrl ?? ''} className="w-full h-full object-contain" muted playsInline />
            ) : (
              <img src={resolvedMediaUrl} alt="Export" className="w-full h-full object-contain" />
            )}
            {/* Format badge */}
            <span
              className="absolute top-1.5 right-1.5 text-[8px] font-black px-1.5 py-0.5 rounded pointer-events-none"
              style={{ backgroundColor: `${fmtColor}33`, color: fmtColor, border: `1px solid ${fmtColor}55` }}
            >
              {config.format.toUpperCase()}
            </span>
            {/* Hover expand */}
            <div
              className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: 'rgba(0,0,0,0.45)' }}
            >
              <span className="p-1 rounded-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Maximize2 size={12} className="text-white" />
              </span>
            </div>
          </div>

          {/* Action row */}
          <div className="flex items-center gap-1.5">
            <span
              className="inline-flex items-center gap-1 text-[9px] px-1.5 py-1 rounded-lg border"
              style={{ background: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}
            >
              <ShareIcon size={9} />
              <span className="capitalize">{config.shareTarget === 'copy-url' ? 'URL' : config.shareTarget}</span>
            </span>
            <div className="ml-auto">
              {config.shareTarget === 'copy-url' ? (
                <button
                  onClick={handleQuickCopy}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium transition-colors cursor-pointer"
                  style={copied
                    ? { background: 'rgba(74,222,128,0.15)', color: '#4ade80', border: '1px solid rgba(74,222,128,0.3)' }
                    : { background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  {copied ? <><Check size={9} /> Copied</> : <><Link size={9} /> Copy</>}
                </button>
              ) : (
                <button
                  onClick={handleQuickSave}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-medium cursor-pointer"
                  style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)', border: '1px solid rgba(255,255,255,0.1)' }}
                >
                  <Download size={9} /> Save
                </button>
              )}
            </div>
          </div>
        </>
      ) : (
        /* Empty state */
        <div className="flex items-center gap-2.5 py-1">
          <div
            className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center text-[12px] font-black"
            style={{ backgroundColor: `${fmtColor}18`, color: fmtColor, border: `1px solid ${fmtColor}35` }}
          >
            {config.format.toUpperCase()}
          </div>
          <div>
            <div className="text-[10px] text-white/40 font-medium">Ready to export</div>
            <div className="text-[9px] text-white/20 mt-0.5 flex items-center gap-1">
              <ShareIcon size={8} /><span className="capitalize">{config.shareTarget}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {lightbox && resolvedMediaUrl && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={resolvedMediaUrl}
            alt="Export"
            className="rounded-xl shadow-2xl"
            style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain' }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            onClick={() => setLightbox(false)}
            className="absolute top-4 right-4 p-2 rounded-full"
            style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <X size={18} className="text-white" />
          </button>
        </div>,
        document.body,
      )}
    </CompactNode>
  );
}

