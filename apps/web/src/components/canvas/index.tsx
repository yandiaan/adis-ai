import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvasInner } from './FlowCanvas';
import type { TourContext } from './tour/tourSteps';

type Props = {
  tourContext?: TourContext;
  onOpenTemplatePicker?: () => void;
  onOpenAiPanel?: () => void;
};

export default function FlowCanvas({ tourContext = 'empty', onOpenTemplatePicker, onOpenAiPanel }: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner
        tourContext={tourContext}
        onOpenTemplatePicker={onOpenTemplatePicker}
        onOpenAiPanel={onOpenAiPanel}
      />
    </ReactFlowProvider>
  );
}
