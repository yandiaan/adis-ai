import { Router, type Router as RouterType } from 'express';
import { z } from 'zod';
import {
  generateText,
  describeImage,
  generateImage,
  editImage,
  generateVideo,
  generateVideoFromImage,
  repaintVideo,
  extendVideo,
  pollTask,
} from '@/services/ai-service';

const router: RouterType = Router();

// --- Prompt Enhancer ---
const promptEnhancerSchema = z.object({
  config: z.object({
    creativity: z.string(),
    contentType: z.string(),
    tone: z.string(),
    language: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    text: z
      .object({
        type: z.literal('text'),
        data: z.object({ text: z.string() }),
      })
      .optional(),
    style: z
      .object({
        type: z.literal('style'),
        data: z.any(),
      })
      .optional(),
  }),
});

router.post('/prompt-enhancer/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = promptEnhancerSchema.parse(req.body);

    const inputText = (inputs.text?.data as { text: string })?.text || '';
    const styleData = inputs.style?.data;

    const temperatureMap: Record<string, number> = { precise: 0.3, balanced: 0.7, creative: 1.0 };
    const temperature = temperatureMap[config.creativity] ?? 0.7;

    const systemPrompt = buildPromptEnhancerSystem(config, styleData);

    const enhancedText = await generateText({
      model: config.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: inputText },
      ],
      temperature,
      max_tokens: 1500,
    });

    res.json({
      output: {
        type: 'prompt',
        data: { prompt: enhancedText, negativePrompt: '' },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

function buildPromptEnhancerSystem(
  config: z.infer<typeof promptEnhancerSchema>['config'],
  styleData?: unknown,
): string {
  let prompt = `You are an expert AI image/video prompt engineer. 
Enhance the user's description into a detailed, high-quality prompt for image/video generation.
Content type: ${config.contentType}. Tone: ${config.tone}.`;

  if (config.language === 'id') {
    prompt +=
      '\nThe user writes in Indonesian. Output the prompt in English for the AI model, but keep Indonesian cultural references.';
  } else if (config.language === 'mixed') {
    prompt += '\nThe user may write in mixed Indonesian/English. Output the prompt in English.';
  }

  if (styleData && typeof styleData === 'object') {
    const s = styleData as Record<string, unknown>;
    if (s.artStyle) prompt += `\nArt style: ${s.artStyle}`;
    if (s.mood) prompt += `\nMood: ${s.mood}`;
    if (s.culturalTheme) prompt += `\nCultural theme: ${s.culturalTheme}`;
  }

  prompt += '\nOutput ONLY the enhanced prompt text, nothing else.';
  return prompt;
}

// --- Image Generator ---
const imageGeneratorSchema = z.object({
  config: z.object({
    mode: z.string(),
    dimensions: z.string(),
    seed: z.number().nullable(),
    prompt_extend: z.boolean().optional(),
    model: z.string().optional(),
    imageEditModel: z.string().optional(),
  }),
  inputs: z.object({
    prompt: z
      .object({
        type: z.literal('prompt'),
        data: z.object({ prompt: z.string(), negativePrompt: z.string().optional() }),
      })
      .optional(),
    style: z.any().optional(),
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

const dimensionMap: Record<string, string> = {
  'square-1024': '1024*1024',
  'portrait-768x1024': '768*1024',
  'landscape-1024x768': '1024*768',
  'story-576x1024': '576*1024',
};

router.post('/image-generator/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = imageGeneratorSchema.parse(req.body);

    const promptData = inputs.prompt?.data as
      | { prompt: string; negativePrompt?: string }
      | undefined;
    if (!promptData?.prompt) {
      res.status(400).json({ error: 'Prompt input required' });
      return;
    }

    const size = dimensionMap[config.dimensions] || '1024*1024';

    if (config.mode === 'img2img' && inputs.image?.data) {
      // Image editing mode — use Qwen-Image-Edit (synchronous)
      const urls = await editImage({
        model: config.imageEditModel,
        images: [(inputs.image.data as { url: string }).url],
        text: promptData.prompt,
        size,
        negative_prompt: promptData.negativePrompt,
        prompt_extend: config.prompt_extend,
        seed: config.seed ?? undefined,
      });

      const imageUrl = urls[0];
      if (!imageUrl) throw new Error('No image generated');

      const [w, h] = size.split('*').map(Number);
      res.json({
        output: {
          type: 'image',
          data: { url: imageUrl, width: w, height: h },
          timestamp: Date.now(),
        },
        duration_ms: Date.now() - startTime,
      });
    } else {
      // Text-to-image mode — async task
      const taskId = await generateImage({
        model: config.model,
        prompt: promptData.prompt,
        negative_prompt: promptData.negativePrompt,
        size,
        prompt_extend: config.prompt_extend,
        seed: config.seed ?? undefined,
      });

      const urls = await pollTask(taskId);
      const imageUrl = urls[0];
      if (!imageUrl) throw new Error('No image generated');

      const [w, h] = size.split('*').map(Number);
      res.json({
        output: {
          type: 'image',
          data: { url: imageUrl, width: w, height: h },
          timestamp: Date.now(),
        },
        duration_ms: Date.now() - startTime,
      });
    }
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Video Generator ---
const videoGeneratorSchema = z.object({
  config: z.object({
    mode: z.string(),
    duration: z.number().int().min(2).max(15).catch(5),
    resolution: z.string(),
    shot_type: z.string().optional(),
    prompt_extend: z.boolean().optional(),
    model: z.string().optional(),
    imageVideoModel: z.string().optional(),
  }),
  inputs: z.object({
    prompt: z
      .object({
        type: z.literal('prompt'),
        data: z.object({ prompt: z.string(), negativePrompt: z.string().optional() }),
      })
      .optional(),
    style: z.any().optional(),
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
    audio: z
      .object({
        type: z.literal('audio'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

const resolutionToSizeMap: Record<string, string> = {
  '480P': '854*480',
  '720P': '1280*720',
  '1080P': '1920*1080',
};

router.post('/video-generator/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = videoGeneratorSchema.parse(req.body);

    const promptData = inputs.prompt?.data as
      | { prompt: string; negativePrompt?: string }
      | undefined;
    if (!promptData?.prompt) {
      res.status(400).json({ error: 'Prompt input required' });
      return;
    }

    const audioUrl = (inputs.audio?.data as { url: string })?.url;
    let taskId: string;

    if (config.mode === 'img2video' && inputs.image?.data) {
      // Image-to-video: uses resolution param (e.g., "720P")
      taskId = await generateVideoFromImage({
        model: config.imageVideoModel,
        prompt: promptData.prompt,
        img_url: (inputs.image.data as { url: string }).url,
        resolution: config.resolution,
        duration: config.duration,
        shot_type: config.shot_type as 'single' | 'multi' | undefined,
        prompt_extend: config.prompt_extend,
        audio_url: audioUrl,
      });
    } else {
      // Text-to-video: uses size param (e.g., "1280*720")
      taskId = await generateVideo({
        model: config.model,
        prompt: promptData.prompt,
        size: resolutionToSizeMap[config.resolution] || '1280*720',
        duration: config.duration,
        shot_type: config.shot_type as 'single' | 'multi' | undefined,
        prompt_extend: config.prompt_extend,
        audio_url: audioUrl,
      });
    }

    const urls = await pollTask(taskId, 120, 5000); // Videos take longer
    const videoUrl = urls[0];
    if (!videoUrl) throw new Error('No video generated');

    const [w, h] = (resolutionToSizeMap[config.resolution] || '1280*720').split('*').map(Number);

    res.json({
      output: {
        type: 'video',
        data: { url: videoUrl, duration: config.duration, width: w, height: h },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Image-to-Text (Vision) ---
const imageToTextSchema = z.object({
  config: z.object({
    detailLevel: z.string(),
    language: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/image-to-text/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = imageToTextSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const detailPrompts: Record<string, string> = {
      brief: 'Describe this image in one short sentence.',
      detailed: 'Describe this image in detail, including objects, colors, composition, and mood.',
      artistic: 'Describe this image as a creative art prompt suitable for AI image generation.',
    };
    const langSuffix =
      config.language === 'id' ? ' Respond in Indonesian.' : ' Respond in English.';

    const text = await describeImage({
      model: config.model,
      image_url: imageUrl,
      system_prompt: detailPrompts[config.detailLevel] + langSuffix,
      max_tokens: config.detailLevel === 'brief' ? 100 : 500,
      temperature: config.detailLevel === 'artistic' ? 0.7 : 0.3,
    });

    res.json({
      output: {
        type: 'text',
        data: { text },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Translate Text ---
const translateTextSchema = z.object({
  config: z.object({
    sourceLang: z.string(),
    targetLang: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    text: z
      .object({
        type: z.literal('text'),
        data: z.object({ text: z.string() }),
      })
      .optional(),
  }),
});

const LANG_NAMES: Record<string, string> = {
  auto: 'auto-detected language',
  id: 'Indonesian',
  en: 'English',
  ar: 'Arabic',
  zh: 'Chinese',
};

router.post('/translate-text/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = translateTextSchema.parse(req.body);

    const inputText = (inputs.text?.data as { text: string })?.text || '';
    if (!inputText) {
      res.status(400).json({ error: 'Text input required' });
      return;
    }

    const srcLabel = LANG_NAMES[config.sourceLang] || config.sourceLang;
    const tgtLabel = LANG_NAMES[config.targetLang] || config.targetLang;

    const translated = await generateText({
      model: config.model || 'qwen-flash',
      messages: [
        {
          role: 'system',
          content: `Translate from ${srcLabel} to ${tgtLabel}. Output ONLY the translated text, nothing else.`,
        },
        { role: 'user', content: inputText },
      ],
      temperature: 0.1,
      max_tokens: 2000,
    });

    res.json({
      output: {
        type: 'text',
        data: { text: translated },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Background Remover ---
const backgroundRemoverSchema = z.object({
  config: z.object({
    outputType: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/background-remover/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = backgroundRemoverSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const outputInstructions: Record<string, string> = {
      transparent: 'Remove the background completely, making it transparent.',
      white: 'Remove the background and replace it with a solid white background.',
      blur: 'Keep the subject sharp and blur the background with a strong gaussian blur effect.',
    };

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: outputInstructions[config.outputType],
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Face Crop ---
const faceCropSchema = z.object({
  config: z.object({
    margin: z.number(),
    format: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/face-crop/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = faceCropSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const aspect = config.format === 'square' ? 'square (1:1)' : 'portrait (3:4)';
    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Detect and crop the main face in this image. Output a ${aspect} crop centered on the face with ${config.margin}px margin around it. Keep the face sharp and well-framed.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Inpainting ---
const inpaintingSchema = z.object({
  config: z.object({
    mode: z.string(),
    strength: z.number().min(0).max(100),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
    prompt: z
      .object({
        type: z.literal('prompt'),
        data: z.object({ prompt: z.string(), negativePrompt: z.string().optional() }),
      })
      .or(
        z.object({
          type: z.literal('text'),
          data: z.object({ text: z.string() }),
        }),
      )
      .optional(),
  }),
});

router.post('/inpainting/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = inpaintingSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    // Extract prompt text from either prompt or text input type
    const promptInput = inputs.prompt?.data;
    const promptText =
      promptInput && 'prompt' in promptInput
        ? promptInput.prompt
        : promptInput && 'text' in promptInput
          ? promptInput.text
          : '';
    if (!promptText) {
      res.status(400).json({ error: 'Prompt input required' });
      return;
    }

    const strengthNote =
      config.strength > 80
        ? 'Apply strong modifications.'
        : config.strength > 50
          ? 'Apply moderate modifications.'
          : 'Apply subtle modifications, keeping most of the original intact.';

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `${promptText}. ${strengthNote}`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Image Upscaler ---
const imageUpscalerSchema = z.object({
  config: z.object({
    scale: z.union([z.literal(2), z.literal(4)]),
    enhanceFaces: z.boolean(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/image-upscaler/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = imageUpscalerSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const faceNote = config.enhanceFaces ? ' Enhance and sharpen any faces in the image.' : '';
    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Upscale this image by ${config.scale}x, enhancing details and sharpness while preserving the original content.${faceNote}`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Text Overlay ---
const textOverlaySchema = z.object({
  config: z.object({
    text: z.string(),
    position: z.string(),
    font: z.string(),
    fontSize: z.number().catch(48),
    fontColor: z.string().catch('#ffffff'),
    stroke: z.boolean().catch(true),
    effect: z.string(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
    text: z
      .object({
        type: z.literal('text'),
        data: z.object({ text: z.string() }),
      })
      .optional(),
  }),
});

router.post('/text-overlay/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = textOverlaySchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const overlayText = inputs.text?.data?.text || config.text;
    if (!overlayText) {
      res.status(400).json({ error: 'Text is required' });
      return;
    }

    const strokeNote = config.stroke ? ' with a dark stroke/outline' : '';
    const effectNote = config.effect !== 'none' ? `, with a ${config.effect} text effect` : '';

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Add the text "${overlayText}" at the ${config.position} of the image in ${config.font} font at size ${config.fontSize}px in color ${config.fontColor}${strokeNote}${effectNote}. Keep the rest of the image unchanged.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Frame Border ---
const frameBorderSchema = z.object({
  config: z.object({
    style: z.string(),
    thickness: z.number().catch(20),
    color: z.string().catch('#C9A84C'),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/frame-border/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = frameBorderSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    if (config.style === 'none') {
      res.json({
        output: {
          type: 'image',
          data: { url: imageUrl, width: 0, height: 0 },
          timestamp: Date.now(),
        },
        duration_ms: Date.now() - startTime,
      });
      return;
    }

    const styleDescriptions: Record<string, string> = {
      islamic: 'ornate Islamic geometric patterns',
      floral: 'decorative floral patterns',
      polaroid: 'a polaroid photo style white border with extra space at the bottom',
      neon: 'a glowing neon light border',
      'torn-paper': 'a torn paper edge effect border',
    };
    const styleDesc = styleDescriptions[config.style] || config.style;

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Add a ${styleDesc} frame/border around this image. Border thickness: ${config.thickness}px, color: ${config.color}. Keep the main subject fully visible inside.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Sticker Layer ---
const stickerLayerSchema = z.object({
  config: z.object({
    pack: z.string(),
    stickers: z.array(
      z.object({
        emoji: z.string(),
        x: z.number(),
        y: z.number(),
        size: z.number(),
      }),
    ),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/sticker-layer/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = stickerLayerSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    const stickerList =
      config.stickers.length > 0
        ? config.stickers
            .map(
              (s) =>
                `${s.emoji} at position (${Math.round(s.x)}%, ${Math.round(s.y)}%) with size ${s.size}px`,
            )
            .join(', ')
        : `decorative ${config.pack} themed emoji stickers spread naturally around the image`;

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Add stickers/emoji overlays to this image: ${stickerList}. Make the stickers look natural and well-integrated with the image.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Color Filter ---
const colorFilterSchema = z.object({
  config: z.object({
    preset: z.string(),
    intensity: z.number().min(0).max(100).catch(60),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

const COLOR_FILTER_DESCRIPTIONS: Record<string, string> = {
  warm: 'a warm orange-golden color grade',
  vintage: 'a vintage faded film look with slightly desaturated warm tones',
  'eid-gold': 'a golden Eid celebration color grade with rich gold and warm tones',
  sahur: 'a pre-dawn blue-purple atmospheric color grade',
  cool: 'a cool blue-teal color grade',
  vibrant: 'a vibrant highly-saturated color grade',
};

router.post('/color-filter/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = colorFilterSchema.parse(req.body);

    const imageUrl = (inputs.image?.data as { url: string })?.url;
    if (!imageUrl) {
      res.status(400).json({ error: 'Image input required' });
      return;
    }

    if (config.preset === 'none') {
      res.json({
        output: {
          type: 'image',
          data: { url: imageUrl, width: 0, height: 0 },
          timestamp: Date.now(),
        },
        duration_ms: Date.now() - startTime,
      });
      return;
    }

    const filterDesc = COLOR_FILTER_DESCRIPTIONS[config.preset] || config.preset;
    const strengthNote =
      config.intensity < 30
        ? 'Apply it very subtly.'
        : config.intensity < 70
          ? 'Apply it at medium strength.'
          : 'Apply it strongly.';

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: `Apply ${filterDesc} color filter/grade to this image. ${strengthNote} Keep the composition and subjects unchanged.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Collage Layout ---
const collageLayoutSchema = z.object({
  config: z.object({
    layout: z.string(),
    gap: z.number().catch(8),
    borderRadius: z.number().catch(12),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image1: z.object({ type: z.literal('image'), data: z.object({ url: z.string() }) }).optional(),
    image2: z.object({ type: z.literal('image'), data: z.object({ url: z.string() }) }).optional(),
    image3: z.object({ type: z.literal('image'), data: z.object({ url: z.string() }) }).optional(),
    image4: z.object({ type: z.literal('image'), data: z.object({ url: z.string() }) }).optional(),
  }),
});

const COLLAGE_DESCRIPTIONS: Record<string, string> = {
  '2-horizontal': 'side by side horizontally (2 columns)',
  '2-vertical': 'stacked vertically (2 rows)',
  '3-grid': '3 images in a row',
  '4-grid': '2x2 grid',
  mosaic:
    'mosaic layout with one large image on the left and two smaller ones stacked on the right',
};

router.post('/collage-layout/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = collageLayoutSchema.parse(req.body);

    // Collect provided images (editImage supports up to 3)
    const imageUrls = [
      inputs.image1?.data?.url,
      inputs.image2?.data?.url,
      inputs.image3?.data?.url,
      inputs.image4?.data?.url,
    ]
      .filter((u): u is string => !!u)
      .slice(0, 3); // API max is 3 input images

    if (imageUrls.length < 2) {
      res.status(400).json({ error: 'At least 2 images required for collage' });
      return;
    }

    const layoutDesc = COLLAGE_DESCRIPTIONS[config.layout] || config.layout;

    const urls = await editImage({
      model: config.model,
      images: imageUrls,
      text: `Combine these ${imageUrls.length} images into a collage arranged ${layoutDesc}. Gap between images: ${config.gap}px. Rounded corners: ${config.borderRadius}px. Output a single combined collage image.`,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Object Remover ---
const objectRemoverSchema = z.object({
  config: z.object({
    target: z.string(),
    mode: z.string().default('auto'),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z.object({
      type: z.literal('image'),
      data: z.object({ url: z.string() }),
    }),
  }),
});

router.post('/object-remover/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = objectRemoverSchema.parse(req.body);

    const imageUrl = inputs.image.data.url;

    const instruction =
      config.mode === 'describe' && config.target
        ? `Remove the ${config.target} from this image and fill the removed area naturally to blend with the surrounding background`
        : 'Remove the main subject from this image and fill the removed area naturally to blend with the surrounding background';

    const urls = await editImage({
      model: config.model,
      images: [imageUrl],
      text: instruction,
    });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Background Replacer ---
const backgroundReplacerSchema = z.object({
  config: z.object({
    replacementType: z.string(),
    color: z.string().optional(),
    backgroundPrompt: z.string().optional(),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z.object({
      type: z.literal('image'),
      data: z.object({ url: z.string() }),
    }),
    bgImage: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/background-replacer/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = backgroundReplacerSchema.parse(req.body);

    const imageUrl = inputs.image.data.url;
    const bgImageUrl = inputs.bgImage?.data?.url;

    let instruction: string;
    if (bgImageUrl) {
      instruction =
        'Replace the background of the subject in this image with the background from the second image, preserving the subject perfectly';
    } else if (config.replacementType === 'blur') {
      instruction =
        'Remove the background from this image and replace it with a soft blurred version of the original background';
    } else if (config.replacementType === 'solid-color') {
      instruction = `Remove the background from this image and replace it with a solid ${config.color || 'white'} color background`;
    } else {
      instruction = config.backgroundPrompt
        ? `Remove the background from this image and replace it with: ${config.backgroundPrompt}`
        : 'Remove the background from this image and replace it with a clean professional background';
    }

    const images = bgImageUrl ? [imageUrl, bgImageUrl] : [imageUrl];
    const urls = await editImage({ model: config.model, images, text: instruction });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Style Transfer ---
const styleTransferSchema = z.object({
  config: z.object({
    stylePrompt: z.string().default(''),
    strength: z.string().default('moderate'),
    model: z.string().optional(),
  }),
  inputs: z.object({
    image: z.object({
      type: z.literal('image'),
      data: z.object({ url: z.string() }),
    }),
    styleImage: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

const STRENGTH_LABELS: Record<string, string> = {
  subtle: 'slight',
  moderate: 'noticeable',
  strong: 'dramatic',
};

router.post('/style-transfer/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = styleTransferSchema.parse(req.body);

    const imageUrl = inputs.image.data.url;
    const styleImageUrl = inputs.styleImage?.data?.url;
    const strengthLabel = STRENGTH_LABELS[config.strength];

    let instruction: string;
    if (styleImageUrl) {
      instruction = `Transform the content of the first image using the artistic style from the second image. Apply a ${strengthLabel} style transformation while preserving the main subject and composition`;
    } else if (config.stylePrompt) {
      instruction = `Apply ${config.stylePrompt} style to this image with a ${strengthLabel} transformation. Preserve the main subject and composition`;
    } else {
      instruction = 'Apply an artistic style transformation to this image';
    }

    const images = styleImageUrl ? [imageUrl, styleImageUrl] : [imageUrl];
    const urls = await editImage({ model: config.model, images, text: instruction });

    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No image generated');

    res.json({
      output: {
        type: 'image',
        data: { url: resultUrl, width: 0, height: 0 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Video Repainting ---
const videoRepaintingSchema = z.object({
  config: z.object({
    control_condition: z.string(),
    strength: z.number().min(0).max(1).optional(),
    prompt_extend: z.boolean().optional(),
  }),
  inputs: z.object({
    prompt: z
      .object({
        type: z.literal('prompt'),
        data: z.object({ prompt: z.string(), negativePrompt: z.string().optional() }),
      })
      .optional(),
    video: z
      .object({
        type: z.literal('video'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/video-repainting/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = videoRepaintingSchema.parse(req.body);

    const promptData = inputs.prompt?.data;
    if (!promptData?.prompt) {
      res.status(400).json({ error: 'Prompt input required' });
      return;
    }
    const videoUrl = (inputs.video?.data as { url: string })?.url;
    if (!videoUrl) {
      res.status(400).json({ error: 'Video input required' });
      return;
    }

    const refImageUrl = (inputs.image?.data as { url: string })?.url;

    const taskId = await repaintVideo({
      prompt: promptData.prompt,
      video_url: videoUrl,
      control_condition: config.control_condition as 'posebodyface' | 'posebody' | 'depth' | 'scribble',
      strength: config.strength,
      ref_images_url: refImageUrl ? [refImageUrl] : undefined,
      prompt_extend: config.prompt_extend,
    });

    const urls = await pollTask(taskId, 120, 5000);
    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No video generated');

    res.json({
      output: {
        type: 'video',
        data: { url: resultUrl, duration: 5, width: 1280, height: 720 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

// --- Video Extension ---
const videoExtensionSchema = z.object({
  config: z.object({
    direction: z.string(),
    prompt_extend: z.boolean().optional(),
  }),
  inputs: z.object({
    prompt: z
      .object({
        type: z.literal('prompt'),
        data: z.object({ prompt: z.string(), negativePrompt: z.string().optional() }),
      })
      .optional(),
    video: z
      .object({
        type: z.literal('video'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
    image: z
      .object({
        type: z.literal('image'),
        data: z.object({ url: z.string() }),
      })
      .optional(),
  }),
});

router.post('/video-extension/run', async (req, res, next) => {
  try {
    const startTime = Date.now();
    const { config, inputs } = videoExtensionSchema.parse(req.body);

    const promptData = inputs.prompt?.data;
    if (!promptData?.prompt) {
      res.status(400).json({ error: 'Prompt input required' });
      return;
    }

    const videoUrl = (inputs.video?.data as { url: string })?.url;
    const imageUrl = (inputs.image?.data as { url: string })?.url;

    if (!videoUrl && !imageUrl) {
      res.status(400).json({ error: 'Video or image input required' });
      return;
    }

    const taskId = await extendVideo({
      prompt: promptData.prompt,
      ...(config.direction === 'forward'
        ? videoUrl
          ? { first_clip_url: videoUrl }
          : { first_frame_url: imageUrl! }
        : videoUrl
          ? { last_clip_url: videoUrl }
          : { last_frame_url: imageUrl! }),
      prompt_extend: config.prompt_extend,
    });

    const urls = await pollTask(taskId, 120, 5000);
    const resultUrl = urls[0];
    if (!resultUrl) throw new Error('No video generated');

    res.json({
      output: {
        type: 'video',
        data: { url: resultUrl, duration: 5, width: 1280, height: 720 },
        timestamp: Date.now(),
      },
      duration_ms: Date.now() - startTime,
    });
  } catch (err) {
    console.log(err);
    next(err);
  }
});

export default router;
