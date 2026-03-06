import { useState } from 'react';
import { Maximize2 } from 'lucide-react';
import { MediaLightbox } from '../MediaLightbox';

type Props = {
  src: string;
  type: 'image' | 'video';
  /** Max height in px — defaults to 200 */
  maxHeight?: number;
  /** CSS object-fit — defaults to 'contain' */
  objectFit?: 'contain' | 'cover';
  className?: string;
};

export function DrawerMediaPreview({
  src,
  type,
  maxHeight = 200,
  objectFit = 'contain',
  className = '',
}: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);

  return (
    <>
      <div
        className={`relative w-full rounded-xl overflow-hidden border border-white/10 bg-black/30 cursor-pointer group ${className}`}
        style={{ maxHeight }}
        onClick={() => setLightboxOpen(true)}
        title="Klik untuk perbesar"
      >
        {type === 'video' ? (
          <video
            src={src}
            className="w-full block"
            style={{ maxHeight, objectFit, display: 'block' }}
            muted
            playsInline
            onClick={(e) => e.preventDefault()}
          />
        ) : (
          <img
            src={src}
            alt="Preview"
            className="w-full block mx-auto"
            style={{ maxHeight, objectFit, display: 'block' }}
          />
        )}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center pointer-events-none">
          <Maximize2
            size={22}
            className="text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg"
          />
        </div>
      </div>

      {lightboxOpen && (
        <MediaLightbox src={src} type={type} onClose={() => setLightboxOpen(false)} />
      )}
    </>
  );
}
