const API_BASE_URL = 'http://localhost:5000/api';

const API = {
    async getCropRecommendation(data) {
        try {
            const response = await fetch(`${API_BASE_URL}/crop-recommendation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return {
                crops: [
                    {
                        name: 'Rice',
                        suitability: 92,
                        yield: '55',
                        profit: '110000',
                        sustainability: 8.5
                    },
                    {
                        name: 'Wheat',
                        suitability: 88,
                        yield: '45',
                        profit: '90000',
                        sustainability: 8.2
                    },
                    {
                        name: 'Maize',
                        suitability: 85,
                        yield: '60',
                        profit: '95000',
                        sustainability: 7.8
                    }
                ]
            };
        }
    },

    async detectDisease(formData) {
        try {
            const response = await fetch(`${API_BASE_URL}/disease-detection`, {
                method: 'POST',
                body: formData
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return {
                disease: 'Leaf Blight',
                confidence: 94.5,
                severity: 'Moderate',
                treatments: [
                    'Apply copper-based fungicide',
                    'Remove infected leaves immediately',
                    'Improve air circulation around plants',
                    'Reduce overhead watering'
                ],
                prevention: [
                    'Use disease-resistant varieties',
                    'Practice crop rotation',
                    'Maintain proper plant spacing',
                    'Apply preventive fungicides during wet season'
                ]
            };
        }
    },

    async getWeather(location) {
        try {
            const response = await fetch(`${API_BASE_URL}/weather?location=${encodeURIComponent(location)}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return {
                location: location,
                current: {
                    temperature: 28,
                    condition: 'Partly Cloudy',
                    humidity: 65,
                    windSpeed: 12
                },
                forecast: [
                    { date: 'Mon', condition: 'Sunny', temp: 30, rainfall: 0 },
                    { date: 'Tue', condition: 'Cloudy', temp: 28, rainfall: 5 },
                    { date: 'Wed', condition: 'Rainy', temp: 26, rainfall: 15 },
                    { date: 'Thu', condition: 'Rainy', temp: 25, rainfall: 20 },
                    { date: 'Fri', condition: 'Cloudy', temp: 27, rainfall: 8 },
                    { date: 'Sat', condition: 'Sunny', temp: 29, rainfall: 0 },
                    { date: 'Sun', condition: 'Sunny', temp: 31, rainfall: 0 }
                ]
            };
        }
    },

    async getMarketPrices(crop) {
        try {
            const response = await fetch(`${API_BASE_URL}/market-prices?crop=${encodeURIComponent(crop)}`);
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return {
                crop: crop,
                markets: [
                    { location: 'Mumbai APMC', price: 2450, change: 5.2, demand: 'High' },
                    { location: 'Delhi Azadpur', price: 2380, change: 3.8, demand: 'Medium' },
                    { location: 'Bangalore', price: 2420, change: 4.5, demand: 'High' },
                    { location: 'Kolkata', price: 2350, change: 2.1, demand: 'Medium' },
                    { location: 'Chennai', price: 2400, change: 3.9, demand: 'High' }
                ],
                avgPrice: 2400,
                maxPrice: 2450,
                minPrice: 2350
            };
        }
    },

    async sendChatMessage(message) {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ message, language: 'en' })
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            const responses = [
                'Based on your location and soil conditions, I recommend growing wheat or rice this season.',
                'Leaf blight can be identified by brown spots on leaves. Apply copper-based fungicides for treatment.',
                'Current wheat prices are around ₹2,400 per quintal. Prices have increased by 5% this week.',
                'Irrigation should be done when soil moisture drops below 60%. Check weather forecast before watering.',
                'For better yields, maintain proper soil pH between 6.0-7.5 and ensure adequate NPK levels.',
                'Disease prevention is key. Practice crop rotation and use disease-resistant varieties.'
            ];
            return {
                message: responses[Math.floor(Math.random() * responses.length)]
            };
        }
    },

    async getUserProfile() {
        try {
            const response = await fetch(`${API_BASE_URL}/profile`, {
                headers: {
                    'Authorization': `Bearer ${this.getToken()}`
                }
            });
            
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            
            return await response.json();
        } catch (error) {
            console.error('Error:', error);
            return null;
        }
    },

    async login(email, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });
            
            if (!response.ok) {
                throw new Error('Login failed');
            }
            
            const data = await response.json();
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData)
            });
            
            if (!response.ok) {
                throw new Error('Registration failed');
            }
            
            const data = await response.json();
            this.setToken(data.token);
            return data;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    },

    getToken() {
        return localStorage.getItem('agrismart_token');
    },

    setToken(token) {
        localStorage.setItem('agrismart_token', token);
    },

    removeToken() {
        localStorage.removeItem('agrismart_token');
    }
};

if (typeof module !== 'undefined' && module.exports) {
    module.exports = API;
}
