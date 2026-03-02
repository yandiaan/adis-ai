import { PanelLeftClose, PanelRight } from 'lucide-react';

interface SidebarToggleProps {
  isExpanded: boolean;
  onClick: () => void;
}

export function SidebarToggle({ isExpanded, onClick }: SidebarToggleProps) {
  return (
    <div className={`px-3 py-3 flex ${isExpanded ? 'justify-start' : 'justify-center'}`}>
      <button
        onClick={onClick}
        className="w-12 h-12 rounded-lg flex items-center justify-center hover:bg-white/10 transition-colors text-white"
      >
        {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelRight className="w-5 h-5" />}
      </button>
    </div>
  );
}
