import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Download } from 'lucide-react';
import { resolveMediaUrl } from '../../utils/runtimeUrl';

type Props = {
  src: string;
  type: 'image' | 'video';
  onClose: () => void;
};

export function MediaLightbox({ src, type, onClose }: Props) {
  const resolvedSrc = resolveMediaUrl(src) ?? src;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onClose]);

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
        <a
          href={resolvedSrc}
          download
          onClick={(e) => e.stopPropagation()}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          title="Download"
        >
          <Download size={16} />
        </a>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/10 border border-white/15 text-white/70 hover:text-white hover:bg-white/20 transition-colors"
          title="Tutup"
        >
          <X size={18} />
        </button>
      </div>

      {/* Media */}
      <div
        className="relative max-w-[90vw] max-h-[85vh] rounded-2xl overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {type === 'video' ? (
          <video
            src={resolvedSrc}
            className="max-w-[90vw] max-h-[85vh] rounded-2xl"
            controls
            autoPlay
            playsInline
          />
        ) : (
          <img
            src={resolvedSrc}
            alt="Output preview"
            className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
          />
        )}
      </div>
    </div>,
    document.body,
  );
}
