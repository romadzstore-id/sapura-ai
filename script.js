// Main Application Script
document.addEventListener('DOMContentLoaded', function() {
    // State Management
    const state = {
        currentStep: 1,
        username: '',
        password: '',
        selectedPackage: null,
        paymentAmount: 0,
        uniqueCode: 0,
        totalPayment: 0,
        transactionId: '',
        paymentStatus: 'pending',
        countdownInterval: null,
        countdownSeconds: 300, // 5 minutes in seconds
        serverDetails: null,
        generatedPassword: ''
    };

    // DOM Elements
    const progressFill = document.getElementById('progressFill');
    const steps = document.querySelectorAll('.step');
    const stepContents = document.querySelectorAll('.step-content');
    
    // Step 1 Elements
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const togglePasswordBtn = document.getElementById('togglePassword');
    const generatePasswordBtn = document.getElementById('generatePassword');
    const passwordStrength = document.getElementById('passwordStrength');
    const passwordStrengthText = document.getElementById('passwordStrengthText');
    const nextStep1Btn = document.getElementById('nextStep1');
    
    // Step 2 Elements
    const packageOptionsContainer = document.getElementById('packageOptions');
    const prevStep2Btn = document.getElementById('prevStep2');
    const nextStep2Btn = document.getElementById('nextStep2');
    
    // Step 3 Elements
    const summaryPackage = document.getElementById('summaryPackage');
    const summaryBasePrice = document.getElementById('summaryBasePrice');
    const summaryUniqueCode = document.getElementById('summaryUniqueCode');
    const summaryTotal = document.getElementById('summaryTotal');
    const qrisPlaceholder = document.getElementById('qrisPlaceholder');
    const minutesElement = document.getElementById('minutes');
    const secondsElement = document.getElementById('seconds');
    const countdownBar = document.getElementById('countdownBar');
    const cancelPaymentBtn = document.getElementById('cancelPayment');
    const checkPaymentBtn = document.getElementById('checkPayment');
    const paymentStatusContainer = document.getElementById('paymentStatus');
    
    // Step 4 Elements
    const resultUsername = document.getElementById('resultUsername');
    const resultPassword = document.getElementById('resultPassword');
    const resultServerId = document.getElementById('resultServerId');
    const resultPackage = document.getElementById('resultPackage');
    const resultSpecs = document.getElementById('resultSpecs');
    const resultPanelLink = document.getElementById('resultPanelLink');
    const newOrderBtn = document.getElementById('newOrder');
    const openPanelBtn = document.getElementById('openPanel');
    
    // Initialize the application
    init();

    function init() {
        // Load packages from config
        loadPackages();
        
        // Set up event listeners
        setupEventListeners();
        
        // Initialize password strength checker
        initPasswordStrength();
    }

    function setupEventListeners() {
        // Step 1: Account Details
        usernameInput.addEventListener('input', validateStep1);
        passwordInput.addEventListener('input', validateStep1);
        passwordInput.addEventListener('input', updatePasswordStrength);
        togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
        generatePasswordBtn.addEventListener('click', generateStrongPassword);
        nextStep1Btn.addEventListener('click', goToStep2);
        
        // Step 2: Package Selection
        prevStep2Btn.addEventListener('click', () => goToStep(1));
        nextStep2Btn.addEventListener('click', goToStep3);
        
        // Step 3: Payment
        cancelPaymentBtn.addEventListener('click', cancelTransaction);
        checkPaymentBtn.addEventListener('click', checkPaymentStatus);
        
        // Step 4: Results
        newOrderBtn.addEventListener('click', resetSystem);
        openPanelBtn.addEventListener('click', openPanel);
        
        // Copy buttons
        document.addEventListener('click', function(e) {
            if (e.target.closest('.copy-btn')) {
                const copyBtn = e.target.closest('.copy-btn');
                const targetId = copyBtn.getAttribute('data-target');
                const targetElement = document.getElementById(targetId);
                copyToClipboard(targetElement.textContent, copyBtn);
            }
        });
    }

    // Step Management
    function goToStep(step) {
        // Validate current step before proceeding
        if (step > state.currentStep) {
            if (!validateCurrentStep()) {
                return;
            }
        }
        
        // Update progress bar
        const progressPercentage = (step / 4) * 100;
        progressFill.style.width = `${progressPercentage}%`;
        
        // Update step indicators
        steps.forEach(s => {
            const stepNum = parseInt(s.getAttribute('data-step'));
            if (stepNum <= step) {
                s.classList.add('active');
            } else {
                s.classList.remove('active');
            }
        });
        
        // Hide all step contents
        stepContents.forEach(content => {
            content.classList.remove('active');
        });
        
        // Show the target step content
        document.getElementById(`step${step}`).classList.add('active');
        
        // Update state
        state.currentStep = step;
        
        // Step-specific initialization
        if (step === 2) {
            updatePackageSelection();
        } else if (step === 3) {
            initializePayment();
        } else if (step === 4) {
            displayServerDetails();
        }
        
        // Scroll to top of step
        document.querySelector('.main-content').scrollIntoView({ behavior: 'smooth' });
    }

    function validateCurrentStep() {
        switch (state.currentStep) {
            case 1:
                return validateStep1(true);
            case 2:
                return validateStep2();
            default:
                return true;
        }
    }

    // Step 1: Account Details
    function validateStep1(showNotification = false) {
        const username = usernameInput.value.trim();
        const password = passwordInput.value;
        
        let isValid = false;
        
        if (username.length < 3) {
            if (showNotification) {
                showNotificationMessage('Username terlalu pendek', 'Username harus minimal 3 karakter', 'error');
            }
        } else if (username.includes(' ')) {
            if (showNotification) {
                showNotificationMessage('Format username salah', 'Username tidak boleh mengandung spasi', 'error');
            }
        } else {
            // If password is empty, we'll generate one automatically
            if (password.length === 0) {
                isValid = true;
                state.password = '';
            } else if (password.length < 6) {
                if (showNotification) {
                    showNotificationMessage('Password terlalu pendek', 'Password harus minimal 6 karakter', 'error');
                }
            } else {
                isValid = true;
                state.password = password;
            }
            
            state.username = username;
        }
        
        nextStep1Btn.disabled = !isValid;
        return isValid;
    }

    function togglePasswordVisibility() {
        const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
        passwordInput.setAttribute('type', type);
        togglePasswordBtn.innerHTML = type === 'password' ? '<i class="fas fa-eye"></i>' : '<i class="fas fa-eye-slash"></i>';
    }

    function generateStrongPassword() {
        const length = 12;
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        let password = "";
        
        // Ensure at least one of each type
        password += "ABCDEFGHIJKLMNOPQRSTUVWXYZ".charAt(Math.floor(Math.random() * 26));
        password += "abcdefghijklmnopqrstuvwxyz".charAt(Math.floor(Math.random() * 26));
        password += "0123456789".charAt(Math.floor(Math.random() * 10));
        password += "!@#$%^&*()_+".charAt(Math.floor(Math.random() * 12));
        
        // Fill the rest
        for (let i = 4; i < length; i++) {
            password += charset.charAt(Math.floor(Math.random() * charset.length));
        }
        
        // Shuffle the password
        password = password.split('').sort(() => Math.random() - 0.5).join('');
        
        passwordInput.value = password;
        state.password = password;
        state.generatedPassword = password;
        
        // Update password strength
        updatePasswordStrength();
        
        // Enable next button
        validateStep1();
        
        showNotificationMessage('Password dibuat', 'Password kuat telah berhasil dibuat', 'success');
    }

    function initPasswordStrength() {
        passwordInput.addEventListener('input', updatePasswordStrength);
    }

    function updatePasswordStrength() {
        const password = passwordInput.value;
        let strength = 0;
        let text = 'Kosong';
        let width = 0;
        let color = '#e74c3c';
        
        if (password.length > 0) {
            strength++;
            
            // Length check
            if (password.length >= 8) strength++;
            if (password.length >= 12) strength++;
            
            // Complexity checks
            if (/[A-Z]/.test(password)) strength++;
            if (/[0-9]/.test(password)) strength++;
            if (/[^A-Za-z0-9]/.test(password)) strength++;
            
            // Determine strength level
            if (strength <= 2) {
                text = 'Lemah';
                width = 33;
                color = '#e74c3c';
            } else if (strength <= 4) {
                text = 'Sedang';
                width = 66;
                color = '#f39c12';
            } else {
                text = 'Kuat';
                width = 100;
                color = '#2ecc71';
            }
        }
        
        passwordStrength.style.width = `${width}%`;
        passwordStrength.style.backgroundColor = color;
        passwordStrengthText.textContent = text;
        passwordStrengthText.style.color = color;
    }

    function goToStep2() {
        if (validateStep1(true)) {
            // If password is empty, generate one
            if (!state.password) {
                generateStrongPassword();
            }
            
            goToStep(2);
        }
    }

    // Step 2: Package Selection
    function loadPackages() {
        // Clear container
        packageOptionsContainer.innerHTML = '';
        
        // Load packages from config
        window.packages.forEach((pkg, index) => {
            const packageCard = document.createElement('div');
            packageCard.className = 'package-card';
            packageCard.dataset.index = index;
            
            // Check if this is a reseller package
            const isReseller = pkg.name.toLowerCase().includes('resseler') || pkg.name.toLowerCase().includes('reseller');
            
            packageCard.innerHTML = `
                ${isReseller ? '<div class="package-badge">RESSELER</div>' : ''}
                <h3 class="package-name">${pkg.name}</h3>
                <div class="package-price">${formatCurrency(pkg.price)}<span>/bulan</span></div>
                <div class="package-specs">
                    <div class="spec-item">
                        <i class="fas fa-memory"></i>
                        <span>RAM: ${pkg.ram}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-microchip"></i>
                        <span>CPU: ${pkg.cpu}</span>
                    </div>
                    <div class="spec-item">
                        <i class="fas fa-hdd"></i>
                        <span>Disk: ${pkg.disk}</span>
                    </div>
                </div>
                <button class="btn-secondary select-package-btn" style="width: 100%;">
                    Pilih Paket
                </button>
            `;
            
            // Add click event
            const selectBtn = packageCard.querySelector('.select-package-btn');
            selectBtn.addEventListener('click', () => selectPackage(index));
            
            packageOptionsContainer.appendChild(packageCard);
        });
    }

    function selectPackage(index) {
        // Deselect all packages
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Select the clicked package
        const selectedCard = document.querySelector(`.package-card[data-index="${index}"]`);
        selectedCard.classList.add('selected');
        
        // Update state
        state.selectedPackage = window.packages[index];
        
        // Enable next button
        nextStep2Btn.disabled = false;
        
        showNotificationMessage('Paket dipilih', `${state.selectedPackage.name} telah dipilih`, 'success');
    }

    function updatePackageSelection() {
        // Reset selection
        document.querySelectorAll('.package-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        nextStep2Btn.disabled = true;
        state.selectedPackage = null;
    }

    function validateStep2() {
        if (!state.selectedPackage) {
            showNotificationMessage('Pilih paket', 'Silakan pilih paket panel terlebih dahulu', 'error');
            return false;
        }
        return true;
    }

    function goToStep3() {
        if (validateStep2()) {
            goToStep(3);
        }
    }

    // Step 3: Payment
    function initializePayment() {
        // Update payment summary
        summaryPackage.textContent = state.selectedPackage.name;
        summaryBasePrice.textContent = formatCurrency(state.selectedPackage.price);
        
        // Generate unique code (random 3 digits)
        state.uniqueCode = Math.floor(Math.random() * 900) + 100;
        summaryUniqueCode.textContent = formatCurrency(state.uniqueCode);
        
        // Calculate total
        state.totalPayment = state.selectedPackage.price + state.uniqueCode;
        summaryTotal.textContent = formatCurrency(state.totalPayment);
        
        // Generate QRIS (simulated)
        generateQRIS();
        
        // Start countdown
        startCountdown();
        
        // Generate transaction ID
        state.transactionId = 'TXN-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        
        // Reset payment status
        state.paymentStatus = 'pending';
        updatePaymentStatusUI();
        
        // Simulate payment checking after 30 seconds
        setTimeout(() => {
            if (state.paymentStatus === 'pending') {
                // 70% chance of successful payment after 30 seconds (simulation)
                if (Math.random() > 0.3) {
                    simulateSuccessfulPayment();
                }
            }
        }, 30000);
    }

    function generateQRIS() {
        // In a real application, this would call an API to generate QRIS
        // For simulation, we'll create a placeholder with animation
        
        qrisPlaceholder.innerHTML = `
            <div class="qris-loading">
                <i class="fas fa-qrcode"></i>
                <p>Generating QR Code...</p>
            </div>
        `;
        
        // Simulate QR generation delay
        setTimeout(() => {
            // Create a simulated QR code (in reality, this would be an image from API)
            const qrSize = 250;
            const qrCanvas = document.createElement('canvas');
            qrCanvas.width = qrSize;
            qrCanvas.height = qrSize;
            const ctx = qrCanvas.getContext('2d');
            
            // Draw a simulated QR code (just for demo)
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, qrSize, qrSize);
            
            // Draw QR pattern (simplified)
            ctx.fillStyle = '#000';
            
            // Draw position markers
            ctx.fillRect(20, 20, 50, 50);
            ctx.fillRect(qrSize - 70, 20, 50, 50);
            ctx.fillRect(20, qrSize - 70, 50, 50);
            
            // Draw some random blocks to simulate QR data
            for (let i = 0; i < 200; i++) {
                const x = Math.floor(Math.random() * (qrSize - 40)) + 20;
                const y = Math.floor(Math.random() * (qrSize - 40)) + 20;
                // Avoid position markers
                if (!((x >= 20 && x <= 70 && y >= 20 && y <= 70) ||
                      (x >= qrSize - 70 && x <= qrSize - 20 && y >= 20 && y <= 70) ||
                      (x >= 20 && x <= 70 && y >= qrSize - 70 && y <= qrSize - 20))) {
                    ctx.fillRect(x, y, 10, 10);
                }
            }
            
            // Add text
            ctx.fillStyle = '#4361ee';
            ctx.font = 'bold 16px Inter';
            ctx.textAlign = 'center';
            ctx.fillText('QRIS Payment', qrSize/2, qrSize - 20);
            
            // Convert to data URL and display
            const qrDataURL = qrCanvas.toDataURL();
            
            qrisPlaceholder.innerHTML = `
                <img src="${qrDataURL}" alt="QRIS Payment Code">
            `;
            
            showNotificationMessage('QRIS siap', 'Scan kode QR untuk melanjutkan pembayaran', 'success');
        }, 1500);
    }

    function startCountdown() {
        // Reset countdown
        state.countdownSeconds = 300; // 5 minutes
        
        // Clear any existing interval
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
        }
        
        // Update UI immediately
        updateCountdownUI();
        
        // Start countdown interval
        state.countdownInterval = setInterval(() => {
            state.countdownSeconds--;
            updateCountdownUI();
            
            // Check if time's up
            if (state.countdownSeconds <= 0) {
                clearInterval(state.countdownInterval);
                handlePaymentExpired();
            }
        }, 1000);
    }

    function updateCountdownUI() {
        const minutes = Math.floor(state.countdownSeconds / 60);
        const seconds = state.countdownSeconds % 60;
        
        minutesElement.textContent = minutes.toString().padStart(2, '0');
        secondsElement.textContent = seconds.toString().padStart(2, '0');
        
        // Update progress bar
        const progressPercentage = (state.countdownSeconds / 300) * 100;
        countdownBar.style.width = `${progressPercentage}%`;
        
        // Change color when less than 1 minute
        if (state.countdownSeconds < 60) {
            countdownBar.style.background = 'linear-gradient(90deg, #e74c3c, #c0392b)';
            minutesElement.parentElement.style.color = '#e74c3c';
            secondsElement.parentElement.style.color = '#e74c3c';
        } else {
            countdownBar.style.background = 'linear-gradient(90deg, var(--primary-color), var(--secondary-color))';
            minutesElement.parentElement.style.color = '';
            secondsElement.parentElement.style.color = '';
        }
    }

    function updatePaymentStatusUI() {
        if (state.paymentStatus === 'pending') {
            paymentStatusContainer.innerHTML = `
                <div class="status-waiting">
                    <i class="fas fa-hourglass-half"></i>
                    <p>Menunggu pembayaran...</p>
                </div>
            `;
        } else if (state.paymentStatus === 'success') {
            paymentStatusContainer.innerHTML = `
                <div class="status-success">
                    <i class="fas fa-check-circle" style="color: #2ecc71; font-size: 48px;"></i>
                    <p style="color: #2ecc71; font-weight: 600;">Pembayaran berhasil!</p>
                    <p>Panel sedang dibuat...</p>
                </div>
            `;
        } else if (state.paymentStatus === 'failed') {
            paymentStatusContainer.innerHTML = `
                <div class="status-failed">
                    <i class="fas fa-times-circle" style="color: #e74c3c; font-size: 48px;"></i>
                    <p style="color: #e74c3c; font-weight: 600;">Pembayaran gagal atau expired</p>
                </div>
            `;
        }
    }

    function checkPaymentStatus() {
        // Simulate checking payment status
        showNotificationMessage('Memeriksa pembayaran', 'Memeriksa status pembayaran...', 'info');
        
        // In real implementation, this would call your payment API
        setTimeout(() => {
            // For simulation, 40% chance payment is completed
            if (Math.random() > 0.6 && state.paymentStatus === 'pending') {
                simulateSuccessfulPayment();
            } else {
                showNotificationMessage('Belum dibayar', 'Pembayaran belum diterima', 'warning');
            }
        }, 2000);
    }

    function simulateSuccessfulPayment() {
        // Update payment status
        state.paymentStatus = 'success';
        updatePaymentStatusUI();
        
        // Clear countdown
        clearInterval(state.countdownInterval);
        
        showNotificationMessage('Pembayaran berhasil', 'Pembayaran telah diverifikasi', 'success');
        
        // Simulate creating Pterodactyl account and server
        setTimeout(() => {
            createPterodactylAccount();
        }, 2000);
    }

    function createPterodactylAccount() {
        // In a real implementation, this would call Pterodactyl API
        // For simulation, we'll generate mock data
        
        showNotificationMessage('Membuat akun', 'Membuat akun panel Pterodactyl...', 'info');
        
        setTimeout(() => {
            // Generate server ID
            const serverId = 'SRV-' + Date.now().toString().substr(-8) + '-' + Math.floor(Math.random() * 1000);
            
            // Use provided password or generated one
            const finalPassword = state.password || state.generatedPassword;
            
            // Create server details
            state.serverDetails = {
                username: state.username,
                password: finalPassword,
                serverId: serverId,
                package: state.selectedPackage.name,
                specs: `${state.selectedPackage.ram} RAM, ${state.selectedPackage.cpu} CPU, ${state.selectedPackage.disk} Disk`,
                panelLink: window.config.domainPanel + '/auth/login',
                created: new Date().toLocaleString()
            };
            
            // Move to step 4
            goToStep(4);
            
            showNotificationMessage('Panel berhasil dibuat', 'Panel Pterodactyl siap digunakan', 'success');
        }, 3000);
    }

    function cancelTransaction() {
        if (confirm('Batalkan transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
            // Clear countdown
            clearInterval(state.countdownInterval);
            
            // Update payment status
            state.paymentStatus = 'failed';
            
            showNotificationMessage('Transaksi dibatalkan', 'Transaksi telah dibatalkan', 'warning');
            
            // Reset system after 2 seconds
            setTimeout(() => {
                resetSystem();
            }, 2000);
        }
    }

    function handlePaymentExpired() {
        state.paymentStatus = 'failed';
        updatePaymentStatusUI();
        
        showNotificationMessage('Pembayaran expired', 'Waktu pembayaran telah habis', 'error');
        
        // Reset system after 3 seconds
        setTimeout(() => {
            resetSystem();
        }, 3000);
    }

    // Step 4: Results
    function displayServerDetails() {
        if (!state.serverDetails) return;
        
        resultUsername.textContent = state.serverDetails.username;
        resultPassword.textContent = state.serverDetails.password;
        resultServerId.textContent = state.serverDetails.serverId;
        resultPackage.textContent = state.serverDetails.package;
        resultSpecs.textContent = state.serverDetails.specs;
        resultPanelLink.textContent = state.serverDetails.panelLink;
    }

    function openPanel() {
        if (state.serverDetails && state.serverDetails.panelLink) {
            window.open(state.serverDetails.panelLink, '_blank');
        }
    }

    // Utility Functions
    function formatCurrency(amount) {
        return 'Rp ' + amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    }

    function copyToClipboard(text, button) {
        navigator.clipboard.writeText(text).then(() => {
            // Change button icon temporarily
            const originalIcon = button.innerHTML;
            button.innerHTML = '<i class="fas fa-check"></i>';
            button.style.background = '#2ecc71';
            button.style.borderColor = '#2ecc71';
            button.style.color = 'white';
            
            showNotificationMessage('Disalin', 'Teks telah disalin ke clipboard', 'success');
            
            // Revert button after 2 seconds
            setTimeout(() => {
                button.innerHTML = originalIcon;
                button.style.background = '';
                button.style.borderColor = '';
                button.style.color = '';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy: ', err);
            showNotificationMessage('Gagal menyalin', 'Gagal menyalin teks ke clipboard', 'error');
        });
    }

    function showNotificationMessage(title, message, type = 'info') {
        const notificationContainer = document.getElementById('notificationContainer');
        const notificationId = 'notif-' + Date.now();
        
        const iconMap = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'warning': 'fas fa-exclamation-triangle',
            'info': 'fas fa-info-circle'
        };
        
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.id = notificationId;
        
        notification.innerHTML = `
            <i class="${iconMap[type]}"></i>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
            <button class="notification-close" onclick="document.getElementById('${notificationId}').remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        notificationContainer.appendChild(notification);
        
        // Auto-remove after 5 seconds
        setTimeout(() => {
            const notif = document.getElementById(notificationId);
            if (notif) {
                notif.style.opacity = '0';
                notif.style.transform = 'translateX(100%)';
                setTimeout(() => notif.remove(), 300);
            }
        }, 5000);
    }

    function resetSystem() {
        // Reset all state
        state.currentStep = 1;
        state.username = '';
        state.password = '';
        state.selectedPackage = null;
        state.paymentAmount = 0;
        state.uniqueCode = 0;
        state.totalPayment = 0;
        state.transactionId = '';
        state.paymentStatus = 'pending';
        state.countdownSeconds = 300;
        state.serverDetails = null;
        state.generatedPassword = '';
        
        // Clear any countdown interval
        if (state.countdownInterval) {
            clearInterval(state.countdownInterval);
        }
        
        // Reset UI
        usernameInput.value = '';
        passwordInput.value = '';
        updatePasswordStrength();
        updatePackageSelection();
        
        // Go back to step 1
        goToStep(1);
        
        showNotificationMessage('System reset', 'Sistem telah direset untuk pesanan baru', 'info');
    }
});