(() => {
  const COUNT = 5;
  const STORAGE_KEY = "huehunt_favorites";
  const THEME_KEY = "huehunt_theme";

  const paletteWrap = document.getElementById("paletteWrap");
  const generateBtn = document.getElementById("generateBtn");
  const saveBtn = document.getElementById("saveBtn");
  const copyAllBtn = document.getElementById("copyAllBtn");
  const themeToggle = document.getElementById("themeToggle");
  const favoritesToggle = document.getElementById("favoritesToggle");
  const favoritesPanel = document.getElementById("favoritesPanel");
  const closeFavorites = document.getElementById("closeFavorites");
  const favoritesList = document.getElementById("favoritesList");
  const favCount = document.getElementById("favCount");
  const toast = document.getElementById("toast");

  let palette = []; // [{hex, locked}]

  const NAME_BANK = [
    "Drift", "Ember", "Mist", "Slate", "Bloom", "Dusk", "Glow", "Sage",
    "Coral", "Frost", "Amber", "Tide", "Moss", "Plum", "Haze", "Spark"
  ];

  /* ---------- Color helpers ---------- */
  function randomHex() {
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return rgbToHex(r, g, b);
  }

  function rgbToHex(r, g, b) {
    return "#" + [r, g, b].map(v => v.toString(16).padStart(2, "0")).join("").toUpperCase();
  }

  function hexToRgb(hex) {
    const v = hex.replace("#", "");
    return {
      r: parseInt(v.substring(0, 2), 16),
      g: parseInt(v.substring(2, 4), 16),
      b: parseInt(v.substring(4, 6), 16)
    };
  }

  function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex);
    const [rs, gs, bs] = [r, g, b].map(c => {
      c /= 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  function textColorFor(hex) {
    return relativeLuminance(hex) > 0.45 ? "var(--swatch-text-dark)" : "var(--swatch-text-light)";
  }

  function randomName() {
    return NAME_BANK[Math.floor(Math.random() * NAME_BANK.length)];
  }

  /* ---------- Palette generation ---------- */
  function generatePalette(animate = true) {
    palette = palette.length
      ? palette.map(c => (c.locked ? c : { hex: randomHex(), locked: false, name: randomName() }))
      : Array.from({ length: COUNT }, () => ({ hex: randomHex(), locked: false, name: randomName() }));
    renderPalette(animate);
  }

  function renderPalette(animate) {
    paletteWrap.innerHTML = "";
    palette.forEach((color, i) => {
      const el = document.createElement("div");
      el.className = "swatch" + (color.locked ? " locked" : "");
      el.style.background = color.hex;
      el.style.color = textColorFor(color.hex);
      if (animate) el.style.animationDelay = `${i * 0.05}s`;

      el.innerHTML = `
        <div class="swatch-top">
          <button class="lock-btn" aria-label="${color.locked ? "Unlock color" : "Lock color"}" data-action="lock" data-index="${i}">
            ${color.locked ? lockIconClosed() : lockIconOpen()}
          </button>
        </div>
        <div class="swatch-bottom">
          <span class="swatch-name">${color.name}</span>
          <div class="swatch-hex-row">
            <span class="swatch-hex">${color.hex}</span>
            <button class="copy-btn" aria-label="Copy hex code" data-action="copy" data-index="${i}">
              ${copyIcon()}
            </button>
          </div>
        </div>
        <div class="copied-flash">Copied!</div>
      `;
      paletteWrap.appendChild(el);
    });
  }

  function lockIconOpen() {
    return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7h-1V7a5 5 0 00-9.9-1l1.9.6A3 3 0 0115 7v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2z"/></svg>`;
  }
  function lockIconClosed() {
    return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M12 17a2 2 0 100-4 2 2 0 000 4zm6-7h-1V7a5 5 0 00-10 0v3H6a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2v-8a2 2 0 00-2-2zM9 7a3 3 0 016 0v3H9V7z"/></svg>`;
  }
  function copyIcon() {
    return `<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1zm3 4H8a2 2 0 00-2 2v14a2 2 0 002 2h11a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h11v14z"/></svg>`;
  }

  function showToast(msg) {
    toast.textContent = msg;
    toast.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => toast.classList.remove("show"), 1800);
  }

  function copyHex(hex, flashEl) {
    navigator.clipboard.writeText(hex).then(() => {
      showToast(`Copied ${hex}`);
      if (flashEl) {
        flashEl.classList.add("show");
        setTimeout(() => flashEl.classList.remove("show"), 700);
      }
    }).catch(() => showToast("Couldn't copy — try manually"));
  }

  paletteWrap.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const index = Number(btn.dataset.index);
    const action = btn.dataset.action;
    const swatchEl = btn.closest(".swatch");

    if (action === "lock") {
      palette[index].locked = !palette[index].locked;
      renderPalette(false);
    } else if (action === "copy") {
      copyHex(palette[index].hex, swatchEl.querySelector(".copied-flash"));
    }
  });

  generateBtn.addEventListener("click", () => generatePalette(true));

  document.addEventListener("keydown", (e) => {
    if (e.code === "Space" && !["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
      e.preventDefault();
      generatePalette(true);
    }
  });

  copyAllBtn.addEventListener("click", () => {
    const text = palette.map(c => c.hex).join(", ");
    navigator.clipboard.writeText(text).then(() => showToast("All HEX codes copied"));
  });

  /* ---------- Favorites (localStorage) ---------- */
  function getFavorites() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    } catch {
      return [];
    }
  }

  function setFavorites(favs) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
    favCount.textContent = favs.length;
  }

  function renderFavorites() {
    const favs = getFavorites();
    favCount.textContent = favs.length;
    if (!favs.length) {
      favoritesList.innerHTML = `<p class="empty-state">No saved palettes yet. Generate one you like and hit "Save palette".</p>`;
      return;
    }
    favoritesList.innerHTML = favs.map((fav, i) => `
      <div class="fav-item">
        <div class="fav-swatches">
          ${fav.colors.map(c => `<span style="background:${c}"></span>`).join("")}
        </div>
        <div class="fav-meta">
          <span>${new Date(fav.savedAt).toLocaleDateString()}</span>
          <div class="fav-meta-actions">
            <button data-fav-action="apply" data-fav-index="${i}">Use</button>
            <button data-fav-action="delete" data-fav-index="${i}">Remove</button>
          </div>
        </div>
      </div>
    `).join("");
  }

  favoritesList.addEventListener("click", (e) => {
    const btn = e.target.closest("button[data-fav-action]");
    if (!btn) return;
    const favs = getFavorites();
    const idx = Number(btn.dataset.favIndex);

    if (btn.dataset.favAction === "delete") {
      favs.splice(idx, 1);
      setFavorites(favs);
      renderFavorites();
      showToast("Removed from favorites");
    } else if (btn.dataset.favAction === "apply") {
      const fav = favs[idx];
      palette = fav.colors.map(hex => ({ hex, locked: false, name: randomName() }));
      renderPalette(true);
      showToast("Palette applied");
    }
  });

  saveBtn.addEventListener("click", () => {
    const favs = getFavorites();
    favs.unshift({ colors: palette.map(c => c.hex), savedAt: Date.now() });
    setFavorites(favs.slice(0, 30));
    renderFavorites();
    showToast("Palette saved to favorites");
  });

  favoritesToggle.addEventListener("click", () => {
    favoritesPanel.classList.add("open");
    renderFavorites();
  });
  closeFavorites.addEventListener("click", () => favoritesPanel.classList.remove("open"));

  document.addEventListener("click", (e) => {
    if (
      favoritesPanel.classList.contains("open") &&
      !favoritesPanel.contains(e.target) &&
      !favoritesToggle.contains(e.target)
    ) {
      favoritesPanel.classList.remove("open");
    }
  });

  /* ---------- Theme ---------- */
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }

  themeToggle.addEventListener("click", () => {
    const current = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(current);
  });

  (function initTheme() {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved) {
      applyTheme(saved);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      applyTheme("dark");
    }
  })();

  /* ---------- Init ---------- */
  generatePalette(true);
  renderFavorites();
})();
