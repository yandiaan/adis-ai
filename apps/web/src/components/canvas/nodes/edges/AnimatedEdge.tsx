import { getBezierPath, type EdgeProps } from '@xyflow/react';
import { useExecutionContext } from '../../execution/ExecutionContext';
import { PORT_COLORS } from '../../config/port-colors';
import type { PortDataType } from '../../types/port-types';

const DASH = 5;
const GAP = 13;

export function AnimatedEdge({
  id,
  source,
  sourceX,
  sourceY,
  sourcePosition,
  targetX,
  targetY,
  targetPosition,
  sourceHandleId,
  selected,
}: EdgeProps) {
  const { getNodeState, pipelineRunning } = useExecutionContext();
  const nodeState = getNodeState(source);

  // Resolve wire color from the source port type
  const portType =
    sourceHandleId && sourceHandleId in PORT_COLORS
      ? (sourceHandleId as PortDataType)
      : 'image';
  const color = PORT_COLORS[portType];

  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isNodeRunning = nodeState.status === 'running';
  const isNodeDone = pipelineRunning && nodeState.status === 'done';
  const isActive = pipelineRunning && (isNodeRunning || isNodeDone);

  const baseOpacity = selected ? 0.85 : isActive ? 0.5 : 0.28;
  const strokeW = selected ? 2.5 : isActive ? 2 : 1.5;
  // Running nodes pulse faster — done nodes flow slower indicating completed data
  const animDuration = isNodeRunning ? '0.42s' : '0.85s';

  return (
    <g>
      {/* Invisible wide hit area for easy clicking */}
      <path d={edgePath} fill="none" stroke="transparent" strokeWidth={20} />

      {/* Soft outer glow when active */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeW + 8}
          strokeOpacity={isNodeRunning ? 0.1 : 0.06}
          style={{ filter: 'blur(5px)', transition: 'stroke-opacity 0.5s' }}
        />
      )}

      {/* Base wire — always visible, colored by port type */}
      <path
        id={id}
        d={edgePath}
        fill="none"
        stroke={color}
        strokeWidth={strokeW}
        strokeOpacity={baseOpacity}
        style={{ transition: 'stroke-opacity 0.4s, stroke-width 0.3s' }}
      />

      {/* Flowing data dots — only when pipeline is running and source has data */}
      {isActive && (
        <path
          d={edgePath}
          fill="none"
          stroke={color}
          strokeWidth={strokeW}
          strokeOpacity={0.9}
          strokeLinecap="round"
          strokeDasharray={`${DASH} ${GAP}`}
          style={{
            animation: `edgeFlow ${animDuration} linear infinite`,
          }}
        />
      )}
    </g>
  );
}
