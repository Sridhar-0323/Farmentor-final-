const WEATHER_API_KEY = "f9bfc493b2345558b50bc0b0b1a13029";
const NEWS_API_KEY = "34e3af9a31c64a50a3793a778534c0b3";
const MARKET_API_KEY = "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b";
const GEMINI_API_KEY = "AQ.Ab8RN6L-igtUDZ_eev5TzMoqqBBxA_zrh1vupHmsnukbdw6w-g";

// Utility function to toggle visibility
function showElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'block';
}

function hideElement(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
}

// Weather Module Logic
async function fetchWeather() {
    const cityInput = document.getElementById('cityInput').value.trim();
    if (!cityInput) return alert('Please enter a city name.');

    const loaderId = 'weatherLoader';
    const resultId = 'weatherResult';

    showElement(loaderId);
    hideElement(resultId);

    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityInput}&appid=${WEATHER_API_KEY}&units=metric`);
        const data = await response.json();

        hideElement(loaderId);

        if (response.ok) {
            document.getElementById('cityName').textContent = `${data.name}, ${data.sys.country}`;
            document.getElementById('temperature').textContent = `${Math.round(data.main.temp)}°C`;
            document.getElementById('condition').textContent = data.weather[0].main;
            document.getElementById('humidity').textContent = `${data.main.humidity}%`;
            document.getElementById('windSpeed').textContent = `${data.wind.speed} m/s`;
            showElement(resultId);
        } else {
            // Handle error (or placeholder logic)
            if (data.message === "Invalid API key. Please see https://openweathermap.org/faq#error401 for more info.") {
                alert("API Key is missing or invalid. Please add a valid OpenWeatherMap API key.");
            } else {
                alert(`Error: ${data.message}`);
            }
        }
    } catch (error) {
        hideElement(loaderId);
        console.error("Fetch error: ", error);
        alert("Failed to fetch weather data. Check console for details.");
    }
}

// Market Price Module Logic
const fallbackMarketData = [
    { name: "Rice", price: "₹2,500 / Quintal", trend: "up", trendText: "+2.1%", variety: "Basmati", market: "Delhi Mandi", date: "Updated Today" },
    { name: "Wheat", price: "₹2,125 / Quintal", trend: "down", trendText: "-0.5%", variety: "Lokwan", market: "Punjab Mandi", date: "Updated Today" },
    { name: "Corn", price: "₹1,850 / Quintal", trend: "up", trendText: "+1.2%", variety: "Hybrid", market: "Maharashtra", date: "Updated Yesterday" },
    { name: "Cotton", price: "₹6,000 / Quintal", trend: "up", trendText: "+3.4%", variety: "Long Staple", market: "Gujarat", date: "Updated Today" },
    { name: "Sugarcane", price: "₹3,150 / Tonne", trend: "down", trendText: "-1.1%", variety: "Standard", market: "UP Mandi", date: "Updated Today" }
];

async function fetchMarketPrices(query = "") {
    const grid = document.getElementById('marketGrid');
    if (!grid) return;

    grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Loading market prices...</p>";

    try {
        // If no API key is provided, use fallback data for demonstration
        if (MARKET_API_KEY === "579b464db66ec23bdd000001cdd3946e44ce4aad7209ff7b23ac571b") {
            throw new Error("API_KEY_MISSING");
        }

        // Example using commodities-api.com (You can change the URL to api.data.gov.in or any other Market API)
        const response = await fetch(`https://commodities-api.com/api/latest?access_key=${MARKET_API_KEY}&base=INR&symbols=RICE,WHEAT,CORN`);
        const data = await response.json();

        if (data.success) {
            grid.innerHTML = "";
            // Render actual API data...
            // Note: Adapting this depends heavily on the exact JSON structure of your chosen Market API.
            // Here is a generic renderer assuming a key-value pair of rates
            Object.entries(data.data.rates).forEach(([crop, price]) => {
                const card = document.createElement('div');
                card.className = 'price-card glass-panel';
                card.innerHTML = `
                    <div class="crop-name">${crop}</div>
                    <div class="crop-price">₹${(1/price).toFixed(2)}</div>
                    <div class="price-trend trend-up">▲ Live Data</div>
                `;
                grid.appendChild(card);
            });
        } else {
            grid.innerHTML = `<p style='text-align:center; grid-column:1/-1; color: red;'>API Error: ${data.error ? data.error.info : "Invalid API response"}</p>`;
        }

    } catch (error) {
        if (error.message === "API_KEY_MISSING") {
            // Render Fallback Static Data
            grid.innerHTML = "";
            const filtered = fallbackMarketData.filter(item => item.name.toLowerCase().includes(query.toLowerCase()));
            
            if (filtered.length === 0) {
                grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>No crops found matching your search.</p>";
                return;
            }

            filtered.forEach(item => {
                const trendClass = item.trend === 'up' ? 'trend-up' : 'trend-down';
                const trendIcon = item.trend === 'up' ? '▲' : '▼';

                const card = document.createElement('div');
                card.className = 'price-card glass-panel';
                card.innerHTML = `
                    <div class="crop-name">${item.name} <span style="font-size: 0.8rem; font-weight: normal; color: #666;">(${item.variety})</span></div>
                    <div class="crop-price">${item.price}</div>
                    <div class="price-trend ${trendClass}">${trendIcon} ${item.trendText}</div>
                    <hr style="margin: 10px 0; border: 0; border-top: 1px solid rgba(0,0,0,0.1);">
                    <div style="font-size: 0.85rem; color: #555; text-align: left;">
                        <p>📍 <strong>Market:</strong> ${item.market}</p>
                        <p>🕒 <strong>Date:</strong> ${item.date}</p>
                    </div>
                    <div style="margin-top: 5px; font-size: 0.75rem; color: red;">(Fallback Data - Add Market API Key)</div>
                `;
                grid.appendChild(card);
            });
        } else {
            console.error(error);
            grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Failed to fetch market data.</p>";
        }
    }
}

