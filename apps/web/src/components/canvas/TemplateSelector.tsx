import { useState } from 'react';
import { ALL_TEMPLATES, type PipelineTemplate } from './templates';
import { Plus, X, Wand2, Smile, Sparkles, User2, LayoutTemplate } from 'lucide-react';

type Props = {
  onSelectTemplate: (template: PipelineTemplate | null) => void;
  onClose?: () => void;
};

// Map template IDs to Lucide icons
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

  const handleSelectEmpty = () => {
    onSelectTemplate(null);
  };

  const handleSelectTemplate = (template: PipelineTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50">
      <div className="relative w-full max-w-5xl px-8">
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute -top-12 right-8 p-2 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        )}

        {/* Header */}
        <div className="text-center mb-8">
          <p className="text-white/50 text-base">
            Select a template to get started, or create an empty workflow from scratch. You can
            always change or remove the template later.
          </p>
        </div>

        {/* Template Grid */}
        <div className="flex gap-4 justify-center flex-wrap">
          {/* Empty Workflow Card */}
          <button
            onClick={handleSelectEmpty}
            onMouseEnter={() => setHoveredId('empty')}
            onMouseLeave={() => setHoveredId(null)}
            className={`
              w-44 h-28 rounded-xl border-2 border-dashed transition-all duration-200 flex items-center justify-center
              ${
                hoveredId === 'empty'
                  ? 'border-primary bg-primary/10'
                  : 'border-white/20 bg-white/5 hover:border-white/40'
              }
            `}
          >
            <div className="flex flex-col items-center gap-2">
              <div
                className={`
                w-12 h-12 rounded-full flex items-center justify-center transition-colors
                ${hoveredId === 'empty' ? 'bg-primary text-white' : 'bg-white text-background'}
              `}
              >
                <Plus className="w-6 h-6" />
              </div>
            </div>
          </button>

          {/* Template Cards */}
          {ALL_TEMPLATES.filter((t) => t.id !== 'blank').map((template) => (
            <button
              key={template.id}
              onClick={() => handleSelectTemplate(template)}
              onMouseEnter={() => setHoveredId(template.id)}
              onMouseLeave={() => setHoveredId(null)}
              className={`
                w-44 h-28 rounded-xl border transition-all duration-200 overflow-hidden relative group
                ${
                  hoveredId === template.id
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-white/10 hover:border-white/30'
                }
              `}
            >
              {/* Thumbnail/Preview background */}
              <div className="absolute inset-0 bg-surface-panel flex items-center justify-center">
                <div className="text-white/40 group-hover:text-white/60 transition-colors">
                  {getTemplateIcon(template.id)}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Labels row */}
        <div className="flex gap-4 justify-center flex-wrap mt-3">
          <div className="w-44 text-center">
            <span className="text-white text-sm font-medium">Empty Workflow</span>
          </div>
          {ALL_TEMPLATES.filter((t) => t.id !== 'blank').map((template) => (
            <div key={template.id} className="w-44 text-center">
              <span className="text-white text-sm font-medium">{template.name}</span>
              <p className="text-white/40 text-xs mt-0.5">{template.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
