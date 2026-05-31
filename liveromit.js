// InstaLive / Instastatistics Standalone Client Script
// Replicates 100% of custom React visual styling, interactive sparklines, tickers, and Web Audio synths

const WORKERS = [
  "https://instalive.romitkr361.workers.dev",
  "https://romitlive.romitkr5539.workers.dev",
  "https://krlive.romitkr5539.workers.dev",
  "https://instadp.romitkr5539.workers.dev",
  "https://instadp2.romitkr3018.workers.dev",
  "https://instadp3.romitkryadav5539.workers.dev",
  "https://instadp4.contact-themistero.workers.dev",
  "https://instadp5.romitkr1815130920.workers.dev",
  "https://instadp6.romityadav5539.workers.dev",
  "https://instadp7.r18151309.workers.dev"
];

const POPULAR_PROFILES = [
  { name: "Instagram", username: "instagram", avatarUrl: "https://instadpdownload.com/assets/dpimg/instagram.jpg", count: 685781245 },
  { name: "Cristiano Ronaldo", username: "cristiano", avatarUrl: "https://instadpdownload.com/assets/dpimg/cristiano.jpg", count: 665192897 },
  { name: "Lionel Messi", username: "leomessi", avatarUrl: "https://instadpdownload.com/assets/dpimg/leomessi.jpg", count: 506322419 },
  { name: "Selena Gomez", username: "selenagomez", avatarUrl: "https://instadpdownload.com/assets/dpimg/selenagomez.jpg", count: 414402957 },
  { name: "Kylie Jenner", username: "kyliejenner", avatarUrl: "https://instadpdownload.com/assets/dpimg/kyliejenner.jpg", count: 382739403 },
  { name: "Dwayne Johnson", username: "therock", avatarUrl: "https://instadpdownload.com/assets/dpimg/therock.jpg", count: 382754364 }
];

const TRENDING_ACCOUNTS = [
  { username: "cockroachjantaparty", display: "Cockroach Janta Party" },
  { username: "mrbeast", display: "MrBeast" },
  { username: "virat.kohli", display: "Virat Kohli" },
  { username: "kyliejenner", display: "Kylie Jenner" },
  { username: "therock", display: "Dwayne Johnson" },
  { username: "zachking", display: "Zach King" },
  { username: "cristiano", display: "Cristiano Ronaldo" },
  { username: "selenagomez", display: "Selena Gomez" },
  { username: "leomessi", display: "Lionel Messi" }
];

const PROMOTIONAL_ACCOUNTS = [
  {
    username: "romitkryadav",
    display: "Romit kr Yadav",
    description: "Hi, I'm Romit. I'm interested in technology, web projects, and online business. My goal is to build valuable digital products, develop strong technical skills, and create a successful career in tech.",
    avatarUrl: "https://instadpdownload.com/assets/dpimg/romitkryadav.jpg"
  },
  {
    username: "abhijit_yadav_0018",
    display: "Abhijit Kumar",
    description: "Just a simple guy who loves exploring new places, enjoying nature, and capturing beautiful moments through photography.",
    avatarUrl: "https://instadpdownload.com/assets/dpimg/abhijit_yadav_0018.jpg"
  },
  {
    username: "itz.vikash.kumar.02",
    display: "Vikash Kumar",
    description: "Proud Indian 🇮🇳 | Family is my greatest treasure ❤️ | Music keeps me going 🎶 | Living life by my own rules 😎 | Grateful, ambitious, and always moving forward ✨ | 🎂 29 March.",
    avatarUrl: "https://instadpdownload.com/assets/dpimg/itz.vikash.kumar.02.jpg"
  }
];

// App State
let currentUsername = "instagram";
let currentFollowerCount = null;
let currentFullName = "Instagram";
let currentBiography = "The official page of Instagram";
let currentAvatarUrl = "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop&q=80";

let loading = false;
let isRefreshing = false;
let autoRefresh = true;
let soundEnabled = false;
let timeToNextFetch = 5.0;
let sessionsTracked = []; // stores { time: string, count: number }
let searchHistory = [];
let cooldown = false;

// Web Audio API refs
let audioContext = null;

// UI Selection mapping
const searchForm = document.getElementById("searchForm");
const usernameInput = document.getElementById("usernameInput");
const submitBtn = document.getElementById("submitBtn");
const btnText = document.getElementById("btnText");
const loadingIcon = document.getElementById("loadingIcon");
const loadingState = document.getElementById("loadingState");
const errorState = document.getElementById("errorState");
const errorMessage = document.getElementById("errorMessage");
const errorRetryBtn = document.getElementById("errorRetryBtn");

// Core elements
const profileImg = document.getElementById("profileImg");
const trackerUsername = document.getElementById("trackerUsername");
const igLink = document.getElementById("igLink");
const resFullName = document.getElementById("resFullName");
const resBio = document.getElementById("resBio");
const massiveCounter = document.getElementById("massiveCounter");

