import { useCallback, useEffect, useRef, useState } from 'react';
import type { ManualEditorConfig, DrawingPath, TextLayer } from '../types/node-types';

interface UseCanvasEditorOptions {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  config: ManualEditorConfig;
  onConfigChange: (updates: Partial<ManualEditorConfig>) => void;
}

interface UseCanvasEditorReturn {
  isDrawing: boolean;
  startDrawing: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  draw: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  stopDrawing: () => void;
  handleDoubleClick: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  clearDrawings: () => void;
  addTextLayer: (text: string) => void;
  updateTextLayer: (id: string, updates: Partial<TextLayer>) => void;
  removeTextLayer: (id: string) => void;
  selectedTextId: string | null;
  setSelectedTextId: (id: string | null) => void;
  editingTextId: string | null;
  setEditingTextId: (id: string | null) => void;
  exportToDataUrl: () => string | null;
  redraw: () => void;
}

export function getFontFamily(font: string): string {
  switch (font) {
    case 'inter':
      return 'Inter, system-ui, sans-serif';
    case 'impact':
      return 'Impact, Haettenschweiler, sans-serif';
    case 'arabic-display':
      return '"Noto Sans Arabic", "Arabic Typesetting", sans-serif';
    case 'comic-neue':
      return '"Comic Neue", "Comic Sans MS", cursive';
    default:
      return 'Inter, system-ui, sans-serif';
  }
}

const RESIZE_HANDLE = 8; // px half-size of resize handle hit area

