import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  useReactFlow,
  type Node,
  type NodeMouseHandler,
  type OnConnectStart,
  type OnConnectEnd,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Toaster } from 'sonner';
import { toast } from 'sonner';
import { useFlowNodes } from './hooks/useFlowNodes';
import { useMouseMode } from './hooks/useMouseMode';
import { useTemplateLoader } from './hooks/useTemplateLoader';
import { useExecutionStore } from './execution/store';
import { useLogStore } from './execution/logStore';
import { ExecutionContext } from './execution/ExecutionContext';
import { runPipeline } from './execution/runner';
import { validatePipeline } from './execution/validator';
import { FlowToolbar } from './FlowToolbar';
import { LogPanel } from './LogPanel';
import { nodeTypes } from './nodes';
import { AnimatedEdge } from './nodes/edges/AnimatedEdge';

const edgeTypes = { default: AnimatedEdge };
import { AnimatedNodeDetailDrawer } from './drawer/AnimatedNodeDetailDrawer';
import { ConnectPortMenu, type ConnectMenuState } from './ConnectPortMenu';
import { NODE_PORT_SCHEMAS } from './types/node-types';
import type { CustomNodeData, CustomNodeType } from './types/node-types';
import type { PortDataType } from './types/port-types';
import { useTour } from './tour/useTour';
import { TourOverlay } from './tour/TourOverlay';
import type { TourContext } from './tour/tourSteps';
import { CanvasEmptyState } from './CanvasEmptyState';

type Props = {
  tourContext?: TourContext;
  onOpenTemplatePicker?: () => void;
  onOpenAiPanel?: () => void;
};

