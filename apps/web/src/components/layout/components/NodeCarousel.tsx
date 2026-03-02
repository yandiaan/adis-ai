import { ChevronLeft, ChevronRight } from 'lucide-react';
import { renderNodeTypeIcon } from '../../canvas/icons/nodeTypeIcon';
import { NODE_CATEGORIES } from '../../canvas/config/nodeCategories';
import type { NodeCategory } from '../../canvas/types/node-types';
import type { OnboardingNode } from '../constants/nodeOnboarding';

interface NodeCarouselProps {
  nodes: OnboardingNode[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function NodeCarousel({ nodes, currentIndex, onNavigate }: NodeCarouselProps) {
  const currentNode = nodes[currentIndex];
  const categoryConfig = currentNode ? NODE_CATEGORIES[currentNode.category as NodeCategory] : null;

  return (
    <div
      className="mt-16 p-3 rounded-lg border border-white/10 flex flex-col gap-3"
      style={{
        minHeight: '240px',
        maxHeight: '240px',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-white/70">
          Learn Nodes
        </span>
        <span className="text-xs text-white/40">
          {currentIndex + 1} / {nodes.length}
        </span>
      </div>

      {/* Node Preview */}
      {currentNode && (
        <div className="flex flex-col gap-2 flex-1 overflow-hidden">
          <div className="flex items-start gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
              style={{
                backgroundColor: categoryConfig?.bgColor,
                border: `1.5px solid ${categoryConfig?.color}`,
              }}
            >
              <div style={{ color: categoryConfig?.color }}>
                {renderNodeTypeIcon(currentNode.nodeType)}
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div
                className="text-sm font-semibold tracking-[0.2px] line-clamp-1"
                style={{ color: categoryConfig?.color }}
              >
                {currentNode.title}
              </div>
              <div className="text-xs text-white/60" style={{ color: categoryConfig?.color }}>
                {categoryConfig?.label || currentNode.category}
              </div>
            </div>
          </div>
          <div className="text-xs text-white/70 leading-relaxed">{currentNode.description}</div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center gap-2 justify-center">
        <button
          onClick={() => onNavigate((currentIndex - 1 + nodes.length) % nodes.length)}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex gap-1">
          {nodes.map((node, idx) => {
            const nodeCategoryConfig = NODE_CATEGORIES[node.category as NodeCategory];
            return (
              <button
                key={idx}
                onClick={() => onNavigate(idx)}
                className={`w-2 h-2 rounded-full transition-all ${
                  idx === currentIndex ? 'w-4' : 'bg-white/20'
                }`}
                style={{
                  backgroundColor: idx === currentIndex ? nodeCategoryConfig?.color : undefined,
                }}
              />
            );
          })}
        </div>

        <button
          onClick={() => onNavigate((currentIndex + 1) % nodes.length)}
          className="w-8 h-8 rounded flex items-center justify-center hover:bg-white/10 transition-colors text-white/70 hover:text-white"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
