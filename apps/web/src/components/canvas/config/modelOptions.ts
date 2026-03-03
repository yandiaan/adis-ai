export interface ModelOption {
  id: string;
  label: string;
  badge: string;
  desc: string;
  price: string;
  /** Marked as the recommended default for local development (cheapest/fastest) */
  devDefault?: boolean;
}

export const MODEL_OPTIONS = {
  textGeneration: [
    { id: 'qwen-flash', label: 'Flash', badge: '⚡', desc: 'Fast & cheap', price: '$0.05/1M', devDefault: true },
    { id: 'qwen-plus', label: 'Plus', badge: '🔥', desc: 'Balanced', price: '$0.4/1M' },
    { id: 'qwen-max', label: 'Max', badge: '💎', desc: 'Most powerful', price: '$1.2/1M' },
  ] as ModelOption[],
  vision: [
    { id: 'qwen2.5-vl-3b-instruct', label: 'VL-3B', badge: '⚡', desc: 'Fast & cheap', price: '$0.21/1M', devDefault: true },
    { id: 'qwen2.5-vl-7b-instruct', label: 'VL-7B', badge: '🔥', desc: 'Balanced', price: '$0.35/1M' },
    { id: 'qwen2.5-vl-72b-instruct', label: 'VL-72B', badge: '💎', desc: 'Most accurate', price: '$2.8/1M' },
  ] as ModelOption[],
  imageGeneration: [
    { id: 'wan2.1-t2i-turbo', label: 'Wan 2.1 Turbo', badge: '⚡', desc: 'Fast', price: '$0.025/img', devDefault: true },
    { id: 'wan2.2-t2i-flash', label: 'Wan 2.2 Flash', badge: '✨', desc: 'Better quality', price: '$0.025/img' },
    { id: 'wan2.6-t2i', label: 'Wan 2.6', badge: '★', desc: 'Recommended', price: '$0.03/img' },
    { id: 'qwen-image-plus', label: 'Qwen Plus', badge: '🔥', desc: 'Text rendering', price: '$0.03/img' },
    { id: 'qwen-image-max', label: 'Qwen Max', badge: '💎', desc: 'Highest quality', price: '$0.075/img' },
  ] as ModelOption[],
  imageEditing: [
    { id: 'qwen-image-edit-plus', label: 'Edit Plus', badge: '⚡', desc: 'Best value', price: '$0.03/img', devDefault: true },
    { id: 'qwen-image-edit-max', label: 'Edit Max', badge: '💎', desc: 'Highest quality', price: '$0.075/img' },
  ] as ModelOption[],
  textToVideo: [
    { id: 'wan2.1-t2v-turbo', label: 'Wan 2.1 Turbo', badge: '⚡', desc: 'Fast', price: '$0.036/s', devDefault: true },
    { id: 'wan2.2-t2v-plus', label: 'Wan 2.2 Plus', badge: '💸', desc: 'Cheaper at 480P', price: '$0.02/s' },
    { id: 'wan2.5-t2v-preview', label: 'Wan 2.5', badge: '🔥', desc: 'Newer + audio', price: '$0.05/s' },
    { id: 'wan2.6-t2v', label: 'Wan 2.6', badge: '★', desc: 'Latest + audio', price: '$0.10/s' },
  ] as ModelOption[],
  imageToVideo: [
    { id: 'wan2.1-i2v-turbo', label: 'Wan 2.1 Turbo', badge: '⚡', desc: 'Fast', price: '$0.036/s', devDefault: true },
    { id: 'wan2.2-i2v-flash', label: 'Wan 2.2 Flash', badge: '💸', desc: 'Cheapest', price: '$0.015/s' },
    { id: 'wan2.6-i2v-flash', label: 'Wan 2.6 Flash', badge: '★', desc: 'Latest + audio', price: '$0.025/s' },
  ] as ModelOption[],
};

export type ModelCategory = keyof typeof MODEL_OPTIONS;

/**
 * Returns the appropriate default model ID for the given category.
 * In development: cheapest/fastest (devDefault).
 * In production: first non-devDefault option (balanced quality).
 */
export function getDefaultModel(category: ModelCategory): string {
  const opts = MODEL_OPTIONS[category];
  const isDev = import.meta.env.DEV;
  if (isDev) {
    return opts.find((o) => o.devDefault)?.id ?? opts[0].id;
  }
  // prod: first non-devDefault (balanced) or first option
  return opts.find((o) => !o.devDefault)?.id ?? opts[0].id;
}