const countdownCircle = document.getElementById("countdownCircle");
const countdownLabel = document.getElementById("countdownLabel");
const toggleTimerBtn = document.getElementById("toggleTimerBtn");

// Statistics grid mapping
const statTargetUser = document.getElementById("statTargetUser");
const statDelta = document.getElementById("statDelta");
const statIterations = document.getElementById("statIterations");
const statTime = document.getElementById("statTime");
const sparklineContainer = document.getElementById("sparklineSvgContainer");
const soundToggle = document.getElementById("soundToggle");
const soundOnIcon = document.getElementById("soundOnIcon");
const soundOffIcon = document.getElementById("soundOffIcon");

const downloadBtn = document.getElementById("downloadBtn");
const previewBtn = document.getElementById("previewBtn");

// Panels list mapping
const popularGrid = document.getElementById("popularGrid");
const trendingGrid = document.getElementById("trendingGrid");
const promoGrid = document.getElementById("promoGrid");
const historySection = document.getElementById("historySection");
const historyTagsContainer = document.getElementById("historyTagsContainer");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

// ----------------------------------------------------
// Web Audio synthesizer matching React
// ----------------------------------------------------
function playTickSound() {
  if (!soundEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContext;
    if (ctx.state === "suspended") {
      ctx.resume();
    }
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(2400, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.05);

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.055);
  } catch (err) {
    console.warn("Audio Context blocked by client policies:", err);
  }
}

function playSuccessSound() {
  if (!soundEnabled) return;
  try {
    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    const ctx = audioContext;
    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const gain = ctx.createGain();

    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08); // E5

    gain.gain.setValueAtTime(0.04, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(ctx.destination);

    osc1.start();
    osc1.stop(ctx.currentTime + 0.15);
    osc2.start(ctx.currentTime + 0.08);
    osc2.stop(ctx.currentTime + 0.3);
  } catch (e) {
    // fail silently
  }
}

// ----------------------------------------------------
// Sound Toggle Controls
// ----------------------------------------------------
if (soundToggle && soundOnIcon && soundOffIcon) {
  soundToggle.addEventListener("click", () => {
    soundEnabled = !soundEnabled;
    if (soundEnabled) {
      soundToggle.className = "p-2 rounded-lg border bg-rose-500/10 border-rose-500/30 text-rose-400 transition-all";
      soundToggle.title = "Mute tick count generator";
      soundOnIcon.classList.remove("hidden");
      soundOffIcon.classList.add("hidden");
      
      // Resume audio context instantly on interaction to prevent safari constraints
      if (!audioContext) {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
      }
      audioContext.resume();
    } else {
      soundToggle.className = "p-2 rounded-lg border bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 transition-all";
      soundToggle.title = "Enable nostalgic live tick sounds";
      soundOnIcon.classList.add("hidden");
      soundOffIcon.classList.remove("hidden");
    }
  });
}

// ----------------------------------------------------
// Animated Counter Engine with ease-out cubic interpolators
// ----------------------------------------------------
let displayValue = 0;
let previousValue = 0;
let counterAnimationFrameId = null;

function animateCounter(targetValue, isFreshTarget = false) {
  if (counterAnimationFrameId) {
    cancelAnimationFrame(counterAnimationFrameId);
  }

  const startValue = previousValue;
  const endValue = Number(targetValue) || 0;

  let effectiveStart = startValue;
  let duration = 1200; // default transition in ms

  if (isFreshTarget || startValue === 0) {
    effectiveStart = 0;
    duration = 1600;
  } else if (Math.abs(endValue - startValue) > 50000) {
    effectiveStart = 0;
    duration = 1500;
  } else {
    effectiveStart = startValue;
    duration = 600;
  }

  const startTime = performance.now();
  let lastTickTime = 0;

  function updateCounterLoop(now) {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    
    // Slick cubic ease path
    const c3 = progress - 1;
    const easeProgress = c3 * c3 * c3 + 1;

    const nextValue = Math.floor(effectiveStart + (endValue - effectiveStart) * easeProgress);
    
    if (nextValue !== displayValue) {
      displayValue = nextValue;
      massiveCounter.textContent = displayValue.toLocaleString();
      
      // Throttle sound effect ticks to avoid overlaps
      if (now - lastTickTime > 35) {
        playTickSound();
        lastTickTime = now;
      }
    }

    if (progress < 1) {
      counterAnimationFrameId = requestAnimationFrame(updateCounterLoop);
    } else {
      displayValue = endValue;
      massiveCounter.textContent = endValue.toLocaleString();
      previousValue = endValue;
    }
  }

  counterAnimationFrameId = requestAnimationFrame(updateCounterLoop);
}

