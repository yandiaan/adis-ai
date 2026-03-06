import { ReactFlowProvider } from '@xyflow/react';
import { FlowCanvasInner } from './FlowCanvas';
import type { TourContext } from './tour/tourSteps';

type Props = {
  tourContext?: TourContext;
};

export default function FlowCanvas({ tourContext = 'empty' }: Props) {
  return (
    <ReactFlowProvider>
      <FlowCanvasInner tourContext={tourContext} />
    </ReactFlowProvider>
  );
}