function filterMarket() {
    const query = document.getElementById('marketInput').value;
    fetchMarketPrices(query);
}

// News Module Logic
async function fetchNews() {
    const queryInput = document.getElementById('newsInput');
    const query = queryInput ? queryInput.value.trim() : "agriculture";

    const loaderId = 'newsLoader';
    const gridId = 'newsGrid';

    const loader = document.getElementById(loaderId);
    const grid = document.getElementById(gridId);

    if (!loader || !grid) return;

    showElement(loaderId);
    grid.innerHTML = "";

    try {
        // Use a CORS proxy to bypass NewsAPI's browser block on free developer plans
        const targetUrl = `https://newsapi.org/v2/everything?q=${query}&apiKey=${NEWS_API_KEY}`;
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
        const response = await fetch(proxyUrl);
        const data = await response.json();

        hideElement(loaderId);

        if (response.ok && data.articles) {
            if (data.articles.length === 0) {
                grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>No news found.</p>";
                return;
            }

            // Display top 12 news
            data.articles.slice(0, 12).forEach(article => {
                if (!article.title || !article.description) return;

                const card = document.createElement('div');
                card.className = 'news-card glass-panel';
                const date = new Date(article.publishedAt).toLocaleDateString();

                card.innerHTML = `
                    <div class="news-title">${article.title}</div>
                    <div class="news-desc">${article.description.substring(0, 100)}...</div>
                    <div class="news-date">${date} • ${article.source.name}</div>
                `;
                grid.appendChild(card);
            });
        } else {
            if (data.code === "apiKeyMissing" || data.code === "apiKeyInvalid") {
                grid.innerHTML = "<p style='text-align:center; grid-column:1/-1; color: red;'>API Key is missing or invalid. Please add a valid NewsAPI key in script.js.</p>";
            } else {
                grid.innerHTML = `<p style='text-align:center; grid-column:1/-1;'>Error: ${data.message}</p>`;
            }
        }
    } catch (error) {
        hideElement(loaderId);
        console.error("Fetch error: ", error);
        grid.innerHTML = "<p style='text-align:center; grid-column:1/-1;'>Failed to fetch news. Check console.</p>";
    }
}

