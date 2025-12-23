// Konfigurasi API - URL API disembunyikan dari UI
const AI_CONFIG = {
    // API endpoint - tidak ditampilkan di UI
    API_BASE_URL: "https://skyzopedia-api.vercel.app/ai/gpt",
    API_KEY: "skyy",
    
    // Pengaturan aplikasi
    APP_NAME: "Sapura AI",
    APP_SUBTITLE: "Premium Artificial Intelligence",
    
    // Pengaturan tampilan
    DEFAULT_THEME: "dark",
    TYPING_SPEED: 20, // ms per karakter (efek ketik)
    
    // Pengaturan respons
    MAX_RETRIES: 3,
    TIMEOUT: 30000, // 30 detik
};

// Ekspor untuk penggunaan di script.js
window.AI_CONFIG = AI_CONFIG;