// ----------------------------------------------------
// Responsive SVG Sparkline rendering engine match React
// ----------------------------------------------------
function drawSparkline() {
  if (sessionsTracked.length < 2) {
    sparklineContainer.innerHTML = `
      <div class="h-full flex items-center justify-center text-zinc-500 text-xs font-mono">
        Min. 2 data points required to map live trends
      </div>
    `;
    return;
  }

  const counts = sessionsTracked.map(d => d.count);
  const min = Math.min(...counts);
  const max = Math.max(...counts);
  const range = (max - min === 0) ? 1 : (max - min);

  const containerWidth = sparklineContainer.clientWidth || 500;
  const height = 96; // h-24 in Tailwind is 96px
  const padding = 12;

  // Map data coordinates
  const points = sessionsTracked.map((d, index) => {
    const x = padding + (index / (sessionsTracked.length - 1)) * (containerWidth - padding * 2);
    const y = height - padding - ((d.count - min) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const pathStr = points.join(" ");
  
  // Highlight dot metrics
  const lastDotX = padding + ((sessionsTracked.length - 1) / (sessionsTracked.length - 1)) * (containerWidth - padding * 2);
  const lastDotY = height - padding - ((counts[counts.length - 1] - min) / range) * (height - padding * 2);

  const svgHtml = `
    <svg class="w-full h-full overflow-visible" viewBox="0 0 ${containerWidth} ${height}">
      <defs>
        <!-- Fade Area Gradient -->
        <linearGradient id="cf-sparkline-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#ff2975" stop-opacity="0.2" />
          <stop offset="100%" stop-color="#7209b7" stop-opacity="0" />
        </linearGradient>
        <!-- Line Tube Gradient -->
        <linearGradient id="cf-insta-line-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#f7a53c" />
          <stop offset="50%" stop-color="#ff2975" />
          <stop offset="100%" stop-color="#7f37c9" />
        </linearGradient>
      </defs>

      <!-- Horizontal Dashboard Guideline ticks -->
      <line x1="0" y1="${padding}" x2="${containerWidth}" y2="${padding}" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="0" y1="${height / 2}" x2="${containerWidth}" y2="${height / 2}" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />
      <line x1="0" y1="${height - padding}" x2="${containerWidth}" y2="${height - padding}" stroke="#27272a" stroke-width="1" stroke-dasharray="4,4" />

      <!-- Area below trendline -->
      <path d="M ${padding},${height - padding} L ${pathStr} L ${containerWidth - padding},${height - padding} Z" fill="url(#cf-sparkline-grad)" />

      <!-- Smooth Vector Sparkline Path -->
      <polyline fill="none" stroke="url(#cf-insta-line-gradient)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" points="${pathStr}" />

      <!-- Glowing tracker target dot -->
      <circle cx="${lastDotX}" cy="${lastDotY}" r="5" class="fill-rose-500 stroke-white stroke-2" style="animation: pulse 1s infinite alternate;" />
    </svg>
  `;

  sparklineContainer.innerHTML = svgHtml;
}

// Redraw sparkline if browser dimensions resize
window.addEventListener("resize", drawSparkline);

// ----------------------------------------------------
// UI Render Synchroniser
// ----------------------------------------------------
function syncUIElements(isFresh = false) {
  // Update texts
  trackerUsername.textContent = `@${currentUsername}`;
  igLink.href = `https://instagram.com/${currentUsername}`;
  resFullName.textContent = currentFullName || "Instagram User";
  resBio.textContent = currentBiography || "";
  
  // Update stats cards keys
  statTargetUser.textContent = `@${currentUsername}`;
  
  // Calculate Delta
  const startCount = (sessionsTracked.length > 0 && sessionsTracked[0].count > 0) ? sessionsTracked[0].count : currentFollowerCount;
  const growth = (currentFollowerCount && startCount) ? (currentFollowerCount - startCount) : 0;
  
  statDelta.innerHTML = `
    <span>${growth >= 0 ? "+" : ""}</span>${growth.toLocaleString()}
  `;
  if (growth >= 0) {
    statDelta.className = "text-sm font-mono font-semibold text-emerald-400 flex items-center justify-center gap-1";
  } else {
    statDelta.className = "text-sm font-mono font-semibold text-rose-400 flex items-center justify-center gap-1";
  }

  // Poll Iterations
  const ticksCount = sessionsTracked.filter(s => s.time !== "INIT").length;
  statIterations.textContent = `${ticksCount} ticks`;
  
  // Time updated
  statTime.textContent = new Date().toLocaleTimeString();

  const avatarCacheBuster = currentAvatarUrl ? `${currentAvatarUrl}${currentAvatarUrl.includes('?') ? '&' : '?'}_=${Date.now()}` : currentAvatarUrl;
  
  // Images DP loader
  profileImg.style.opacity = "0.3";
  profileImg.style.filter = "blur(8px)";
  
  const imgLoader = new Image();
  imgLoader.onload = () => {
    profileImg.src = avatarCacheBuster;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };
  imgLoader.onerror = () => {
    const fallback = `https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop`;
    profileImg.src = fallback;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };
  imgLoader.src = avatarCacheBuster;

  // Counter
  if (currentFollowerCount !== null) {
    animateCounter(currentFollowerCount, isFresh);
  }

  // Drawer
  drawSparkline();
}

// ----------------------------------------------------
// Worker Client & Standalone direct scrapers
// ----------------------------------------------------
async function fetchWithTimeout(url, duration = 8000, options = {}) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), duration);
  return fetch(url, { signal: controller.signal, cache: 'no-store', ...options }).finally(() => clearTimeout(timeoutId));
}

