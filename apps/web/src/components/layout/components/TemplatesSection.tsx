import { Search, LayoutTemplate } from 'lucide-react';
import { ALL_TEMPLATES, type PipelineTemplate } from '../../canvas/templates';
import { getTemplateIcon } from '../constants/templateIcons';
import { NodeCarousel } from './NodeCarousel';
import { NODE_ONBOARDING } from '../constants/nodeOnboarding';
import { useTemplateButtonsHover } from '../hooks/useAnimations';
import { useRef } from 'react';

interface TemplatesSectionProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onTemplateClick: (template: PipelineTemplate) => void;
  currentNodeIndex: number;
  onNodeNavigate: (index: number) => void;
  showCarousel: boolean;
  /** When true, shows a brief pulse ring to draw attention */
  highlight?: boolean;
}

export function TemplatesSection({
  searchQuery,
  onSearchChange,
  onTemplateClick,
  currentNodeIndex,
  onNodeNavigate,
  showCarousel,
  highlight,
}: TemplatesSectionProps) {
  const filteredTemplates = ALL_TEMPLATES.filter(
    (t) => t.id !== 'blank' && t.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const templateButtonsRef = useRef<Record<string, HTMLButtonElement>>({});
  useTemplateButtonsHover(templateButtonsRef);

  return (
    <div
      className={`flex-1 overflow-y-auto px-3 pb-3 rounded-lg transition-all duration-300 ${highlight ? 'ring-2 ring-primary/60 ring-offset-2 ring-offset-background' : ''}`}
      style={{ scrollbarGutter: 'stable' }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 py-3 text-white/50">
        <LayoutTemplate className="w-4 h-4" />
        <span className="text-xs font-medium uppercase tracking-wider">Templates</span>
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/30" />
        <input
          type="text"
          placeholder="Search templates..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="
            w-full bg-white/5 border border-white/10 rounded-lg
            pl-9 pr-3 py-2 text-xs text-white
            focus:outline-none focus:border-primary/50
            transition-colors placeholder:text-white/30
          "
        />
      </div>

      {/* Template List */}
      <div className="space-y-2">
        {filteredTemplates.map((template) => (
          <button
            key={template.id}
            onClick={() => onTemplateClick(template)}
            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
              {(() => {
                const Icon = getTemplateIcon(template.id);
                return <Icon className="w-5 h-5" />;
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm text-white font-medium truncate">{template.name}</div>
              <div className="text-xs text-white/40 truncate">{template.nodes.length} nodes</div>
            </div>
          </button>
        ))}
      </div>

      {/* Carousel */}
      {showCarousel && (
        <NodeCarousel
          nodes={NODE_ONBOARDING}
          currentIndex={currentNodeIndex}
          onNavigate={onNodeNavigate}
        />
      )}
    </div>
  );
}
