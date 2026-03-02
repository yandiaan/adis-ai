import { useState, useCallback, useMemo } from 'react';
import {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlow,
  SelectionMode,
  type Node,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useFlowNodes } from './hooks/useFlowNodes';
import { useMouseMode } from './hooks/useMouseMode';
import { useTemplateLoader } from './hooks/useTemplateLoader';
import { useExecutionStore } from './execution/store';
import { ExecutionContext } from './execution/ExecutionContext';
import { runPipeline } from './execution/runner';
import { FlowToolbar } from './FlowToolbar';
import { nodeTypes } from './nodes';
import { AnimatedNodeDetailDrawer } from './drawer/AnimatedNodeDetailDrawer';
import type { CustomNodeData } from './types/node-types';

export function FlowCanvasInner() {
  const { nodes, edges, setNodes, setEdges, onNodesChange, onEdgesChange, onConnect, addNode } =
    useFlowNodes();
  const { mode, setMode } = useMouseMode();
  const [selectedNode, setSelectedNode] = useState<Node<CustomNodeData> | null>(null);
  const executionStore = useExecutionStore();

  // Load template from URL params on mount
  useTemplateLoader(setNodes, setEdges);

  const handleNodeClick: NodeMouseHandler<Node<CustomNodeData>> = useCallback((_, node) => {
    setSelectedNode(node);
  }, []);

  const handlePaneClick = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setSelectedNode(null);
  }, []);

  const handleRunPipeline = useCallback(async () => {
    await runPipeline(nodes, edges, executionStore);
  }, [nodes, edges, executionStore]);

  // Keep drawer in sync with node data changes
  const currentSelectedNode = selectedNode
    ? nodes.find((n) => n.id === selectedNode.id) || null
    : null;

  const executionContextValue = useMemo(
    () => ({ getNodeState: executionStore.getNodeState }),
    [executionStore.getNodeState],
  );

  return (
    <ExecutionContext.Provider value={executionContextValue}>
      <div className="w-full h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes as any}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={handleNodeClick as any}
          onPaneClick={handlePaneClick}
          fitView
          panOnDrag={mode === 'pan'}
          selectionOnDrag={mode === 'select'}
          selectionMode={SelectionMode.Partial}
          panOnScroll={mode === 'select'}
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
          />
        </ReactFlow>

        {/* Node Detail Drawer */}
        <AnimatedNodeDetailDrawer
          selectedNode={currentSelectedNode as Node<CustomNodeData> | null}
          onClose={handleCloseDrawer}
        />
      </div>
    </ExecutionContext.Provider>
  );
}