async function queryEdgeWorkers(username) {
  const randomized = [...WORKERS].sort(() => Math.random() - 0.5);
  const controllers = [];

  const workerPromises = randomized.map(worker => {
    const controller = new AbortController();
    controllers.push(controller);

    const targetQuery = `${worker}?username=${encodeURIComponent(username)}&_=${Date.now()}`;
    return fetchWithTimeout(targetQuery, 5000, { signal: controller.signal })
      .then(response => {
        if (!response.ok) {
          throw new Error(`Worker ${worker} failed with status ${response.status}`);
        }
        return response.json();
      })
      .then(data => {
        if (data && (data.success || data.status === "success" || typeof data.followers === "number")) {
          return { data, worker };
        }
        throw new Error(`Worker ${worker} returned invalid payload`);
      });
  });

  try {
    const result = await Promise.any(workerPromises);
    controllers.forEach(ctrl => ctrl.abort());
    return result;
  } catch (err) {
    controllers.forEach(ctrl => ctrl.abort());
    throw new Error("All active Cloudflare Workers are currently rate-limited by Instagram. Please retry in some seconds or try checking another profile.");
  }
}

async function scrapeFollowersFromInstastatistics(username) {
  // 1. Try direct API calls first (works if in an environment with relaxed CORS, or same-origin setup)
  try {
    const apiHeaders = {
      "Cache-Control": "no-cache, no-store",
      "Pragma": "no-cache",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
      "Referer": "https://instastatistics.com/"
    };
    const tokenRes = await fetchWithTimeout("https://instastatistics.com/api/token", 4000, { headers: apiHeaders });
    if (tokenRes.ok) {
      const tokenData = await tokenRes.json();
      if (tokenData && tokenData.token) {
        const userRes = await fetchWithTimeout(`https://instastatistics.com/api/user/${encodeURIComponent(username)}?_=${Date.now()}`, 4000, { headers: apiHeaders });
        if (userRes.ok) {
          const userData = await userRes.json();
          if (userData && userData.followers !== undefined && userData.followers !== null) {
            return {
              followers: Number(userData.followers),
              avatarUrl: userData.avatar || "",
              fullName: userData.name || "",
              biography: userData.biography || ""
            };
          }
        }
      }
    }
  } catch (err) {
    console.warn("[Direct Instastatistics API Client Mode Failed, trying fallbacks]", err);
  }

  // 2. Fallback to HTML crawling via proxies
  const targetUrl = `https://instastatistics.com/${encodeURIComponent(username)}`;
  const timestamp = Date.now();
  const proxies = [
    `https://corsproxy.io/?${encodeURIComponent(targetUrl)}&_=${timestamp}`,
    `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}&_=${timestamp}`
  ];

  for (const proxyUrl of proxies) {
    try {
      const isAllOrigins = proxyUrl.includes("allorigins");
      const response = await fetchWithTimeout(proxyUrl, 5000, {
        headers: {
          "Cache-Control": "no-cache, no-store",
          "Pragma": "no-cache",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
          "Referer": "https://instastatistics.com/"
        }
      });
      if (!response.ok) continue;

      let htmlText = "";
      if (isAllOrigins) {
        const json = await response.json();
        htmlText = json.contents || "";
      } else {
        htmlText = await response.text();
      }

      if (htmlText) {
        const ogDescMatch = htmlText.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i) ||
                            htmlText.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
        
        let followersCount = null;
        if (ogDescMatch) {
          const descContent = ogDescMatch[1];
          const countMatch = descContent.match(/has\s+([\d,.]+)\s*(?:Instagram\s*)?followers/i) ||
                             descContent.match(/([\d,.]+)\s*(?:Instagram\s*)?followers/i) ||
                             descContent.match(/has\s+([\d,.]+)/i);
          if (countMatch) {
            followersCount = parseInt(countMatch[1].replace(/[,.]/g, ""), 10);
          }
        }
        
        if (!followersCount || isNaN(followersCount)) {
          const bodyMatches = [
            htmlText.match(/has\s+([\d,.]+)\s*(?:Instagram\s*)?followers/i),
            htmlText.match(/([\d,.]+)\s*(?:Instagram\s*)?followers/i),
            htmlText.match(/([\d,.]+)\s+followers/i),
            htmlText.match(/follower_count["']?\s*:\s*([\d]+)/i),
            htmlText.match(/followers["']?\s*:\s*([\d]+)/i)
          ];
          for (const match of bodyMatches) {
            if (match && match[1]) {
              const parsed = parseInt(match[1].replace(/[,.]/g, ""), 10);
              if (!isNaN(parsed) && parsed > 0) {
                followersCount = parsed;
                break;
              }
            }
          }
        }

        if (followersCount && !isNaN(followersCount)) {
          let avatarUrl = "";
          const ogImageMatch = htmlText.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i) ||
                               htmlText.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
          if (ogImageMatch && ogImageMatch[1]) {
            avatarUrl = ogImageMatch[1];
          }
          return {
            followers: followersCount,
            avatarUrl: avatarUrl
          };
        }
      }
    } catch (e) {
      console.warn(`[Proxy Scraping Warning] Failed via proxy: ${proxyUrl}`, e);
    }
  }
  return null;
}

async function smartWorkerRetrieve(username) {
  try {
    return await queryEdgeWorkers(username);
  } catch (err) {
    await new Promise(r => setTimeout(r, 1200));
    return await queryEdgeWorkers(username);
  }
}

// ----------------------------------------------------
// Unified same-origin server fetcher
// ----------------------------------------------------
let activeFetchController = null;

async function trackInstagramProfile(usernameKey, silent = false) {
  if (!usernameKey) return;
  const cleanUser = usernameKey.trim().toLowerCase().replace(/^@/, "");
  if (!cleanUser) return;

  // Concurrency guard: cancel previous search if a fresh manual search starts
  if (!silent && activeFetchController) {
    activeFetchController.abort();
    activeFetchController = null;
  }

  // If a silent background sync triggers while already busy, just wait
  if (isRefreshing && silent) {
    return;
  }

  if (!silent) {
    // Immediate hydration from cache/history to prevent blank screen flicker
    const cachedRecord = searchHistory.find(h => h.username === cleanUser);
    const popularRecord = POPULAR_PROFILES.find(p => p.username === cleanUser);
    const cachedCount = cachedRecord?.lastCount || popularRecord?.count || null;
    const cachedName = cachedRecord?.fullName || popularRecord?.name || null;
    const cachedBio = cachedRecord?.biography || null;
    const cachedPic = cachedRecord?.avatarUrl || popularRecord?.avatarUrl || "https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop&q=80";

    currentFollowerCount = cachedCount;
    currentFullName = cachedName || (cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1));
    currentBiography = cachedBio || "Real-time Instagram statistics tracker.";
    currentAvatarUrl = cachedPic;

    syncUIElements(true);

    loading = !cachedCount;
    errorState.classList.add("hidden");
    submitBtn.disabled = true;
    if (loading) {
      loadingIcon.classList.remove("hidden");
      btnText.textContent = "Loading...";
    } else {
      loadingIcon.classList.add("hidden");
      btnText.textContent = "Track";
    }
    loadingState.classList.remove("hidden");
  } else {
    loadingState.classList.remove("hidden");
  }

  isRefreshing = true;

  try {
    activeFetchController = new AbortController();
    const signal = activeFetchController.signal;

    let nextFollowers = null;
    let nextAvatar = null;
    let nextName = null;
    let nextBio = null;

    // 1. First, try the same-origin server API route (fastest & handles backend CORS natively)
    try {
      const response = await fetchWithTimeout(`/api/followers?user=${encodeURIComponent(cleanUser)}&_=${Date.now()}`, 4000, { signal, cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        if (data && data.success) {
          nextFollowers = data.followers;
          nextAvatar = data.avatarUrl;
          nextName = data.fullName;
          nextBio = data.biography;
        }
      }
    } catch (apiErr) {
      console.warn("[Local API Connection failed or timed out, trying standalone cloud modes]", apiErr);
    }

    // 2. If locally not parsed (e.g. running statically outside workspace), fall back to Scraping/Edge-workers
    if (nextFollowers == null || isNaN(nextFollowers)) {
      const [workerPayload, scrapedCount] = await Promise.allSettled([
        smartWorkerRetrieve(cleanUser),
        scrapeFollowersFromInstastatistics(cleanUser)
      ]);

      let workerData = null;
      let workerUsed = null;
      if (workerPayload.status === "fulfilled" && workerPayload.value) {
        workerData = workerPayload.value.data;
        workerUsed = workerPayload.value.worker;
      }

      // Prioritize modern live Cloudflare Worker results first (since they are unmitigated from proxy-level caches)
      const hasWorkerFollowers = workerData && (workerData.followers !== undefined && workerData.followers !== null && !isNaN(workerData.followers));

      if (hasWorkerFollowers) {
        nextFollowers = Number(workerData.followers || workerData.follower_count || workerData.followers_count || workerData.metrics?.followers);
        if (workerData.avatarUrl || workerData.image || workerData.avatar) {
          nextAvatar = workerData.avatarUrl || workerData.image || workerData.avatar;
        }
        if (workerData.fullName || workerData.full_name) {
          nextName = workerData.fullName || workerData.full_name;
        }
        if (workerData.biography || workerData.bio) {
          nextBio = workerData.biography || workerData.bio;
        }
      } else if (scrapedCount.status === "fulfilled" && scrapedCount.value !== null) {
        const tempRes = scrapedCount.value;
        if (tempRes && typeof tempRes === "object") {
          nextFollowers = tempRes.followers;
          if (tempRes.avatarUrl) nextAvatar = tempRes.avatarUrl;
          if (tempRes.fullName) nextName = tempRes.fullName;
          if (tempRes.biography) nextBio = tempRes.biography;
        } else {
          nextFollowers = tempRes;
        }
      }

      // High availability backup list
      if (!nextFollowers || isNaN(nextFollowers)) {
        throw new Error("Unable to retrieve count. Standalone workers might be rate-limited.");
      }

      const rawAvatar = workerData?.avatarUrl || workerData?.image || workerData?.avatar || nextAvatar || `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop&q=80`;
      if (workerUsed) {
        nextAvatar = `${workerUsed}?proxy=${encodeURIComponent(rawAvatar)}`;
      } else {
        nextAvatar = rawAvatar;
      }

      nextName = workerData?.fullName || workerData?.full_name || nextName || (cleanUser.charAt(0).toUpperCase() + cleanUser.slice(1));
      nextBio = workerData?.biography || workerData?.bio || nextBio || "Real-time Instagram statistics tracker.";
    }

    // Verify if client moved targets mid-cycle
    if (cleanUser !== currentUsername.toLowerCase().trim().replace(/^@/, "")) {
      return;
    }

    currentFollowerCount = nextFollowers;
    currentAvatarUrl = nextAvatar || `https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=150&h=150&fit=crop&q=80`;
    currentFullName = nextName;
    currentBiography = nextBio;

    // Insert sparkline timeline point
    const formatterTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    
    // Reset sparkline history if target completely switches
    if (sessionsTracked.length > 0 && sessionsTracked[0].time === "INIT") {
      sessionsTracked = [];
    }
    
    sessionsTracked.push({ time: formatterTime, count: nextFollowers });
    if (sessionsTracked.length > 15) {
      sessionsTracked.shift(); // keep max last 15 ticks
    }

    // Persist history log
    appendSearchHistory(cleanUser, nextFollowers, nextAvatar, nextName, nextBio);

    // Play successful chime synths
    if (soundEnabled && !silent) {
      playSuccessSound();
    }

    // React style UI update
    syncUIElements(false);

  } catch (err) {
    if (err.name === "AbortError") return; // Suppress manually aborted task error
    if (cleanUser !== currentUsername.toLowerCase().trim().replace(/^@/, "")) return;
    
    if (!silent && !currentFollowerCount) {
      showRenderError(err.message || "Failed to establish a steady live connection.");
    }
  } finally {
    activeFetchController = null;
    isRefreshing = false;
    if (cleanUser === currentUsername.toLowerCase().trim().replace(/^@/, "")) {
      loading = false;
      submitBtn.disabled = false;
      loadingIcon.classList.add("hidden");
      btnText.textContent = "Track";
      loadingState.classList.add("hidden");
      timeToNextFetch = 5.0;
    }
  }
}

function showRenderError(message) {
  errorMessage.textContent = message;
  errorState.classList.remove("hidden");
}

errorRetryBtn.addEventListener("click", () => {
  errorState.classList.add("hidden");
  trackInstagramProfile(currentUsername, false);
});

// ----------------------------------------------------
// Timer Engine & Circular Svg progress bars
// ----------------------------------------------------
let lastIntervalTimestamp = performance.now();

setInterval(() => {
  if (!autoRefresh || loading || isRefreshing || !currentUsername) return;

  const currentNow = performance.now();
  const deltaSeconds = (currentNow - lastIntervalTimestamp) / 1000;
  lastIntervalTimestamp = currentNow;

  // Protect against huge pauses or background inactive tab sleeps
  const decrement = Math.min(deltaSeconds, 0.5);

  timeToNextFetch = Math.max(0, timeToNextFetch - decrement);

  if (timeToNextFetch <= 0.05) {
    timeToNextFetch = 5.0;
    trackInstagramProfile(currentUsername, true);
  }

  // Update Progress visuals circular
  countdownLabel.textContent = `${timeToNextFetch.toFixed(1)}s`;
  
  // Total circumference is 2 * PI * r = 2 * 3.14 * 10 = 62.8
  const offsetCircumference = 62.8 * (1 - timeToNextFetch / 5.0);
  countdownCircle.setAttribute("stroke-dashoffset", offsetCircumference);

}, 100);


// Adjust timestamp on state changes
toggleTimerBtn.addEventListener("click", () => {
  autoRefresh = !autoRefresh;
  const iconDiv = document.getElementById("playPauseIconShape");
  
  if (autoRefresh) {
    toggleTimerBtn.className = "p-1.5 rounded-md bg-amber-500/15 text-amber-400 hover:bg-amber-500/20 transition-all font-display";
    toggleTimerBtn.title = "Pause active polling";
    iconDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-3 w-3 fill-amber-400">
        <rect x="6" y="5" width="3" height="14" rx="0.5" />
        <rect x="15" y="5" width="3" height="14" rx="0.5" />
      </svg>
    `;
    lastIntervalTimestamp = performance.now();
  } else {
    toggleTimerBtn.className = "p-1.5 rounded-md bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/20 transition-all font-display";
    toggleTimerBtn.title = "Resume dynamic 5s auto updates";
    iconDiv.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="h-3 w-3 fill-emerald-400">
        <path d="M8 5v14l11-7z" />
      </svg>
    `;
  }
});

// ----------------------------------------------------
// Search Input Event Handling
// ----------------------------------------------------
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  if (cooldown) return;

  const rawUser = usernameInput.value.trim().toLowerCase().replace(/^@/, "");
  if (!rawUser) return;

  // Validate regex alphanumeric
  if (!/^[a-zA-Z0-9._]{1,30}$/.test(rawUser)) {
    showRenderError("Misspelled target. Only alphanumeric characters, dots, and underscores are allowed.");
    return;
  }

  currentUsername = rawUser;
  usernameInput.value = "";
  
  // Wipe session graphs
  sessionsTracked = [{ time: "INIT", count: 0 }];

  trackInstagramProfile(currentUsername, false);

  cooldown = true;
  setTimeout(() => cooldown = false, 2500);
});

