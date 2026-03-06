import { useCallback } from 'react';
import { X, Sparkles } from 'lucide-react';
import { AiTemplateChatbox } from './AiTemplateChatbox';
import { useAiTemplates } from './hooks/useAiTemplates';
import { ALL_TEMPLATES } from './templates';
import type { PipelineTemplate } from './templates';

interface Props {
  onConfirm: (template: PipelineTemplate) => void;
  onClose: () => void;
}

export function AiGeneratePanel({ onConfirm, onClose }: Props) {
  const aiTemplates = useAiTemplates();

  const handleConfirm = useCallback(
    (template: PipelineTemplate) => {
      onConfirm(template);
      onClose();
    },
    [onConfirm, onClose],
  );

  const handleSaveToLibrary = useCallback(
    (template: PipelineTemplate) => {
      aiTemplates.prepend(template);
    },
    [aiTemplates],
  );

  const examplePrompts = ALL_TEMPLATES.filter((t) => t.id !== 'blank')
    .flatMap((t) => t.examplePrompts ?? [])
    .slice(0, 6);

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4 sm:p-8"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Panel */}
      <div className="relative w-full max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-base leading-tight">Minta AI Buatkan</h2>
            <p className="text-white/40 text-xs mt-0.5">Deskripsikan workflow-mu, AI yang akan menyusunnya</p>
          </div>
          <button
            onClick={onClose}
            className="ml-auto p-2 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <AiTemplateChatbox
          onConfirm={handleConfirm}
          onSaveToLibrary={handleSaveToLibrary}
          examplePrompts={examplePrompts}
          autoFocus
        />
      </div>
    </div>
  );
}
