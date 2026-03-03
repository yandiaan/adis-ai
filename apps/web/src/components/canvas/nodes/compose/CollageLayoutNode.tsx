import { useNodeId, useReactFlow } from '@xyflow/react';
import type { Node, NodeProps } from '@xyflow/react';
import { CompactNode } from '../CompactNode';
import type { CollageLayoutData } from '../../types/node-types';
import type { ImageData, NodePortSchema } from '../../types/port-types';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { NodeModelSelect } from '../shared/NodeModelSelect';
import { MODEL_OPTIONS } from '../../config/modelOptions';

// Mini SVG diagrams for each layout
function LayoutDiagram({ layout }: { layout: string }) {
  const gap = 2;
  const r = 2;
  const s = 36; // total size
  const h = 24;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const m = (s - h) / 2;

  if (layout === '2-horizontal') {
    const w = (s - gap * 3) / 2;
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <rect x={gap} y={gap} width={w} height={h - gap * 2} rx={r} fill="#60a5fa" opacity="0.4" />
        <rect
          x={gap * 2 + w}
          y={gap}
          width={w}
          height={h - gap * 2}
          rx={r}
          fill="#60a5fa"
          opacity="0.4"
        />
      </svg>
    );
  }
  if (layout === '2-vertical') {
    const rowH = (h - gap * 3) / 2;
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        <rect
          x={gap}
          y={gap}
          width={s - gap * 2}
          height={rowH}
          rx={r}
          fill="#60a5fa"
          opacity="0.4"
        />
        <rect
          x={gap}
          y={gap * 2 + rowH}
          width={s - gap * 2}
          height={rowH}
          rx={r}
          fill="#60a5fa"
          opacity="0.4"
        />
      </svg>
    );
  }
  if (layout === '3-grid') {
    const w = (s - gap * 4) / 3;
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        {[0, 1, 2].map((i) => (
          <rect
            key={i}
            x={gap + i * (w + gap)}
            y={gap}
            width={w}
            height={h - gap * 2}
            rx={r}
            fill="#60a5fa"
            opacity="0.4"
          />
        ))}
      </svg>
    );
  }
  if (layout === '4-grid') {
    const w2 = (s - gap * 3) / 2;
    const h2 = (h - gap * 3) / 2;
    return (
      <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
        {[
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ].map(([ci, ri], idx) => (
          <rect
            key={idx}
            x={gap + ci * (w2 + gap)}
            y={gap + ri * (h2 + gap)}
            width={w2}
            height={h2}
            rx={r}
            fill="#60a5fa"
            opacity="0.4"
          />
        ))}
      </svg>
    );
  }
  // mosaic
  return (
    <svg width={s} height={h} viewBox={`0 0 ${s} ${h}`}>
      <rect
        x={gap}
        y={gap}
        width={s * 0.55}
        height={h - gap * 2}
        rx={r}
        fill="#60a5fa"
        opacity="0.4"
      />
      <rect
        x={gap + s * 0.55 + gap}
        y={gap}
        width={s * 0.35 - gap}
        height={(h - gap * 3) / 2}
        rx={r}
        fill="#60a5fa"
        opacity="0.4"
      />
      <rect
        x={gap + s * 0.55 + gap}
        y={gap * 2 + (h - gap * 3) / 2}
        width={s * 0.35 - gap}
        height={(h - gap * 3) / 2}
        rx={r}
        fill="#60a5fa"
        opacity="0.4"
      />
    </svg>
  );
}

const LAYOUT_IMAGE_COUNT: Record<string, number> = {
  '2-horizontal': 2,
  '2-vertical': 2,
  '3-grid': 3,
  '4-grid': 4,
  mosaic: 3,
};

const IMAGE_LABELS = ['A', 'B', 'C', 'D'];

function buildCollageSchema(layout: string): NodePortSchema {
  const count = LAYOUT_IMAGE_COUNT[layout] ?? 2;
  return {
    inputs: Array.from({ length: count }, (_, i) => ({
      id: `image${i + 1}`,
      type: 'image' as const,
      label: `Image ${IMAGE_LABELS[i]}`,
      required: i < 2,
    })),
    outputs: [{ id: 'image', type: 'image' as const, label: 'Collage', required: true }],
  };
}

export function CollageLayoutNode({ id, data, selected }: NodeProps<Node<CollageLayoutData>>) {
  const { config } = data;
  const nodeId = useNodeId();
  const { updateNodeData } = useReactFlow();
  const { getNodeState } = useExecutionContext();
  const execState = nodeId ? getNodeState(nodeId) : null;
  const updateConfig = (updates: Partial<typeof config>) =>
    updateNodeData(id, { config: { ...config, ...updates } });
  const isRunning = execState?.status === 'running';
  const isDone = execState?.status === 'done';
  const outputImage = isDone
    ? execState?.output?.type === 'image'
      ? (execState.output.data as ImageData)
      : null
    : null;

  const dynamicSchema = buildCollageSchema(config.layout);
  const imageCount = LAYOUT_IMAGE_COUNT[config.layout] ?? 2;

  return (
    <CompactNode
      nodeType="collageLayout"
      icon=""
      title={data.label}
      selected={selected}
      portSchema={dynamicSchema}
    >
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <LayoutDiagram layout={config.layout} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-[10px] text-white/60 font-medium capitalize">
              {config.layout.replace('-', ' ')}
            </span>
            <span
              className="text-[9px] px-1.5 py-px rounded-full font-semibold"
              style={{ background: 'rgba(96,165,250,0.15)', color: '#60a5fa' }}
            >
              {imageCount} imgs
            </span>
          </div>
          <div className="text-[9px] text-white/30">
            Gap {config.gap}px · r{config.borderRadius}
          </div>
        </div>
      </div>

      {/* ── Model ── */}
      <div
        className="mt-2.5 pt-2.5 flex items-center gap-2"
        style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
      >
        <span className="text-[9px] text-white/25 uppercase tracking-wider shrink-0">Model</span>
        <div className="flex-1 min-w-0">
          <NodeModelSelect
            options={MODEL_OPTIONS.imageEditing}
            value={config.model ?? 'qwen-image-edit-plus'}
            onChange={(m) => updateConfig({ model: m })}
          />
        </div>
      </div>

      {/* ── Output preview ──────────────────────────────── */}
      {(isRunning || isDone) && (
        <div className="mt-2.5 pt-2.5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <span className="text-[9px] text-white/25 uppercase tracking-wider">Output</span>
          <div
            className="relative w-full overflow-hidden rounded-lg mt-1.5"
            style={{ height: 120, background: '#0e0e16' }}
          >
            {outputImage ? (
              <img src={outputImage.url} alt="Output" className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative w-6 h-6">
                  <div className="absolute inset-0 rounded-full border-2 border-[#60a5fa]/20" />
                  <div className="absolute inset-0 rounded-full border-2 border-t-[#60a5fa] animate-spin" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </CompactNode>
  );
}
