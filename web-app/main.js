document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const currentPage = window.location.pathname.split('/').pop();
    
    // Initialize common functionality
    initCommonFeatures();
    
    // Load user data and update navigation
    loadUserData();
    
    // Initialize page-specific functionality
    if (currentPage === 'crop-recommendation.html') {
        initCropRecommendation();
    } else if (currentPage === 'disease-detection.html') {
        initDiseaseDetection();
    } else if (currentPage === 'weather.html') {
        initWeather();
    } else if (currentPage === 'market-price.html') {
        initMarketPrices();
    } else if (currentPage === 'chatbot.html') {
        initChatbot();
    } else if (currentPage === 'profile.html') {
        initProfile();
    } else if (currentPage === 'dashboard.html') {
        initDashboard();
    } else if (currentPage === 'history.html') {
        initHistory();
    } else if (currentPage === 'settings.html') {
        initSettings();
    } else if (currentPage === 'login.html') {
        initLogin();
    }
    
    // Track page visit
    Analytics.trackAction('page_visit', { page: currentPage });
}

function initCommonFeatures() {
    // Update navigation for all pages
    Navigation.updateNavigation();
    
    // Setup mobile app integration
    if (CrossPlatform.isMobileApp()) {
        document.body.classList.add('mobile-app');
        CrossPlatform.syncWithMobile();
    }
    
    // Setup offline indicators
    setupOfflineIndicators();
    
    // Check for page data
    const pageData = Navigation.getPageData();
    if (pageData) {
        handlePageData(pageData);
    }
}

function loadUserData() {
    const userData = StorageManager.getUser();
    if (userData) {
        updateUserInterface(userData);
        // Auto-sync with mobile if available
        if (CrossPlatform.isMobileApp()) {
            CrossPlatform.syncWithMobile();
        }
    } else {
        // If not on login page and no user data, redirect to login
        const currentPage = window.location.pathname.split('/').pop();
        const publicPages = ['login.html', 'login', 'index.html', 'index', ''];
        if (!publicPages.includes(currentPage)) {
            window.location.href = 'login.html';
        }
    }
}

function updateUserInterface(user) {
    // Update profile links and user name displays
    const profileLinks = document.querySelectorAll('.profile-info, .user-name');
    profileLinks.forEach(link => {
        link.textContent = user.name || user.phone || 'User';
    });
    
    // Update user avatar if present
    const avatars = document.querySelectorAll('.user-avatar');
    avatars.forEach(avatar => {
        avatar.src = user.avatar || 'https://via.placeholder.com/40/4CAF50/FFFFFF?text=U';
        avatar.alt = user.name || 'User';
    });
    
    // Update welcome messages
    const welcomeMessages = document.querySelectorAll('.welcome-user');
    welcomeMessages.forEach(msg => {
        msg.textContent = `Welcome, ${user.name || user.phone}!`;
    });
    
    // Update location-based content if available
    if (user.location) {
        const locationElements = document.querySelectorAll('.user-location');
        locationElements.forEach(el => {
            el.textContent = user.location;
        });
    }
}

function showLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '<div class="loading"><div class="spinner"></div><p>Loading...</p></div>';
    }
}

function hideLoading(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.innerHTML = '';
    }
}

function showAlert(message, type = 'success') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    
    const container = document.querySelector('.container');
    if (container) {
        container.insertBefore(alertDiv, container.firstChild);
        setTimeout(() => {
            alertDiv.remove();
        }, 5000);
    }
}

function initCropRecommendation() {
    const form = document.getElementById('crop-form');
    if (form) {
        form.addEventListener('submit', handleCropRecommendation);
    }
}

async function handleCropRecommendation(e) {
    e.preventDefault();
    showLoading('crop-results');
    
    const formData = {
        nitrogen: document.getElementById('nitrogen').value,
        phosphorus: document.getElementById('phosphorus').value,
        potassium: document.getElementById('potassium').value,
        ph: document.getElementById('ph').value,
        rainfall: document.getElementById('rainfall').value,
        temperature: document.getElementById('temperature').value,
        humidity: document.getElementById('humidity').value,
        location: document.getElementById('location').value
    };

    try {
        const recommendations = await API.getCropRecommendation(formData);
        displayCropRecommendations(recommendations);
    } catch (error) {
        showAlert('Error getting recommendations. Please try again.', 'error');
        hideLoading('crop-results');
    }
}

