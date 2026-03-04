import { useRef, useState, useEffect } from 'react';

/**
 * Debounced color input — prevents flooding React Flow with ~60 `updateNodeData`
 * calls per second while the user drags the color picker, which causes
 * "Maximum update depth exceeded" errors.
 *
 * Keeps local state for instant visual feedback and only commits the final
 * value to the parent after the user stops dragging (150ms debounce).
 */
export function ColorInput({
  value,
  onChange,
  className,
  style,
}: {
  value: string;
  onChange: (val: string) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  const [local, setLocal] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync local state when the parent resets the value externally
  useEffect(() => {
    setLocal(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setLocal(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(v), 150);
  };

  return (
    <input
      type="color"
      value={local}
      onChange={handleChange}
      className={className}
      style={style}
    />
  );
}
