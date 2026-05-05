/**
 * OPTIMIZED INSTAGRAM DP DOWNLOADER (FINAL STABLE)
 */

const WORKERS = [
    'https://instadp.romitkr5539.workers.dev',
    'https://instadp2.romitkr3018.workers.dev',
    'https://instadp3.romitkryadav5539.workers.dev',
    'https://instadp4.contact-themistero.workers.dev',
    'https://instadp5.romitkr1815130920.workers.dev',
    'https://instadp6.romityadav5539.workers.dev',
    'https://instadp7.r18151309.workers.dev',
];

const cache = new Map();
let currentResult = null;

// DOM
const searchForm = document.getElementById('searchForm');
const usernameInput = document.getElementById('usernameInput');
const submitBtn = document.getElementById('submitBtn');
const btnText = document.getElementById('btnText');
const loadingIcon = document.getElementById('loadingIcon');

const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const resultSection = document.getElementById('resultSection');

const profileImg = document.getElementById('profileImg');
const resUsername = document.getElementById('resUsername');
const resFullName = document.getElementById('resFullName');
const resBio = document.getElementById('resBio');
const downloadBtn = document.getElementById('downloadBtn');
const previewBtn = document.getElementById('previewBtn');
const igLink = document.getElementById('igLink');

// =========================
// HELPERS
// =========================
function getCleanUsername(input) {
  let clean = input.trim();

  try {
    if (clean.includes('instagram.com')) {
      const url = new URL(clean.startsWith('http') ? clean : `https://${clean}`);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length) clean = parts[0];
    }
  } catch {}

  if (clean.startsWith('@')) clean = clean.slice(1);
  return clean;
}

function isValidUsername(username) {
  return /^[a-zA-Z0-9._]{2,30}$/.test(username);
}

function setLoading(state) {
  submitBtn.disabled = state;

  btnText.classList.toggle('hidden', state);
  loadingIcon.classList.toggle('hidden', !state);
  loadingState.classList.toggle('hidden', !state);
}

function fetchWithTimeout(url, timeout = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  return fetch(url, { signal: controller.signal })
    .finally(() => clearTimeout(id));
}

// =========================
// WORKER FETCH
// =========================
async function fetchOne(username) {
  const shuffled = [...WORKERS].sort(() => Math.random() - 0.5);

  for (const worker of shuffled) {
    try {
      const res = await fetchWithTimeout(`${worker}?username=${username}`);
      if (!res.ok) continue;

      const data = await res.json();

      if (data?.status === "success" && data.image?.startsWith("http")) {
        return { data, worker };
      }
    } catch {}
  }

  throw new Error("All workers failed");
}

async function fetchSmart(username) {
  try {
    return await fetchOne(username);
  } catch {
    await new Promise(r => setTimeout(r, 1500));
    return await fetchOne(username);
  }
}

async function fetchWithCache(username) {
  if (cache.has(username)) return cache.get(username);

  const result = await fetchSmart(username);
  cache.set(username, result);

  setTimeout(() => cache.delete(username), 120000);
  return result;
}

// =========================
// FORM
// =========================
searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const username = getCleanUsername(usernameInput.value);

  if (!username || !isValidUsername(username)) {
    return showError("Invalid username");
  }

  setLoading(true);
  errorState.classList.add('hidden');
  resultSection.classList.add('hidden');
  currentResult = null;

  try {
    const { data, worker } = await fetchWithCache(username);
    displayResult(data, worker);
  } catch {
    showError("User not found or blocked by Instagram.");
  } finally {
    setLoading(false);
  }
});

// =========================
// DISPLAY RESULT (FIXED)
// =========================
function displayResult(data, worker) {
  currentResult = { ...data, worker };

  const proxied = `${worker}?proxy=${encodeURIComponent(data.image)}`;

  profileImg.style.opacity = "0.3";
  profileImg.style.filter = "blur(8px)";

  const img = new Image();

  img.onload = () => {
    profileImg.src = data.image;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };

  img.onerror = () => {
    profileImg.src = proxied;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };

  img.src = data.image;

  // 🔥 silent failure fix
  setTimeout(() => {
    if (!img.complete || img.naturalWidth === 0) {
      profileImg.src = proxied;
      profileImg.style.opacity = "1";
      profileImg.style.filter = "none";
    }
  }, 2500);

  resUsername.textContent = `@${data.username}`;
  resFullName.textContent = data.full_name || "Instagram User";
  resBio.textContent = data.biography || "";
  igLink.href = `https://instagram.com/${data.username}`;

  resultSection.classList.remove('hidden');
  
  // Auto-scroll to result section
  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

// =========================
// DOWNLOAD
// =========================
downloadBtn.addEventListener('click', async () => {
  if (!currentResult?.image) return;

  const { worker, image, username } = currentResult;
  const proxied = `${worker}?proxy=${encodeURIComponent(image)}`;

  try {
    const res = await fetch(proxied);
    const blob = await res.blob();

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `instagram_${username}.jpg`;
    link.click();
  } catch {
    window.open(proxied, "_blank");
  }
});

// =========================
// PREVIEW
// =========================
previewBtn.addEventListener('click', () => {
  if (!currentResult?.image) return;
  window.open(currentResult.image, "_blank");
});

// =========================
// ERROR
// =========================
function showError(msg) {
  errorMessage.textContent = msg;
  errorState.classList.remove('hidden');
}