function displayCropRecommendations(data) {
    const resultsDiv = document.getElementById('crop-results');
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Recommended Crops</h3>
            <div class="crop-list">
                ${data.crops.map(crop => `
                    <div class="crop-item">
                        <h4>${crop.name}</h4>
                        <p>Suitability: ${crop.suitability}%</p>
                        <p>Expected Yield: ${crop.yield} kg/acre</p>
                        <p>Profit Margin: ₹${crop.profit}</p>
                        <p>Sustainability Score: ${crop.sustainability}/10</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initDiseaseDetection() {
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('disease-image');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleDiseaseImage);
    }
}

async function handleDiseaseImage(e) {
    const file = e.target.files[0];
    if (!file) return;

    showLoading('disease-results');
    
    const formData = new FormData();
    formData.append('image', file);

    try {
        const result = await API.detectDisease(formData);
        displayDiseaseResults(result);
    } catch (error) {
        showAlert('Error detecting disease. Please try again.', 'error');
        hideLoading('disease-results');
    }
}

function displayDiseaseResults(data) {
    const resultsDiv = document.getElementById('disease-results');
    resultsDiv.innerHTML = `
        <div class="result-card">
            <h3>Detection Results</h3>
            <p><strong>Disease:</strong> ${data.disease}</p>
            <p><strong>Confidence:</strong> ${data.confidence}%</p>
            <p><strong>Severity:</strong> ${data.severity}</p>
            <h4>Treatment Recommendations:</h4>
            <ul>
                ${data.treatments.map(treatment => `<li>${treatment}</li>`).join('')}
            </ul>
            <h4>Prevention Tips:</h4>
            <ul>
                ${data.prevention.map(tip => `<li>${tip}</li>`).join('')}
            </ul>
        </div>
    `;
}

function initWeather() {
    const locationInput = document.getElementById('weather-location');
    const searchBtn = document.getElementById('search-weather');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const location = locationInput.value;
            fetchWeatherData(location);
        });
    }
    
    fetchWeatherData('Default');
}

async function fetchWeatherData(location) {
    showLoading('weather-display');
    
    try {
        const weatherData = await API.getWeather(location);
        displayWeather(weatherData);
    } catch (error) {
        showAlert('Error fetching weather data. Please try again.', 'error');
        hideLoading('weather-display');
    }
}

function displayWeather(data) {
    const weatherDiv = document.getElementById('weather-display');
    weatherDiv.innerHTML = `
        <div class="weather-current">
            <h3>${data.location}</h3>
            <p class="temp">${data.current.temperature}°C</p>
            <p>${data.current.condition}</p>
            <p>Humidity: ${data.current.humidity}%</p>
            <p>Wind: ${data.current.windSpeed} km/h</p>
        </div>
        <div class="weather-forecast">
            <h3>7-Day Forecast</h3>
            <div class="forecast-grid">
                ${data.forecast.map(day => `
                    <div class="weather-card">
                        <p><strong>${day.date}</strong></p>
                        <p>${day.condition}</p>
                        <p>${day.temp}°C</p>
                        <p>Rain: ${day.rainfall}mm</p>
                    </div>
                `).join('')}
            </div>
        </div>
    `;
}

function initMarketPrices() {
    const cropSelect = document.getElementById('crop-select');
    const searchBtn = document.getElementById('search-prices');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const crop = cropSelect.value;
            fetchMarketPrices(crop);
        });
    }
    
    fetchMarketPrices('wheat');
}

async function fetchMarketPrices(crop) {
    showLoading('price-display');
    
    try {
        const priceData = await API.getMarketPrices(crop);
        displayMarketPrices(priceData);
    } catch (error) {
        showAlert('Error fetching market prices. Please try again.', 'error');
        hideLoading('price-display');
    }
}

function displayMarketPrices(data) {
    const priceDiv = document.getElementById('price-display');
    priceDiv.innerHTML = `
        <h3>Market Prices for ${data.crop}</h3>
        <table class="price-table">
            <thead>
                <tr>
                    <th>Market</th>
                    <th>Price (₹/kg)</th>
                    <th>Change</th>
                    <th>Demand</th>
                </tr>
            </thead>
            <tbody>
                ${data.markets.map(market => `
                    <tr>
                        <td>${market.location}</td>
                        <td>₹${market.price}</td>
                        <td>${market.change > 0 ? '+' : ''}${market.change}%</td>
                        <td>${market.demand}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        <div class="price-chart">
            <h4>Price Trend (Last 30 Days)</h4>
            <p>Average Price: ₹${data.avgPrice}</p>
            <p>Highest: ₹${data.maxPrice} | Lowest: ₹${data.minPrice}</p>
        </div>
    `;
}

function initChatbot() {
    const sendBtn = document.getElementById('send-message');
    const messageInput = document.getElementById('message-input');
    const voiceBtn = document.getElementById('voice-input');
    
    if (sendBtn) {
        sendBtn.addEventListener('click', () => sendMessage());
    }
    
    if (messageInput) {
        messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') sendMessage();
        });
    }
    
    if (voiceBtn) {
        voiceBtn.addEventListener('click', startVoiceInput);
    }
}

async function sendMessage() {
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    addMessageToChat(message, 'user');
    input.value = '';
    
    try {
        const response = await API.sendChatMessage(message);
        addMessageToChat(response.message, 'bot');
    } catch (error) {
        addMessageToChat('Sorry, I could not process your request.', 'bot');
    }
}

function addMessageToChat(text, sender) {
    const messagesDiv = document.getElementById('chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}`;
    messageDiv.textContent = text;
    messagesDiv.appendChild(messageDiv);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function startVoiceInput() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.lang = 'en-US';
        recognition.onresult = function(event) {
            const transcript = event.results[0][0].transcript;
            document.getElementById('message-input').value = transcript;
        };
        recognition.start();
    } else {
        showAlert('Voice input not supported in this browser', 'error');
    }
}

function initProfile() {
    loadProfileData();
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
}

function loadProfileData() {
    const userData = localStorage.getItem('agrismart_user');
    if (userData) {
        const user = JSON.parse(userData);
        displayProfileData(user);
    }
}

function displayProfileData(user) {
    const profileDiv = document.getElementById('profile-data');
    if (profileDiv) {
        profileDiv.innerHTML = `
            <div class="profile-section">
                <h3>Profile Information</h3>
                <p><strong>Name:</strong> ${user.name}</p>
                <p><strong>Email:</strong> ${user.email}</p>
                <p><strong>Location:</strong> ${user.location}</p>
                <p><strong>Farm Size:</strong> ${user.farmSize} acres</p>
            </div>
        `;
    }
}

function handleLogout() {
    StorageManager.removeUser();
    StorageManager.removeToken();
    Analytics.trackAction('logout');
    window.location.href = 'index.html';
}

// ============================================
// PAGE-SPECIFIC INITIALIZATION FUNCTIONS
// ============================================

function initDashboard() {
    if (!Navigation.requireAuth()) return;
    
    loadDashboardStats();
    loadRecentActivity();
    setupQuickActions();
}

function initHistory() {
    if (!Navigation.requireAuth()) return;
    
    loadHistoryData();
    setupHistoryFilters();
}

function initSettings() {
    if (!Navigation.requireAuth()) return;
    
    loadUserSettings();
    setupSettingsHandlers();
}

function initLogin() {
    // If already logged in, redirect to dashboard
    const user = StorageManager.getUser();
    if (user) {
        window.location.href = 'dashboard.html';
        return;
    }
    
    setupLoginForm();
}

// ============================================
// COMMON UTILITY FUNCTIONS
// ============================================

function setupOfflineIndicators() {
    // Show offline indicator when offline
    window.addEventListener('offline', () => {
        Notifications.show('You are offline. Some features may not work.', 'warning');
    });
    
    window.addEventListener('online', () => {
        Notifications.show('You are back online!', 'success');
    });
}

function handlePageData(data) {
    // Handle data passed between pages
    if (data.type === 'crop_recommendation_result') {
        // Auto-fill form with previous data
        if (data.formData) {
            Object.keys(data.formData).forEach(key => {
                const element = document.getElementById(key);
                if (element) element.value = data.formData[key];
            });
        }
    }
}

function loadDashboardStats() {
    const history = StorageManager.getHistory();
    
    // Calculate statistics
    const stats = {
        totalRecommendations: history.filter(h => h.type === 'crop-recommendation').length,
        diseaseDetections: history.filter(h => h.type === 'disease-detection').length,
        weatherChecks: history.filter(h => h.type === 'weather-check').length,
        marketQueries: history.filter(h => h.type === 'market-price').length
    };
    
    // Update dashboard stats
    updateDashboardUI(stats);
}

function updateDashboardUI(stats) {
    const statElements = {
        'total-crops': stats.totalRecommendations,
        'disease-checks': stats.diseaseDetections,
        'weather-queries': stats.weatherChecks,
        'market-checks': stats.marketQueries
    };
    
    Object.keys(statElements).forEach(key => {
        const element = document.querySelector(`#${key} .stat-value`);
        if (element) element.textContent = statElements[key];
    });
}

function loadRecentActivity() {
    const history = StorageManager.getHistory();
    const recentActivity = history.slice(-5).reverse();
    
    const activityContainer = document.getElementById('recent-activity');
    if (activityContainer) {
        if (recentActivity.length === 0) {
            activityContainer.innerHTML = '<p>No recent activity</p>';
            return;
        }
        
        const activityHTML = recentActivity.map(activity => `
            <div class="activity-item" onclick="Navigation.goToPageWithData('history.html', {filter: '${activity.type}'})">
                <div class="activity-icon">${getActivityIcon(activity.type)}</div>
                <div class="activity-details">
                    <h5>${formatActivityTitle(activity)}</h5>
                    <small>${DateUtils.timeAgo(activity.timestamp)}</small>
                </div>
            </div>
        `).join('');
        
        activityContainer.innerHTML = activityHTML;
    }
}

function getActivityIcon(type) {
    const icons = {
        'crop-recommendation': '🌾',
        'disease-detection': '🔬',
        'weather-check': '🌤️',
        'market-price': '💰',
        'chatbot': '💬'
    };
    return icons[type] || '📊';
}

function formatActivityTitle(activity) {
    switch(activity.type) {
        case 'crop-recommendation':
            return `Crop Recommendation - ${activity.crop || 'Unknown'}`;
        case 'disease-detection':
            return `Disease Detection - ${activity.disease || 'Analyzed'}`;
        case 'weather-check':
            return `Weather Check - ${activity.location || 'Local'}`;
        case 'market-price':
            return `Market Price - ${activity.crop || 'Commodity'}`;
        case 'chatbot':
            return 'Chatbot Consultation';
        default:
            return 'Activity';
    }
}

function setupQuickActions() {
    // Add click handlers for quick action cards
    const quickActions = document.querySelectorAll('.feature-card[onclick], .quick-action');
    quickActions.forEach(action => {
        action.addEventListener('click', function(e) {
            const href = this.getAttribute('href') || this.dataset.href;
            if (href) {
                Analytics.trackAction('quick_action_click', {action: href});
            }
        });
    });
}

function setupLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    FormUtils.autoSave('login-form', 'login');
    
    loginForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        const loginData = {
            phone: formData.get('phone'),
            password: formData.get('password'),
            remember: formData.get('remember-me') === 'on'
        };
        
        try {
            showLoading('login-btn', 'Logging in...');
            
            // Simulate login API call
            const response = await API.login(loginData);
            
            if (response.success) {
                StorageManager.setUser(response.user);
                StorageManager.setToken(response.token);
                Analytics.trackAction('login', {method: 'phone'});
                
                FormUtils.clearSaved('login');
                Notifications.show('Login successful!', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
            } else {
                throw new Error(response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            Notifications.show(error.message || 'Login failed. Please try again.', 'error');
        } finally {
            hideLoading('login-btn');
            document.querySelector('#login-form button[type="submit"]').textContent = 'Login';
        }
    });
}
