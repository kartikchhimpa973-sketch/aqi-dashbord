// *** APNI API KEY YAHAN PASTE KAREIN ***
const apiKey = "9990329544165b03510cc2dd45dede05"; 

const searchBtn = document.getElementById('searchBtn');
const locationBtn = document.getElementById('locationBtn');
const cityInput = document.getElementById('cityInput');
const resultDiv = document.getElementById('result');
const loader = document.getElementById('loader');

// --- Event Listeners ---

// 1. Search Button Click
searchBtn.addEventListener('click', () => {
    const city = cityInput.value;
    if(!city) return alert("Please enter a city name!");
    fetchCityAQI(city);
});

// 2. Location Button Click (New Feature!)
locationBtn.addEventListener('click', () => {
    if (navigator.geolocation) {
        showLoader(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                // Lat/Lon mil gaya, ab AQI aur City Name pata karte hain
                getAQIByCoordinates(lat, lon);
            },
            (error) => {
                showLoader(false);
                alert("Location access denied or error! Please search manually.");
                console.error(error);
            }
        );
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

// --- Main Functions ---

async function fetchCityAQI(city) {
    showLoader(true);
    try {
        // Step 1: City to Coordinates
        const geoRes = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`);
        const geoData = await geoRes.json();

        if(geoData.length === 0) throw new Error("City not found");

        const { lat, lon, name } = geoData[0];
        
        // Step 2: Coordinates to AQI
        await fetchAndShowAQI(lat, lon, name);
        
    } catch (err) {
        showLoader(false);
        alert(err.message || "Something went wrong. Check API Key.");
    }
}

async function getAQIByCoordinates(lat, lon) {
    try {
        // Step 1: Coordinates to City Name (Reverse Geocoding)
        const reverseGeoRes = await fetch(`https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${apiKey}`);
        const reverseGeoData = await reverseGeoRes.json();
        const cityName = reverseGeoData[0]?.name || "Your Location";

        // Step 2: Coordinates to AQI
        await fetchAndShowAQI(lat, lon, cityName);

    } catch (err) {
        showLoader(false);
        alert("Error fetching AQI from location.");
    }
}

// Common function to fetch AQI and update UI
async function fetchAndShowAQI(lat, lon, cityName) {
    const aqiRes = await fetch(`https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`);
    const aqiData = await aqiRes.json();
    updateUI(aqiData.list[0], cityName);
    showLoader(false);
}

// --- UI Update Function ---
function updateUI(data, name) {
    const aqi = data.main.aqi;
    resultDiv.style.display = "block";
    
    document.getElementById('cityName').innerText = name;
    document.getElementById('aqiValue').innerText = aqi;
    document.getElementById('pm25').innerText = data.components.pm2_5;
    document.getElementById('no2').innerText = data.components.no2;

    // UI Data Configuration based on AQI Level (1-5)
    const uiConfig = [
        null, // 0 index unused
        { text: "Good", class: "status-good", icon: "😊" },
        { text: "Fair", class: "status-fair", icon: "😐" },
        { text: "Moderate", class: "status-moderate", icon: "😷" },
        { text: "Poor", class: "status-poor", icon: "🤢" },
        { text: "Very Poor", class: "status-very-poor", icon: "💀" }
    ];

    const config = uiConfig[aqi];
    document.getElementById('aqiText').innerText = config.text;
    document.getElementById('statusIcon').innerText = config.icon;
    
    // Remove old classes and add new one
    resultDiv.className = "result-area fade-in " + config.class;
}

function showLoader(show) {
    loader.style.display = show ? "block" : "none";
    if(show) resultDiv.style.display = "none";
}