export function useCanvasEditor({
  canvasRef,
  config,
  onConfigChange,
}: UseCanvasEditorOptions): UseCanvasEditorReturn {
  const [isDrawing, setIsDrawing] = useState(false);
  const [selectedTextId, setSelectedTextId] = useState<string | null>(null);
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // ── Refs (avoid stale closures) ──────────────────────────────────────────
  // KEY FIX: store config & selectedTextId in refs so `redraw` stays stable
  const configRef = useRef(config);
  configRef.current = config;

  const selectedTextIdRef = useRef(selectedTextId);
  selectedTextIdRef.current = selectedTextId;

  // For freehand drawing
  const isDrawingRef = useRef(false);
  const currentPathRef = useRef<{ x: number; y: number }[]>([]);

  // Live overrides during drag/resize — avoids calling onConfigChange on every mousemove
  const dragOverrideRef = useRef<{
    id: string;
    x?: number;
    y?: number;
    fontSize?: number;
  } | null>(null);

  // Drag state
  const isDraggingTextRef = useRef(false);
  const dragStartRef = useRef<{
    mouseX: number;
    mouseY: number;
    textX: number;
    textY: number;
    textId: string;
  } | null>(null);

  // Resize state
  const isResizingTextRef = useRef(false);
  const resizeStartRef = useRef<{
    mouseX: number;
    startFontSize: number;
    textId: string;
  } | null>(null);

  // ── Coordinate helpers ───────────────────────────────────────────────────
  const getCanvasCoordinates = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return { x: 0, y: 0 };
      const rect = canvas.getBoundingClientRect();
      return {
        x: (e.clientX - rect.left) * (canvas.width / rect.width),
        y: (e.clientY - rect.top) * (canvas.height / rect.height),
      };
    },
    [canvasRef]
  );

  // Hit-test a text layer (reading from ref so it's always fresh)
  const getLayerPosition = (layer: TextLayer) => {
    const o = dragOverrideRef.current;
    return {
      x: o && o.id === layer.id && o.x !== undefined ? o.x : layer.x,
      y: o && o.id === layer.id && o.y !== undefined ? o.y : layer.y,
      fontSize:
        o && o.id === layer.id && o.fontSize !== undefined ? o.fontSize : layer.fontSize,
    };
  };

  const hitTestText = useCallback(
    (x: number, y: number): string | null => {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const layers = configRef.current.textLayers;
      for (let i = layers.length - 1; i >= 0; i--) {
        const l = layers[i];
        const { x: lx, y: ly, fontSize } = getLayerPosition(l);
        ctx.font = `${fontSize}px ${getFontFamily(l.font)}`;
        const maxTextWidth = canvas.width - lx - 10;
        const lines = wrapText(ctx, l.text, maxTextWidth);
        const maxLineW = Math.max(...lines.map((line) => ctx.measureText(line).width));
        const totalH = lines.length * fontSize * 1.2;
        const pad = 6;
        if (x >= lx - pad && x <= lx + maxLineW + pad && y >= ly - pad && y <= ly + totalH + pad) {
          return l.id;
        }
      }
      return null;
    },
    [canvasRef]
  );

  const hitTestResizeHandle = useCallback(
    (x: number, y: number, targetId: string): boolean => {
      const canvas = canvasRef.current;
      if (!canvas) return false;
      const ctx = canvas.getContext('2d');
      if (!ctx) return false;
      const layers = configRef.current.textLayers;
      const l = layers.find((ll) => ll.id === targetId);
      if (!l) return false;
      const { x: lx, y: ly, fontSize } = getLayerPosition(l);
      ctx.font = `${fontSize}px ${getFontFamily(l.font)}`;
      const maxTextWidth = canvas.width - lx - 10;
      const lines = wrapText(ctx, l.text, maxTextWidth);
      const maxLineW = Math.max(...lines.map((line) => ctx.measureText(line).width));
      const totalH = lines.length * fontSize * 1.2;
      const hx = lx + maxLineW + 4;
      const hy = ly + totalH + 4;
      return Math.abs(x - hx) <= RESIZE_HANDLE && Math.abs(y - hy) <= RESIZE_HANDLE;
    },
    [canvasRef]
  );

  // ── Word-wrap helper ─────────────────────────────────────────────────────
  const wrapText = (
    ctx: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] => {
    if (maxWidth <= 0) return [text];
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (ctx.measureText(test).width > maxWidth && current) {
        lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines.length ? lines : [text];
  };

  // ── Stable redraw (depends only on canvasRef) ────────────────────────────
  // Uses configRef / selectedTextIdRef so the function identity stays constant
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const cfg = configRef.current;
    const selId = selectedTextIdRef.current;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Saved paths
    cfg.drawings.forEach((path) => {
      if (path.points.length < 2) return;
      ctx.beginPath();
      ctx.strokeStyle = path.color;
      ctx.lineWidth = path.strokeWidth;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(path.points[0].x, path.points[0].y);
      for (let i = 1; i < path.points.length; i++) ctx.lineTo(path.points[i].x, path.points[i].y);
      ctx.stroke();
    });

    // In-progress path
    if (currentPathRef.current.length >= 2) {
      ctx.beginPath();
      ctx.strokeStyle = cfg.brushColor;
      ctx.lineWidth = cfg.brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.moveTo(currentPathRef.current[0].x, currentPathRef.current[0].y);
      for (let i = 1; i < currentPathRef.current.length; i++)
        ctx.lineTo(currentPathRef.current[i].x, currentPathRef.current[i].y);
      ctx.stroke();
    }

    // Text layers
    cfg.textLayers.forEach((layer) => {
      const { x, y, fontSize } = getLayerPosition(layer);

      ctx.font = `${fontSize}px ${getFontFamily(layer.font)}`;
      ctx.textBaseline = 'top';

      // Word-wrap text within canvas bounds
      const maxTextWidth = canvas.width - x - 10;
      const lines = wrapText(ctx, layer.text, maxTextWidth);
      const lineHeight = fontSize * 1.2;
      const totalHeight = lines.length * lineHeight;

      lines.forEach((line, idx) => {
        const ly = y + idx * lineHeight;
        if (layer.stroke) {
          ctx.strokeStyle = layer.strokeColor;
          ctx.lineWidth = Math.max(2, fontSize / 10);
          ctx.strokeText(line, x, ly);
        }
        ctx.fillStyle = layer.color;
        ctx.fillText(line, x, ly);
      });

      // Selection box + resize handle
      if (layer.id === selId) {
        const maxLineW = Math.max(...lines.map((l) => ctx.measureText(l).width));

        // Dashed selection box
        ctx.strokeStyle = '#60a5fa';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 4]);
        ctx.strokeRect(x - 4, y - 4, maxLineW + 8, totalHeight + 8);
        ctx.setLineDash([]);

        // Corner handles
        ctx.fillStyle = '#60a5fa';
        [[x - 4, y - 4], [x + maxLineW + 4, y - 4], [x - 4, y + totalHeight + 4]].forEach(([cx, cy]) =>
          ctx.fillRect(cx - 3, cy - 3, 6, 6)
        );

        // Resize handle — bottom-right (distinct orange)
        const rx = x + maxLineW + 4;
        const ry = y + totalHeight + 4;
        ctx.fillStyle = '#fb923c';
        ctx.fillRect(rx - 5, ry - 5, 10, 10);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.strokeRect(rx - 5, ry - 5, 10, 10);
      }
    });
  }, [canvasRef]); // ← stable: only depends on canvasRef

  // Trigger redraw when config or selection changes
  useEffect(() => {
    redraw();
  }, [config, selectedTextId, redraw]);

  // Store activeTool in ref so startDrawing stays stable
  const activeToolRef = useRef(config.activeTool);
  activeToolRef.current = config.activeTool;

  // ── Mouse Down ───────────────────────────────────────────────────────────
  const startDrawing = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoordinates(e);
      const activeTool = activeToolRef.current;

      if (activeTool === 'select') {
        const currSelId = selectedTextIdRef.current;

        // Check resize handle first (only when a layer is selected)
        if (currSelId && hitTestResizeHandle(coords.x, coords.y, currSelId)) {
          const layer = configRef.current.textLayers.find((l) => l.id === currSelId);
          if (layer) {
            isResizingTextRef.current = true;
            resizeStartRef.current = {
              mouseX: coords.x,
              startFontSize: layer.fontSize,
              textId: currSelId,
            };
          }
          return;
        }

        // Check drag
        const hitId = hitTestText(coords.x, coords.y);
        if (hitId) {
          setSelectedTextId(hitId);
          selectedTextIdRef.current = hitId; // Update ref immediately
          const layer = configRef.current.textLayers.find((l) => l.id === hitId)!;
          const { x: lx, y: ly } = getLayerPosition(layer);
          isDraggingTextRef.current = true;
          dragStartRef.current = {
            mouseX: coords.x,
            mouseY: coords.y,
            textX: lx,
            textY: ly,
            textId: hitId,
          };
        } else {
          setSelectedTextId(null);
          selectedTextIdRef.current = null;
        }
        return;
      }

      if (activeTool === 'draw') {
        setIsDrawing(true);
        isDrawingRef.current = true;
        currentPathRef.current = [coords];
      }
    },
    [getCanvasCoordinates, hitTestText, hitTestResizeHandle]
  );

  // ── Mouse Move ───────────────────────────────────────────────────────────
  const draw = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const coords = getCanvasCoordinates(e);

      // Resize
      if (isResizingTextRef.current && resizeStartRef.current) {
        const rs = resizeStartRef.current;
        const delta = coords.x - rs.mouseX;
        const newSize = Math.max(10, Math.round(rs.startFontSize + delta * 0.5));
        dragOverrideRef.current = { id: rs.textId, fontSize: newSize };
        // Preserve existing x/y from config
        const layer = configRef.current.textLayers.find((l) => l.id === rs.textId);
        if (layer) {
          dragOverrideRef.current = { id: rs.textId, x: layer.x, y: layer.y, fontSize: newSize };
        }
        redraw();
        return;
      }

      // Drag
      if (isDraggingTextRef.current && dragStartRef.current) {
        const ds = dragStartRef.current;
        dragOverrideRef.current = {
          id: ds.textId,
          x: ds.textX + (coords.x - ds.mouseX),
          y: ds.textY + (coords.y - ds.mouseY),
        };
        redraw();
        return;
      }

      // Freehand — read from refs only, no closure dependency on isDrawing/config
      if (!isDrawingRef.current || activeToolRef.current !== 'draw') return;
      currentPathRef.current.push(coords);
      redraw();
    },
    [getCanvasCoordinates, redraw]
  );

  // ── Mouse Up ─────────────────────────────────────────────────────────────
  const stopDrawing = useCallback(() => {
    // Commit resize
    if (isResizingTextRef.current && dragOverrideRef.current) {
      const { id, fontSize } = dragOverrideRef.current;
      if (fontSize !== undefined) {
        onConfigChange({
          textLayers: configRef.current.textLayers.map((l) =>
            l.id === id ? { ...l, fontSize } : l
          ),
        });
      }
      isResizingTextRef.current = false;
      resizeStartRef.current = null;
      dragOverrideRef.current = null;
      return;
    }

    // Commit drag
    if (isDraggingTextRef.current && dragOverrideRef.current) {
      const { id, x, y } = dragOverrideRef.current;
      if (x !== undefined && y !== undefined) {
        onConfigChange({
          textLayers: configRef.current.textLayers.map((l) =>
            l.id === id ? { ...l, x, y } : l
          ),
        });
      }
      isDraggingTextRef.current = false;
      dragStartRef.current = null;
      dragOverrideRef.current = null;
      return;
    }

    // Commit freehand — read from ref, not closure
    if (!isDrawingRef.current) return;
    setIsDrawing(false);
    isDrawingRef.current = false;
    if (currentPathRef.current.length >= 2) {
      const newPath: DrawingPath = {
        points: [...currentPathRef.current],
        color: configRef.current.brushColor,
        strokeWidth: configRef.current.brushSize,
      };
      onConfigChange({ drawings: [...configRef.current.drawings, newPath] });
    }
    currentPathRef.current = [];
  }, [onConfigChange]);

  // ── Double Click — enter inline text edit ────────────────────────────────
  const handleDoubleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (activeToolRef.current !== 'select') return;
      const coords = getCanvasCoordinates(e);
      const hitId = hitTestText(coords.x, coords.y);
      if (hitId) {
        setSelectedTextId(hitId);
        setEditingTextId(hitId);
      }
    },
    [getCanvasCoordinates, hitTestText]
  );

  // ── Actions ──────────────────────────────────────────────────────────────
  const clearDrawings = useCallback(() => {
    onConfigChange({ drawings: [] });
  }, [onConfigChange]);

  const addTextLayer = useCallback(
    (text: string) => {
      if (!text.trim()) return;
      const canvas = canvasRef.current;
      const cfg = configRef.current;
      const newLayer: TextLayer = {
        id: `text-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        text,
        x: canvas ? canvas.width / 4 : 50,
        y: canvas ? canvas.height / 2 : 100,
        font: cfg.textFont,
        fontSize: cfg.textSize,
        color: cfg.textColor,
        stroke: cfg.textStroke,
        strokeColor: cfg.textStrokeColor,
      };
      onConfigChange({
        textLayers: [...cfg.textLayers, newLayer],
        activeTool: 'select',
      });
      setSelectedTextId(newLayer.id);
    },
    [canvasRef, onConfigChange]
  );

  const updateTextLayer = useCallback(
    (id: string, updates: Partial<TextLayer>) => {
      onConfigChange({
        textLayers: configRef.current.textLayers.map((l) =>
          l.id === id ? { ...l, ...updates } : l
        ),
      });
    },
    [onConfigChange]
  );

  const removeTextLayer = useCallback(
    (id: string) => {
      onConfigChange({
        textLayers: configRef.current.textLayers.filter((l) => l.id !== id),
      });
      if (selectedTextIdRef.current === id) setSelectedTextId(null);
      if (editingTextId === id) setEditingTextId(null);
    },
    [editingTextId, onConfigChange]
  );

  const exportToDataUrl = useCallback(() => {
    return canvasRef.current?.toDataURL('image/png') ?? null;
  }, [canvasRef]);

  return {
    isDrawing,
    startDrawing,
    draw,
    stopDrawing,
    handleDoubleClick,
    clearDrawings,
    addTextLayer,
    updateTextLayer,
    removeTextLayer,
    selectedTextId,
    setSelectedTextId,
    editingTextId,
    setEditingTextId,
    exportToDataUrl,
    redraw,
  };
}
