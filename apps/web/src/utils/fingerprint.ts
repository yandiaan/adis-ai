let cachedHash: string | null = null;

async function sha256(input: string): Promise<string> {
  const encoded = new TextEncoder().encode(input);
  const buffer = await crypto.subtle.digest('SHA-256', encoded);
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function sampleCanvas(): string {
  try {
    const canvas = document.createElement('canvas');
    canvas.width = 200;
    canvas.height = 50;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.fillStyle = '#f60';
    ctx.fillRect(10, 10, 100, 30);
    ctx.fillStyle = '#069';
    ctx.font = '14px Arial';
    ctx.fillText('fp-sample \u2601', 15, 30);
    return canvas.toDataURL();
  } catch {
    return '';
  }
}

function sampleWebGL(): string {
  try {
    const canvas = document.createElement('canvas');
    const gl =
      (canvas.getContext('webgl') as WebGLRenderingContext | null) ??
      (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
    if (!gl) return '';
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return gl.getParameter(gl.RENDERER) as string;
    return [
      gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL),
      gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL),
    ].join('|');
  } catch {
    return '';
  }
}

async function sampleAudio(): Promise<string> {
  try {
    const ctx = new OfflineAudioContext(1, 44100, 44100);
    const oscillator = ctx.createOscillator();
    const compressor = ctx.createDynamicsCompressor();
    oscillator.connect(compressor);
    compressor.connect(ctx.destination);
    oscillator.start(0);
    const buffer = await ctx.startRendering();
    const data = buffer.getChannelData(0);
    let sum = 0;
    for (let i = 0; i < Math.min(data.length, 500); i++) sum += Math.abs(data[i]);
    return sum.toFixed(10);
  } catch {
    return '';
  }
}

function sampleFonts(): string {
  const testFonts = [
    'Arial', 'Verdana', 'Helvetica', 'Times New Roman', 'Courier New',
    'Georgia', 'Trebuchet MS', 'Impact', 'Comic Sans MS', 'Palatino',
  ];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  const baseline = (() => {
    ctx.font = '16px monospace';
    return ctx.measureText('mmmmmmmmm').width;
  })();
  return testFonts
    .filter((font) => {
      ctx.font = `16px '${font}', monospace`;
      return ctx.measureText('mmmmmmmmm').width !== baseline;
    })
    .join(',');
}

function sampleScreen(): string {
  return [
    screen.width,
    screen.height,
    screen.colorDepth,
    window.devicePixelRatio,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    navigator.language,
    navigator.hardwareConcurrency ?? 0,
  ].join('|');
}

export async function getFingerprint(): Promise<string> {
  if (cachedHash) return cachedHash;

  const [audioSample] = await Promise.all([sampleAudio()]);

  const raw = [
    sampleCanvas(),
    sampleWebGL(),
    audioSample,
    sampleFonts(),
    sampleScreen(),
    navigator.userAgent,
  ].join('###');

  cachedHash = await sha256(raw);
  return cachedHash;
}
