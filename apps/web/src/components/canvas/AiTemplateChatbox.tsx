import { useState, useRef, useCallback } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle,
  AlertCircle,
  ChevronDown,
  Trash2,
  Wand2,
  RefreshCw,
} from 'lucide-react';
import type { PipelineTemplate } from './templates';
import { getFingerprint } from '../../utils/fingerprint';
import { getSessionStartMs } from '../../utils/sessionContext';

type ChatboxState = 'idle' | 'loading' | 'preview' | 'error';

interface ModelOption {
  value: string;
  label: string;
  description: string;
}

const MODEL_OPTIONS: ModelOption[] = [
  { value: 'qwen-max', label: 'qwen-max', description: 'Best Quality' },
  { value: 'qwen-plus', label: 'qwen-plus', description: 'Balanced' },
  { value: 'qwen-turbo', label: 'qwen-turbo', description: 'Fastest' },
];

interface SSEEvent {
  type: 'status' | 'result' | 'error';
  message?: string;
  template?: PipelineTemplate;
}

interface Props {
  onConfirm: (template: PipelineTemplate) => void;
  onSaveToLibrary?: (template: PipelineTemplate) => void;
}

export function AiTemplateChatbox({ onConfirm, onSaveToLibrary }: Props) {
  const [state, setState] = useState<ChatboxState>('idle');
  const [prompt, setPrompt] = useState('');
  const [selectedModel, setSelectedModel] = useState('qwen-plus');
  const [showModelPicker, setShowModelPicker] = useState(false);
  const [preview, setPreview] = useState<PipelineTemplate | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  // SSE step tracking
  const [currentStatus, setCurrentStatus] = useState('');
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const currentStatusRef = useRef('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selectedModelOption = MODEL_OPTIONS.find((m) => m.value === selectedModel)!;

  const pushStep = useCallback((msg: string) => {
    // Move current to completed log, set new as current
    if (currentStatusRef.current) {
      setCompletedSteps((prev) => [...prev, currentStatusRef.current]);
    }
    currentStatusRef.current = msg;
    setCurrentStatus(msg);
  }, []);

  async function handleEnhancePrompt() {
    if (!prompt.trim() || isEnhancing || state === 'loading') return;
    setIsEnhancing(true);
    try {
      const fpHash = await getFingerprint();
      const res = await fetch('http://localhost:3000/api/ai/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FP-Hash': fpHash,
          'X-Session-Start': String(getSessionStartMs()),
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
      });
      if (res.ok) {
        const { enhancedPrompt } = (await res.json()) as { enhancedPrompt: string };
        setPrompt(enhancedPrompt);
        setTimeout(() => textareaRef.current?.focus(), 50);
      }
    } catch {
      // silently fail — user still has their original prompt
    } finally {
      setIsEnhancing(false);
    }
  }

  async function handleGenerate() {
    if (!prompt.trim() || state === 'loading') return;

    setState('loading');
    setPreview(null);
    setErrorMessage('');
    setCompletedSteps([]);
    setCurrentStatus('');
    currentStatusRef.current = '';

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 120000);
    try {
      const fpHash = await getFingerprint();
      const res = await fetch('http://localhost:3000/api/ai/generate-template', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-FP-Hash': fpHash,
          'X-Session-Start': String(getSessionStartMs()),
        },
        body: JSON.stringify({ prompt: prompt.trim(), model: selectedModel }),
        signal: controller.signal,
      });

      if (!res.body) {
        throw new Error(`Server error ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let receivedTerminal = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          let event: SSEEvent;
          try {
            event = JSON.parse(line.slice(6)) as SSEEvent;
          } catch {
            continue;
          }

          if (event.type === 'status' && event.message) {
            pushStep(event.message);
          } else if (event.type === 'result' && event.template) {
            // Move final status to completed
            if (currentStatusRef.current) {
              setCompletedSteps((prev) => [...prev, currentStatusRef.current]);
              currentStatusRef.current = '';
              setCurrentStatus('');
            }
            setPreview(event.template);
            setState('preview');
            receivedTerminal = true;
          } else if (event.type === 'error' && event.message) {
            setErrorMessage(event.message);
            setState('error');
            receivedTerminal = true;
          }
        }
      }

      if (!receivedTerminal) {
        setErrorMessage('Connection closed before pipeline was generated. Please try again.');
        setState('error');
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.name === 'AbortError'
            ? 'Request timed out. Try switching to qwen-turbo for faster generation.'
            : err.message
          : 'Unknown error occurred.';
      setErrorMessage(msg);
      setState('error');
    } finally {
      clearTimeout(timeout);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleGenerate();
    }
  }

  function handleConfirm() {
    if (!preview) return;
    onSaveToLibrary?.(preview);
    onConfirm(preview);
  }

  function handleRetry() {
    setState('idle');
    setPreview(null);
    setErrorMessage('');
    setCompletedSteps([]);
    setCurrentStatus('');
    currentStatusRef.current = '';
    setTimeout(() => textareaRef.current?.focus(), 50);
  }

  const charCount = prompt.length;
  const charLimit = 500;

  return (
    <div className="flex flex-col gap-5 w-full">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-primary" />
        <span className="text-white font-semibold text-base">
          Ask AI to build a workflow for your Content Generator
        </span>
      </div>

      {/* Prompt area */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value.slice(0, charLimit))}
          onKeyDown={handleKeyDown}
          disabled={state === 'loading' || isEnhancing}
          placeholder="Describe the workflow you want, e.g. 'Create an Eid greeting card from a photo with glowing text overlay'"
          rows={4}
          className="w-full bg-surface-panel border border-white/10 rounded-xl px-4 py-3 pb-10 text-white text-sm placeholder:text-white/30 resize-none focus:outline-none focus:ring-1 focus:ring-primary disabled:opacity-50"
        />
        {/* Enhance button — bottom-left inside textarea */}
        <button
          type="button"
          onClick={handleEnhancePrompt}
          disabled={!prompt.trim() || isEnhancing || state === 'loading'}
          title="Enhance prompt with AI"
          className="absolute bottom-2.5 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-medium hover:bg-primary/20 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isEnhancing ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Wand2 className="w-3 h-3" />
          )}
          {isEnhancing ? 'Enhancing…' : 'Enhance Prompt'}
        </button>
        {/* Char counter + shortcut hint */}
        <div className="absolute bottom-3 right-3 flex items-center gap-2">
          <span
            className={`text-xs select-none ${charCount > charLimit * 0.9 ? 'text-yellow-400/60' : 'text-white/20'}`}
          >
            {charCount}/{charLimit}
          </span>
          <span className="text-white/20 text-xs select-none">⌘↵</span>
        </div>
      </div>

      {/* Model picker + Generate button */}
      <div className="flex items-center gap-3">
        {/* Model picker */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowModelPicker((v) => !v)}
            disabled={state === 'loading'}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/70 text-sm hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <span className="font-mono">{selectedModelOption.label}</span>
            <span className="text-white/30 text-xs">· {selectedModelOption.description}</span>
            <ChevronDown className="w-3 h-3 ml-1 text-white/40" />
          </button>

          {showModelPicker && (
            <div className="absolute top-full mt-1 left-0 z-10 bg-surface-panel border border-white/10 rounded-xl overflow-hidden shadow-xl min-w-[200px]">
              {MODEL_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setSelectedModel(opt.value);
                    setShowModelPicker(false);
                  }}
                  className={`w-full flex items-center justify-between px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${
                    selectedModel === opt.value ? 'text-primary' : 'text-white/70'
                  }`}
                >
                  <span className="font-mono">{opt.label}</span>
                  <span className="text-white/40 text-xs">{opt.description}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Generate button */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!prompt.trim() || state === 'loading'}
          className="ml-auto flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {state === 'loading' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating…
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </button>
      </div>

      {/* Loading step tracker */}
      {state === 'loading' && (
        <div className="border border-white/10 bg-white/[0.03] rounded-xl p-4 flex flex-col gap-2">
          {/* Completed steps */}
          {completedSteps.map((step, i) => (
            <div key={i} className="flex items-center gap-2.5">
              <CheckCircle className="w-3.5 h-3.5 text-green-500/70 flex-shrink-0" />
              <span className="text-white/35 text-xs">{step}</span>
            </div>
          ))}
          {/* Current active step */}
          {currentStatus && (
            <div className="flex items-center gap-2.5 mt-0.5">
              <Loader2 className="w-3.5 h-3.5 text-primary animate-spin flex-shrink-0" />
              <span className="text-white/80 text-xs font-medium">{currentStatus}</span>
            </div>
          )}
          {/* Pulsing bar */}
          <div className="mt-2 h-0.5 rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-primary/40 animate-pulse rounded-full"
              style={{
                width: `${Math.min(100, (completedSteps.length + 1) * 25)}%`,
                transition: 'width 0.5s ease',
              }}
            />
          </div>
        </div>
      )}

      {/* Preview card */}
      {state === 'preview' && preview && (
        <div className="border border-primary/30 bg-primary/5 rounded-xl p-4 flex flex-col gap-3 animate-in fade-in duration-300">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">{preview.thumbnail}</span>
              <div>
                <p className="text-white font-semibold text-sm">{preview.name}</p>
                <p className="text-white/50 text-xs mt-0.5">{preview.description}</p>
              </div>
            </div>
            <CheckCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
          </div>
          {/* Pipeline stats */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-white/40 text-xs">{preview.nodes.length} nodes</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs">{preview.edges.length} edges</span>
            <span className="text-white/20">·</span>
            <span className="text-white/40 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
              {preview.category}
            </span>
          </div>
          {/* Node type chips */}
          <div className="flex flex-wrap gap-1.5">
            {preview.nodes.map((n) => (
              <span
                key={n.id}
                className="text-xs bg-white/5 border border-white/10 text-white/40 px-2 py-0.5 rounded-full font-mono"
              >
                {n.type}
              </span>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
            >
              Use this pipeline
            </button>
            <button
              type="button"
              onClick={handleRetry}
              className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 text-sm hover:bg-white/10 transition-colors flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Error state */}
      {state === 'error' && (
        <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-red-400 text-sm font-medium">Generation failed</p>
            <p className="text-white/40 text-xs mt-1 leading-relaxed">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={handleRetry}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/60 text-xs hover:bg-white/10 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
            Clear
          </button>
        </div>
      )}
    </div>
  );
}
