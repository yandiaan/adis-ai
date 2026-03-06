import { useState, useCallback } from 'react';
import { ALL_TEMPLATES, type PipelineTemplate } from './templates';
import { Plus, X, Wand2, Smile, Sparkles, User2, LayoutTemplate, Trash2 } from 'lucide-react';
import { AiTemplateChatbox } from './AiTemplateChatbox';
import { useAiTemplates } from './hooks/useAiTemplates';

type Props = {
  onSelectTemplate: (template: PipelineTemplate | null) => void;
  onClose?: () => void;
};

const TEMPLATE_ICONS: Record<string, React.ComponentType<{ className: string }>> = {
  'ramadan-wishes': Wand2,
  'holiday-meme': Smile,
  'ai-pet': Sparkles,
  'custom-avatar': User2,
};

const getTemplateIcon = (templateId: string) => {
  const Icon = TEMPLATE_ICONS[templateId] || LayoutTemplate;
  return <Icon className="w-6 h-6" />;
};

export function TemplateSelector({ onSelectTemplate, onClose }: Props) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const aiTemplates = useAiTemplates();
  const [aiSavedTemplates, setAiSavedTemplates] = useState<PipelineTemplate[]>(() =>
    aiTemplates.getAll(),
  );

  const handleSelectEmpty = () => onSelectTemplate(null);
  const handleSelectTemplate = (template: PipelineTemplate) => onSelectTemplate(template);

  const handleAiConfirm = useCallback(
    (template: PipelineTemplate) => onSelectTemplate(template),
    [onSelectTemplate],
  );

  const handleSaveToLibrary = useCallback(
    (template: PipelineTemplate) => {
      aiTemplates.prepend(template);
      setAiSavedTemplates(aiTemplates.getAll());
    },
    [aiTemplates],
  );

  const handleClearAiTemplates = () => {
    aiTemplates.clearAll();
    setAiSavedTemplates([]);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-start justify-center z-50 overflow-y-auto py-6 sm:py-10">
      <div className="relative w-full max-w-5xl px-4 sm:px-8">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="fixed top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white z-10"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* AI Chatbox */}
        <AiTemplateChatbox onConfirm={handleAiConfirm} onSaveToLibrary={handleSaveToLibrary} />

        {/* Divider */}
        <div className="flex items-center gap-3 my-6 sm:my-8">
          <div className="flex-1 h-px bg-white/10" />
          <span className="text-white/30 text-xs uppercase tracking-widest whitespace-nowrap">
            or pick a template
          </span>
          <div className="flex-1 h-px bg-white/10" />
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
          {/* Empty Workflow Card */}
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSelectEmpty}
              onMouseEnter={() => setHoveredId('empty')}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                w-full aspect-[11/7] rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center
                ${hoveredId === 'empty' ? 'border-primary bg-primary/10' : 'border-white/20 bg-white/5 hover:border-white/40'}
              `}
            >
              <div
                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center transition-colors ${hoveredId === 'empty' ? 'bg-primary text-white' : 'bg-white text-background'}`}
              >
                <Plus className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
            </button>
            <div className="text-center">
              <span className="text-white text-xs sm:text-sm font-medium">Empty Workflow</span>
            </div>
          </div>

          {ALL_TEMPLATES.filter((t) => t.id !== 'blank').map((template) => (
            <div key={template.id} className="flex flex-col gap-2">
              <button
                onClick={() => handleSelectTemplate(template)}
                onMouseEnter={() => setHoveredId(template.id)}
                onMouseLeave={() => setHoveredId(null)}
                className={`w-full aspect-[11/7] rounded-xl border transition-all duration-200 overflow-hidden relative group ${
                  hoveredId === template.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-white/10 hover:border-white/30'
                }`}
              >
                <div className="absolute inset-0 bg-surface-panel flex items-center justify-center">
                  <div className="text-white/40 group-hover:text-white/60 transition-colors">
                    {getTemplateIcon(template.id)}
                  </div>
                </div>
              </button>
              <div className="text-center">
                <span className="text-white text-xs sm:text-sm font-medium">{template.name}</span>
                <p className="text-white/40 text-[10px] sm:text-xs mt-0.5 line-clamp-2">
                  {template.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Generated section */}
        {aiSavedTemplates.length > 0 && (
          <div className="mt-8 pb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                AI Generated
              </h3>
              <button
                onClick={handleClearAiTemplates}
                className="flex items-center gap-1 text-white/30 hover:text-red-400 text-xs transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Clear all
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {aiSavedTemplates.map((template) => (
                <div key={template.id} className="flex flex-col gap-2">
                  <button
                    onClick={() => handleSelectTemplate(template)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`w-full aspect-[11/7] rounded-xl border transition-all duration-200 overflow-hidden relative group ${
                      hoveredId === template.id
                        ? 'border-primary ring-2 ring-primary/30'
                        : 'border-white/10 hover:border-white/30'
                    }`}
                  >
                    <div className="absolute inset-0 bg-surface-panel flex flex-col items-center justify-center gap-1">
                      <span className="text-2xl">{template.thumbnail}</span>
                      <span className="text-white/30 text-xs font-mono bg-white/5 px-1.5 py-0.5 rounded">
                        {template.category}
                      </span>
                    </div>
                  </button>
                  <div className="text-center">
                    <span className="text-white text-xs sm:text-sm font-medium">
                      {template.name}
                    </span>
                    <p className="text-white/40 text-[10px] sm:text-xs mt-0.5 line-clamp-2">
                      {template.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
