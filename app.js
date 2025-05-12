document.addEventListener("DOMContentLoaded", () => {
  // DOM references
  const qText = document.getElementById("quoteText"),
    qAuth = document.getElementById("quoteAuthor"),
    quoteBox = document.getElementById("quoteBox"),
    quoteMark = document.getElementById("quoteMark"),
    genBtn = document.getElementById("generateBtn"),
    shareBtn = document.getElementById("shareBtn"),
    copyBtn = document.getElementById("copyBtn"),
    favBtn = document.getElementById("favBtn"),
    themeSw = document.getElementById("themeSwitch"),
    openMenuBtn = document.getElementById("openMenuBtn"),
    categoryModal = document.getElementById("categoryModal"),
    closeMenuBtn = document.getElementById("closeMenuBtn"),
    currentCategory = document.getElementById("currentCategory"),
    categoryMenu = document.getElementById("categoryMenu"),
    streakBadge = document.getElementById("streakBadge"),
    shareMenu = document.getElementById("shareMenu"),
    submitQuoteModal = document.getElementById("submitQuoteModal"),
    closeSubmitQuoteModal = document.getElementById("closeSubmitQuoteModal"),
    customQuoteForm = document.getElementById("customQuoteForm"),
    submitCustomQuoteBtn = document.getElementById("submitCustomQuoteBtn"),
    quoteFormSuccess = document.getElementById("quoteFormSuccess"),
    favModal = document.getElementById('favModal'),
    closeFavModal = document.getElementById('closeFavModal'),
    favQuotesList = document.getElementById('favQuotesList'),
    specialBanner = document.getElementById('specialBanner'),
    bannerText = document.getElementById('bannerText'),
    closeBannerBtn = document.getElementById('closeBannerBtn'),
    closeFavModalLarge = document.getElementById('closeFavModalLarge'),
    undoBtn = document.getElementById('undoBtn'),
    feedbackBtn = document.getElementById('feedbackBtn'),
    feedbackModal = document.getElementById('feedbackModal'),
    closeFeedbackModal = document.getElementById('closeFeedbackModal'),
    feedbackTextarea = document.getElementById('feedbackTextarea'),
    submitFeedbackBtn = document.getElementById('submitFeedbackBtn'),
    feedbackSuccess = document.getElementById('feedbackSuccess'),
    magicSound = document.getElementById('magicSound'),
    favSound = document.getElementById('favSound');

  // DOM references for Image Generation Modal
  const quoteImagePreviewContainer = document.getElementById('quoteImagePreviewContainer');
  const quoteImageWrapper = document.getElementById('quoteImageWrapper');
  const imageQuoteText = document.getElementById('imageQuoteText');
  const imageQuoteAuthor = document.getElementById('imageQuoteAuthor');
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  const shareGeneratedImageBtn = document.getElementById('shareGeneratedImageBtn');
  const closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn');
  const generateImageShareOption = document.getElementById('generateImageShareOption'); // Button in shareMenu

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = "inspiration"; // Default category
  let lastQuote = null; // Stores { text: "...", author: "...", category: "..." }
  let quoteHistory = [];
  let authorMode = false;
  let authorQuotes = [];
  let authorName = "";
  let authorQuoteIndex = 0;
  let debounceTimer = null;
  let currentCanvas = null; // To store the generated canvas for image share/download

  // --- IMAGE GENERATION LOGIC (DROP-IN REPLACEMENT) ---

/**
 * Dynamically calculates the best font size so the text fits inside a square image.
 */
function calculateFontSize(ctx, text, maxWidth, maxHeight, minFont = 24, maxFont = 100) {
  let fontSize = maxFont;
  ctx.font = `${fontSize}px Arial`;
  let lines = splitTextToLines(ctx, text, maxWidth);
  while ((lines.length * fontSize * 1.2 > maxHeight || lines.some(line => ctx.measureText(line).width > maxWidth)) && fontSize > minFont) {
    fontSize -= 2;
    ctx.font = `${fontSize}px Arial`;
    lines = splitTextToLines(ctx, text, maxWidth);
  }
  return fontSize;
}

/**
 * Splits text into lines so each line fits the maxWidth.
 */
function splitTextToLines(ctx, text, maxWidth) {
  const words = text.split(' ');
  let lines = [];
  let line = '';
  for (let n = 0; n < words.length; n++) {
    let testLine = line + words[n] + ' ';
    let metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && n > 0) {
      lines.push(line.trim());
      line = words[n] + ' ';
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

/**
 * Generates a 1:1 square canvas with the quote text, auto-sizing and centering.
 */
function generateQuoteImage() {
  const quoteText = lastQuote && lastQuote.text ? lastQuote.text : (qText ? qText.textContent : "");
  const author = lastQuote && lastQuote.author ? lastQuote.author : (qAuth ? qAuth.textContent : "Unknown");
  const watermark = "wordsofwisdom.in";

  const size = 1024;
  const padding = size * 0.08;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  // Background
  ctx.fillStyle = "#f5f5f7";
  ctx.fillRect(0, 0, size, size);

  // Quote text
  ctx.fillStyle = "#222";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Dynamic font sizing and wrapping
  let fontSize = 64;
  ctx.font = `bold ${fontSize}px 'Georgia', serif`;
  let lines = [];
  const maxWidth = size - 2 * padding;

  function wrapText(text, font) {
    ctx.font = font;
    const words = text.split(' ');
    let lines = [];
    let line = '';
    for (let i = 0; i < words.length; i++) {
      let testLine = line + words[i] + ' ';
      let metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && i > 0) {
        lines.push(line.trim());
        line = words[i] + ' ';
      } else {
        line = testLine;
      }
    }
    lines.push(line.trim());
    return lines;
  }

  // Reduce font size if needed for long quotes
  do {
    ctx.font = `bold ${fontSize}px 'Georgia', serif`;
    lines = wrapText(quoteText, ctx.font);
    fontSize -= 2;
  } while (
    (lines.length * fontSize * 1.2 > size * 0.55 || lines.some(line => ctx.measureText(line).width > maxWidth))
    && fontSize > 28
  );

  // Calculate total height (quote lines + author)
  const quoteBlockHeight = lines.length * fontSize * 1.2;
  const authorFontSize = Math.round(fontSize * 0.7);
  const authorHeight = authorFontSize * 1.4;
  const totalBlockHeight = quoteBlockHeight + authorHeight;

  // Center block vertically
  let y = (size - totalBlockHeight) / 2;

  // Draw quote lines
  ctx.font = `bold ${fontSize}px 'Georgia', serif`;
  ctx.fillStyle = "#222";
  lines.forEach(line => {
    ctx.fillText(line, size / 2, y);
    y += fontSize * 1.2;
  });

  // Author (italic, below quote)
  ctx.font = `italic ${authorFontSize}px 'Georgia', serif`;
  ctx.fillStyle = "#666";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.fillText(`- ${author}`, size / 2, y);

  // Watermark (bottom right)
  ctx.font = "28px Arial";
  ctx.fillStyle = "#aaa";
  ctx.textAlign = "right";
  ctx.textBaseline = "bottom";
  ctx.fillText(watermark, size - padding, size - padding/2);

  currentCanvas = canvas;
  document.getElementById('quoteImagePreview').src = canvas.toDataURL('image/png');
}

// --- END IMAGE GENERATION LOGIC ---

document.getElementById('shareGeneratedImageBtn').addEventListener('click', () => {
  generateQuoteImage();
  quoteImagePreviewContainer.style.display = 'flex';
  setTimeout(() => {
    quoteImagePreviewContainer.classList.add('visible');
  }, 10);
});
document.getElementById('closeImagePreviewBtn').addEventListener('click', () => {
  quoteImagePreviewContainer.classList.remove('visible');
  setTimeout(() => {
    quoteImagePreviewContainer.style.display = 'none';
    document.getElementById('quoteImagePreview').src = '';
  }, 300);
});
document.getElementById('downloadImageBtn').addEventListener('click', () => {
  if (!currentCanvas) return;
  const link = document.createElement('a');
  link.download = 'quote.png';
  link.href = currentCanvas.toDataURL();
  link.click();
});

// Share image (Web Share API)
shareGeneratedImageBtn.addEventListener('dblclick', async () => {
// Share image (Web Share API)
shareGeneratedImageBtn.addEventListener('dblclick', async () => {
  if (!currentCanvas) return;
  if (navigator.share && navigator.canShare) {
    currentCanvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Error creating image blob for sharing.");
        return;
      }
      const authorName = lastQuote && lastQuote.author ? lastQuote.author : 'Unknown';
      const quoteText = lastQuote && lastQuote.text ? lastQuote.text : '';
      const filesArray = [
        new File([blob], `WOW_Quote_${authorName}.png`, {
          type: 'image/png',
          lastModified: new Date().getTime()
        })
      ];
      const shareData = {
        files: filesArray,
        title: `Quote by ${authorName} - Words of Wisdom`,
        text: `"${quoteText}" - ${authorName}\nShared via wordsofwisdom.in`,
      };
      try {
        if (navigator.canShare({ files: filesArray })) {
          await navigator.share(shareData);
        } else {
          await navigator.share({
            title: `Quote by ${authorName} - Words of Wisdom`,
            text: `"${quoteText}" - ${authorName}\nShared via wordsofwisdom.in`,
            url: window.location.href
          });
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('Sharing failed. You can try downloading the image instead.');
        }
      }
    }, 'image/png');
  } else {
    alert('Sharing images this way is not supported on your browser. Please download the image to share it.');
  }
});

  // --- Banner themes and styles ---
  const bannerThemes = [
    {cat: "inspiration",    text: "Ignite fresh ideas to fuel your week."},
    {cat: "motivation",     text: "Power up your ambition and take the lead."},
    {cat: "positivethinking", text: "Spotlight on optimism-see possibilities."},
    {cat: "happiness",      text: "Embrace joy in every passing moment."},
    {cat: "love",           text: "Let compassion guide your connections."},
    {cat: "gratitude",      text: "Honor today with a thankful heart."},
    {cat: "resilience",     text: "Stand strong-your strength shines through."},
    {cat: "courage",        text: "Step forward with unwavering bravery."},
    {cat: "change",         text: "Welcome new paths with open arms."},
    {cat: "lifelessons",    text: "Learn, grow, and carry wisdom onward."},
    {cat: "dreams",         text: "Chase bold visions beyond the horizon."},
    {cat: "kindness",       text: "Extend a gesture that brightens someone’s day."},
    {cat: "beauty",         text: "Discover the elegance in simplicity."},
    {cat: "wisdom",         text: "Let insight illuminate your choices."},
    {cat: "sufiwisdom",     text: "Find depth in every sacred whisper."},
    {cat: "truth",          text: "Stand firm in authentic clarity."},
    {cat: "time",           text: "Value each moment’s fleeting gift."},
    {cat: "mortality",      text: "Reflect on life’s precious fragility."},
    {cat: "freedom",        text: "Celebrate the power of choice."},
    {cat: "society",        text: "Shape community with integrity."},
    {cat: "learning",       text: "Feed your mind with new discoveries."},
    {cat: "simplicity",     text: "Simplify to amplify what matters most."},
    {cat: "selfcare",       text: "Prioritize the well-being you deserve."},
    {cat: "mindfulness",    text: "Anchor yourself in this present breath."},
    {cat: "selfknowledge",  text: "Turn inward to unlock your true depth."},
    {cat: "innerpeace",     text: "Cultivate calm amid the daily rush."},
    {cat: "spirituality",   text: "Connect with what lies beyond the seen."},
    {cat: "perseverance",   text: "Advance onward-steady and unyielding."}
  ];
  const bannerStyles = {
    inspiration:    { color: "#7c5df0", icon: "💡" },
    motivation:     { color: "#ff9800", icon: "⚡" },
    positivethinking: { color: "#43b581", icon: "🌈" },
    happiness:      { color: "#ffd700", icon: "😊" },
    love:           { color: "#e57373", icon: "❤️" },
    gratitude:      { color: "#4caf50", icon: "🙏" },
    resilience:     { color: "#2196f3", icon: "🛡️" },
    courage:        { color: "#ff5722", icon: "🦁" },
    change:         { color: "#00bcd4", icon: "🔄" },
    lifelessons:    { color: "#3f51b5", icon: "📚" },
    dreams:         { color: "#9c27b0", icon: "🌠" },
    kindness:       { color: "#8bc34a", icon: "🤝" },
    beauty:         { color: "#f06292", icon: "🌸" },
    wisdom:         { color: "#607d8b", icon: "🦉" },
    sufiwisdom:     { color: "#009688", icon: "🕊️" },
    truth:          { color: "#795548", icon: "🔎" },
    time:           { color: "#607d8b", icon: "⏳" },
    mortality:      { color: "#455a64", icon: "🌑" },
    freedom:        { color: "#00bfae", icon: "🕊️" },
    society:        { color: "#ffb300", icon: "🌍" },
    learning:       { color: "#3949ab", icon: "🧠" },
    simplicity:     { color: "#bdbdbd", icon: "🍃" },
    selfcare:       { color: "#f48fb1", icon: "🛁" },
    mindfulness:    { color: "#aeea00", icon: "🧘" },
    selfknowledge:  { color: "#ab47bc", icon: "🔮" },
    innerpeace:     { color: "#81d4fa", icon: "🌊" },
    spirituality:   { color: "#ba68c8", icon: "✨" },
    perseverance:   { color: "#6d4c41", icon: "🚀" }
  };

  function capitalize(str) {
    if (!str) return "";
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function showRotatingBanner() {
    const today = new Date();
    const startDate = new Date("2025-05-05"); // Ensure this date is in the past or current for testing
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const idx = ((daysSinceStart % bannerThemes.length) + bannerThemes.length) % bannerThemes.length;
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");

    if (lastBannerDate === todayStr && specialBanner.style.display === 'none' && !localStorage.getItem("bannerForceShow")) return;

    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;

    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "block";
    specialBanner.style.background = style.color ? style.color : "linear-gradient(90deg, #ffd700 0%, #7c5df0 100%)";
    specialBanner.style.color = style.color && (style.color === "#ffd700" || style.color === "#aeea00") ? "#222" : "#fff";

    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr);
      localStorage.removeItem("bannerForceShow");
    };
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){
          specialBanner.style.display = "none";
          localStorage.setItem("wowBannerDate", todayStr);
          localStorage.removeItem("bannerForceShow");
      }
    }, 8000);

    selectedCat = theme.cat;
    authorMode = false;
    if(currentCategory) currentCategory.textContent = capitalize(theme.cat);
    console.log(`Banner set category to: ${selectedCat}`);
    localStorage.setItem("wowBannerDate", todayStr);
    localStorage.setItem("lastAutoSelectedCategory", theme.cat);
  }

  async function fetchJSON(url, cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} for ${url}`);
      }
      const data = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Failed to fetch or parse ${url}:`, e.message);
      throw e; // Re-throw to be caught by caller
    }
  }

  async function loadCategoriesAndQuotes() {
    try {
      try {
        categories = await fetchJSON('data/categories.json', 'wowCategories');
      } catch (e) {
        console.warn("Could not load categories.json from data/, trying root...");
        categories = await fetchJSON('categories.json', 'wowCategoriesRoot');
      }

      if (!categories || categories.length === 0) {
        console.error("CRITICAL: categories.json is empty or could not be loaded.");
        if(qText) qText.textContent = "Error: Main category file could not be loaded.";
        if(qAuth) qAuth.textContent = "";
        return;
      }

      const quotePromises = [];
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) {
            collectCategories(cat.children);
          } else if (cat.file) {
            const originalPath = cat.file;
            let pathAttempt1 = originalPath;
            let pathAttempt2 = null;
            if (originalPath && originalPath.startsWith('data/')) {
                pathAttempt2 = originalPath.substring(5); // e.g., "quotes_inspiration.json"
            }

            const fetchAndProcessQuoteFile = async (filePath, cacheKeyPrefix) => {
                try {
                    const data = await fetchJSON(filePath, cacheKeyPrefix + cat.id);
                    if (Array.isArray(data)) {
                        quotes[cat.id] = data;
                        buildAuthorIndex(data, cat.id);
                        return true; // Success
                    }
                    console.warn(`Invalid data structure in ${filePath} for category ${cat.id}. Received:`, data);
                    return false; // Failure due to structure
                } catch (err) {
                    // Error already logged by fetchJSON, just indicate failure
                    console.error(`Attempt to fetch/process ${filePath} for category ${cat.id} failed.`);
                    return false; // Failure due to fetch/parse
                }
            };
            quotePromises.push(
                fetchAndProcessQuoteFile(pathAttempt1, 'wowQuotes_').then(success => {
                    if (!success && pathAttempt2) {
                        // If first attempt failed and there's a fallback path, try it
                        return fetchAndProcessQuoteFile(pathAttempt2, 'wowQuotesRoot_');
                    }
                    return success; // Return result of first attempt or indicate it was the only one
                })
            );
          }
        });
      }
      collectCategories(categories);

      // Load user-submitted quotes if they exist
      if (localStorage.getItem('userQuotes')) {
        const userQuotesData = JSON.parse(localStorage.getItem('userQuotes'));
        quotes['user'] = userQuotesData; // Assuming 'user' is a valid category ID for these
        buildAuthorIndex(userQuotesData, 'user');
      }
      await Promise.all(quotePromises);

      // Check if any quotes were loaded at all
      if (Object.keys(quotes).length === 0 && (!localStorage.getItem('userQuotes') || JSON.parse(localStorage.getItem('userQuotes')).length === 0)) {
          if(qText) qText.textContent = "No quote data could be loaded. Please check your connection or try again later.";
          if(qAuth) qAuth.textContent = "";
      }
    } catch (err) {
      // This catch is for errors in loadCategoriesAndQuotes itself, like issues with categories.json loading
      console.error('CRITICAL FAILURE in loadCategoriesAndQuotes:', err);
      if(qText) qText.textContent = "A critical error occurred while loading app data.";
      if(qAuth) qAuth.textContent = "";
    }
  }

  function buildAuthorIndex(quoteList, categoryId) {
    if (!Array.isArray(quoteList)) return;
    quoteList.forEach(quote => {
      const by = (quote.author || quote.by || "").trim();
      if (by) {
        const authorKey = by.toLowerCase();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          author: by, // Store the trimmed, original case author
          category: categoryId
        });
      }
    });
  }

  function renderMenu() {
    if (!categoryMenu) return;
    categoryMenu.innerHTML = ""; // Clear previous menu
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) { // Handle the special search section
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn" aria-expanded="false" aria-controls="authorSearchWrapper-${cat.id || 'search'}"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
            <div id="authorSearchWrapper-${cat.id || 'search'}" class="author-search-wrapper" style="display: none;">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" aria-label="Search by author name" />
              <ul id="authorList" class="suggestions-list" role="listbox"></ul>
            </div>`;
          categoryMenu.appendChild(sec); // Append directly to categoryMenu
          sec.querySelector('.section-btn').addEventListener('click', function() {
            const wrapper = sec.querySelector('.author-search-wrapper');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            wrapper.style.display = isExpanded ? 'none' : 'block';
            if (!isExpanded) wrapper.querySelector('input').focus();
          });

          // Add "View Favorites" and "Submit a Quote" directly after search
          const favSec = document.createElement("div");
          favSec.className = "section";
          favSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-heart section-icon" aria-hidden="true"></i>View Favorites</button>`;
          favSec.querySelector(".section-btn").addEventListener("click", () => {
            openFavoritesModal();
            closeMenu();
          });
          categoryMenu.appendChild(favSec);

          const myFavCatSec = document.createElement("div");
          myFavCatSec.className = "section";
          myFavCatSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-star section-icon" aria-hidden="true"></i>Quotes from My Favorites</button>`;
          myFavCatSec.querySelector(".section-btn").addEventListener("click", () => {
            selectedCat = "myfavorites";
            authorMode = false;
            if(currentCategory) currentCategory.textContent = "My Favorites";
            closeMenu();
            displayQuote();
          });
          categoryMenu.appendChild(myFavCatSec);


          const submitSec = document.createElement("div");
          submitSec.className = "section";
          submitSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-plus section-icon" aria-hidden="true"></i>Submit a Quote</button>`;
          submitSec.querySelector(".section-btn").addEventListener("click", () => {
            if(submitQuoteModal) submitQuoteModal.classList.add('open');
            document.body.style.overflow = "hidden";
            if(customQuoteForm) customQuoteForm.reset();
            if(quoteFormSuccess) {
                quoteFormSuccess.style.display = "none";
                quoteFormSuccess.textContent = "Thank you! Your quote was submitted.";
            }
            // Reset spinner and button state
            const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
            const submitSpinner = submitCustomQuoteBtn.querySelector('.loader-spinner');
            if(submitBtnText) submitBtnText.style.display = 'inline';
            if(submitSpinner) submitSpinner.style.display = 'none';
            submitCustomQuoteBtn.disabled = false;
            closeMenu();
          });
          categoryMenu.appendChild(submitSec);

        } else { // Handle regular categories and subcategories
          const sec = document.createElement("div");
          sec.className = "section";
          const sectionId = `section-list-${cat.id || Math.random().toString(36).substring(2,9)}`;
          sec.innerHTML = `<button class="section-btn" aria-expanded="false" aria-controls="${sectionId}">
            ${cat.icon ? `<i class="fa-solid ${cat.icon} section-icon" aria-hidden="true"></i>` : ""}
            ${cat.name} <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
          </button>
          <ul class="section-list" id="${sectionId}" style="display: none;"></ul>`;
          const ul = sec.querySelector(".section-list");

          if (cat.children) {
            cat.children.forEach(child => {
              const li = document.createElement("li");
              if (child.children) { // Nested subcategories
                li.className = "has-children";
                const subSectionId = `subsection-list-${child.id || Math.random().toString(36).substring(2,9)}`;
                li.innerHTML = `<span role="button" tabindex="0" aria-expanded="false" aria-controls="${subSectionId}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}" aria-hidden="true"></i>` : ""}
                  ${child.name} <i class="fa-solid fa-caret-right" aria-hidden="true"></i>
                </span>
                <ul class="nested-list" id="${subSectionId}" style="display: none;"></ul>`;
                const subul = li.querySelector(".nested-list");
                child.children.forEach(sub => {
                  const subli = document.createElement("li");
                  subli.innerHTML = `<a href="#" data-cat="${sub.id}">
                    ${sub.icon ? `<i class="fa-solid ${sub.icon}" aria-hidden="true"></i>` : ""}
                    ${sub.name}
                  </a>`;
                  subul.appendChild(subli);
                });
              } else { // Direct child category
                li.innerHTML = `<a href="#" data-cat="${child.id}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}" aria-hidden="true"></i>` : ""}
                  ${child.name}
                </a>`;
              }
              ul.appendChild(li);
            });
          }
          categoryMenu.appendChild(sec); // Append section to categoryMenu
          // Add click listener for section toggle
          sec.querySelector('.section-btn').addEventListener('click', function() {
            const list = sec.querySelector('.section-list');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            list.style.display = isExpanded ? 'none' : 'block';
            const icon = this.querySelector('.fa-chevron-down, .fa-chevron-up'); // Chevron toggle
            if(icon){
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
          });
        }
      });
    }
    renderCategoryList(categories, categoryMenu); // Initial call

    // Event listeners for nested lists (sub-subcategories)
    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent parent section from toggling
        const nestedList = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        nestedList.style.display = isExpanded ? 'none' : 'block';
        const icon = this.querySelector('.fa-caret-right, .fa-caret-down'); // Caret toggle
        if (icon) {
            icon.classList.toggle('fa-caret-right');
            icon.classList.toggle('fa-caret-down');
        }
      });
      span.addEventListener('keydown', function(e) { // Accessibility for keyboard
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Event listeners for category links
    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCat = link.dataset.cat;
        authorMode = false; // Reset author mode
        if(currentCategory) currentCategory.textContent = capitalize(link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim());
        closeMenu();
        displayQuote();
        recordCategoryUse(selectedCat);
      });
    });

    // Author search input handling
    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorListUL = categoryMenu.querySelector("#authorList");
    if (authorInput && authorListUL) {
      authorInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = authorInput.value.toLowerCase().trim();
          authorListUL.innerHTML = ""; // Clear previous suggestions
          if (!query) return; // No query, no suggestions
          Object.keys(authors)
            .filter(name => name.includes(query)) // Filter authors by query
            .sort() // Sort alphabetically
            .slice(0, 10) // Limit to 10 suggestions
            .forEach(nameKey => {
              const li = document.createElement("li");
              li.setAttribute('role', 'option');
              li.textContent = authors[nameKey][0].author; // Display original case author name
              li.tabIndex = -1; // For accessibility, not focusable by default
              li.addEventListener("click", () => {
                authorMode = true;
                authorName = nameKey; // Use lowercased key for consistency
                authorQuotes = [...authors[nameKey]]; // Get all quotes by this author
                authorQuoteIndex = 0; // Reset index for this author
                if(currentCategory) currentCategory.textContent = "Author: " + authors[nameKey][0].author;
                closeMenu();
                showAuthorQuote(); // Display first quote by this author
              });
              authorListUL.appendChild(li);
            });
        }, 300); // Debounce for 300ms
      });
    }
  }


  function openMenu() {
    renderMenu(); // Re-render menu each time it opens to ensure it's up-to-date
    if(categoryModal) categoryModal.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
    if(closeMenuBtn) closeMenuBtn.focus(); // Focus on close button for accessibility
  }
  function closeMenu() {
    if(categoryModal) categoryModal.classList.remove("open");
    document.body.style.overflow = ""; // Restore background scroll
    if(openMenuBtn) openMenuBtn.focus(); // Focus back on menu open button
  }
  if(openMenuBtn) openMenuBtn.addEventListener("click", openMenu);
  if(closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if(categoryModal) categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu(); // Close if clicking outside modal content
  });

  // Submit Quote Modal
  if(closeSubmitQuoteModal) closeSubmitQuoteModal.addEventListener('click', () => {
    if(submitQuoteModal) submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  if(customQuoteForm) customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
    const spinner = submitCustomQuoteBtn.querySelector('.loader-spinner');

    if(submitBtnText) submitBtnText.style.display = 'none';
    if(spinner) spinner.style.display = 'inline-block';
    submitCustomQuoteBtn.disabled = true;

    // Simulate submission
    setTimeout(() => {
        if(quoteFormSuccess) {
            quoteFormSuccess.textContent = "Thank you! Your quote was submitted."; // Or actual success message
            quoteFormSuccess.style.display = 'block';
        }

        // Reset button and form
        if(submitBtnText) submitBtnText.style.display = 'inline';
        if(spinner) spinner.style.display = 'none';
        submitCustomQuoteBtn.disabled = false;
        customQuoteForm.reset();

        // Hide success message and modal after a delay
        setTimeout(() => {
          if(quoteFormSuccess) quoteFormSuccess.style.display = 'none';
          if(submitQuoteModal) submitQuoteModal.classList.remove('open');
          document.body.style.overflow = "";
        }, 2500);
    }, 1500);
  });

  function showQuote(item, cat, fromUndo = false) {
    if (!item || (typeof item.text === 'undefined' && typeof item.quote === 'undefined' && typeof item.message === 'undefined')) {
        if(qText) qText.textContent = "No quote available. Try another category or inspire me again!";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
        updateFavoriteButtonState();
        return;
    }

    if (!fromUndo && lastQuote) { // Add to history if not an undo action
      quoteHistory.unshift(lastQuote);
      if (quoteHistory.length > 5) quoteHistory.length = 5; // Keep history to 5 items
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";

    // Fade out current quote
    if(qText) qText.classList.add('fade-out');
    if(qAuth) qAuth.classList.add('fade-out');

    setTimeout(() => { // After fade out, update and fade in
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = (item.author || item.by || "").trim();

      if(qText) qText.textContent = txt;
      if(qAuth) {
        if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
          qAuth.textContent = ""; // Hide author if anonymous/unknown
        } else {
          qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
        }
      }
      if(quoteMark) { // Reset quote mark
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
      }

      // Fade in new quote
      if(qText) qText.classList.remove('fade-out');
      if(qAuth) qAuth.classList.remove('fade-out');

      lastQuote = { text: txt, author: by, category: cat }; // Store current quote
      updateStreak(); // Update daily streak
      updateFavoriteButtonState(); // Update favorite button
    }, 300); // Duration of fade effect
  }

  function showAuthorQuote() {
    if (!authorQuotes.length) {
      if(qText) qText.textContent = "No quotes found for this author.";
      if(qAuth) qAuth.textContent = "";
      return;
    }
    const quote = authorQuotes[authorQuoteIndex % authorQuotes.length];
    showQuote(quote, quote.category);
    authorQuoteIndex++;
  }

  function displayQuote() {
    if (authorMode && authorQuotes.length > 0) {
      showAuthorQuote();
      return;
    }

    let pool = [];
    const isValidQuote = q => q && (typeof q.text !== 'undefined' || typeof q.quote !== 'undefined' || typeof q.message !== 'undefined');

    if (selectedCat === 'myfavorites') {
      const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
      pool = favs.filter(isValidQuote);
      if (pool.length === 0) {
        if(qText) qText.textContent = "You have no favorite quotes yet. Add some!";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        updateFavoriteButtonState();
        return;
      }
    } else if (selectedCat === 'user' && Array.isArray(quotes['user'])) {
      pool = quotes['user'].filter(isValidQuote);
    } else if (quotes[selectedCat] && Array.isArray(quotes[selectedCat])) {
      pool = quotes[selectedCat].filter(isValidQuote);
    }


    // Fallback if selected category has no quotes or is invalid
    if (!pool || pool.length === 0) {
        const allQuotesRaw = Object.values(quotes).flat(); // Flatten all quotes from all categories
        pool = allQuotesRaw.filter(isValidQuote);
        if (pool.length > 0 && currentCategory && (!selectedCat || !(quotes[selectedCat] && Array.isArray(quotes[selectedCat])))) {
            // If we fell back to all quotes, update the display
            if(currentCategory) currentCategory.textContent = "All Quotes";
        }
    }

    // If still no quotes after all fallbacks
    if (!pool || pool.length === 0) {
        if(qText) qText.textContent = "No valid quotes available for this selection or any category.";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        updateFavoriteButtonState();
        console.error("CRITICAL: Pool is empty after all fallbacks. No quotes to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    showQuote(pool[randomIndex], selectedCat || "all_fallback"); // Use "all_fallback" if category was not specific
  }


  if(undoBtn) undoBtn.addEventListener("click", () => {
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift(); // Get the last quote from history
      showQuote(prev, prev.category, true); // Display it, marking as 'fromUndo'
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none"; // Update undo button visibility
  });

  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0; // Rewind sound
      magicSound.play().catch(e => console.warn("Audio play failed:", e));
    }
    if(quoteBox) quoteBox.classList.add('glow'); // Add glow effect to quote box
    setTimeout(() => { if(quoteBox) quoteBox.classList.remove('glow'); }, 400);

    const wand = genBtn ? genBtn.querySelector('.magic-wand-icon') : null;
    if (wand) { // Animate magic wand icon
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    if(genBtn) genBtn.classList.add('touched'); // Visual feedback for button press
    setTimeout(() => {if(genBtn) genBtn.classList.remove('touched');}, 400);

    // Ripple effect for generate button
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = "50%"; // Center ripple
    ripple.style.top = "50%";
    if(genBtn) genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700); // Remove ripple after animation
  }

  if(genBtn) {
    genBtn.addEventListener("click", e => {
        triggerGenerateEffects();
        displayQuote(); // Get and display a new quote
    });
  }

  // Ripple effect for other icon buttons
  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent"; // Remove tap highlight on mobile
    btn.addEventListener('click', function(e) {
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      // Position ripple at click location
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });


  // Share Menu Toggle
  if(shareBtn) shareBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from bubbling up
    if(shareMenu) shareMenu.classList.toggle("open");
    // Add listener to close menu if clicking outside
    if (shareMenu && shareMenu.classList.contains("open")) {
      setTimeout(() => { // Use timeout to ensure this listener is added after the current click event is processed
        document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
      }, 0);
    }
  });

  function closeShareMenuOnClickOutside(event) {
    // Check if the click was outside the share menu and not on the share button itself
    if (shareMenu && shareMenu.classList.contains("open") && !shareMenu.contains(event.target) && event.target !== shareBtn && (shareBtn && !shareBtn.contains(event.target))) {
      shareMenu.classList.remove("open");
    } else if (shareMenu && shareMenu.classList.contains("open")) {
         // If menu is still open (e.g., clicked inside), re-add the listener for the next click
         document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }


  // Share Options (Twitter, Facebook, etc.)
  if(shareMenu) shareMenu.querySelectorAll('.share-option').forEach(btn => {
    // Skip the image generation button here, it's handled separately
    if (btn.id === 'generateImageShareOption') return;

    btn.addEventListener('click', function() {
      const quoteContent = qText ? qText.textContent || "" : "";
      const cleanAuthor = lastQuote && lastQuote.author ? lastQuote.author : "";
      const textToShare = `${quoteContent}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
      const pageUrl = window.location.href;
      let shareUrl = '';

      switch (btn.dataset.network) {
        case 'twitter':
          shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(textToShare)}&url=${encodeURIComponent(pageUrl)}`;
          break;
        case 'facebook':
          shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(pageUrl)}&quote=${encodeURIComponent(textToShare)}`;
          break;
        case 'linkedin':
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(quoteContent.substring(0,100))}...&summary=${encodeURIComponent(textToShare)}`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(textToShare + " (via " + pageUrl + ")")}`;
          break;
      }
      if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
      if(shareMenu) shareMenu.classList.remove("open"); // Close share menu after action
    });
  });


  // Copy to Clipboard
  if(copyBtn) copyBtn.addEventListener("click", () => {
    const quoteContent = qText ? qText.textContent || "" : "";
    const cleanAuthor = lastQuote && lastQuote.author ? lastQuote.author : "";
    const textToCopy = `${quoteContent}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      // Visual feedback for successful copy
      const iconElement = copyBtn.querySelector("i");
      const originalIcon = iconElement ? iconElement.className : "";
      if(iconElement) iconElement.className = "fa-solid fa-check"; // Change to checkmark
      copyBtn.classList.add('copied-feedback');
      const tooltip = copyBtn.querySelector('.btn-tooltip');
      const originalTooltipText = tooltip ? tooltip.textContent : '';
      if(tooltip) tooltip.textContent = "Copied!";

      setTimeout(() => { // Revert after 1.5 seconds
        if(iconElement) iconElement.className = originalIcon;
        copyBtn.classList.remove('copied-feedback');
        if(tooltip) tooltip.textContent = originalTooltipText;
      }, 1500);
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      const tooltip = copyBtn.querySelector('.btn-tooltip'); // Error feedback
      if(tooltip) {
          const originalTooltipText = tooltip.textContent;
          tooltip.textContent = "Copy failed!";
          setTimeout(() => { tooltip.textContent = originalTooltipText; }, 2000);
      }
    });
  });

  // Favorite Button
  if(favBtn) favBtn.addEventListener('click', () => {
    if (!lastQuote || !lastQuote.text) return; // No quote to favorite

    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const currentQuoteText = lastQuote.text;
    const currentAuthorText = lastQuote.author; // Already clean

    const favIndex = favs.findIndex(q => q.text === currentQuoteText && q.author === currentAuthorText);
    const isFavorited = favIndex !== -1;

    const savedPopup = favBtn.querySelector('.saved-popup');

    if (isFavorited) { // Unfavorite
      favs.splice(favIndex, 1);
      if(savedPopup) savedPopup.textContent = "Unsaved";
    } else { // Favorite
      favs.push({ text: currentQuoteText, author: currentAuthorText });
      if(favSound) favSound.play().catch(e => console.warn("Fav sound play failed", e));
      if(savedPopup) savedPopup.textContent = "Saved!";
    }

    localStorage.setItem('favQuotes', JSON.stringify(favs)); // Save to local storage
    updateFavoriteButtonState(); // Update heart icon

    // Show "Saved!" / "Unsaved" popup
    if(favBtn) favBtn.classList.add('show-saved-popup');
    setTimeout(() => {
        if(favBtn) favBtn.classList.remove('show-saved-popup');
    }, 1200);
  });

  function updateFavoriteButtonState() {
    if (!favBtn || !lastQuote || !lastQuote.text) {
        const favIcon = favBtn ? favBtn.querySelector("i") : null;
        if (favIcon) {
            favIcon.className = "fa-regular fa-heart"; // Default empty heart
        }
        return;
    }

    const favIcon = favBtn.querySelector("i");
    if (!favIcon) return;

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    if (isFavorited) {
        favIcon.className = "fa-solid fa-heart"; // Solid heart if favorited
    } else {
        favIcon.className = "fa-regular fa-heart"; // Empty heart if not
    }
  }


  // Theme Switch (Dark/Light Mode)
  if(themeSw) {
    const savedTheme = localStorage.getItem("wowDark");
    if (savedTheme === "true") { // Apply saved theme on load
        themeSw.checked = true;
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
    themeSw.addEventListener("change", () => { // Toggle theme
        const isDark = themeSw.checked;
        document.body.classList.toggle("dark", isDark);
        localStorage.setItem("wowDark", isDark); // Save preference
    });
  }


  // Daily Streak
  function updateStreak() {
    const today = new Date().toISOString().slice(0,10);
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    if (streak.last !== today) { // If last visit was not today
      if (streak.last === getYesterday()) { // If last visit was yesterday, increment streak
        streak.count++;
      } else { // Otherwise, reset streak to 1
        streak.count = 1;
      }
      streak.last = today; // Update last visit date
      localStorage.setItem('wowStreak', JSON.stringify(streak));
    }
    showStreak(streak.count); // Display streak
    // updateFavoriteButtonState(); // Already called in showQuote, but can be here too if needed
  }
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate()-1);
    return d.toISOString().slice(0,10);
  }
  function showStreak(count) {
    if (!streakBadge) return;
    if (count > 1) {
        streakBadge.innerHTML = `🔥 <span class="streak-count">${count}</span> day streak!`;
        streakBadge.style.display = 'inline-flex';
    } else {
        streakBadge.textContent = '';
        streakBadge.style.display = 'none';
    }
  }

  // Feedback Modal
  if(submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', async () => {
    const feedback = feedbackTextarea ? feedbackTextarea.value.trim() : "";
    if (!feedback) {
        feedbackTextarea.placeholder = "Please enter your feedback first!";
        setTimeout(() => { if(feedbackTextarea) feedbackTextarea.placeholder = "Your feedback...";}, 2000);
        return;
    }

    const submitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
    const spinner = submitFeedbackBtn.querySelector('.loader-spinner');

    if(submitBtnText) submitBtnText.style.display = 'none';
    if(spinner) spinner.style.display = 'inline-block';
    submitFeedbackBtn.disabled = true;

    // Simulate feedback submission
    setTimeout(async () => {
            if(feedbackSuccess) {
                feedbackSuccess.textContent = "Thank you for your feedback!";
                feedbackSuccess.style.display = 'block';
            }
            if(feedbackTextarea) feedbackTextarea.value = ''; // Clear textarea

            // Reset button
            if(submitBtnText) submitBtnText.style.display = 'inline';
            if(spinner) spinner.style.display = 'none';
            submitFeedbackBtn.disabled = false;

            // Hide success and close modal
            setTimeout(() => {
                if(feedbackSuccess) feedbackSuccess.style.display = 'none';
                if(feedbackModal) feedbackModal.classList.remove('open');
                document.body.style.overflow = "";
            }, 2500);
    }, 1500);
  });

  if(feedbackBtn) feedbackBtn.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    if(feedbackTextarea) feedbackTextarea.value = ''; // Clear textarea
    if(feedbackSuccess) { // Reset success message
        feedbackSuccess.style.display = 'none';
        feedbackSuccess.textContent = "Thank you for your feedback!";
    }
    // Reset spinner and button state
    const feedbackSubmitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
    const feedbackSpinner = submitFeedbackBtn.querySelector('.loader-spinner');
    if(feedbackSubmitBtnText) feedbackSubmitBtnText.style.display = 'inline';
    if(feedbackSpinner) feedbackSpinner.style.display = 'none';
    submitFeedbackBtn.disabled = false;
    if(feedbackTextarea) feedbackTextarea.focus();
  });
  if(closeFeedbackModal) closeFeedbackModal.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  // Favorites Modal
  function openFavoritesModal() {
    if(favModal) favModal.classList.add('open');
    document.body.style.overflow = "hidden";
    showFavorites(); // Populate favorites list
    const firstFocusable = favModal ? favModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') : null;
    if (firstFocusable) firstFocusable.focus(); // Accessibility: focus first element
  }
  if(closeFavModal) closeFavModal.addEventListener('click', () => {
    if(favModal) favModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  if (closeFavModalLarge) { // For larger close button outside modal
    closeFavModalLarge.addEventListener('click', () => {
        if(favModal) favModal.classList.remove('open');
        document.body.style.overflow = "";
    });
  }

  function showFavorites() {
    if (!favQuotesList) return;
    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favQuotesList.innerHTML = favs.length
      ? favs.map((q, idx) => `
        <div class="fav-quote" data-index="${idx}">
          <p>${q.text}</p>
          <p class="author">${q.author ? `&#8213; ${q.author}` : ''}</p>
          <div class="fav-actions">
            <button class="fav-action-btn remove-fav-btn" title="Remove from Favorites" aria-label="Remove quote by ${q.author || 'Unknown'} from favorites"><i class="fa-solid fa-trash"></i></button>
            <button class="fav-action-btn copy-fav-btn" title="Copy Quote" aria-label="Copy quote by ${q.author || 'Unknown'}"><i class="fa-solid fa-copy"></i></button>
            <button class="fav-action-btn share-fav-btn" title="Share Quote" aria-label="Share quote by ${q.author || 'Unknown'}"><i class="fa-solid fa-share-nodes"></i></button>
          </div>
        </div>
      `).join('')
      : "<p>No favorites yet. Click the heart icon on a quote to save it!</p>";

      // Add event listeners for actions on favorite quotes
      favQuotesList.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.closest('.fav-quote').dataset.index);
            removeFavorite(index);
        });
      });

      favQuotesList.querySelectorAll('.copy-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];

            if (favoriteQuoteObject) {
                copyFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author, this);
            } else { // Fallback if object not found (should not happen ideally)
                 const displayedText = quoteDiv.querySelector('p:first-child').textContent;
                 const displayedAuthor = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[\s–—]+/, "").trim();
                 copyFavorite(displayedText, displayedAuthor, this);
            }
        });
      });

      favQuotesList.querySelectorAll('.share-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];

            if (favoriteQuoteObject) {
                shareFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author);
            } else { // Fallback
                 const displayedText = quoteDiv.querySelector('p:first-child').textContent;
                 const displayedAuthor = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[\s–—]+/, "").trim();
                 shareFavorite(displayedText, displayedAuthor);
            }
        });
      });
  }

  window.removeFavorite = function(idx) { // Make accessible globally if needed, or handle differently
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites(); // Refresh list
    updateFavoriteButtonState(); // Update main heart icon if current quote was removed
  };

  window.copyFavorite = function(text, cleanAuthor, buttonElement) {
    const textToCopy = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        if(buttonElement){ // Visual feedback on the button
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fa-solid fa-check" style="color: var(--green-accent);"></i>';
            setTimeout(() => { buttonElement.innerHTML = originalIconHTML; }, 1200);
        }
    }).catch(err => console.error("Copying favorite failed:", err));
  };

  window.shareFavorite = function(text, cleanAuthor) {
    const shareText = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    if (navigator.share) { // Use Web Share API if available
      navigator.share({ title: `Quote by ${cleanAuthor || 'Words of Wisdom'}`, text: shareText, url: window.location.href })
        .catch(err => {
            if (err.name !== 'AbortError') { // Don't log error if user cancels share
                console.error("Sharing favorite failed:", err);
            }
        });
    } else { // Fallback: copy to clipboard and alert
      navigator.clipboard.writeText(shareText).then(() => alert("Quote copied! You can now paste it to share."))
                         .catch(() => alert("Could not copy quote. Please share manually."));
    }
  };

  // Global Escape Key Listener for Modals
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      // Close any open modals
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => {
        modal.classList.remove("open");
      });
      // Close image preview modal specifically if it's open
      if (quoteImagePreviewContainer && quoteImagePreviewContainer.style.display === 'flex') {
        closeImagePreview();
      }
      document.body.style.overflow = ""; // Restore scroll

      // Close share menu if open
      if (shareMenu && shareMenu.classList.contains("open")) {
          shareMenu.classList.remove("open");
      }
    }
  });

  function recordCategoryUse(cat) {
    if (!cat) return;
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    usage[cat] = (usage[cat] || 0) + 1;
    localStorage.setItem('catUsage', JSON.stringify(usage));
  }
  function getMostUsedCategory() {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    if (Object.keys(usage).length === 0) return null;
    const sortedUsage = Object.entries(usage).sort(([,a],[,b]) => b-a);
    return sortedUsage[0][0]; // Returns the category ID with highest count
  }

  // Placeholder for notification functions (to be implemented)
  function requestNotificationPermission() { /* console.log("Placeholder: Request Notification Permission"); */ }
  function sendDailyQuoteNotification() { /* console.log("Placeholder: Send Daily Quote Notification"); */ }
  function scheduleDailyNotification() { /* console.log("Placeholder: Schedule Daily Notification"); */ }


  // --- Image Generation Feature Logic ---
  if (generateImageShareOption) {
    generateImageShareOption.addEventListener('click', () => {
      if (!lastQuote || !lastQuote.text) {
        alert("Please generate a quote first!"); // Or use a nicer modal
        return;
      }

      // Populate the image content
      imageQuoteText.textContent = lastQuote.text;
      if (lastQuote.author) {
        imageQuoteAuthor.textContent = `— ${lastQuote.author}`;
        imageQuoteAuthor.style.display = 'block';
      } else {
        imageQuoteAuthor.textContent = '';
        imageQuoteAuthor.style.display = 'none';
      }

      // Show the preview container
      if (quoteImagePreviewContainer) quoteImagePreviewContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent background scrolling

      // Disable buttons until canvas is ready
      downloadImageBtn.disabled = true;
      shareGeneratedImageBtn.disabled = true;

      // Use html2canvas
      // A small delay can sometimes help ensure styles are fully applied, especially web fonts
      setTimeout(() => {
          html2canvas(quoteImageWrapper, {
              allowTaint: true,
              useCORS: true,
              backgroundColor: getComputedStyle(quoteImageWrapper).backgroundColor, // Crucial for themed background
              scale: 2, // Increase scale for better resolution
              logging: false // Suppress html2canvas console logs if desired
          }).then(canvas => {
              currentCanvas = canvas; // Store for download/share

              // Enable buttons now that canvas is ready
              downloadImageBtn.disabled = false;
              shareGeneratedImageBtn.disabled = false;

          }).catch(err => {
              console.error("Error generating image with html2canvas:", err);
              alert("Sorry, couldn't generate the image. Please try again.");
              closeImagePreview(); // Close modal on error
          });
      }, 100); // 100ms delay
    });
  }

  function closeImagePreview() {
    if (quoteImagePreviewContainer) quoteImagePreviewContainer.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    currentCanvas = null; // Clear stored canvas
    // Optional: If shareMenu was open and closed by this, decide if it should reopen
    // if (shareMenu && !shareMenu.classList.contains('open')) {
    //   // Logic to reopen share menu if desired
    // }
  }

  if (closeImagePreviewBtn) {
    closeImagePreviewBtn.addEventListener('click', closeImagePreview);
  }

  // Download Image Functionality
  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
      if (!currentCanvas) {
          alert("Image not generated yet.");
          return;
      }
      const imageURL = currentCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      // Sanitize author name and quote start for filename
      const authorNameForFile = lastQuote.author ? lastQuote.author.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'Unknown';
      const quoteStartForFile = lastQuote.text.substring(0,15).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `WOW_Quote_${quoteStartForFile}_${authorNameForFile}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

// --- IMAGE PREVIEW & SHARE LOGIC ---

// Show the image preview modal when "Share as Image" is clicked
shareGeneratedImageBtn.addEventListener('click', () => {
  generateQuoteImage(); // Always generate fresh image
  if (!currentCanvas) return;

  // Show modal centered
  quoteImagePreviewContainer.style.display = 'flex';
  setTimeout(() => {
    quoteImagePreviewContainer.classList.add('visible');
  }, 10);

  // Set preview as background-image
  const imgURL = currentCanvas.toDataURL('image/png');
  quoteImageWrapper.style.backgroundImage = `url(${imgURL})`;
  // Optionally, clear the text node to avoid double text
  imageQuoteText.textContent = '';
});

// Close the preview modal
closeImagePreviewBtn.addEventListener('click', () => {
  quoteImagePreviewContainer.classList.remove('visible');
  setTimeout(() => {
    quoteImagePreviewContainer.style.display = 'none';
    quoteImageWrapper.style.backgroundImage = '';
  }, 300);
});

// Download the generated image
downloadImageBtn.addEventListener('click', () => {
  if (!currentCanvas) return;
  const link = document.createElement('a');
  link.download = 'quote.png';
  link.href = currentCanvas.toDataURL();
  link.click();
});

// Share the generated image using Web Share API (if supported)
// You can trigger this from a dedicated share button (here, double-click on the preview's share button)
shareGeneratedImageBtn.addEventListener('dblclick', async () => {
  if (!currentCanvas) return;

  if (navigator.share && navigator.canShare) {
    currentCanvas.toBlob(async (blob) => {
      if (!blob) {
        alert("Error creating image blob for sharing.");
        return;
      }
      const authorName = lastQuote && lastQuote.author ? lastQuote.author : 'Unknown';
      const quoteText = lastQuote && lastQuote.text ? lastQuote.text : '';
      const filesArray = [
        new File([blob], `WOW_Quote_${authorName}.png`, {
          type: 'image/png',
          lastModified: new Date().getTime()
        })
      ];
      const shareData = {
        files: filesArray,
        title: `Quote by ${authorName} - Words of Wisdom`,
        text: `"${quoteText}" - ${authorName}\nShared via wordsofwisdom.in`,
      };
      try {
        if (navigator.canShare({ files: filesArray })) {
          await navigator.share(shareData);
          console.log('Image shared successfully');
        } else {
          // Fallback: share text and URL only
          await navigator.share({
            title: `Quote by ${authorName} - Words of Wisdom`,
            text: `"${quoteText}" - ${authorName}\nShared via wordsofwisdom.in`,
            url: window.location.href
          });
          console.log('Shared text content and URL as fallback.');
        }
      } catch (err) {
        if (err.name !== 'AbortError') {
          console.error('Error sharing image:', err);
          alert('Sharing failed. You can try downloading the image instead.');
        }
      }
    }, 'image/png');
  } else {
    alert('Sharing images this way is not supported on your browser. Please download the image to share it.');
  }
});

// --- END IMAGE PREVIEW & SHARE LOGIC ---


  // App Initialization
  (async function initApp(){
    if(qText) qText.textContent = "✨ Loading Wisdom..."; // Initial loading message
    if(qAuth) qAuth.textContent = "";
    if(quoteMark) {
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
    }

    await loadCategoriesAndQuotes(); // Load all data
    renderMenu(); // Build the category menu

    // Determine initial category based on banner or most used
    let initialCategory = "inspiration"; // Default
    const lastAutoCat = localStorage.getItem("lastAutoSelectedCategory");
    const todayStrInit = new Date().toISOString().slice(0,10);
    const lastBannerDateInit = localStorage.getItem("wowBannerDate");

    if (lastBannerDateInit === todayStrInit && lastAutoCat) {
        initialCategory = lastAutoCat;
        console.log(`Initial category from today's banner: ${initialCategory}`);
    } else {
        const mostUsed = getMostUsedCategory();
        if (mostUsed) {
            initialCategory = mostUsed;
            console.log(`Initial category from most used: ${initialCategory}`);
        } else {
            console.log(`Initial category set to default: ${initialCategory}`);
        }
    }
    selectedCat = initialCategory;
    if (currentCategory) currentCategory.textContent = capitalize(selectedCat);


    showRotatingBanner(); // Show daily banner (which might override selectedCat)

    // If banner didn't lead to a quote display OR if we are using a stored category, display a quote.
    // This ensures a quote is displayed on initial load if the banner logic doesn't trigger one.
    if (!lastQuote || !lastQuote.text) {
        console.log(`Banner didn't set a quote, or using stored category. Displaying quote for: ${selectedCat}`);
        displayQuote();
    }


    // Final check if still loading after everything
    if ((!lastQuote || !lastQuote.text) && qText && qText.textContent.includes("Loading Wisdom")) {
        qText.textContent = "Sorry, we couldn't load any quotes right now. Please try again later.";
        if(qAuth) qAuth.textContent = "";
    }

    // Initialize streak and favorite button state
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
    updateFavoriteButtonState(); // Call this after a quote might have been displayed

    // Placeholders for future notification features
    requestNotificationPermission();
    scheduleDailyNotification();
    console.log("App initialization complete.");
  })();
});
