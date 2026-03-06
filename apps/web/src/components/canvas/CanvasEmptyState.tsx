import { LayoutTemplate, Sparkles, Plus } from 'lucide-react';

type Props = {
  onOpenTemplatePicker?: () => void;
  onOpenAiPanel?: () => void;
};

export function CanvasEmptyState({ onOpenAiPanel }: Props) {
  const handleOpenSidebar = () => {
    window.dispatchEvent(new CustomEvent('sidebar:expand-templates'));
  };

  const handleAddNode = () => {
    window.dispatchEvent(new KeyboardEvent('keydown', { key: 'N', bubbles: true }));
  };

  return (
    <div
      className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-24"
      aria-label="Canvas kosong — pilih cara memulai"
    >
      <div className="pointer-events-auto flex flex-col items-center gap-6 select-none">
        {/* Heading */}
        <div className="text-center">
          <div className="text-5xl mb-3">🎨</div>
          <h2 className="text-2xl font-bold text-white/90 mb-1">Canvas siap untuk ide kamu</h2>
          <p className="text-white/40 text-sm max-w-xs leading-relaxed">
            Buat pipeline AI pertamamu — susun blok, sambungkan, lalu jalankan.
          </p>
        </div>

        {/* CTA Cards */}
        <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm sm:max-w-none">
          {/* Template — expands sidebar */}
          <button
            onClick={handleOpenSidebar}
            className="group flex items-center gap-3 px-5 py-4 rounded-2xl border border-primary/40 bg-primary/10 hover:bg-primary/20 hover:border-primary/70 transition-all duration-200 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/20 group-hover:bg-primary/30 flex items-center justify-center shrink-0 transition-colors">
              <LayoutTemplate className="w-4 h-4 text-primary" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Gunakan Template</div>
              <div className="text-white/40 text-xs mt-0.5">Lihat di sidebar kiri</div>
            </div>
          </button>

          {/* AI — opens dedicated panel */}
          <button
            onClick={onOpenAiPanel}
            className="group flex items-center gap-3 px-5 py-4 rounded-2xl border border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 hover:border-violet-500/60 transition-all duration-200 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-violet-500/20 group-hover:bg-violet-500/30 flex items-center justify-center shrink-0 transition-colors">
              <Sparkles className="w-4 h-4 text-violet-400" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Minta AI Buatkan</div>
              <div className="text-white/40 text-xs mt-0.5">Deskripsikan, AI yang susun</div>
            </div>
          </button>

          {/* Manual */}
          <button
            data-tour="add-node-btn-hint"
            onClick={handleAddNode}
            className="group flex items-center gap-3 px-5 py-4 rounded-2xl border border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20 transition-all duration-200 text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-white/[0.06] group-hover:bg-white/10 flex items-center justify-center shrink-0 transition-colors">
              <Plus className="w-4 h-4 text-white/60" />
            </div>
            <div>
              <div className="text-white text-sm font-semibold">Buat dari Nol</div>
              <div className="text-white/40 text-xs mt-0.5">Tambah blok satu per satu</div>
            </div>
          </button>
        </div>

        {/* Hint */}
        <p className="text-white/20 text-xs text-center max-w-xs">
          Tekan{' '}
          <kbd className="px-1.5 py-0.5 rounded-md bg-white/10 border border-white/15 text-white/50 font-mono text-[10px]">
            N
          </kbd>{' '}
          untuk langsung tambah blok, atau klik{' '}
          <span className="text-white/40 font-medium">New Node</span> di toolbar atas.
        </p>
      </div>
    </div>
  );
}
