import { useState, useRef } from 'react';
import { TooltipProvider } from '../ui/tooltip';
import type { PipelineTemplate } from '../canvas/templates';
import { SidebarHeader } from './components/SidebarHeader';
import { SidebarToggle } from './components/SidebarToggle';
import { NewWorkflowButton } from './components/NewWorkflowButton';
import { TemplatesSection } from './components/TemplatesSection';
import { CollapsedIconsSection } from './components/CollapsedIconsSection';
import { BackToLandingButton } from './components/BackToLandingButton';
import { ConfirmationModal } from './components/ConfirmationModal';
import { useCarousel, useCarouselDelay } from './hooks/useCarousel';

type Props = {
  onSelectTemplate?: (template: PipelineTemplate | null) => void;
  onNewWorkflow?: () => void;
  onBackToLanding?: () => void;
};

export function WorkspaceSidebar({ onSelectTemplate, onNewWorkflow, onBackToLanding }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentNodeIndex, setCurrentNodeIndex] = useState(0);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCarousel, setShowCarousel] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'template' | 'new-workflow';
    template?: PipelineTemplate;
  } | null>(null);

  const templateButtonsRef = useRef<Record<string, HTMLButtonElement>>({});

  // Carousel logic
  useCarousel(9, (newIndex) => setCurrentNodeIndex(newIndex));
  useCarouselDelay(isExpanded, setShowCarousel);

  // Handlers
  const handleTemplateClick = (template: PipelineTemplate) => {
    setPendingAction({ type: 'template', template });
    setShowConfirmModal(true);
  };

  const handleNewWorkflow = () => {
    setPendingAction({ type: 'new-workflow' });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = () => {
    if (!pendingAction) return;

    if (pendingAction.type === 'template' && pendingAction.template) {
      if (onSelectTemplate) {
        onSelectTemplate(pendingAction.template);
      }
    } else if (pendingAction.type === 'new-workflow') {
      if (onNewWorkflow) {
        onNewWorkflow();
      }
    }

    setShowConfirmModal(false);
    setPendingAction(null);
  };

  const handleCancelAction = () => {
    setShowConfirmModal(false);
    setPendingAction(null);
  };

  return (
    <TooltipProvider>
      <ConfirmationModal
        isOpen={showConfirmModal}
        pendingAction={pendingAction}
        onConfirm={handleConfirmAction}
        onCancel={handleCancelAction}
      />

      <aside
        className={`
          fixed left-0 top-0 h-full bg-background border-r border-white/10 z-40
          transition-all duration-300 ease-in-out flex flex-col overflow-x-hidden
          ${isExpanded ? 'w-64' : 'w-16'}
        `}
      >
        <SidebarHeader isExpanded={isExpanded} />
        <SidebarToggle isExpanded={isExpanded} onClick={() => setIsExpanded(!isExpanded)} />
        <NewWorkflowButton isExpanded={isExpanded} onClick={handleNewWorkflow} />

        {isExpanded && (
          <TemplatesSection
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onTemplateClick={handleTemplateClick}
            currentNodeIndex={currentNodeIndex}
            onNodeNavigate={setCurrentNodeIndex}
            showCarousel={showCarousel}
          />
        )}

        {!isExpanded && (
          <CollapsedIconsSection
            onTemplateClick={handleTemplateClick}
            templateButtonsRef={templateButtonsRef}
          />
        )}

        <BackToLandingButton onClick={onBackToLanding} />
      </aside>
    </TooltipProvider>
  );
}
