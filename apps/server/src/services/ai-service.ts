/**
 * AI service facade — delegates AI operations to DashScope (Alibaba Model Studio).
 * Uses Qwen for text generation, Qwen-Image/Wan for image generation,
 * Qwen-Image-Edit for image editing, and Wan for video generation.
 */

import * as dashscope from '@/services/dashscope';

/**
 * Generate text using Qwen model.
 */
export async function generateText(params: {
  model?: string;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  return dashscope.generateText(params);
}

/**
 * Describe an image using Qwen VL model.
 * Uses multimodal input (image + text) to generate a description.
 */
export async function describeImage(params: {
  model?: string;
  image_url: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}): Promise<string> {
  return dashscope.describeImage(params);
}

/**
 * Generate image using Qwen-Image or Wan model.
 * Returns a task ID for polling.
 */
export async function generateImage(params: {
  model?: string;
  prompt: string;
  negative_prompt?: string;
  size?: string;
  n?: number;
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}): Promise<string> {
  return dashscope.generateImage(params);
}

/**
 * Edit images using Qwen-Image-Edit model.
 * Returns output image URLs directly (synchronous).
 */
export async function editImage(params: {
  model?: string;
  images: string[];
  text: string;
  n?: number;
  size?: string;
  negative_prompt?: string;
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}): Promise<string[]> {
  return dashscope.editImage(params);
}

/**
 * Generate video from text using Wan model.
 * Returns a task ID for polling.
 */
export async function generateVideo(params: {
  model?: string;
  prompt: string;
  size?: string;
  duration?: number;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
  watermark?: boolean;
  audio_url?: string;
}): Promise<string> {
  return dashscope.generateVideo(params);
}

/**
 * Generate video from image using Wan i2v model.
 * Returns a task ID for polling.
 */
export async function generateVideoFromImage(params: {
  model?: string;
  prompt: string;
  img_url: string;
  resolution?: string;
  duration?: number;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
  watermark?: boolean;
  audio_url?: string;
}): Promise<string> {
  return dashscope.generateVideoFromImage(params);
}

/**
 * Repaint a video using wan2.1-vace-plus.
 * Extracts pose/depth/sketch from source video and generates a stylistically new video.
 * Returns a task ID for polling.
 */
export async function repaintVideo(params: {
  prompt: string;
  video_url: string;
  control_condition: 'posebodyface' | 'posebody' | 'depth' | 'scribble';
  strength?: number;
  ref_images_url?: string[];
  prompt_extend?: boolean;
}): Promise<string> {
  return dashscope.repaintVideo(params);
}

/**
 * Extend a video using wan2.1-vace-plus.
 * Generates 5s of content from an input clip or frame.
 * Returns a task ID for polling.
 */
export async function extendVideo(params: {
  prompt: string;
  first_clip_url?: string;
  last_clip_url?: string;
  first_frame_url?: string;
  last_frame_url?: string;
  prompt_extend?: boolean;
}): Promise<string> {
  return dashscope.extendVideo(params);
}

/**
 * Poll a DashScope async task until completion.
 * Returns result URLs on success, throws on failure.
 */
export async function pollTask(
  taskId: string,
  maxAttempts?: number,
  intervalMs?: number,
): Promise<string[]> {
  return dashscope.pollTask(taskId, maxAttempts, intervalMs);
}
