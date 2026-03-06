import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Maximize2, X } from 'lucide-react';

interface Props {
  url: string;
  alt?: string;
}

/** Renders an image at its natural aspect ratio (no crop) with a lightbox view button. */
export function NodeImagePreview({ url, alt = 'Preview' }: Props) {
  const [lightbox, setLightbox] = useState(false);

  return (
    <>
      <div
        className="relative group w-full rounded-lg overflow-hidden flex items-center justify-center"
        style={{ background: '#0e0e16' }}
      >
        <img
          src={url}
          alt={alt}
          className="block rounded-lg"
          style={{ maxWidth: '100%', maxHeight: 200, width: 'auto', height: 'auto' }}
        />
        <button
          onClick={(e) => {
            e.stopPropagation();
            setLightbox(true);
          }}
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.42)' }}
        >
          <span
            className="p-1.5 rounded-lg"
            style={{ background: 'rgba(0,0,0,0.65)', border: '1px solid rgba(255,255,255,0.2)' }}
          >
            <Maximize2 size={14} className="text-white" />
          </span>
        </button>
      </div>

      {lightbox &&
        createPortal(
          <div
            className="fixed inset-0 z-[99999] flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.92)' }}
            onClick={() => setLightbox(false)}
          >
            <img
              src={url}
              alt={alt}
              className="max-w-[90vw] max-h-[90vh] object-contain rounded-xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setLightbox(false)}
              className="absolute top-4 right-4 p-2 rounded-full transition-colors"
              style={{
                background: 'rgba(255,255,255,0.1)',
                border: '1px solid rgba(255,255,255,0.2)',
              }}
            >
              <X size={20} className="text-white" />
            </button>
          </div>,
          document.body,
        )}
    </>
  );
}
