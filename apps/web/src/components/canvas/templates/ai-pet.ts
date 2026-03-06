import type { PipelineTemplate } from './types';
import { defaultConfigs } from '../types/node-types';

export const aiPetTemplate: PipelineTemplate = {
  id: 'ai-pet',
  name: 'AI Pet',
  description: 'Desain karakter hewan peliharaan virtual unik menggunakan AI',
  thumbnail: '🐾',
  category: 'character',
  difficulty: 'Menengah',
  examplePrompts: [
    'Kucing peliharaan warna oranye, gaya kartun lucu',
    'Anjing Shiba Inu berpose heroik seperti pahlawan super',
  ],
  nodes: [
    {
      id: 'txt1',
      type: 'textPrompt',
      data: {
        label: 'Pet Description',
        config: {
          ...defaultConfigs.textPrompt,
          text: 'Kucing lucu dengan sayap peri, warna pastel, mata besar berkilau',
          placeholder: 'Describe your dream pet...',
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
          contentType: 'character',
          tone: 'casual',
          language: 'id',
        },
      },
      position: { x: 350, y: 150 },
    },
    {
      id: 'sc1',
      type: 'styleConfig',
      data: {
        label: 'Cute Style',
        config: {
          ...defaultConfigs.styleConfig,
          artStyle: 'cartoon',
          colorPalette: ['#ffb3ba', '#bae1ff', '#baffc9', '#ffffba'],
          mood: 'cute',
          culturalTheme: null,
        },
      },
      position: { x: 350, y: 400 },
    },
    {
      id: 'ig1',
      type: 'imageGenerator',
      data: {
        label: 'Pet Generator',
        config: { ...defaultConfigs.imageGenerator, dimensions: 'square-1024' },
      },
      position: { x: 650, y: 200 },
    },
    {
      id: 'pv1',
      type: 'preview',
      data: {
        label: 'Preview',
        config: { ...defaultConfigs.preview, preset: 'ig-square' },
      },
      position: { x: 950, y: 100 },
    },
    {
      id: 'ex1',
      type: 'export',
      data: {
        label: 'Export',
        config: { ...defaultConfigs.export, format: 'png', shareTarget: 'download' },
      },
      position: { x: 950, y: 350 },
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
      id: 'e-ig1-pv1',
      source: 'ig1',
      target: 'pv1',
      sourceHandle: 'image',
      targetHandle: 'media',
      animated: true,
    },
    { id: 'e-ig1-ex1', source: 'ig1', target: 'ex1', sourceHandle: 'image', targetHandle: 'media' },
  ],
};
