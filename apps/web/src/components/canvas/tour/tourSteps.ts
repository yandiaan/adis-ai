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
const EDIT_NODE_TYPES = [
  'backgroundRemover',
  'faceCrop',
  'objectRemover',
  'backgroundReplacer',
  'styleTransfer',
  'videoRepainting',
  'videoExtension',
  'textOverlay',
  'frameBorder',
  'stickerLayer',
  'colorFilter',
  'collageLayout',
];
const OUTPUT_NODE_TYPES = ['preview', 'export', 'manualEditor'];

export const TOUR_STEPS: Record<TourContext, TourStep[]> = {
  empty: [
    {
      id: 'welcome',
      title: 'Selamat datang di Canvas! 👋',
      description:
        'Canvas adalah workspace visual untuk membangun pipeline AI. Susun node, sambungkan aliran data, lalu jalankan — semuanya di sini. Yuk, kenali bagian-bagiannya!',
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
      title: 'Tambah Node Baru',
      description:
        'Klik "New Node" untuk menelusuri semua node yang tersedia. Ada node Input, Generator AI, Transform, hingga Output. Klik node untuk langsung menambahkannya ke canvas.',
      targetSelector: '[data-tour="add-node-btn"]',
      placement: 'top',
    },
    {
      id: 'connect',
      title: 'Cara Menghubungkan Node',
      description:
        'Drag dari port output (titik di kanan node) ke port input (titik di kiri node) lainnya. Kamu juga bisa drag ke area kosong — akan muncul menu untuk memilih node baru yang langsung terhubung.',
      placement: 'center',
    },
    {
      id: 'run',
      title: 'Jalankan Pipeline',
      description:
        'Setelah node tersusun dan terhubung, klik Run. Hasil akhir akan tampil di node Output. Kamu bisa pantau prosesnya lewat panel Logs.',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],

  'builtin-template': [
    {
      id: 'welcome',
      title: 'Template Siap Digunakan! 🎉',
      description:
        'Template ini sudah berisi node-node yang terhubung. Kamu tinggal review konfigurasinya lalu langsung jalankan. Mari kita kenali setiap bagiannya!',
      placement: 'center',
    },
    {
      id: 'input-node',
      title: '📥 Node Input — Awal Pipeline',
      description:
        'Node ini adalah pintu masuk data ke pipeline. Isi prompt teks, upload gambar, atau pilih preset template. Klik node untuk membuka panel konfigurasi di sebelah kanan.',
      targetNodeTypes: INPUT_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'style-node',
      title: '✏️ Node Gaya & Teks',
      description:
        'Node ini memperkuat input sebelum diproses AI — misalnya memperkaya prompt, menambahkan konfigurasi gaya visual, atau menerjemahkan teks. Klik untuk mengaturnya.',
      targetNodeTypes: STYLE_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'generate-node',
      title: '🤖 Node AI Generator — Inti Pipeline',
      description:
        'Inilah node yang menjalankan AI! Pilih model AI, atur parameter seperti ukuran gambar atau durasi video, lalu hubungkan ke node input dan output.',
      targetNodeTypes: GENERATE_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'output-node',
      title: '🖼️ Node Output — Hasil Akhir',
      description:
        'Hasil dari pipeline akan tampil di sini. Node Preview menampilkan gambar/video langsung di canvas. Node Export menyediakan tombol unduh.',
      targetNodeTypes: OUTPUT_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'run',
      title: 'Siap Dijalankan!',
      description:
        'Semua node sudah terhubung dan siap jalan. Klik Run dan tunggu hasilnya — setiap node akan dieksekusi berurutan sesuai aliran koneksi.',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],

  'ai-template': [
    {
      id: 'welcome',
      title: 'Pipeline AI Kamu Siap! ✨',
      description:
        'AI sudah membuatkan pipeline khusus berdasarkan deskripsimu. Node dan koneksi sudah dikonfigurasi secara otomatis. Mari kita pahami struktur yang dibuat AI!',
      placement: 'center',
    },
    {
      id: 'input-node',
      title: '📥 Node Input',
      description:
        'AI menempatkan node input di awal pipeline. Di sinilah kamu memasukkan bahan baku — teks prompt, gambar, atau preset. Klik node untuk mengisi atau mengubah isinya.',
      targetNodeTypes: INPUT_NODE_TYPES,
      placement: 'right',
    },
    {
      id: 'generate-node',
      title: '🤖 Node AI — Dibuat Otomatis',
      description:
        'AI sudah memilih dan mengkonfigurasi node generator yang paling sesuai dengan permintaanmu. Kamu bisa mengubah model atau parameter dengan klik node ini.',
      targetNodeTypes: GENERATE_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'edit-compose-node',
      title: '🎨 Node Transform & Compose',
      description:
        'AI juga menambahkan node pengolahan tambahan sesuai kebutuhanmu — misalnya hapus background, tambahkan teks, atau atur frame. Klik untuk melihat konfigurasinya.',
      targetNodeTypes: EDIT_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'output-node',
      title: '🖼️ Node Output',
      description:
        'Hasil akhir pipeline akan muncul di sini. Kamu bisa preview langsung atau download hasilnya.',
      targetNodeTypes: OUTPUT_NODE_TYPES,
      placement: 'left',
    },
    {
      id: 'customize',
      title: 'Kustomisasi Pipeline-mu',
      description:
        'Ingin menambah langkah lain? Gunakan "New Node" untuk menambah node baru. Drag port node untuk menghubungkannya ke pipeline yang sudah ada.',
      targetSelector: '[data-tour="add-node-btn"]',
      placement: 'top',
    },
    {
      id: 'run',
      title: 'Jalankan Pipeline AI-mu!',
      description:
        'Semuanya sudah siap. Klik Run dan lihat pipeline AI kamu bekerja! Log eksekusi bisa dilihat di panel Logs di sebelah kanan bawah.',
      targetSelector: '[data-tour="run-btn"]',
      placement: 'top',
    },
  ],
};
