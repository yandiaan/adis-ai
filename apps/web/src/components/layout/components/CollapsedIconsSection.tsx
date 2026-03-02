import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import { ALL_TEMPLATES, type PipelineTemplate } from '../../canvas/templates';
import { getTemplateIcon } from '../constants/templateIcons';
import React from 'react';

interface CollapsedIconsSectionProps {
  onTemplateClick: (template: PipelineTemplate) => void;
  templateButtonsRef: React.MutableRefObject<Record<string, HTMLButtonElement>>;
}

export function CollapsedIconsSection({
  onTemplateClick,
  templateButtonsRef,
}: CollapsedIconsSectionProps) {
  return (
    <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarGutter: 'stable' }}>
      <div className="space-y-1 px-2">
        {ALL_TEMPLATES.filter((t) => t.id !== 'blank')
          .slice(0, 5)
          .map((template) => (
            <Tooltip key={template.id}>
              <TooltipTrigger asChild>
                <button
                  ref={(el) => {
                    if (el) templateButtonsRef.current[template.id] = el;
                  }}
                  onClick={() => onTemplateClick(template)}
                  className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white"
                >
                  {(() => {
                    const Icon = getTemplateIcon(template.id);
                    return <Icon className="w-5 h-5" />;
                  })()}
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{template.name}</TooltipContent>
            </Tooltip>
          ))}
      </div>
    </div>
  );
}
