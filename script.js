
const form = document.getElementById("issueForm");
const issuesList = document.getElementById("issuesList");

const searchInput = document.getElementById("searchInput");
const statusFilter = document.getElementById("statusFilter");
const categoryFilter = document.getElementById("categoryFilter");

let issues =
    JSON.parse(localStorage.getItem("campusIssues")) || [];


// ========================================
// SAVE
// ========================================

function saveIssues() {
    localStorage.setItem(
        "campusIssues",
        JSON.stringify(issues)
    );
}


// ========================================
// DASHBOARD
// ========================================

function updateDashboard() {
    const total = issues.length;

    const reported = issues.filter(
        issue => issue.status === "Reported"
    ).length;

    const progress = issues.filter(
        issue => issue.status === "In Progress"
    ).length;

    const fixed = issues.filter(
        issue => issue.status === "Fixed"
    ).length;

    document.getElementById("totalCount").textContent = total;
    document.getElementById("reportedCount").textContent = reported;
    document.getElementById("progressCount").textContent = progress;
    document.getElementById("fixedCount").textContent = fixed;
}


// ========================================
// DISPLAY ISSUES
// ========================================

function displayIssues() {
    const searchText = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";

    const selectedStatus = statusFilter
        ? statusFilter.value
        : "All";

    const selectedCategory = categoryFilter
        ? categoryFilter.value
        : "All";

    const filteredIssues = issues.filter(issue => {
        const title = issue.title
            ? issue.title.toLowerCase()
            : "";

        const location = issue.location
            ? issue.location.toLowerCase()
            : "";

        const description = issue.description
            ? issue.description.toLowerCase()
            : "";

        const matchesSearch =
            title.includes(searchText) ||
            location.includes(searchText) ||
            description.includes(searchText);

        const matchesStatus =
            selectedStatus === "All" ||
            issue.status === selectedStatus;

        const matchesCategory =
            selectedCategory === "All" ||
            issue.category === selectedCategory;

        return (
            matchesSearch &&
            matchesStatus &&
            matchesCategory
        );
    });


    // EMPTY STATE

    if (filteredIssues.length === 0) {
        issuesList.innerHTML = `
            <div class="empty-state">
                <h3>No issues found</h3>
                <p>There are no matching campus issues.</p>
            </div>
        `;

        updateDashboard();
        return;
    }

    issuesList.innerHTML = "";


    // ISSUE CARDS

    filteredIssues.forEach(issue => {
        const originalIndex = issues.indexOf(issue);

        const card = document.createElement("div");
        card.className = "issue-card";

        const priorityClass = issue.priority
            ? issue.priority.toLowerCase()
            : "low";

        const statusClass = issue.status
            ? issue.status.toLowerCase().replace(" ", "-")
            : "reported";

        card.innerHTML = `
            <h3>${issue.title}</h3>

            <p>
                <strong>Issue ID:</strong>
                ${issue.id}
            </p>

            <p>
                <strong>Category:</strong>
                ${issue.category}
            </p>

            <p>
                <strong>Priority:</strong>
                <span class="priority-badge priority-${priorityClass}">
                    ${issue.priority}
                </span>
            </p>

            <p>
                <strong>Location:</strong>
                ${issue.location}
            </p>

            <p>
                <strong>Description:</strong>
                ${issue.description}
            </p>

            <p>
                <strong>Reported:</strong>
                ${issue.date}
            </p>

            <p>
                <strong>Status:</strong>
                <span class="status-badge status-${statusClass}">
                    ${issue.status}
                </span>
            </p>

            <label>
                <strong>Update Status:</strong>
            </label>

            <select
                class="status-select"
                data-index="${originalIndex}">

                <option value="Reported"
                    ${issue.status === "Reported" ? "selected" : ""}>
                    🟠 Reported
                </option>

                <option value="In Progress"
                    ${issue.status === "In Progress" ? "selected" : ""}>
                    🔵 In Progress
                </option>

                <option value="Fixed"
                    ${issue.status === "Fixed" ? "selected" : ""}>
                    ✅ Fixed
                </option>
            </select>

            <div class="issue-actions">
                <button
                    type="button"
                    class="delete-btn"
                    data-index="${originalIndex}">
                    🗑️ Delete Issue
                </button>
            </div>
        `;

        issuesList.appendChild(card);
    });


    // STATUS CHANGE

    document.querySelectorAll(".status-select")
        .forEach(select => {
            select.addEventListener("change", function () {
                const index = Number(this.dataset.index);

                if (!issues[index]) return;

                issues[index].status = this.value;

                saveIssues();
                displayIssues();
            });
        });


    // DELETE ISSUE

    document.querySelectorAll(".delete-btn")
        .forEach(button => {
            button.addEventListener("click", function () {
                const index = Number(this.dataset.index);

                if (!issues[index]) return;

                const confirmDelete = confirm(
                    "Are you sure you want to delete this issue?"
                );

                if (!confirmDelete) return;

                issues.splice(index, 1);

                saveIssues();
                displayIssues();
            });
        });

    updateDashboard();
}


