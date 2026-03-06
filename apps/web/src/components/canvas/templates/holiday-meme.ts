import type { PipelineTemplate } from './types';
import { defaultConfigs } from '../types/node-types';

export const holidayMemeTemplate: PipelineTemplate = {
  id: 'holiday-meme',
  name: 'Holiday Meme',
  description: 'Buat meme lucu dan relevan untuk hari raya seperti Lebaran',
  thumbnail: '🎉',
  category: 'seasonal',
  difficulty: 'Pemula',
  examplePrompts: [
    'Meme Lebaran: "Maaf lahir batin, THR-nya kapan?"',
    'Meme liburan: foto keluarga dengan caption lucu',
  ],
  nodes: [
    {
      id: 'txt1',
      type: 'textPrompt',
      data: {
        label: 'Meme Idea',
        config: {
          ...defaultConfigs.textPrompt,
          text: 'THR sudah cair tapi langsung habis buat bayar utang',
          placeholder: 'Describe your meme idea...',
        },
      },
      position: { x: 50, y: 200 },
    },
    {
      id: 'pe1',
      type: 'promptEnhancer',
      data: {
        label: 'Prompt Enhancer',
        config: {
          ...defaultConfigs.promptEnhancer,
          creativity: 'creative',
          contentType: 'meme',
          tone: 'funny',
          language: 'id',
        },
      },
      position: { x: 350, y: 150 },
    },
    {
      id: 'sc1',
      type: 'styleConfig',
      data: {
        label: 'Meme Style',
        config: {
          ...defaultConfigs.styleConfig,
          artStyle: 'pop-art',
          colorPalette: ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff'],
          mood: 'funny',
          culturalTheme: 'lebaran',
        },
      },
      position: { x: 350, y: 400 },
    },
    {
      id: 'ig1',
      type: 'imageGenerator',
      data: {
        label: 'Meme Image',
        config: { ...defaultConfigs.imageGenerator, dimensions: 'square-1024' },
      },
      position: { x: 650, y: 200 },
    },
    {
      id: 'to1',
      type: 'textOverlay',
      data: {
        label: 'Meme Text',
        config: {
          ...defaultConfigs.textOverlay,
          position: 'bottom',
          font: 'impact',
          fontSize: 64,
          fontColor: '#ffffff',
          stroke: true,
          effect: 'shadow',
        },
      },
      position: { x: 950, y: 200 },
    },
    {
      id: 'pv1',
      type: 'preview',
      data: {
        label: 'Preview',
        config: { ...defaultConfigs.preview, preset: 'ig-square' },
      },
      position: { x: 1250, y: 100 },
    },
    {
      id: 'ex1',
      type: 'export',
      data: {
        label: 'Export',
        config: { ...defaultConfigs.export, format: 'jpg', shareTarget: 'whatsapp' },
      },
      position: { x: 1250, y: 350 },
    },
  ],
  edges: [
    {
      id: 'e-txt1-pe1',
      source: 'txt1',
      target: 'pe1',
      sourceHandle: 'text',
      targetHandle: 'text',
      animated: true,
    },
    { id: 'e-sc1-pe1', source: 'sc1', target: 'pe1', sourceHandle: 'style', targetHandle: 'style' },
    {
      id: 'e-pe1-ig1',
      source: 'pe1',
      target: 'ig1',
      sourceHandle: 'prompt',
      targetHandle: 'prompt',
      animated: true,
    },
    { id: 'e-sc1-ig1', source: 'sc1', target: 'ig1', sourceHandle: 'style', targetHandle: 'style' },
    {
      id: 'e-ig1-to1',
      source: 'ig1',
      target: 'to1',
      sourceHandle: 'image',
      targetHandle: 'image',
      animated: true,
    },
    { id: 'e-txt1-to1', source: 'txt1', target: 'to1', sourceHandle: 'text', targetHandle: 'text' },
    {
      id: 'e-to1-pv1',
      source: 'to1',
      target: 'pv1',
      sourceHandle: 'image',
      targetHandle: 'media',
      animated: true,
    },
    { id: 'e-to1-ex1', source: 'to1', target: 'ex1', sourceHandle: 'image', targetHandle: 'media' },
  ],
};