// ----------------------------------------------------
// Local Storage History Management
// ----------------------------------------------------
function loadLocalHistory() {
  const localLogs = localStorage.getItem("insta_tracker_history");
  if (localLogs) {
    try {
      searchHistory = JSON.parse(localLogs);
    } catch (e) {
      searchHistory = [];
    }
  }
  renderHistoryTags();
}

function appendSearchHistory(username, count, avatarUrl, fullName, bio) {
  searchHistory = [
    { username, timestamp: Date.now(), lastCount: count, avatarUrl, fullName, biography: bio },
    ...searchHistory.filter(item => item.username !== username)
  ].slice(0, 8); // keeps last 8 profiles

  localStorage.setItem("insta_tracker_history", JSON.stringify(searchHistory));
  renderHistoryTags();
}

function renderHistoryTags() {
  if (searchHistory.length === 0) {
    historySection.classList.add("hidden");
    return;
  }

  historySection.classList.remove("hidden");
  historyTagsContainer.innerHTML = "";

  searchHistory.forEach(rec => {
    const btn = document.createElement("button");
    btn.className = `flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono border transition-all ${
      rec.username === currentUsername 
        ? "bg-rose-500/5 border-rose-500/30 text-rose-300" 
        : "bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:text-zinc-200 text-zinc-400"
    }`;
    
    // Dynamic tag HTML matching React
    btn.innerHTML = `
      <span>@${rec.username}</span>
      ${rec.lastCount !== undefined ? `
        <span class="text-[10px] bg-zinc-950 text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
          ${rec.lastCount.toLocaleString()}
        </span>
      ` : ""}
      <!-- Chevron right inline svg -->
      <svg class="h-2 w-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
    `;

    btn.addEventListener("click", () => {
      currentUsername = rec.username;
      currentFollowerCount = rec.lastCount || null;
      currentAvatarUrl = rec.avatarUrl || "";
      currentFullName = rec.fullName || rec.username;
      currentBiography = rec.biography || "";
      
      sessionsTracked = [{ time: "INIT", count: 0 }];
      
      syncUIElements(true);
      trackInstagramProfile(currentUsername, false);
    });

    historyTagsContainer.appendChild(btn);
  });
}

