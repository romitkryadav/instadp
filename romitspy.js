const WORKERS = [
  "https://instadp.romitkr5539.workers.dev",
  "https://instadp2.romitkr3018.workers.dev",
  "https://instadp3.romitkryadav5539.workers.dev",
  "https://instadp4.contact-themistero.workers.dev",
  "https://instadp5.romitkr1815130920.workers.dev",
  "https://instadp6.romityadav5539.workers.dev",
  "https://instadp7.r18151309.workers.dev",
];

const cache = new Map();
let currentResult = null;

const searchForm = document.getElementById("searchForm"),
  usernameInput = document.getElementById("usernameInput"),
  submitBtn = document.getElementById("submitBtn"),
  btnText = document.getElementById("btnText"),
  loadingIcon = document.getElementById("loadingIcon"),
  loadingState = document.getElementById("loadingState"),
  errorState = document.getElementById("errorState"),
  errorMessage = document.getElementById("errorMessage"),
  resultSection = document.getElementById("resultSection"),
  profileImg = document.getElementById("profileImg"),
  resUsername = document.getElementById("resUsername"),
  resFullName = document.getElementById("resFullName"),
  resBio = document.getElementById("resBio"),
  downloadBtn = document.getElementById("downloadBtn"),
  previewBtn = document.getElementById("previewBtn"),
  igLink = document.getElementById("igLink");

function getCleanUsername(raw) {
  let t = raw.trim();
  try {
    if (t.includes("instagram.com")) {
      let r = new URL(t.startsWith("http") ? t : `https://${t}`);
      let n = r.pathname.split("/").filter(Boolean);
      if (n.length) t = n[0];
    }
  } catch {}
  if (t.startsWith("@")) t = t.slice(1);
  return t;
}

function isValidUsername(e) {
  return /^[a-zA-Z0-9._]{2,30}$/.test(e);
}

function setLoading(e) {
  submitBtn.disabled = e;
  btnText.classList.toggle("hidden", e);
  loadingIcon.classList.toggle("hidden", !e);
  loadingState.classList.toggle("hidden", !e);
}

function fetchWithTimeout(url, ms = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), ms);
  return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
}

/**
 * Fires requests to ALL workers at the same time.
 * Resolves as soon as the first worker returns a valid successful response.
 * Rejects only if every single worker fails.
 */
function fetchOne(username) {
  return new Promise((resolve, reject) => {
    let settled = false;
    let remaining = WORKERS.length;

    WORKERS.forEach(async (worker) => {
      try {
        const res = await fetchWithTimeout(`${worker}?username=${username}`);
        if (!res.ok) throw new Error("bad status");

        const data = await res.json();
        if (data?.status === "success" && data.image?.startsWith("http")) {
          if (!settled) {
            settled = true;
            resolve({ data, worker });
          }
        } else {
          throw new Error("invalid data");
        }
      } catch {
        // this worker failed — ignore, let the others keep racing
      } finally {
        remaining--;
        if (remaining === 0 && !settled) {
          reject(new Error("All workers failed"));
        }
      }
    });
  });
}

async function fetchSmart(username) {
  try {
    return await fetchOne(username);
  } catch {
    await new Promise((r) => setTimeout(r, 1500));
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

function displayResult(data, worker) {
  currentResult = { ...data, worker };
  const proxyUrl = `${worker}?proxy=${encodeURIComponent(data.image)}`;

  profileImg.style.opacity = "0.3";
  profileImg.style.filter = "blur(8px)";

  const img = new Image();
  img.onload = () => {
    profileImg.src = data.image;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };
  img.onerror = () => {
    profileImg.src = proxyUrl;
    profileImg.style.opacity = "1";
    profileImg.style.filter = "none";
  };
  img.src = data.image;

  setTimeout(() => {
    if (!img.complete || img.naturalWidth === 0) {
      profileImg.src = proxyUrl;
      profileImg.style.opacity = "1";
      profileImg.style.filter = "none";
    }
  }, 2500);

  resUsername.textContent = `@${data.username}`;
  resFullName.textContent = data.full_name || "Instagram User";
  resBio.textContent = data.biography || "";
  igLink.href = `https://instagram.com/${data.username}`;
  resultSection.classList.remove("hidden");

  setTimeout(() => {
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 100);
}

function showError(msg) {
  errorMessage.textContent = msg;
  errorState.classList.remove("hidden");
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = getCleanUsername(usernameInput.value);

  if (!username || !isValidUsername(username)) {
    return showError("Invalid username");
  }

  setLoading(true);
  errorState.classList.add("hidden");
  resultSection.classList.add("hidden");
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

downloadBtn.addEventListener("click", async () => {
  if (!currentResult?.image) return;
  const { worker, image, username } = currentResult;
  const proxyUrl = `${worker}?proxy=${encodeURIComponent(image)}`;

  try {
    const res = await fetch(proxyUrl);
    const blob = await res.blob();
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `instagram_${username}.jpg`;
    a.click();
  } catch {
    window.open(proxyUrl, "_blank");
  }
});

previewBtn.addEventListener("click", () => {
  if (currentResult?.image) window.open(currentResult.image, "_blank");
});
