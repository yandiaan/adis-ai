import { useState, useCallback } from 'react';
import LandingPanel from './landing/LandingPanel';
import FlowCanvas from '@/components/canvas';
import { TemplateSelector } from './canvas/TemplateSelector';
import { WorkspaceSidebar } from './layout/WorkspaceSidebar';
import type { PipelineTemplate } from './canvas/templates';

type AppView = 'landing' | 'template-picker' | 'canvas';

export default function LandingCanvasWrapper() {
  const [view, setView] = useState<AppView>('landing');
  const [canvasKey, setCanvasKey] = useState(0);

  const handleGetStarted = useCallback(() => {
    setView('template-picker');
  }, []);

  const handleSelectTemplate = useCallback((template: PipelineTemplate | null) => {
    // Update URL with template ID so useTemplateLoader can pick it up
    const url = new URL(window.location.href);
    if (template) {
      url.searchParams.set('template', template.id);
    } else {
      url.searchParams.delete('template');
    }
    window.history.replaceState({}, '', url.toString());

    // Increment canvasKey to force FlowCanvas remount with new template
    setCanvasKey((prev) => prev + 1);
    setView('canvas');
  }, []);

  const handleNewWorkflow = useCallback(() => {
    // Clear template and go directly to canvas with empty workflow
    const url = new URL(window.location.href);
    url.searchParams.delete('template');
    window.history.replaceState({}, '', url.toString());

    // Increment canvasKey to force FlowCanvas remount with blank canvas
    setCanvasKey((prev) => prev + 1);
    setView('canvas');
  }, []);

  const handleDismissTemplatePicker = useCallback(() => {
    // Go to canvas with current state
    setView('canvas');
  }, []);

  const handleBackToLanding = useCallback(() => {
    setView('landing');
  }, []);

  // Show sidebar on template-picker and canvas views
  const showSidebar = view !== 'landing';

  return (
    <div className="fixed inset-0 overflow-hidden bg-background">
      {/* Workspace Sidebar - hidden on landing */}
      {showSidebar && (
        <WorkspaceSidebar
          onSelectTemplate={handleSelectTemplate}
          onNewWorkflow={handleNewWorkflow}
          onBackToLanding={handleBackToLanding}
        />
      )}

      {/* Main Content */}
      {view === 'landing' && <LandingPanel onHideLanding={handleGetStarted} />}

      {view === 'template-picker' && (
        <div className={showSidebar ? 'ml-16' : ''}>
          <TemplateSelector
            onSelectTemplate={handleSelectTemplate}
            onClose={canvasKey > 0 ? handleDismissTemplatePicker : undefined}
          />
        </div>
      )}

      {view === 'canvas' && (
        <div className="ml-16 h-full">
          <FlowCanvas key={canvasKey} />
        </div>
      )}
    </div>
  );
}