// ========================================
// SUBMIT ISSUE
// ========================================

if (form) {
    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const title = document
            .getElementById("title")
            .value.trim();

        const category = document
            .getElementById("category")
            .value;

        const priority = document
            .getElementById("priority")
            .value;

        const location = document
            .getElementById("location")
            .value.trim();

        const description = document
            .getElementById("description")
            .value.trim();

        const newIssue = {
            id: "CF-" + Date.now().toString().slice(-6),
            title: title,
            category: category,
            priority: priority,
            location: location,
            description: description,
            status: "Reported",
            date: new Date().toLocaleString()
        };

        issues.push(newIssue);

        saveIssues();

        form.reset();
        displayIssues();

        alert("✅ Your problem has been reported!");

        document.getElementById("issuesList")
            .scrollIntoView({
                behavior: "smooth"
            });
    });
}


// ========================================
// SEARCH
// ========================================

if (searchInput) {
    searchInput.addEventListener("input", displayIssues);
}


// ========================================
// STATUS FILTER
// ========================================

if (statusFilter) {
    statusFilter.addEventListener("change", displayIssues);
}


// ========================================
// CATEGORY FILTER
// ========================================

if (categoryFilter) {
    categoryFilter.addEventListener("change", displayIssues);
}


// ========================================
// INITIAL LOAD
// ========================================

displayIssues();


// ========================================
// IMAGE PREVIEW
// ========================================

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");

if (imageInput && imagePreview) {
    imageInput.addEventListener("change", function () {
        const file = this.files[0];

        if (!file) {
            imagePreview.innerHTML = "";
            imagePreview.style.display = "none";
            return;
        }

        if (!file.type.startsWith("image/")) {
            alert("Please select an image file.");

            this.value = "";
            imagePreview.innerHTML = "";
            imagePreview.style.display = "none";

            return;
        }

        const reader = new FileReader();

        reader.onload = function (event) {
            imagePreview.innerHTML = `
                <img
                    src="${event.target.result}"
                    alt="Selected problem photo"
                >
            `;

            imagePreview.style.display = "block";
        };

        reader.readAsDataURL(file);
    });
}


// ========================================
// SEASONAL THEME + WEATHER EFFECTS
// ========================================

function updateSeasonalTheme() {
    const now = new Date();
    const month = now.getMonth();
    const hour = now.getHours();

    let season;

    // March-May: Summer
    // June-September: Monsoon
    // October-November: Autumn
    // December-February: Winter

    if (month >= 2 && month <= 4) {
        season = "summer";
    } else if (month >= 5 && month <= 8) {
        season = "monsoon";
    } else if (month >= 9 && month <= 10) {
        season = "autumn";
    } else {
        season = "winter";
    }

    // Day: 6 AM to 5:59 PM
    // Night: 6 PM to 5:59 AM

    const time = hour >= 6 && hour < 18
        ? "day"
        : "night";

    document.body.classList.remove(
        "theme-summer-day",
        "theme-summer-night",
        "theme-monsoon-day",
        "theme-monsoon-night",
        "theme-autumn-day",
        "theme-autumn-night",
        "theme-winter-day",
        "theme-winter-night"
    );

    document.body.classList.add(
        `theme-${season}-${time}`
    );

    createWeatherEffects(season, time);
}


