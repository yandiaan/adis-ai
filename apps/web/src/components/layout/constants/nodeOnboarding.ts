import type { CustomNodeType } from '../../canvas/types/node-types';

export interface OnboardingNode {
  nodeType: CustomNodeType;
  title: string;
  category: string;
  description: string;
}

export const NODE_ONBOARDING: OnboardingNode[] = [
  {
    nodeType: 'textPrompt',
    title: 'Text Prompt',
    category: 'input',
    description:
      'Enter and compose text prompts or descriptions that will be used as input for AI processing and content generation workflows.',
  },
  {
    nodeType: 'imageUpload',
    title: 'Image Upload',
    category: 'input',
    description:
      'Upload and manage reference images that will be used as input for image processing, style transfer, or enhancement operations.',
  },
  {
    nodeType: 'promptEnhancer',
    title: 'Prompt Enhancer',
    category: 'textStyle',
    description:
      'Automatically refine and enhance your prompts to improve quality, clarity, and specificity for better AI-generated results.',
  },
  {
    nodeType: 'styleConfig',
    title: 'Style Config',
    category: 'textStyle',
    description:
      'Configure visual styles, artistic parameters, and design preferences to control the aesthetic outcome of generated content.',
  },
  {
    nodeType: 'imageGenerator',
    title: 'Image Generator',
    category: 'generate',
    description:
      'Generate high-quality images from text prompts using advanced AI models, with full control over styles and parameters.',
  },
  {
    nodeType: 'videoGenerator',
    title: 'Video Generator',
    category: 'generate',
    description:
      'Create dynamic video content from images or prompts, enabling sophisticated visual storytelling and animation workflows.',
  },
  {
    nodeType: 'textOverlay',
    title: 'Text Overlay',
    category: 'compose',
    description:
      'Add customizable text, captions, or watermarks to images with precise control over positioning, styling, and formatting.',
  },
  {
    nodeType: 'preview',
    title: 'Preview',
    category: 'output',
    description:
      'Preview and inspect generated content in real-time before final export, with options for adjustments and refinements.',
  },
  {
    nodeType: 'export',
    title: 'Export',
    category: 'output',
    description:
      'Export your finished creative projects in various formats and quality levels, ready for sharing or further use.',
  },
];