clearHistoryBtn.addEventListener("click", () => {
  searchHistory = [];
  localStorage.removeItem("insta_tracker_history");
  renderHistoryTags();
});

// ----------------------------------------------------
// Popular Selection Lists
// ----------------------------------------------------
function renderPopularSelectGrid() {
  popularGrid.innerHTML = "";
  
  POPULAR_PROFILES.forEach(profile => {
    const btn = document.createElement("button");
    btn.className = `flex flex-col items-center p-3 rounded-xl border text-center transition-all ${
      currentUsername === profile.username
        ? "bg-rose-500/10 border-rose-500/30 text-white"
        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 text-zinc-400 hover:text-zinc-200"
    }`;

    btn.innerHTML = `
      <div class="p-0.5 rounded-full bg-gradient-to-tr from-[#fbc531] via-[#e84118] to-[#9c88ff] mb-2.5">
        <img
          src="${profile.avatarUrl}"
          alt="${profile.name}"
          class="w-10 h-10 rounded-full object-cover bg-zinc-950"
        />
      </div>
      <span class="text-[11px] font-semibold font-display truncate w-full">${profile.name}</span>
      <span class="text-[9px] font-mono text-zinc-500 truncate w-full mt-0.5">@${profile.username}</span>
    `;

    btn.addEventListener("click", () => {
      currentUsername = profile.username;
      
      const cachedRecord = searchHistory.find(h => h.username === profile.username);
      currentFollowerCount = cachedRecord?.lastCount || profile.count || null;
      currentAvatarUrl = cachedRecord?.avatarUrl || profile.avatarUrl;
      currentFullName = cachedRecord?.fullName || profile.name;
      currentBiography = cachedRecord?.biography || "Real-time Instagram statistics tracker.";
      
      sessionsTracked = [{ time: "INIT", count: 0 }];
      
      syncUIElements(true);
      trackInstagramProfile(currentUsername, false);
      
      // Update popular button highlights
      renderPopularSelectGrid();
    });

    popularGrid.appendChild(btn);
  });
}