// ========================================
// CREATE WEATHER EFFECTS
// ========================================

function createWeatherEffects(season, time) {
    let effects = document.querySelector(".seasonal-effects");

    if (!effects) {
        effects = document.createElement("div");

        effects.className = "seasonal-effects";

        effects.setAttribute("aria-hidden", "true");

        document.body.prepend(effects);
    }

    // Avoid restarting animations every minute

    const themeKey = `${season}-${time}`;

    if (effects.dataset.theme === themeKey) {
        return;
    }

    effects.dataset.theme = themeKey;

    effects.className = `seasonal-effects ${season} ${time}`;

    effects.innerHTML = "";


    // MONSOON CLOUD

    if (season === "monsoon") {
        const cloud = document.createElement("div");

        cloud.className = "weather-cloud";

        effects.appendChild(cloud);
    }


    // WEATHER PARTICLES

    const particleSettings = {
        summer: {
            symbol: "✦",
            count: 12
        },

        monsoon: {
            symbol: "💧",
            count: 28
        },

        autumn: {
            symbol: "🍂",
            count: 18
        },

        winter: {
            symbol: "❄",
            count: 30
        }
    };

    const settings = particleSettings[season];


    // CREATE PARTICLES

    for (let i = 0; i < settings.count; i++) {
        const particle = document.createElement("span");

        particle.className = "weather-particle";

        particle.textContent = settings.symbol;

        particle.style.setProperty(
            "--x",
            Math.random() * 100 + "%"
        );

        particle.style.setProperty(
            "--delay",
            -(Math.random() * 15) + "s"
        );

        particle.style.setProperty(
            "--duration",
            (7 + Math.random() * 10) + "s"
        );

        particle.style.setProperty(
            "--size",
            (12 + Math.random() * 15) + "px"
        );

        particle.style.setProperty(
            "--drift",
            (Math.random() * 160 - 80) + "px"
        );

        effects.appendChild(particle);
    }
}


// ========================================
// START SEASONAL THEME
// ========================================

updateSeasonalTheme();

setInterval(updateSeasonalTheme, 60000);

/* =========================================
   CAMPUSFIX LIVE SEASON & SKY SYSTEM
========================================= */

const seasonTest = document.getElementById("seasonTest");
const timeTest = document.getElementById("timeTest");
const resetThemeTest = document.getElementById("resetThemeTest");

const seasonName = document.getElementById("seasonName");
const dayNightName = document.getElementById("dayNightName");
const liveClock = document.getElementById("liveClock");
const themeModeName = document.getElementById("themeModeName");
const skyMessage = document.getElementById("skyMessage");

const sunVisual = document.getElementById("sunVisual");
const moonVisual = document.getElementById("moonVisual");
const skyParticles = document.getElementById("skyParticles");

let previousSkyEffect = "";

/* GET SEASON */

function getCurrentSeason(month) {
    if (month >= 2 && month <= 4) return "summer";
    if (month >= 5 && month <= 8) return "monsoon";
    if (month >= 9 && month <= 10) return "autumn";
    return "winter";
}

/* GET TIME PERIOD */

function getCurrentPeriod(hour) {
    if (hour >= 6 && hour < 16) return "day";
    if (hour >= 16 && hour < 18) return "sunset";
    return "night";
}

/* CREATE SKY EFFECTS */

function createSkyEffects(season, period) {

    const effectKey = season + "-" + period;

    if (previousSkyEffect === effectKey) return;

    previousSkyEffect = effectKey;
    skyParticles.innerHTML = "";

    const particleTypes = {
        summer: ["✨", "☀️", "✦"],
        monsoon: ["💧", "🌧️", "💧"],
        autumn: ["🍂", "🍁", "🍂"],
        winter: ["❄️", "❄️", "✧"]
    };

    /* STARS AT NIGHT */

    if (period === "night") {
        for (let i = 0; i < 45; i++) {
            const star = document.createElement("span");
            star.className = "sky-star";
            star.textContent = "✦";

            star.style.setProperty("--left", Math.random() * 100 + "%");
            star.style.setProperty("--top", Math.random() * 75 + "%");
            star.style.setProperty("--size", (5 + Math.random() * 9) + "px");

            skyParticles.appendChild(star);
        }
    }

    /* SEASON PARTICLES */

    const symbols = particleTypes[season];

    if (period !== "night" || season === "winter" || season === "autumn") {
        for (let i = 0; i < 22; i++) {
            const particle = document.createElement("span");

            particle.className = "sky-particle";
            particle.textContent =
                symbols[Math.floor(Math.random() * symbols.length)];

            particle.style.setProperty("--left", Math.random() * 100 + "%");
            particle.style.setProperty("--size", (12 + Math.random() * 14) + "px");
            particle.style.setProperty("--duration", (7 + Math.random() * 10) + "s");
            particle.style.setProperty("--delay", (-Math.random() * 15) + "s");
            particle.style.setProperty("--drift", (Math.random() * 120 - 60) + "px");

            skyParticles.appendChild(particle);
        }
    }
}

