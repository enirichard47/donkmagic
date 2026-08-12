const PROJECT = {
  contract: "TBA",
  buyUrl: "https://t.me/DONKstribe",
  xUrl: "https://x.com/DonkMagic",
  telegramUrl: "https://t.me/DONKstribe",
  dexUrl: "#",
  founderXUrl: "https://x.com/Eternal_HeroS",
  tiktokUrl: "https://www.tiktok.com/@eternal_heros?_r=1&_t=ZG-98nIgKiUjq5",
  youtubeUrl: "https://youtube.com/@eternal_heros?si=r6qqDXnXNwkwuTYo",
};

const menuButton = document.querySelector(".menu-toggle");
const nav = document.querySelector(".site-nav");

function closeMenu() {
  menuButton.setAttribute("aria-expanded", "false");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuButton.addEventListener("click", () => {
  const isOpen = menuButton.getAttribute("aria-expanded") === "true";
  menuButton.setAttribute("aria-expanded", String(!isOpen));
  nav.classList.toggle("open", !isOpen);
  document.body.classList.toggle("menu-open", !isOpen);
});

nav.querySelectorAll("a").forEach((link) => link.addEventListener("click", closeMenu));

function wireLinks(selector, url) {
  document.querySelectorAll(selector).forEach((link) => {
    link.href = url;
    if (url && url.startsWith("http")) {
      link.target = "_blank";
      link.rel = "noopener noreferrer";
    }
  });
}

wireLinks(".js-buy-link", PROJECT.buyUrl);
wireLinks(".js-x-link", PROJECT.xUrl);
wireLinks(".js-telegram-link", PROJECT.telegramUrl);
wireLinks(".js-dex-link", PROJECT.dexUrl);
wireLinks(".js-founder-x-link", PROJECT.founderXUrl);
wireLinks(".js-tiktok-link", PROJECT.tiktokUrl);
wireLinks(".js-youtube-link", PROJECT.youtubeUrl);

// Dynamic Chart Initialization
function initChart() {
  const chartContainer = document.getElementById("chart-container");
  if (chartContainer) {
    if (PROJECT.contract === "TBA" || !PROJECT.contract) {
      chartContainer.innerHTML = `
        <div class="chart-placeholder">
          <div class="placeholder-icon">🫏</div>
          <h3>CHART LAUNCHING SOON</h3>
          <p>The official contract address has not launched yet. Once announced, the live Dexscreener chart will load here.</p>
          <a class="button button-gold js-telegram-link" href="${PROJECT.telegramUrl}" target="_blank" rel="noopener noreferrer">Join Telegram for Launch <span>↗</span></a>
        </div>
      `;
    } else {
      chartContainer.innerHTML = `<iframe src="https://dexscreener.com/solana/${PROJECT.contract}?embed=1&theme=dark&trades=0&info=0"></iframe>`;
    }
  }
}
initChart();

const shortContract = PROJECT.contract.length > 20
  ? `${PROJECT.contract.slice(0, 7)}…${PROJECT.contract.slice(-6)}`
  : PROJECT.contract;
document.querySelectorAll(".js-contract-short").forEach((el) => { el.textContent = shortContract; });
document.querySelectorAll(".js-contract-full").forEach((el) => { el.textContent = PROJECT.contract; });

const toast = document.querySelector(".toast");
let toastTimer;
document.querySelectorAll(".js-copy").forEach((button) => {
  button.addEventListener("click", async () => {
    if (PROJECT.contract === "TBA" || PROJECT.contract === "COMING SOON") {
      toast.textContent = "Contract address will be announced soon!";
      toast.classList.add("show");
      clearTimeout(toastTimer);
      toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
      return;
    }
    try {
      await navigator.clipboard.writeText(PROJECT.contract);
    } catch {
      const input = document.createElement("textarea");
      input.value = PROJECT.contract;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }
    toast.textContent = "Contract copied!";
    toast.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("show"), 2200);
  });
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

document.getElementById("year").textContent = new Date().getFullYear();

// FAQ Accordion Toggle
document.querySelectorAll(".faq-item").forEach((item) => {
  item.addEventListener("click", () => {
    const isOpen = item.classList.contains("open");
    document.querySelectorAll(".faq-item").forEach((el) => el.classList.remove("open"));
    if (!isOpen) {
      item.classList.add("open");
    }
  });
});

// Dexscreener API Data Fetching
async function fetchDexData() {
  if (PROJECT.contract === "TBA" || !PROJECT.contract) {
    document.getElementById("stat-mcap").textContent = "TBA";
    document.getElementById("stat-price").textContent = "TBA";
    document.getElementById("stat-volume").textContent = "TBA";
    document.getElementById("stat-change").textContent = "TBA";
    return;
  }
  try {
    const response = await fetch(`https://api.dexscreener.com/latest/dex/tokens/${PROJECT.contract}`);
    if (!response.ok) throw new Error("Failed to fetch data");
    const data = await response.json();
    
    const pair = data.pairs && data.pairs[0];
    if (pair) {
      const price = parseFloat(pair.priceUsd || 0);
      const mcap = parseFloat(pair.marketCap || pair.fdv || 0);
      const volume = parseFloat((pair.volume && pair.volume.h24) || 0);
      const change = parseFloat((pair.priceChange && pair.priceChange.h24) || 0);

      const formatUsd = (num) => {
        if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
        if (num >= 1e3) return `$${(num / 1e3).toFixed(1)}K`;
        return `$${num.toFixed(2)}`;
      };

      const formatPrice = (num) => {
        if (num === 0) return "$0.00";
        if (num < 0.0001) return `$${num.toFixed(6)}`;
        if (num < 0.01) return `$${num.toFixed(4)}`;
        return `$${num.toFixed(2)}`;
      };

      const formatChange = (num) => {
        const prefix = num > 0 ? "+" : "";
        return `${prefix}${num.toFixed(2)}%`;
      };

      document.getElementById("stat-mcap").textContent = formatUsd(mcap);
      document.getElementById("stat-price").textContent = formatPrice(price);
      document.getElementById("stat-volume").textContent = formatUsd(volume);
      
      const changeEl = document.getElementById("stat-change");
      changeEl.textContent = formatChange(change);
      if (change < 0) {
        changeEl.style.color = "var(--gold)"; // Red highlight in theme
      } else {
        changeEl.style.color = "var(--lime)"; // Green highlight in theme
      }
    }
  } catch (error) {
    console.error("Dexscreener data load error:", error);
    document.getElementById("stat-mcap").textContent = "TBA";
    document.getElementById("stat-price").textContent = "TBA";
    document.getElementById("stat-volume").textContent = "TBA";
    document.getElementById("stat-change").textContent = "TBA";
  }
}

fetchDexData();
setInterval(fetchDexData, 30000);

// Preloader Loading Progress Logic
const preloader = document.getElementById("preloader");
const preloaderBar = document.getElementById("preloader-bar");

let loaderProgress = 0;
const loaderInterval = setInterval(() => {
  if (loaderProgress < 85) {
    loaderProgress += Math.random() * 15;
    if (loaderProgress > 85) loaderProgress = 85;
    if (preloaderBar) preloaderBar.style.width = `${loaderProgress}%`;
  }
}, 80);

function completeLoader() {
  clearInterval(loaderInterval);
  if (preloaderBar) preloaderBar.style.width = "100%";
  setTimeout(() => {
    if (preloader) {
      preloader.classList.add("fade-out");
    }
  }, 350);
}

// Complete loading when the window is fully loaded
window.addEventListener("load", completeLoader);

// Safety timeout: force preloader closure after 2.5 seconds
setTimeout(completeLoader, 2500);

// Floating Audio Control Logic
const bgMusic = document.getElementById("bg-music");
const musicToggle = document.getElementById("music-toggle");
const musicTooltip = document.querySelector(".music-tooltip");

if (bgMusic && musicToggle) {
  // Toggle music on button click
  musicToggle.addEventListener("click", (e) => {
    e.stopPropagation(); // Avoid triggering document click listener
    if (musicTooltip) {
      musicTooltip.classList.add("hidden");
    }

    if (bgMusic.paused) {
      bgMusic.play()
        .then(() => {
          musicToggle.classList.add("playing");
        })
        .catch((err) => {
          console.warn("Audio play blocked by browser:", err);
        });
    } else {
      bgMusic.pause();
      musicToggle.classList.remove("playing");
    }
  });

  // Attempt to play on first user interaction anywhere on page
  const startAudioOnInteraction = () => {
    if (bgMusic.paused && !musicToggle.classList.contains("playing")) {
      bgMusic.play()
        .then(() => {
          musicToggle.classList.add("playing");
          if (musicTooltip) {
            musicTooltip.classList.add("hidden");
          }
        })
        .catch((err) => {
          console.log("Interaction autoplay blocked:", err);
        });
    }
    // Remove listeners once interaction occurs
    cleanupInteractionListeners();
  };

  function cleanupInteractionListeners() {
    document.removeEventListener("click", startAudioOnInteraction);
    document.removeEventListener("keydown", startAudioOnInteraction);
    document.removeEventListener("touchstart", startAudioOnInteraction);
  }

  document.addEventListener("click", startAudioOnInteraction);
  document.addEventListener("keydown", startAudioOnInteraction);
  document.addEventListener("touchstart", startAudioOnInteraction);
}

