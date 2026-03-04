/**
 * DashScope (Alibaba Model Studio) service.
 * Integrates with Qwen for text generation, Qwen-Image/Wan for image generation,
 * Qwen-Image-Edit for image editing, and Wan for video generation.
 *
 * API reference:
 * - Text generation: OpenAI-compatible Chat Completions API
 * - Text-to-image: POST /api/v1/services/aigc/text2image/image-synthesis (async)
 * - Image editing: POST /api/v1/services/aigc/multimodal-generation/generation (sync)
 * - Text-to-video: POST /api/v1/services/aigc/video-generation/video-synthesis (async)
 * - Image-to-video: POST /api/v1/services/aigc/video-generation/video-synthesis (async)
 * - Task polling: GET /api/v1/tasks/{task_id}
 */

import OpenAI from 'openai';
import { env } from '@/config/env';
import { readFile } from 'fs/promises';
import { join } from 'path';

const DASHSCOPE_API_KEY = env.DASHSCOPE_API_KEY;
const DASHSCOPE_BASE_URL = 'https://dashscope-intl.aliyuncs.com/compatible-mode/v1';
const DASHSCOPE_API_BASE = 'https://dashscope-intl.aliyuncs.com/api/v1';

/**
 * Convert image URL to Base64 data URL if it's a local file.
 * DashScope API requires either a public URL (http/https) or Base64 data URL.
 */
async function convertImageToBase64(imageUrl: string): Promise<string> {
  console.log('[convertImageToBase64] Original URL:', imageUrl);

  // If it's already a public URL or data URL, return as-is
  if (
    imageUrl.startsWith('http://') ||
    imageUrl.startsWith('https://') ||
    imageUrl.startsWith('data:')
  ) {
    console.log('[convertImageToBase64] Using public URL as-is');
    return imageUrl;
  }

  // Handle local file paths (e.g., /uploads/filename.jpg or uploads/filename.jpg)
  let fileName: string | null = null;
  if (imageUrl.startsWith('/uploads/')) {
    fileName = imageUrl.replace('/uploads/', '');
  } else if (imageUrl.startsWith('uploads/')) {
    fileName = imageUrl.replace('uploads/', '');
  } else if (!imageUrl.includes('://') && !imageUrl.startsWith('/')) {
    // Assume it's just a filename in the uploads folder
    fileName = imageUrl;
  }

  if (fileName) {
    const filePath = join(process.cwd(), 'uploads', fileName);
    console.log('[convertImageToBase64] Reading file:', filePath);
    try {
      const buffer = await readFile(filePath);
      const ext = fileName.split('.').pop()?.toLowerCase() || 'png';
      const mimeType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';
      const base64Url = `data:${mimeType};base64,${buffer.toString('base64')}`;
      console.log('[convertImageToBase64] Converted to base64, length:', base64Url.length);
      return base64Url;
    } catch (err) {
      console.error('[convertImageToBase64] Failed to read file:', err);
      throw new Error(`Failed to read image file: ${fileName}`);
    }
  }

  // Unknown format, throw error
  console.error('[convertImageToBase64] Unknown image URL format:', imageUrl);
  throw new Error(
    `Invalid image URL format. Must be http/https URL, data URL, or /uploads/ path. Got: ${imageUrl}`,
  );
}

function createClient(): OpenAI {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY not configured');
  }
  return new OpenAI({
    apiKey: DASHSCOPE_API_KEY,
    baseURL: DASHSCOPE_BASE_URL,
  });
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface QwenMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface TextGenerationParams {
  model?: string;
  messages: QwenMessage[];
  temperature?: number;
  max_tokens?: number;
}

export interface ImageGenerationParams {
  model?: string;
  prompt: string;
  negative_prompt?: string;
  size?: string;
  n?: number;
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}

export interface ImageEditParams {
  model?: string;
  images: string[];
  text: string;
  n?: number;
  size?: string;
  negative_prompt?: string;
  prompt_extend?: boolean;
  watermark?: boolean;
  seed?: number;
}

export interface TextToVideoParams {
  model?: string;
  prompt: string;
  size?: string;
  duration?: number;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
  watermark?: boolean;
  audio_url?: string;
}

export interface ImageToVideoParams {
  model?: string;
  prompt: string;
  img_url: string;
  resolution?: string;
  duration?: number;
  shot_type?: 'single' | 'multi';
  prompt_extend?: boolean;
  watermark?: boolean;
  audio_url?: string;
}

export interface VideoRepaintingParams {
  prompt: string;
  video_url: string;
  control_condition: 'posebodyface' | 'posebody' | 'depth' | 'scribble';
  strength?: number;
  ref_images_url?: string[];
  prompt_extend?: boolean;
}

export interface VideoExtensionParams {
  prompt: string;
  first_clip_url?: string;
  last_clip_url?: string;
  first_frame_url?: string;
  last_frame_url?: string;
  prompt_extend?: boolean;
}

interface TaskResponse {
  request_id: string;
  output: {
    task_id: string;
    task_status: string;
  };
}

