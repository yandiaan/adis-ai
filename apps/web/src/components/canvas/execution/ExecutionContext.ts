import { createContext, useContext } from 'react';
import type { NodeExecutionState } from './types';
import { createDefaultExecutionState } from './types';

export interface ExecutionContextValue {
  getNodeState: (nodeId: string) => NodeExecutionState;
  pipelineRunning: boolean;
}

const defaultValue: ExecutionContextValue = {
  getNodeState: () => createDefaultExecutionState(),
  pipelineRunning: false,
};

export const ExecutionContext = createContext<ExecutionContextValue>(defaultValue);

export function useExecutionContext() {
  return useContext(ExecutionContext);
}