function renderTrendingGrid() {
  if (!trendingGrid) return;
  trendingGrid.innerHTML = "";

  TRENDING_ACCOUNTS.forEach(account => {
    const btn = document.createElement("button");
    btn.className = `rounded-2xl border px-3 py-2 text-sm font-semibold text-left transition-all ${
      currentUsername === account.username
        ? "bg-sky-500/10 border-sky-500 text-white"
        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 text-zinc-300 hover:text-zinc-100"
    }`;

    btn.innerHTML = `
      <span class="block truncate">@${account.username}</span>
      <span class="block text-[10px] text-zinc-500 mt-0.5">${account.display}</span>
    `;

    btn.addEventListener("click", () => {
      currentUsername = account.username;
      const cachedRecord = searchHistory.find(h => h.username === account.username);
      currentFollowerCount = cachedRecord?.lastCount || null;
      currentAvatarUrl = cachedRecord?.avatarUrl || "";
      currentFullName = cachedRecord?.fullName || account.display;
      currentBiography = cachedRecord?.biography || "Real-time Instagram statistics tracker.";
      sessionsTracked = [{ time: "INIT", count: 0 }];

      syncUIElements(true);
      trackInstagramProfile(currentUsername, false);
      renderPopularSelectGrid();
      renderTrendingGrid();
    });

    trendingGrid.appendChild(btn);
  });
}