/* UPDATE EVERYTHING */

function updateSeasonalSky() {

    const now = new Date();

    const month = now.getMonth();
    const hour = now.getHours();

    const actualSeason = getCurrentSeason(month);
    const actualPeriod = getCurrentPeriod(hour);

    const selectedSeason = seasonTest.value;
    const selectedPeriod = timeTest.value;

    const season =
        selectedSeason === "auto"
            ? actualSeason
            : selectedSeason;

    const period =
        selectedPeriod === "auto"
            ? actualPeriod
            : selectedPeriod;

    const isAuto =
        selectedSeason === "auto" &&
        selectedPeriod === "auto";

    /* UPDATE CLOCK */

    liveClock.textContent = now.toLocaleTimeString();

    /* UPDATE STATUS */

    const seasonLabels = {
        summer: "☀️ Summer",
        monsoon: "🌧️ Monsoon",
        autumn: "🍂 Autumn",
        winter: "❄️ Winter"
    };

    seasonName.textContent = seasonLabels[season];

    const periodLabels = {
        day: "☀️ Day",
        sunset: "🌇 Sunset",
        night: "🌙 Night"
    };

    dayNightName.textContent = periodLabels[period];

    themeModeName.textContent = isAuto ? "AUTO" : "TEST MODE";

    /* CHANGE BODY THEME */

    document.body.classList.remove(
        "theme-summer-day",
        "theme-summer-night",
        "theme-monsoon-day",
        "theme-monsoon-night",
        "theme-autumn-day",
        "theme-autumn-night",
        "theme-winter-day",
        "theme-winter-night",
        "theme-sunset"
    );

    if (period === "sunset") {
        document.body.classList.add("theme-sunset");
    } else {
        document.body.classList.add(
            "theme-" + season + "-" + period
        );
    }

    /* SUN POSITION */

    if (period === "day") {
        sunVisual.style.opacity = "1";
        moonVisual.style.opacity = "0";

        const minutes = now.getHours() * 60 + now.getMinutes();
        const progress = Math.max(0, Math.min(1, (minutes - 360) / 600));

        sunVisual.style.top = (10 + progress * 28) + "%";
    }

    if (period === "sunset") {
        sunVisual.style.opacity = "1";
        moonVisual.style.opacity = "0";
        sunVisual.style.top = "48%";
    }

    if (period === "night") {
        sunVisual.style.opacity = "0";
        moonVisual.style.opacity = "1";
    }

    /* MESSAGE */

    const messages = {
        summer: "Warm summer sky is active!",
        monsoon: "Monsoon clouds and rain are active!",
        autumn: "Autumn leaves are falling!",
        winter: "Winter snow effects are active!"
    };

    skyMessage.textContent =
        messages[season] + " " + periodLabels[period];

    /* EFFECTS */

    createSkyEffects(season, period);
}

/* TEST CONTROLS */

if (seasonTest && timeTest) {
    seasonTest.addEventListener("change", updateSeasonalSky);
    timeTest.addEventListener("change", updateSeasonalSky);
}

if (resetThemeTest) {
    resetThemeTest.addEventListener("click", function () {
        seasonTest.value = "auto";
        timeTest.value = "auto";
        updateSeasonalSky();
    });
}

/* START */

updateSeasonalSky();

setInterval(updateSeasonalSky, 1000);


    
   
    
  
