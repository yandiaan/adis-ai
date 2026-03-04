import type { PipelineTemplate } from '../templates';

const STORAGE_KEY = 'ai-generated-templates';
const MAX_ENTRIES = 20;

function readFromStorage(): PipelineTemplate[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as PipelineTemplate[];
  } catch {
    return [];
  }
}

function writeToStorage(templates: PipelineTemplate[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
  } catch (err: unknown) {
    if (err instanceof DOMException && err.name === 'QuotaExceededError') {
      // Drop oldest entry and retry once
      const trimmed = templates.slice(1);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
      } catch {
        // Give up silently
      }
    }
  }
}

export function useAiTemplates() {
  function getAll(): PipelineTemplate[] {
    return readFromStorage();
  }

  function prepend(template: PipelineTemplate): void {
    const current = readFromStorage();
    // Assign ai- prefixed id with timestamp if not already prefixed
    const withId: PipelineTemplate = template.id.startsWith('ai-')
      ? template
      : { ...template, id: `ai-${Date.now()}` };
    // LIFO: newest first, cap at MAX_ENTRIES
    const updated = [withId, ...current].slice(0, MAX_ENTRIES);
    writeToStorage(updated);
  }

  function clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }

  return { getAll, prepend, clearAll };
}
