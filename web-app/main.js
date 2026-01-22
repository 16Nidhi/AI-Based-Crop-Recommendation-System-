document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    const currentPage = window.location.pathname.split('/').pop();
    loadUserData();
    
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
    }
}

function loadUserData() {
    const userData = localStorage.getItem('agrismart_user');
    if (userData) {
        const user = JSON.parse(userData);
        updateUserInterface(user);
    }
}

function updateUserInterface(user) {
    const profileLinks = document.querySelectorAll('.profile-info');
    profileLinks.forEach(link => {
        link.textContent = user.name || 'User';
    });
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
    localStorage.removeItem('agrismart_user');
    window.location.href = 'index.html';
}
