
const API_KEY = "4a68e0ec8b595e9382d84165d8a9cce7";

const CURRENT_WEATHER_URL =
    "https://api.openweathermap.org/data/2.5/weather";

const FORECAST_URL =
    "https://api.openweathermap.org/data/2.5/forecast";

// DOM elements
const searchForm = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const searchBtn = document.getElementById("searchBtn");

const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const weatherContent = document.getElementById("weatherContent");

const cityName = document.getElementById("cityName");
const weatherDate = document.getElementById("weatherDate");
const weatherDescription = document.getElementById("weatherDescription");
const temperature = document.getElementById("temperature");
const feelsLike = document.getElementById("feelsLike");
const weatherIcon = document.getElementById("weatherIcon");

const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");
const pressure = document.getElementById("pressure");
const cloudiness = document.getElementById("cloudiness");

const forecastContainer =
    document.getElementById("forecastContainer");

// Search form
searchForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const city = cityInput.value.trim();

    if (!city) {
        showError("Please enter a city name.");
        return;
    }

    await getWeather(city);
});

// Fetch weather information
async function getWeather(city) {
    showLoading(true);
    hideError();

    try {
        const currentResponse = await fetch(
            `${CURRENT_WEATHER_URL}?q=${encodeURIComponent(city)}&appid=${API_KEY}&units=metric`
        );

        if (!currentResponse.ok) {
            if (currentResponse.status === 404) {
                throw new Error("City not found. Please enter a valid city.");
            }

            if (currentResponse.status === 401) {
                throw new Error("Invalid API key. Please check your API key.");
            }

            throw new Error("Unable to fetch weather information.");
        }

        const currentData = await currentResponse.json();

        const { lat, lon } = currentData.coord;

        const forecastResponse = await fetch(
            `${FORECAST_URL}?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );

        if (!forecastResponse.ok) {
            throw new Error("Unable to load the weather forecast.");
        }

        const forecastData = await forecastResponse.json();

        displayCurrentWeather(currentData);
        displayForecast(forecastData);

        weatherContent.style.display = "block";

    } catch (error) {
        weatherContent.style.display = "none";
        forecastContainer.innerHTML = "";
        showError(error.message);

    } finally {
        showLoading(false);
    }
}

// Display current weather
function displayCurrentWeather(data) {
    cityName.textContent = `${data.name}, ${data.sys.country}`;

    weatherDate.textContent = new Date().toLocaleDateString(
        "en-IN",
        {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        }
    );

    weatherDescription.textContent =
        data.weather[0].description;

    temperature.textContent =
        `${Math.round(data.main.temp)}°C`;

    feelsLike.textContent =
        `Feels like ${Math.round(data.main.feels_like)}°C`;

    weatherIcon.src =
        `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;

    weatherIcon.alt = data.weather[0].description;

    humidity.textContent = `${data.main.humidity}%`;
    windSpeed.textContent = `${data.wind.speed} m/s`;
    pressure.textContent = `${data.main.pressure} hPa`;
    cloudiness.textContent = `${data.clouds.all}%`;

    updateBackground(
        data.weather[0].main,
        data.weather[0].icon
    );
}

// Update dynamic background
function updateBackground(condition, icon) {
    document.body.classList.remove(
        "sunny",
        "rainy",
        "cloudy",
        "night"
    );

    if (icon.endsWith("n")) {
        document.body.classList.add("night");
        return;
    }

    const weather = condition.toLowerCase();

    if (weather.includes("clear")) {
        document.body.classList.add("sunny");
    } else if (
        weather.includes("rain") ||
        weather.includes("drizzle") ||
        weather.includes("thunder")
    ) {
        document.body.classList.add("rainy");
    } else {
        document.body.classList.add("cloudy");
    }
}

// Display five-day forecast
function displayForecast(data) {
    forecastContainer.innerHTML = "";

    const dailyForecast = {};

    data.list.forEach((item) => {
        const date = item.dt_txt.split(" ")[0];

        if (!dailyForecast[date]) {
            dailyForecast[date] = item;
        }

        if (item.dt_txt.includes("12:00:00")) {
            dailyForecast[date] = item;
        }
    });

    const days = Object.values(dailyForecast).slice(0, 5);

    days.forEach((day) => {
        const date = new Date(day.dt * 1000);

        const dayName = date.toLocaleDateString("en-IN", {
            weekday: "short"
        });

        const icon = day.weather[0].icon;
        const description = day.weather[0].description;

        const card = document.createElement("div");
        card.className = "forecast-card";

        card.innerHTML = `
            <h3>${dayName}</h3>

            <img
                src="https://openweathermap.org/img/wn/${icon}@2x.png"
                alt="${description}"
            >

            <h2>${Math.round(day.main.temp)}°C</h2>

            <p>${description}</p>
        `;

        forecastContainer.appendChild(card);
    });
}

// Loading spinner
function showLoading(isLoading) {
    loading.style.display = isLoading ? "flex" : "none";
    searchBtn.disabled = isLoading;
}

// Show error
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = "block";
}

// Hide error
function hideError() {
    errorMessage.textContent = "";
    errorMessage.style.display = "none";
}

// Automatically load Bengaluru weather
document.addEventListener("DOMContentLoaded", () => {
    getWeather("Bengaluru");
});
