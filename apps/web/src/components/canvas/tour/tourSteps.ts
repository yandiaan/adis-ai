export type TourContext = 'empty' | 'builtin-template' | 'ai-template';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** CSS selector for a fixed UI element to highlight. */
  targetSelector?: string;
  /**
   * First node type in this list that exists on canvas will be spotlighted.
   * Takes priority over targetSelector when matched.
   */
  targetNodeTypes?: string[];
  placement: 'top' | 'bottom' | 'left' | 'right' | 'center';
}

const INPUT_NODE_TYPES = ['templatePreset', 'textPrompt', 'imageUpload', 'videoUpload'];
const GENERATE_NODE_TYPES = ['imageGenerator', 'videoGenerator', 'inpainting', 'imageUpscaler'];
const STYLE_NODE_TYPES = ['promptEnhancer', 'styleConfig', 'imageToText', 'translateText'];

const OUTPUT_NODE_TYPES = ['preview', 'export', 'manualEditor'];

export const TOUR_STEPS: Record<TourContext, TourStep[]> = {
  empty: [
    {
      id: 'welcome',
      title: 'Selamat datang di Canvas! 👋',
      description:
        'Canvas adalah workspace visual untuk membangun pipeline AI. Susun blok, sambungkan aliran data, lalu jalankan — semuanya di sini. Yuk, kenali bagian-bagiannya!',
      placement: 'center',
    },
    {
      id: 'sidebar',
      title: 'Sidebar Navigasi',
      description:
        'Di sidebar ini kamu bisa memuat template siap pakai, beralih ke workflow lain, atau kembali ke halaman utama.',
      targetSelector: '[data-tour="sidebar"]',
      placement: 'right',
    },
    {
      id: 'add-node',
      title: 'Tambah Blok Baru',
      description:
        'Klik "New Node" untuk menelusuri semua blok yang tersedia. Ada blok Input, Generator AI, Transform, hingga Output. Klik blok untuk langsung menambahkannya ke canvas.',
      targetSelector: '[data-tour="add-node-btn"]',
      placement: 'top',
    },
    {
      id: 'connect',
      title: 'Cara Menghubungkan Blok',
      description:
        'Drag dari titik output (kanan blok) ke titik input (kiri blok) lainnya. Kamu juga bisa drag ke area kosong — akan muncul menu untuk memilih blok baru yang langsung terhubung.',
      placement: 'center',
    },
    {
      id: 'shortcuts',
      title: '⌨️ Pintasan Keyboard',
      description:
        'Gunakan shortcut ini untuk bekerja lebih cepat:\n• N — Buka menu tambah blok\n• V — Mode pilih (klik & drag untuk seleksi)\n• H — Mode geser (pan canvas)\n• ` (backtick) — Buka/tutup panel Log\n• Ctrl+Enter — Jalankan pipeline',
      placement: 'center',
    },
    {
      id: 'run',
      title: 'Jalankan Pipeline',
      description:
        'Setelah blok tersusun dan terhubung, klik Run. Hasil akhir akan tampil di blok Output. Kamu bisa pantau prosesnya lewat panel Logs.',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],

  'builtin-template': [
    {
      id: 'welcome',
      title: 'Template Siap Digunakan! 🎉',
      description:
        'Template ini sudah berisi blok-blok yang terhubung. Kamu tinggal review konfigurasinya lalu langsung jalankan. Mari kita kenali setiap bagiannya!',
      placement: 'center',
    },
    {
      id: 'input-node',
      title: '📥 Blok Input — Awal Pipeline',
      description:
        'Blok ini adalah pintu masuk data ke pipeline. Isi prompt teks, upload gambar, atau pilih preset template. Klik blok untuk membuka panel konfigurasi di sebelah kanan.',
      targetNodeTypes: INPUT_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'style-node',
      title: '✏️ Blok Gaya & Teks',
      description:
        'Blok ini memperkuat input sebelum diproses AI — misalnya memperkaya prompt, menambahkan konfigurasi gaya visual, atau menerjemahkan teks. Klik untuk mengaturnya.',
      targetNodeTypes: STYLE_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'generate-node',
      title: '🤖 Blok AI Generator — Inti Pipeline',
      description:
        'Inilah blok yang menjalankan AI! Pilih model AI, atur parameter seperti ukuran gambar atau durasi video, lalu hubungkan ke blok input dan output.',
      targetNodeTypes: GENERATE_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'output-node',
      title: '🖼️ Blok Output — Hasil Akhir',
      description:
        'Hasil dari pipeline akan tampil di sini. Blok Preview menampilkan gambar/video langsung di canvas. Blok Export menyediakan tombol unduh.',
      targetNodeTypes: OUTPUT_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'shortcuts',
      title: '⌨️ Pintasan Keyboard',
      description:
        'Gunakan shortcut ini untuk bekerja lebih cepat:\n• N — Buka menu tambah blok\n• V — Mode pilih\n• H — Mode geser canvas\n• ` (backtick) — Buka/tutup panel Log\n• Ctrl+Enter — Jalankan pipeline',
      placement: 'center',
    },
    {
      id: 'run',
      title: 'Siap Dijalankan!',
      description:
        'Semua blok sudah terhubung dan siap jalan. Klik Run dan tunggu hasilnya — setiap blok akan dieksekusi berurutan sesuai aliran koneksi.',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],

  'ai-template': [
    {
      id: 'welcome',
      title: 'Pipeline AI Kamu Siap! ✨',
      description:
        'AI sudah membuat pipeline sederhana berdasarkan deskripsimu — hanya beberapa blok yang paling penting. Tidak perlu khawatir, kamu bisa kustomisasi sesuai kebutuhan. Mari kita pelajari cara mengubahnya!',
      placement: 'center',
    },
    {
      id: 'customize-prompt',
      title: '✏️ Langkah 1 — Ubah Teks Prompt',
      description:
        'Klik blok "Text Prompt" (biasanya di paling kiri). Panel konfigurasi akan terbuka di kanan — ubah teks sesuai keinginanmu. Misalnya: "Foto keluarga bergaya anime dengan latar Lebaran". Semakin detail prompt, semakin bagus hasilnya!',
      targetNodeTypes: INPUT_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'customize-generator',
      title: '🤖 Langkah 2 — Pilih Model AI',
      description:
        'Klik blok generator (Image Generator atau Video Generator). Di panel kanan, kamu bisa ganti model AI — misalnya dari "wanx" ke "flux" untuk gaya gambar yang berbeda. Setiap model punya karakteristik unik!',
      targetNodeTypes: GENERATE_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'customize-effects',
      title: '🎨 Langkah 3 — Tambah Efek (Opsional)',
      description:
        'Ingin menambah filter warna, teks ucapan, atau frame dekoratif? Klik tombol "+ New Node" dan pilih blok efek (Color Filter, Text Overlay, Frame Border). Lalu hubungkan ke pipeline dengan menarik titik koneksi dari blok sebelumnya.',
      targetSelector: '[data-tour="add-node-btn"]',
      placement: 'top',
    },
    {
      id: 'output-node',
      title: '🖼️ Langkah 4 — Preview & Download',
      description:
        'Blok "Preview" dan "Export" sudah ada di ujung pipeline. Setelah pipeline berjalan, klik ikon expand di blok Preview untuk melihat hasilnya secara penuh — atau klik "Export" untuk download langsung!',
      targetNodeTypes: OUTPUT_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'run',
      title: '🚀 Sekarang Coba Jalankan!',
      description:
        'Klik tombol "Run" untuk menjalankan pipeline. Tunggu beberapa detik — hasilnya akan muncul di blok Preview. Kalau ada yang kurang pas, ubah prompt atau ganti model lalu jalankan lagi. Tidak ada batas percobaan!',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],
};
