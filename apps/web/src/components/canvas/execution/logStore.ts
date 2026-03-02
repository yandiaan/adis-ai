import { useState, useCallback, useRef } from 'react';

export type LogLevel = 'info' | 'success' | 'error' | 'warn';

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  nodeId: string | null;
  nodeType: string | null;
  nodeLabel: string | null;
  message: string;
  details?: Record<string, unknown> | null;
  durationMs?: number | null;
}

export interface LogStore {
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, 'id' | 'timestamp'>) => void;
  clearLogs: () => void;
}

let logCounter = 0;

export function useLogStore(): LogStore {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const logsRef = useRef<LogEntry[]>([]);

  const addLog = useCallback((entry: Omit<LogEntry, 'id' | 'timestamp'>) => {
    const newEntry: LogEntry = {
      ...entry,
      id: `log-${Date.now()}-${++logCounter}`,
      timestamp: Date.now(),
    };
    logsRef.current = [...logsRef.current, newEntry];
    setLogs(logsRef.current);
  }, []);

  const clearLogs = useCallback(() => {
    logsRef.current = [];
    setLogs([]);
  }, []);

  return { logs, addLog, clearLogs };
}