// Chatbot Module Logic (Gemini API Integration)

async function sendChatMessage() {
    const inputField = document.getElementById("chatInput");
    const message = inputField.value.trim();

    if (!message) return;

    addMessageToUI(message, "user");
    inputField.value = "";

    const typingId = "botTyping";
    addMessageToUI("Thinking...", "bot", typingId);

    try {
        // Replace this placeholder in your local development setup.
        if (!GEMINI_API_KEY ||
            GEMINI_API_KEY === "YOUR_NEW_KEY_HERE") {
            throw new Error("Please configure your Gemini API key.");
        }

        const response = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-4-argon:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": "AQ.Ab8RN6L-igtUDZ_eev5TzMoqqBBxA_zrh1vupHmsnukbdw6w-g"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text:
                                        "You are FarmMentor AI, an agricultural advisor. " +
                                        "Give a concise, helpful answer to this farmer's question: " +
                                        message
                                }
                            ]
                        }
                    ],
                    generationConfig: {
                        thinkingConfig: {
                            thinkingLevel: "low"
                        }
                    }
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            throw new Error(
                data.error?.message || "Gemini API request failed."
            );
        }

        const reply = data.candidates?.[0]?.content?.parts
            ?.map(part => part.text || "")
            .join("")
            .trim();

        if (!reply) {
            throw new Error("No response received from Gemini.");
        }

        document.getElementById(typingId)?.remove();
        addMessageToUI(reply, "bot");

    } catch (error) {
        console.error("Gemini error:", error);
        document.getElementById(typingId)?.remove();
        addMessageToUI("Error: " + error.message, "bot");
    }
}


function addMessageToUI(text, sender, id = null) {
    const chatMessages = document.getElementById('chatMessages');
    const msgDiv = document.createElement('div');
    msgDiv.className = `message ${sender}`;
    if (id) msgDiv.id = id;
    
    // Simple markdown parsing for bold text and line breaks
    msgDiv.innerHTML = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>');
    
    chatMessages.appendChild(msgDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight; // Auto-scroll
}

// Language Initialization Logic
function changeLanguage(lang) {
    if (typeof translations === 'undefined' || !translations[lang]) return;
    localStorage.setItem('farmMentorLang', lang);
    
    // Update all elements with data-i18n attribute
    const elements = document.querySelectorAll('[data-i18n]');
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (translations[lang][key]) {
            if (el.tagName === 'INPUT' && el.hasAttribute('placeholder')) {
                el.placeholder = translations[lang][key];
            } else {
                el.innerText = translations[lang][key];
            }
        }
    });
}

function initLanguage() {
    const savedLang = localStorage.getItem('farmMentorLang') || 'en';
    
    // Attempt to sync all language selectors if multiple exist (though usually just one in nav)
    const langSelectors = document.querySelectorAll('#langSelector, .lang-selector');
    langSelectors.forEach(selector => {
        selector.value = savedLang;
    });

    changeLanguage(savedLang);
}

// Initialize things on page load
document.addEventListener('DOMContentLoaded', () => {
    initLanguage();
    // If on market page, fetch initial prices
    if (document.getElementById('marketGrid')) {
        fetchMarketPrices();
    }

    // If on news page, fetch initial news
    if (document.getElementById('newsGrid')) {
        fetchNews();
    }

    // Handle Enter key for inputs
    const cityInput = document.getElementById('cityInput');
    if (cityInput) cityInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchWeather() });

    const marketInput = document.getElementById('marketInput');
    if (marketInput) marketInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') filterMarket() });

    const newsInput = document.getElementById('newsInput');
    if (newsInput) newsInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') fetchNews() });

    const chatInput = document.getElementById('chatInput');
    if (chatInput) chatInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') sendChatMessage() });
});
