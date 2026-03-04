# ADIS AI - Content Generator

<p align="center">
  <img src="apps/web/public/logo.svg" alt="ADIS AI Logo" width="100" />
</p>

A modular, node-based content generation engine designed to transform creative ideas into high-quality visual content including stickers, memes, and personalized greetings. Powered by **Alibaba Cloud AI** technologies for an intuitive visual workflow experience.

This application leverages **Alibaba Cloud Qwen** - an advanced language model by Alibaba Cloud - as the core AI engine for text generation, prompt enhancement, and intelligent content reasoning. Combined with Alibaba's image and video generation capabilities, ADIS AI delivers a comprehensive solution for creating culturally-relevant Indonesian content.


## Overview

ADIS AI provides a visual pipeline editor that enables users to create complex content generation workflows through an intuitive drag-and-drop interface. The application leverages Alibaba Cloud AI services (Qwen for text/reasoning, Wan for image/video generation) to power the content generation capabilities.

![ADIS AI Canvas Interface](apps/web/public/screenshot-1.png)

### Key Features

- **Visual Node-Based Editor**: Create and manage content generation pipelines using an intuitive canvas interface
- **Typed Port System**: Connection validation ensures data compatibility between nodes with distinct port types (text, prompt, image, video, style, media)
- **Pipeline Execution Engine**: Client-orchestrated execution with server-side AI processing, featuring topology sorting and state management
- **Template Presets**: Quick-start workflows for common use cases including Ramadan Wishes, Holiday Memes, AI Pet, and Custom Avatar generation
- **Real-time Execution Feedback**: Live progress updates and logging during pipeline execution
- **Indonesian Cultural Context**: Specialized templates and content generation for Indonesian cultural events and celebrations

## Node Categories

The pipeline editor supports five distinct node categories:

| Category | Description | Color Code |
|----------|-------------|------------|
| **Input** | Data entry points (Text Prompt, Image Upload, Template Preset) | Green |
| **Transform** | Data manipulation nodes (Prompt Enhancer, Style Config, Image to Text, Translate Text) | Purple |
| **Generate** | AI-powered content creation (Image Generator, Video Generator, Background Remover, Inpainting) | Blue |
| **Compose** | Layout and composition tools (Text Overlay, Frame Border, Sticker Layer, Collage Layout) | Orange |
| **Output** | Final output nodes (Preview, Export) | Red |

## Getting Started

### Prerequisites

- Node.js 18.x or higher
- pnpm 8.x or higher
- Backend server running (see `apps/server`)

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install
```

### Development

```bash
# Start development server
pnpm dev
```

The application will be available at `http://localhost:4321`.

### Build

```bash
# Create production build
pnpm build

# Preview production build locally
pnpm preview
```

## Available Templates

| Template | Description | Use Case |
|----------|-------------|----------|
| **Ramadan Wishes** | Generate personalized Ramadan greeting cards | Eid al-Fitr and Ramadan celebrations |
| **Holiday Meme** | Create viral holiday-themed memes | Social media content for holidays |
| **AI Pet** | Generate stylized pet character images | Personal pet avatars and stickers |
| **Custom Avatar** | Create personalized character avatars | Profile pictures and digital identities |
| **Blank Canvas** | Start from scratch with an empty workflow | Custom pipeline creation |

## Architecture

### Execution Model

The application implements a client-orchestrated, server-executed architecture:

1. **Frontend Orchestrator**: Manages execution graph topology, state management, and execution ordering
2. **Server Executor**: Stateless AI processing endpoint that validates inputs and calls AI APIs
3. **Real-time Updates**: SSE-based progress updates during pipeline execution

### Port Type System

The port type system ensures data compatibility through a static compatibility matrix:

- `text`: Plain text data
- `prompt`: AI prompt data (enhanced text for generation)
- `image`: Image data with URL reference
- `video`: Video data with URL reference
- `style`: Style configuration (art style, color palette, mood)
- `media`: Generic media type (compatible with image and video)

## Configuration

### Environment Variables

The web application connects to the backend server. Ensure the following configuration:

```
API_BASE=http://localhost:3000
```

### Model Options

AI model configurations are defined in `src/components/canvas/config/modelOptions.ts` and can be customized based on available Alibaba Cloud Model Studio services.

## Alibaba Qwen Integration

### Overview

ADIS AI leverages Alibaba Cloud's Qwen language model family to power intelligent content generation workflows. Qwen provides state-of-the-art natural language understanding and generation capabilities optimized for multilingual contexts, including Indonesian language support.

### Qwen Capabilities

| Capability | Usage in ADIS AI |
|------------|------------------|
| **Text Generation** | Create original content, prompts, and narratives |
| **Prompt Enhancement** | Intelligently enhance user prompts for better generation quality |
| **Language Understanding** | Analyze and process user inputs with cultural context awareness |
| **Reasoning & Logic** | Support complex workflow logic and conditional content generation |
| **Multilingual Support** | Native support for Indonesian and English language processing |

### Integration Points

1. **Prompt Enhancement Node** - Uses Qwen to analyze and enhance user prompts with creativity and tone modulation
2. **Template Presets** - Qwen generates contextually relevant content for cultural templates (Ramadan, Holidays, etc.)
3. **Text Transformation** - Text translation, rewriting, and style transformation capabilities
4. **Style Analysis** - Intelligent analysis of style requirements and color palette suggestions

### Qwen Model Versions

The application supports multiple Qwen model variants for different use cases:

- **Qwen-Long** - For processing extended context and complex reasoning
- **Qwen-Turbo** - Optimized for speed and real-time applications
- **Qwen-Max** - Maximum quality and instruction-following capabilities

Configuration of the active model can be adjusted in the application settings to match performance and accuracy requirements.

## Contributing

1. Follow established code quality standards
2. Maintain type safety and proper error handling
3. Follow the existing component structure and naming conventions
4. Add appropriate documentation for new features
5. Test pipeline execution with various node configurations

## License

This project is proprietary software. All rights reserved.

## Acknowledgments

- **Alibaba Cloud** - AI infrastructure and model services
- **Qwen** - Advanced language model capabilities
- Open source community for visualization libraries
