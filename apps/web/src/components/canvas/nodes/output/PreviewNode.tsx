import { useState } from 'react';
import { createPortal } from 'react-dom';
import type { Node, NodeProps } from '@xyflow/react';
import { useNodeId, useEdges, useNodesData } from '@xyflow/react';
import { Maximize2, X } from 'lucide-react';
import { CompactNode } from '../CompactNode';
import type { PreviewData } from '../../types/node-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import type { ImageData, VideoData } from '../../types/port-types';
import { resolveMediaUrl } from '../../../../utils/runtimeUrl';

// Must match PreviewPreset type exactly
const PRESET_META: Record<string, { label: string; aspect: [number, number] }> = {
  'ig-square':       { label: 'IG Square',  aspect: [1, 1] },
  'ig-story':        { label: 'IG Story',   aspect: [9, 16] },
  'tiktok':          { label: 'TikTok',     aspect: [9, 16] },
  'twitter':         { label: 'Twitter',    aspect: [16, 9] },
  'whatsapp-status': { label: 'WA Status',  aspect: [9, 16] },
  'custom':          { label: 'Custom',     aspect: [16, 9] },
};

// Available content width inside CompactNode (220px - 2×12px padding)
const CONTENT_W = 196;
const THUMB_MAX_H = 96;

export function PreviewNode({ data, selected }: NodeProps<Node<PreviewData>>) {
  const [lightbox, setLightbox] = useState(false);
  const { config } = data;
  const nodeId = useNodeId()!;
  const edges = useEdges();
  const { getNodeState } = useExecutionContext();
  const incomingEdge = edges.find((e) => e.target === nodeId);
  const upstreamState = incomingEdge ? getNodeState(incomingEdge.source) : null;
  const output = upstreamState?.output ?? null;

  // upstreamExportUrl (ManualEditor live) has priority over execution output
  const upstreamNodesData = useNodesData(incomingEdge?.source ? [incomingEdge.source] : []);
  const upstreamExportUrl = (upstreamNodesData?.[0]?.data as Record<string, unknown>)
    ?.exportDataUrl as string | null | undefined;

  const imageUrl = output?.type === 'image' ? (output.data as ImageData).url : null;
  const videoUrl = output?.type === 'video' ? (output.data as VideoData).url : null;
  const rawMediaUrl = upstreamExportUrl ?? imageUrl ?? null;
  const resolvedMediaUrl = resolveMediaUrl(rawMediaUrl);
  const resolvedVideoUrl = resolveMediaUrl(videoUrl);

  const meta = PRESET_META[config.preset] ?? PRESET_META.custom;
  const [aw, ah] = meta.aspect;

  // Fit thumbnail proportionally into CONTENT_W × THUMB_MAX_H
  const scale = Math.min(CONTENT_W / aw, THUMB_MAX_H / ah);
  const thumbW = Math.round(aw * scale);
  const thumbH = Math.round(ah * scale);

  return (
    <CompactNode nodeType="preview" icon="" title={data.label} selected={selected} width={220}>
      {/* Aspect-ratio preview frame */}
      <div className="flex justify-center mb-2">
        <div
          className="relative group rounded-lg overflow-hidden border border-white/10 cursor-pointer"
          style={{ width: thumbW, height: thumbH, backgroundColor: config.backgroundColor, minWidth: 40 }}
          onClick={(e) => { e.stopPropagation(); if (resolvedMediaUrl) setLightbox(true); }}
        >
          {resolvedMediaUrl ? (
            <>
              <img
                src={resolvedMediaUrl}
                alt="Preview"
                className="w-full h-full"
                style={{ objectFit: config.fit }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: 'rgba(0,0,0,0.45)' }}
              >
                <span className="p-1 rounded-md" style={{ background: 'rgba(0,0,0,0.7)', border: '1px solid rgba(255,255,255,0.2)' }}>
                  <Maximize2 size={12} className="text-white" />
                </span>
              </div>
            </>
          ) : resolvedVideoUrl ? (
            <video src={resolvedVideoUrl} className="w-full h-full" style={{ objectFit: config.fit }} muted playsInline />
          ) : (
            <div className="flex flex-col items-center justify-center w-full h-full gap-1">
              <span className="text-white/15 text-[11px] font-medium">{aw}:{ah}</span>
              <span className="text-white/10 text-[9px]">no input</span>
            </div>
          )}
          {/* Preset badge */}
          <span
            className="absolute top-1 left-1 text-[8px] leading-none font-semibold px-1 py-0.5 rounded pointer-events-none"
            style={{ background: 'rgba(0,0,0,0.65)', color: 'rgba(255,255,255,0.65)' }}
          >
            {meta.label}
          </span>
        </div>
      </div>

      {/* Info row */}
      <div className="flex items-center justify-between text-[9px]">
        <span className="text-white/30">{config.width}×{config.height}</span>
        <span className="text-white/20 capitalize">{config.fit}</span>
      </div>

      {/* Lightbox */}
      {lightbox && resolvedMediaUrl && createPortal(
        <div
          className="fixed inset-0 z-[99999] flex items-center justify-center"
          style={{ background: 'rgba(0,0,0,0.92)' }}
          onClick={() => setLightbox(false)}
        >
          <img
            src={resolvedMediaUrl}
            alt="Preview"
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
