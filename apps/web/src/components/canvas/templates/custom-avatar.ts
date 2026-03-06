import type { PipelineTemplate } from './types';
import { defaultConfigs } from '../types/node-types';

export const customAvatarTemplate: PipelineTemplate = {
  id: 'custom-avatar',
  name: 'Custom Avatar',
  description: 'Buat avatar digital personal dari foto atau deskripsi Anda',
  thumbnail: '👤',
  category: 'character',
  difficulty: 'Menengah',
  examplePrompts: [
    'Avatar profesional bergaya anime dari foto selfie',
    'Karakter game RPG berdasarkan foto wajah saya',
  ],
  nodes: [
    {
      id: 'iu1',
      type: 'imageUpload',
      data: {
        label: 'Reference Photo',
        config: { ...defaultConfigs.imageUpload },
      },
      position: { x: 50, y: 100 },
    },
    {
      id: 'txt1',
      type: 'textPrompt',
      data: {
        label: 'Avatar Style Description',
        config: {
          ...defaultConfigs.textPrompt,
          text: 'Convert to anime style avatar, keep facial features',
          placeholder: 'Describe the avatar style...',
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
          creativity: 'balanced',
          contentType: 'avatar',
          tone: 'casual',
          language: 'en',
        },
      },
      position: { x: 350, y: 250 },
    },
    {
      id: 'sc1',
      type: 'styleConfig',
      data: {
        label: 'Anime Style',
        config: {
          ...defaultConfigs.styleConfig,
          artStyle: 'anime',
          colorPalette: ['#ff9a9e', '#a18cd1', '#fbc2eb', '#a6c0fe'],
          mood: 'playful',
          culturalTheme: null,
        },
      },
      position: { x: 350, y: 450 },
    },
    {
      id: 'ig1',
      type: 'imageGenerator',
      data: {
        label: 'Avatar Generator',
        config: { ...defaultConfigs.imageGenerator, mode: 'img2img', dimensions: 'square-1024' },
      },
      position: { x: 650, y: 250 },
    },
    {
      id: 'pv1',
      type: 'preview',
      data: {
        label: 'Preview',
        config: { ...defaultConfigs.preview, preset: 'ig-square' },
      },
      position: { x: 950, y: 150 },
    },
    {
      id: 'ex1',
      type: 'export',
      data: {
        label: 'Export',
        config: { ...defaultConfigs.export, format: 'png', shareTarget: 'download' },
      },
      position: { x: 950, y: 400 },
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
    { id: 'e-iu1-ig1', source: 'iu1', target: 'ig1', sourceHandle: 'image', targetHandle: 'image' },
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