export function FlowCanvasInner({ tourContext = 'empty', onOpenTemplatePicker, onOpenAiPanel }: Props) {
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    addNodeAtPosition,
    connectPorts,
  } = useFlowNodes();
  const { mode, setMode } = useMouseMode();
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [connectMenu, setConnectMenu] = useState<ConnectMenuState | null>(null);
  const connectStartRef = useRef<{
    nodeId: string;
    handleId: string;
    handleType: 'source' | 'target';
  } | null>(null);
  const connectionMadeRef = useRef(false);
  const executionStore = useExecutionStore();
  const logStore = useLogStore();
  const { screenToFlowPosition, getNode } = useReactFlow();
  const tour = useTour(tourContext, nodes);

  // Load template from URL params on mount
  useTemplateLoader(setNodes, setEdges);

  const handleNodeClick: NodeMouseHandler<Node<CustomNodeData>> = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
    // Note: ConnectPortMenu closes itself via its own outside-click listener.
    // Do NOT call setConnectMenu(null) here — it would race with onConnectEnd.
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedNode(null);
  }, []);

  // Listen for canvas:open-export-node (dispatched from PreviewPanel CTA)
  useEffect(() => {
    const handler = (e: Event) => {
      const fromNodeId = (e as CustomEvent<{ fromNodeId: string }>).detail?.fromNodeId;

      // Prefer export node connected downstream from the preview node;
      // fall back to any export node on the canvas.
      const exportNode =
        (fromNodeId
          ? nodes.find(
              (n) =>
                n.type === 'export' &&
                edges.some((edge) => edge.source === fromNodeId && edge.target === n.id),
            )
          : undefined) ?? nodes.find((n) => n.type === 'export');

      if (exportNode) {
        setSelectedNode(exportNode as Node<CustomNodeData>);
      } else {
        toast.info('Tambahkan Export node ke pipeline terlebih dahulu.');
      }
    };

    window.addEventListener('canvas:open-export-node', handler);
    return () => window.removeEventListener('canvas:open-export-node', handler);
  }, [nodes, edges]);

  // ---------------- connect-to-empty-canvas handlers ----------------
  // Wrap onConnect so we know when a real edge was formed during a drag.
  const handleConnect = useCallback<typeof onConnect>(
    (connection) => {
      connectionMadeRef.current = true;
      onConnect(connection);
    },
    [onConnect],
  );

  const handleConnectStart: OnConnectStart = useCallback(
    (_event, { nodeId, handleId, handleType }) => {
      if (nodeId && handleId && handleType) {
        connectStartRef.current = { nodeId, handleId, handleType };
        connectionMadeRef.current = false;
      }
    },
    [],
  );

  const handleConnectEnd: OnConnectEnd = useCallback(
    (event, _connectionState) => {
      const start = connectStartRef.current;
      connectStartRef.current = null;

      // If a real edge was formed (onConnect fired), skip the menu.
      if (connectionMadeRef.current) {
        connectionMadeRef.current = false;
        return;
      }
      connectionMadeRef.current = false;

      if (!start) {
        return;
      }

      // Resolve port type from source node schema
      const sourceNode = getNode(start.nodeId);
      if (!sourceNode?.type) {
        return;
      }
      const schema = NODE_PORT_SCHEMAS[sourceNode.type as CustomNodeType];
      const portList = start.handleType === 'source' ? schema.outputs : schema.inputs;
      const port = portList.find((p) => p.id === start.handleId);
      if (!port) {
        return;
      }

      const { clientX, clientY } =
        'touches' in event ? (event as TouchEvent).changedTouches[0] : (event as MouseEvent);

      setConnectMenu({
        visible: true,
        clientX,
        clientY,
        portType: port.type as PortDataType,
        direction: start.handleType === 'source' ? 'source' : 'target',
        sourceNodeId: start.nodeId,
        sourcePortId: start.handleId,
      });
    },
    [getNode],
  );

  /** Called when user picks a node from the ConnectPortMenu. */
  const handleConnectMenuSelect = useCallback(
    (nodeType: CustomNodeType, compatiblePortId: string) => {
      if (!connectMenu) return;
      const flowPos = screenToFlowPosition({
        x: connectMenu.clientX + 60,
        y: connectMenu.clientY - 20,
      });
      const newId = addNodeAtPosition(nodeType, flowPos);
      if (!newId) return; // blocked by canvas limit

      // Auto-wire the edge
      if (connectMenu.direction === 'source') {
        // dragged from output → connect to compatible input on new node
        connectPorts(connectMenu.sourceNodeId, connectMenu.sourcePortId, newId, compatiblePortId);
      } else {
        // dragged from input → connect from compatible output on new node
        connectPorts(newId, compatiblePortId, connectMenu.sourceNodeId, connectMenu.sourcePortId);
      }
    },
    [connectMenu, addNodeAtPosition, connectPorts, screenToFlowPosition],
  );

  const handleRunPipeline = useCallback(async () => {
    // Validate pipeline before running
    const validation = validatePipeline(nodes, edges);

    if (!validation.valid) {
      const errors = validation.issues.filter((i) => i.severity === 'error');
      const warnings = validation.issues.filter((i) => i.severity === 'warning');

      errors.forEach((issue) => {
        toast.error(issue.message, { duration: 6000 });
      });
      warnings.forEach((issue) => {
        toast.warning(issue.message, { duration: 4000 });
      });

      if (errors.length > 0) return; // Block run on errors
    } else if (validation.issues.length > 0) {
      // Only warnings — show them but allow run
      validation.issues.forEach((issue) => {
        toast.warning(issue.message, { duration: 4000 });
      });
    }

    setLogOpen(true); // Auto-open log panel on run
    const result = await runPipeline(nodes, edges, executionStore, logStore.addLog);
    if (result.success) {
      // Auto-open the first output node's panel so user can see the result immediately
      const OUTPUT_NODE_PRIORITY: CustomNodeType[] = ['preview', 'export', 'manualEditor'];
      const outputNode = OUTPUT_NODE_PRIORITY.map((t) => nodes.find((n) => n.type === t)).find(
        Boolean,
      );
      if (outputNode) setSelectedNode(outputNode as Node<CustomNodeData>);
    }
  }, [nodes, edges, executionStore, logStore.addLog]);

  const handleToggleLog = useCallback(() => {
    setLogOpen((prev) => !prev);
  }, []);

  // Keep drawer in sync with node data changes
  const currentSelectedNode = selectedNode
    ? nodes.find((n) => n.id === selectedNode.id) || null
    : null;

  const executionContextValue = useMemo(
    () => ({
      getNodeState: executionStore.getNodeState,
      pipelineRunning: executionStore.pipelineRunning,
    }),
    [executionStore.getNodeState, executionStore.pipelineRunning],
  );

  const logErrorCount = logStore.logs.filter((l) => l.level === 'error').length;

  const isCanvasEmpty = nodes.length === 0 && !executionStore.pipelineRunning;

  return (
    <ExecutionContext.Provider value={executionContextValue}>
      <div className="w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes as any}
          edgeTypes={edgeTypes}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={handleConnect}
          onConnectStart={handleConnectStart}
          onConnectEnd={handleConnectEnd}
          onNodeClick={handleNodeClick as any}
          onPaneClick={handlePaneClick}
          fitView
          panOnDrag={mode === 'pan'}
          selectionOnDrag={mode === 'select'}
          selectionMode={SelectionMode.Partial}
          panOnScroll={mode === 'select'}
          className={isCanvasEmpty ? '[&_.react-flow__pane]:pointer-events-none' : ''}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls className="text-black" />
          <MiniMap nodeStrokeWidth={3} zoomable pannable />
          <FlowToolbar
            mode={mode}
            onModeChange={setMode}
            onAddNode={addNode}
            onRunPipeline={handleRunPipeline}
            pipelineRunning={executionStore.pipelineRunning}
            logCount={logStore.logs.length}
            logErrorCount={logErrorCount}
            logOpen={logOpen}
            onToggleLog={handleToggleLog}
          />
        </ReactFlow>

        {/* Empty state — rendered AFTER ReactFlow so it sits on top in DOM order.
            The ReactFlow pane has pointer-events-none when empty, so buttons are clickable. */}
        {isCanvasEmpty && (
          <CanvasEmptyState
            onOpenTemplatePicker={onOpenTemplatePicker}
            onOpenAiPanel={onOpenAiPanel}
          />
        )}

        {/* Log Panel */}
        <LogPanel
          logs={logStore.logs}
          isOpen={logOpen}
          onToggle={handleToggleLog}
          onClear={logStore.clearLogs}
          pipelineRunning={executionStore.pipelineRunning}
          drawerOpen={!!currentSelectedNode}
        />

        {/* Node Detail Drawer */}
        <AnimatedNodeDetailDrawer
          selectedNode={currentSelectedNode as Node<CustomNodeData> | null}
          onClose={handleCloseDrawer}
        />

        {/* Connect-to-empty-canvas port menu */}
        {connectMenu?.visible && (
          <ConnectPortMenu
            state={connectMenu}
            onSelect={handleConnectMenuSelect}
            onClose={() => setConnectMenu(null)}
          />
        )}

        <Toaster position="top-right" richColors />

        <TourOverlay
          step={tour.currentStep}
          stepIndex={tour.stepIndex}
          totalSteps={tour.totalSteps}
          nodes={nodes}
          onNext={tour.next}
          onPrev={tour.prev}
          onSkip={tour.skip}
        />
      </div>
    </ExecutionContext.Provider>
  );
}
