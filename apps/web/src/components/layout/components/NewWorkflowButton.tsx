import { Plus } from 'lucide-react';
import { Tooltip, TooltipTrigger, TooltipContent } from '../../ui/tooltip';
import { useNewWorkflowButtonAnimation, useNewWorkflowButtonHover } from '../hooks/useAnimations';

interface NewWorkflowButtonProps {
  isExpanded: boolean;
  onClick: () => void;
}

export function NewWorkflowButton({ isExpanded, onClick }: NewWorkflowButtonProps) {
  const { buttonRef, textRef } = useNewWorkflowButtonAnimation(isExpanded);
  useNewWorkflowButtonHover();

  return (
    <div className="p-3 pt-4">
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            ref={buttonRef}
            onClick={onClick}
            className={`
              ${isExpanded ? 'w-full px-3 py-2.5' : 'w-12 h-12'} h-12 flex items-center justify-center gap-3
              rounded-lg border border-primary/50 bg-transparent
              hover:bg-primary/10 hover:border-primary
              transition-colors duration-200
              text-white
            `}
          >
            <Plus className="w-5 h-5 shrink-0" />
            {isExpanded && (
              <span ref={textRef} className="text-sm font-medium whitespace-nowrap">
                New Workflow
              </span>
            )}
          </button>
        </TooltipTrigger>
        {!isExpanded && <TooltipContent side="right">New Workflow</TooltipContent>}
      </Tooltip>
    </div>
  );
}
