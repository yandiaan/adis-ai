import type { PipelineTemplate } from './types';
import { defaultConfigs } from '../types/node-types';

export const ramadanWishesTemplate: PipelineTemplate = {
  id: 'ramadan-wishes',
  name: 'Ramadan Wishes',
  description: 'Buat kartu ucapan Ramadan bertema Islami yang indah dengan AI',
  thumbnail: '🕌',
  category: 'seasonal',
  difficulty: 'Pemula',
  examplePrompts: [
    'Kartu ucapan Ramadan dengan nama: Ahmad & Keluarga',
    'Ucapan selamat puasa bergaya kaligrafi modern',
  ],
  nodes: [
    {
      id: 'tp1',
      type: 'templatePreset',
      data: {
        label: 'Template Preset',
        config: { ...defaultConfigs.templatePreset, template: 'ramadan-wishes', locale: 'id' },
      },
      position: { x: 50, y: 150 },
    },
    {
      id: 'txt1',
      type: 'textPrompt',
      data: {
        label: 'Greeting Text',
        config: {
          ...defaultConfigs.textPrompt,
          text: 'Selamat menjalankan ibadah puasa, semoga Ramadan tahun ini penuh berkah',
        },
      },
      position: { x: 50, y: 350 },
    },
    {
      id: 'pe1',
      type: 'promptEnhancer',
      data: {
        label: 'Prompt Enhancer',
        config: {
          ...defaultConfigs.promptEnhancer,
          creativity: 'creative',
          contentType: 'wishes',
          tone: 'heartfelt',
          language: 'id',
        },
      },
      position: { x: 350, y: 150 },
    },
    {
      id: 'sc1',
      type: 'styleConfig',
      data: {
        label: 'Islamic Style',
        config: {
          ...defaultConfigs.styleConfig,
          artStyle: 'islamic-art',
          colorPalette: ['#1a5c3a', '#c9a84c', '#f5f1e3', '#2d7d5f'],
          mood: 'spiritual',
          culturalTheme: 'ramadan',
        },
      },
      position: { x: 350, y: 350 },
    },
    {
      id: 'ig1',
      type: 'imageGenerator',
      data: {
        label: 'Image Generator',
        config: { ...defaultConfigs.imageGenerator, dimensions: 'square-1024' },
      },
      position: { x: 650, y: 200 },
    },
    {
      id: 'to1',
      type: 'textOverlay',
      data: {
        label: 'Text Overlay',
        config: {
          ...defaultConfigs.textOverlay,
          position: 'center',
          font: 'arabic-display',
          fontSize: 56,
          fontColor: '#c9a84c',
          effect: 'glow',
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
        config: { ...defaultConfigs.export, shareTarget: 'whatsapp' },
      },
      position: { x: 1250, y: 350 },
    },
  ],
  edges: [
    {
      id: 'e-tp1-pe1',
      source: 'tp1',
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