interface TaskStatusResponse {
  request_id: string;
  output: {
    task_id: string;
    task_status: 'PENDING' | 'RUNNING' | 'SUCCEEDED' | 'FAILED' | 'UNKNOWN';
    // Image tasks return results array
    results?: Array<{ url: string }>;
    // Video tasks return video_url
    video_url?: string;
    task_metrics?: {
      TOTAL: number;
      SUCCEEDED: number;
      FAILED: number;
    };
    message?: string;
    code?: string;
  };
}

interface ImageEditResponse {
  request_id: string;
  output: {
    choices: Array<{
      finish_reason: string;
      message: {
        role: string;
        content: Array<{ image?: string; text?: string }>;
      };
    }>;
  };
  usage?: {
    image_count: number;
    width: number;
    height: number;
  };
}

function getAuthHeaders() {
  if (!DASHSCOPE_API_KEY) {
    throw new Error('DASHSCOPE_API_KEY not configured');
  }
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${DASHSCOPE_API_KEY}`,
  };
}

// ─── Text Generation (OpenAI-compatible) ─────────────────────────────────────

/**
 * Generate text using Qwen model via OpenAI-compatible Chat Completions API.
 */
export async function generateText(params: TextGenerationParams): Promise<string> {
  const client = createClient();
  const completion = await client.chat.completions.create({
    model: params.model || 'qwen-flash',
    messages: params.messages,
    temperature: params.temperature ?? 0.7,
    max_tokens: params.max_tokens ?? 1500,
  });

  return completion.choices[0]?.message?.content || '';
}

// ─── Vision / Image-to-Text (OpenAI-compatible multimodal) ───────────────────

export interface DescribeImageParams {
  model?: string;
  image_url: string;
  system_prompt?: string;
  temperature?: number;
  max_tokens?: number;
}

/**
 * Describe an image using Qwen VL model via OpenAI-compatible API.
 * Sends the image as a multimodal message content array.
 */
export async function describeImage(params: DescribeImageParams): Promise<string> {
  const client = createClient();
  const imageUrl = await convertImageToBase64(params.image_url);

  const completion = await client.chat.completions.create({
    model: params.model || 'qwen2.5-vl-3b-instruct',
    messages: [
      ...(params.system_prompt ? [{ role: 'system' as const, content: params.system_prompt }] : []),
      {
        role: 'user' as const,
        content: [
          { type: 'image_url' as const, image_url: { url: imageUrl } },
          { type: 'text' as const, text: 'Describe this image.' },
        ],
      },
    ],
    temperature: params.temperature ?? 0.3,
    max_tokens: params.max_tokens ?? 500,
  });

  return completion.choices[0]?.message?.content || '';
}

// ─── Image Generation (async task) ───────────────────────────────────────────

/**
 * Submit text-to-image generation task.
 * Supports Qwen-Image and Wan models.
 * Returns a task ID for polling.
 */
export async function generateImage(params: ImageGenerationParams): Promise<string> {
  const body = {
    model: params.model || 'wan2.1-t2i-turbo',
    input: {
      prompt: params.prompt,
    },
    parameters: {
      size: params.size || '1024*1024',
      n: params.n || 1,
      prompt_extend: params.prompt_extend ?? true,
      watermark: params.watermark ?? false,
      ...(params.negative_prompt && { negative_prompt: params.negative_prompt }),
      ...(params.seed != null && { seed: params.seed }),
    },
  };

  const response = await fetch(`${DASHSCOPE_API_BASE}/services/aigc/text2image/image-synthesis`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'X-DashScope-Async': 'enable',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image Generation API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TaskResponse;
  return data.output.task_id;
}

// ─── Image Editing (synchronous) ─────────────────────────────────────────────

/**
 * Edit images using Qwen-Image-Edit model.
 * Supports 1-3 input images. Returns output image URLs directly (synchronous).
 */
export async function editImage(params: ImageEditParams): Promise<string[]> {
  const content: Array<{ image?: string; text?: string }> = [];
  for (const imageUrl of params.images) {
    const convertedUrl = await convertImageToBase64(imageUrl);
    content.push({ image: convertedUrl });
  }
  content.push({ text: params.text });

  const body = {
    model: params.model || 'qwen-image-edit-plus',
    input: {
      messages: [
        {
          role: 'user',
          content,
        },
      ],
    },
    parameters: {
      n: params.n || 1,
      prompt_extend: params.prompt_extend ?? true,
      watermark: params.watermark ?? false,
      ...(params.size && { size: params.size }),
      ...(params.negative_prompt && { negative_prompt: params.negative_prompt }),
      ...(params.seed != null && { seed: params.seed }),
    },
  };

  const response = await fetch(
    `${DASHSCOPE_API_BASE}/services/aigc/multimodal-generation/generation`,
    {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image Edit API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as ImageEditResponse;
  const choice = data.output.choices[0];
  if (!choice) throw new Error('No output from image edit API');

  return choice.message.content.filter((item) => item.image).map((item) => item.image!);
}

// ─── Text-to-Video (async task) ──────────────────────────────────────────────

/**
 * Submit text-to-video generation task.
 * Returns a task ID for polling.
 */
export async function generateVideo(params: TextToVideoParams): Promise<string> {
  const body = {
    model: params.model || 'wan2.1-t2v-turbo',
    input: {
      prompt: params.prompt,
      ...(params.audio_url && { audio_url: params.audio_url }),
    },
    parameters: {
      size: params.size || '1280*720',
      duration: params.duration ?? 5,
      prompt_extend: params.prompt_extend ?? true,
      watermark: params.watermark ?? false,
      ...(params.shot_type && { shot_type: params.shot_type }),
    },
  };

  const response = await fetch(
    `${DASHSCOPE_API_BASE}/services/aigc/video-generation/video-synthesis`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Text-to-Video API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TaskResponse;
  return data.output.task_id;
}

// ─── Image-to-Video (async task) ─────────────────────────────────────────────

/**
 * Submit image-to-video generation task.
 * Uses the same endpoint as text-to-video but with i2v models and img_url input.
 * Returns a task ID for polling.
 */
export async function generateVideoFromImage(params: ImageToVideoParams): Promise<string> {
  const body = {
    model: params.model || 'wan2.1-i2v-turbo',
    input: {
      prompt: params.prompt,
      img_url: params.img_url,
      ...(params.audio_url && { audio_url: params.audio_url }),
    },
    parameters: {
      resolution: params.resolution || '720P',
      duration: params.duration ?? 5,
      prompt_extend: params.prompt_extend ?? true,
      watermark: params.watermark ?? false,
      ...(params.shot_type && { shot_type: params.shot_type }),
    },
  };

  const response = await fetch(
    `${DASHSCOPE_API_BASE}/services/aigc/video-generation/video-synthesis`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Image-to-Video API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TaskResponse;
  return data.output.task_id;
}

// ─── Task Polling ────────────────────────────────────────────────────────────

/**
 * Poll a DashScope async task until completion.
 * Handles both image tasks (results[].url) and video tasks (video_url).
 * Returns result URLs on success, throws on failure.
 */
export async function pollTask(
  taskId: string,
  maxAttempts = 60,
  intervalMs = 3000,
): Promise<string[]> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const response = await fetch(`${DASHSCOPE_API_BASE}/tasks/${taskId}`, {
      method: 'GET',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error(`Task poll error (${response.status})`);
    }

    const data = (await response.json()) as TaskStatusResponse;
    const status = data.output.task_status;

    if (status === 'SUCCEEDED') {
      // Video tasks return video_url
      if (data.output.video_url) {
        return [data.output.video_url];
      }
      // Image tasks return results array
      if (data.output.results) {
        return data.output.results.map((r) => r.url);
      }
      return [];
    }

    if (status === 'FAILED') {
      throw new Error(`Task failed: ${data.output.message || data.output.code || 'Unknown error'}`);
    }

    // Still running — wait and retry
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error(`Task ${taskId} timed out after ${maxAttempts} attempts`);
}

// ─── Video Repainting (wan2.1-vace-plus) ─────────────────────────────────────

/**
 * Submit video repainting task using wan2.1-vace-plus.
 * Extracts pose/depth/scribble from the input video and repaints it with a new prompt.
 * Returns a task ID for polling.
 */
export async function repaintVideo(params: VideoRepaintingParams): Promise<string> {
  const body = {
    model: 'wan2.1-vace-plus',
    input: {
      function: 'video_repainting',
      prompt: params.prompt,
      video_url: params.video_url,
      ...(params.ref_images_url?.length && { ref_images_url: params.ref_images_url }),
    },
    parameters: {
      control_condition: params.control_condition,
      prompt_extend: params.prompt_extend ?? false,
      watermark: false,
      ...(params.strength != null && { strength: params.strength }),
    },
  };

  const response = await fetch(
    `${DASHSCOPE_API_BASE}/services/aigc/video-generation/video-synthesis`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Video Repainting API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TaskResponse;
  return data.output.task_id;
}

// ─── Video Extension (wan2.1-vace-plus) ──────────────────────────────────────

/**
 * Submit video extension task using wan2.1-vace-plus.
 * Predicts and generates 5s of content from an input clip or frame.
 * Returns a task ID for polling.
 */
export async function extendVideo(params: VideoExtensionParams): Promise<string> {
  const body = {
    model: 'wan2.1-vace-plus',
    input: {
      function: 'video_extension',
      prompt: params.prompt,
      ...(params.first_clip_url && { first_clip_url: params.first_clip_url }),
      ...(params.last_clip_url && { last_clip_url: params.last_clip_url }),
      ...(params.first_frame_url && { first_frame_url: params.first_frame_url }),
      ...(params.last_frame_url && { last_frame_url: params.last_frame_url }),
    },
    parameters: {
      prompt_extend: params.prompt_extend ?? false,
      watermark: false,
    },
  };

  const response = await fetch(
    `${DASHSCOPE_API_BASE}/services/aigc/video-generation/video-synthesis`,
    {
      method: 'POST',
      headers: {
        ...getAuthHeaders(),
        'X-DashScope-Async': 'enable',
      },
      body: JSON.stringify(body),
    },
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Video Extension API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as TaskResponse;
  return data.output.task_id;
}
