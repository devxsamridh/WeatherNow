const API_KEY = "fd9bf1824ea44a02a2f72946261702";
const BASE_URL = "https://api.weatherapi.com/v1/current.json";

const form = document.getElementById("searchForm");
const input = document.getElementById("searchInput");
const btn = document.getElementById("searchBtn");
const errorEl = document.getElementById("error");
const resultEl = document.getElementById("weatherResult");
const placeholderEl = document.getElementById("placeholder");

const stats = [
    { key: "humidity", label: "Humidity", icon: "💧", unit: "%" },
    { key: "wind", label: "Wind", icon: "💨", unit: "" },
    { key: "visibility", label: "Visibility", icon: "👁️", unit: " km" },
    { key: "pressure", label: "Pressure", icon: "📊", unit: " mb" },
    { key: "uv", label: "UV Index", icon: "☀️", unit: "" },
    { key: "aqi", label: "Air Quality", icon: "🌍", unit: "" },
];

function getAqiLabel(index) {
    if (!index) return "N/A";
    if (index <= 1) return "Good";
    if (index <= 2) return "Moderate";
    if (index <= 3) return "Unhealthy (S)";
    if (index <= 4) return "Unhealthy";
    return "Hazardous";
}

form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    btn.disabled = true;
    btn.textContent = "...";
    errorEl.classList.add("hidden");

    try {
        const res = await fetch(`${BASE_URL}?key=${API_KEY}&q=${encodeURIComponent(query)}&aqi=yes`);
        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err?.error?.message || "Location not found");
        }
        const data = await res.json();
        renderWeather(data);
    } catch (err) {
        errorEl.textContent = err.message;
        errorEl.classList.remove("hidden");
        resultEl.classList.add("hidden");
        resultEl.style.display = "none";
        placeholderEl.classList.remove("hidden");
    } finally {
        btn.disabled = false;
        btn.textContent = "Go";
    }
});

function renderWeather(data) {
    const { location, current } = data;

    document.getElementById("wLocation").textContent = `${location.name}, ${location.country}`;
    document.getElementById("wIcon").src = `https:${current.condition.icon}`;
    document.getElementById("wTemp").textContent = `${Math.round(current.temp_c)}°`;
    document.getElementById("wCondition").textContent = current.condition.text;
    document.getElementById("wFeels").textContent =
        `Feels like ${Math.round(current.feelslike_c)}° · ${location.localtime.split(" ")[1]}`;

    const values = {
        humidity: `${current.humidity}%`,
        wind: `${current.wind_kph} km/h ${current.wind_dir}`,
        visibility: `${current.vis_km} km`,
        pressure: `${current.pressure_mb} mb`,
        uv: `${current.uv}`,
        aqi: getAqiLabel(current.air_quality?.["us-epa-index"]),
    };

    const grid = document.getElementById("statsGrid");
    grid.innerHTML = stats.map(s => `
        <div class="stat-card">
            <div class="stat-icon">${s.icon}</div>
            <div class="stat-label">${s.label}</div>
            <div class="stat-value">${values[s.key]}</div>
        </div>
    `).join("");

    placeholderEl.classList.add("hidden");
    errorEl.classList.add("hidden");
    resultEl.classList.remove("hidden");
    resultEl.style.display = "flex";
}