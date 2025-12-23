// Configuration File for Pterodactyl Panel Store
// IMPORTANT: Replace with your actual configuration in production

// Pterodactyl Panel Configuration
window.config = {
    domainPanel: "https://panel.sapuracloud.com",
    apiKeyPanel: "ptlc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual API key
    capiKeyPanel: "ptlc_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", // Replace with your actual Client API key
    nestId: 1,
    eggId: 1,
    locationId: 1,
    
    // OrderKuota API Configuration (for payment processing)
    usernameOrderkuota: "sapuracloud",
    tokenOrderkuota: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    apiKeyOrderkuota: "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
    
    // QRIS Payment Configuration
    qrisMerchantName: "SAPURA CLOUD",
    qrisMerchantCity: "JAKARTA"
};

// Available Packages
window.packages = [
    {
        id: 1,
        name: "Unlimited",
        ram: "Unlimited RAM",
        cpu: "Unlimited CPU",
        disk: "Unlimited Disk",
        price: 299000,
        description: "Paket unlimited untuk kebutuhan besar",
        features: ["Unlimited Resources", "Prioritas Support", "Backup Otomatis"]
    },
    {
        id: 2,
        name: "Pro 10GB",
        ram: "10 GB",
        cpu: "8 Core",
        disk: "200 GB",
        price: 199000,
        description: "Paket profesional untuk bisnis menengah",
        features: ["10GB RAM", "8 Core CPU", "200GB Disk", "Support 24/7"]
    },
    {
        id: 3,
        name: "Business 5GB",
        ram: "5 GB",
        cpu: "4 Core",
        disk: "100 GB",
        price: 129000,
        description: "Paket bisnis untuk kebutuhan standar",
        features: ["5GB RAM", "4 Core CPU", "100GB Disk", "Daily Backup"]
    },
    {
        id: 4,
        name: "Standard 2GB",
        ram: "2 GB",
        cpu: "2 Core",
        disk: "50 GB",
        price: 79000,
        description: "Paket standar untuk pemula",
        features: ["2GB RAM", "2 Core CPU", "50GB Disk", "Basic Support"]
    },
    {
        id: 5,
        name: "Basic 1GB",
        ram: "1 GB",
        cpu: "1 Core",
        disk: "25 GB",
        price: 49000,
        description: "Paket dasar untuk testing",
        features: ["1GB RAM", "1 Core CPU", "25GB Disk", "Email Support"]
    },
    {
        id: 6,
        name: "Resseler Panel",
        ram: "Custom",
        cpu: "Custom",
        disk: "Custom",
        price: 500000,
        description: "Paket reseller dengan keuntungan maksimal",
        features: ["Harga Khusus Reseller", "Panel Whitelabel", "Support Priority", "Dashboard Reseller"]
    }
];

// System Messages
window.messages = {
    errors: {
        invalidUsername: "Username tidak valid. Harus 3-20 karakter tanpa spasi.",
        weakPassword: "Password terlalu lemah. Gunakan minimal 6 karakter.",
        noPackageSelected: "Silakan pilih paket terlebih dahulu.",
        paymentFailed: "Pembayaran gagal. Silakan coba lagi.",
        paymentExpired: "Waktu pembayaran telah habis.",
        serverCreationFailed: "Gagal membuat server. Silakan hubungi support."
    },
    success: {
        accountCreated: "Akun berhasil dibuat!",
        paymentSuccess: "Pembayaran berhasil!",
        serverCreated: "Server berhasil dibuat dan siap digunakan!"
    }
};

// API Endpoints (example - replace with actual endpoints)
window.apiEndpoints = {
    createUser: "/api/application/users",
    createServer: "/api/application/servers",
    generateQR: "/api/payment/qris/generate",
    checkPayment: "/api/payment/qris/check",
    verifyOrder: "/api/order/verify"
};

// Utility function to get API headers
window.getApiHeaders = function(apiType = 'application') {
    const headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    };
    
    if (apiType === 'application') {
        headers['Authorization'] = `Bearer ${window.config.apiKeyPanel}`;
    } else if (apiType === 'client') {
        headers['Authorization'] = `Bearer ${window.config.capiKeyPanel}`;
    }
    
    return headers;
};

// Log configuration status
console.log("SAPURA CLOUD Configuration Loaded");
console.log("Packages Available:", window.packages.length);
console.log("Panel Domain:", window.config.domainPanel);