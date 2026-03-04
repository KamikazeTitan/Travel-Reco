let apiData = null;

// Task 6: fetch JSON
async function loadApiData() {
  const res = await fetch("travel_recommendation_api.json");
  if (!res.ok) throw new Error("Failed to load travel_recommendation_api.json");
  apiData = await res.json();
  console.log("Loaded API data:", apiData); // ✅ required debug check
}

function normalizeKeyword(raw) {
  const q = String(raw || "").trim().toLowerCase();

  // Task 7: accept variations
  if (q === "beach" || q === "beaches") return "beaches";
  if (q === "temple" || q === "temples") return "temples";
  if (q === "country" || q === "countries") return "countries";

  return q; // if you want to support extra keywords later
}

function getRecommendations(keyword) {
  if (!apiData) return [];

  // Task 8: return at least 2 per keyword (depends on JSON content)
  if (keyword === "beaches") return apiData.beaches || [];
  if (keyword === "temples") return apiData.temples || [];

  // Countries are usually nested: {countries:[{name, cities:[...]}]}
  if (keyword === "countries") {
    const out = [];
    (apiData.countries || []).forEach(c => {
      (c.cities || []).forEach(city => {
        out.push({
          name: `${city.name}, ${c.name}`,
          imageUrl: city.imageUrl,
          description: city.description
        });
      });
    });
    return out;
  }

  return [];
}

function renderResults(items) {
  const grid = document.getElementById("resultsGrid");
  if (!grid) return;

  if (!items.length) {
    grid.innerHTML = `<p class="hint">No results found. Try: beach, temple, or country.</p>`;
    return;
  }

  // Task 8: results in grid
  grid.innerHTML = items.slice(0, 6).map(item => `
    <div class="card">
      <img src="${item.imageUrl}" alt="${escapeAttr(item.name)}" />
      <div class="card-body">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.description || "")}</p>
      </div>
    </div>
  `).join("");
}

function clearResults() {
  const grid = document.getElementById("resultsGrid");
  if (grid) grid.innerHTML = "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, m => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"
  }[m]));
}
function escapeAttr(str) { return escapeHtml(str); }

// Wire up events
document.addEventListener("DOMContentLoaded", async () => {
  const searchBtn = document.getElementById("searchBtn");
  const resetBtn = document.getElementById("resetBtn");
  const input = document.getElementById("searchInput");

  try {
    await loadApiData();
  } catch (e) {
    console.error(e);
  }

  // Task 7: show results ONLY after Search click
  searchBtn.addEventListener("click", () => {
    const kw = normalizeKeyword(input.value);
    const results = getRecommendations(kw);
    renderResults(results);
  });

  // Task 9: clear button
  resetBtn.addEventListener("click", () => {
    input.value = "";
    clearResults();
  });
});