function renderPromotionalGrid() {
  if (!promoGrid) return;
  promoGrid.innerHTML = "";

  PROMOTIONAL_ACCOUNTS.forEach(account => {
    const btn = document.createElement("button");
    btn.className = `rounded-3xl border p-4 text-left transition-all min-h-[130px] w-full ${
      currentUsername === account.username
        ? "bg-rose-500/10 border-rose-500 text-white"
        : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900/80 text-zinc-300 hover:text-zinc-100"
    }`;

    btn.innerHTML = `
      <div class="flex items-center gap-3 mb-3">
        <div class="w-10 h-10 rounded-full bg-zinc-950 overflow-hidden flex items-center justify-center border border-zinc-800">
          <img src="${account.avatarUrl}" alt="${account.display}" class="w-full h-full object-cover" />
        </div>
        <div class="text-left">
          <div class="text-sm font-semibold">${account.display}</div>
          <div class="text-[10px] text-zinc-500">@${account.username}</div>
        </div>
      </div>
      <p class="text-[10px] text-zinc-400 leading-snug">${account.description}</p>
    `;

    btn.addEventListener("click", () => {
      currentUsername = account.username;
      const cachedRecord = searchHistory.find(h => h.username === account.username);
      currentFollowerCount = cachedRecord?.lastCount || null;
      currentAvatarUrl = cachedRecord?.avatarUrl || account.avatarUrl;
      currentFullName = cachedRecord?.fullName || account.display;
      currentBiography = cachedRecord?.biography || "Real-time Instagram statistics tracker.";
      sessionsTracked = [{ time: "INIT", count: 0 }];

      syncUIElements(true);
      trackInstagramProfile(currentUsername, false);
      renderPopularSelectGrid();
      renderTrendingGrid();
      renderPromotionalGrid();
    });

    promoGrid.appendChild(btn);
  });
}

// ----------------------------------------------------
// Visual Asset Actions handling (Download, preview)
// ----------------------------------------------------
downloadBtn.addEventListener("click", async () => {
  if (!currentAvatarUrl) return;
  
  // Identify the active worker domain from currentAvatarUrl
  let downloadUrl = currentAvatarUrl;
  
  try {
    const response = await fetch(downloadUrl);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    
    const virtualLink = document.createElement("a");
    virtualLink.href = blobUrl;
    virtualLink.download = `krlive_dp_${currentUsername}.jpg`;
    virtualLink.click();
    
    // Cleanup reference memory
    URL.revokeObjectURL(blobUrl);
  } catch (e) {
    // Failover directly targets picture resource in new tab if CORS issues emerge
    window.open(downloadUrl, "_blank");
  }
});

previewBtn.addEventListener("click", () => {
  if (currentAvatarUrl) {
    window.open(currentAvatarUrl, "_blank");
  }
});

// ----------------------------------------------------
// App Initialization
// ----------------------------------------------------
function initApp() {
  loadLocalHistory();
  renderPopularSelectGrid();
  renderTrendingGrid();
  renderPromotionalGrid();
  
  // Track default "instagram" profile on boot
  sessionsTracked = [{ time: "INIT", count: 0 }];
  syncUIElements(true);
  trackInstagramProfile(currentUsername, false);
}

// Trigger initializations
document.addEventListener("DOMContentLoaded", initApp);
