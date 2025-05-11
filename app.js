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
    submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
    // feedbackSuccess = document.getElementById('feedbackSuccess'); // Already defined above

  // DOM references for Image Generation Modal
  const quoteImagePreviewContainer = document.getElementById('quoteImagePreviewContainer');
  const quoteImageContent = document.getElementById('quoteImageContent'); // The div to capture
  const imageQuoteText = document.getElementById('imageQuoteText');
  const imageQuoteAuthor = document.getElementById('imageQuoteAuthor');
  const imageWatermark = document.getElementById('imageWatermark'); // Already in HTML, styled by CSS
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  const shareGeneratedImageBtn = document.getElementById('shareGeneratedImageBtn');
  const closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn');
  const generateImageShareOption = document.getElementById('generateImageShareOption'); // Button in shareMenu

  // Audio Element References
  const appLoadSound = document.getElementById('appLoadSound');
  const generateSound = document.getElementById('generateSound');
  const menuClickSound = document.getElementById('menuClickSound');
  const shareCopySound = document.getElementById('shareCopySound');
  const saveFavSound = document.getElementById('saveFavSound');
  const downloadSound = document.getElementById('downloadSound');
  const undoSound = document.getElementById('undoSound');
  const themeToggleSound = document.getElementById('themeToggleSound');
  const notificationSound = document.getElementById('notificationSound');
  // Keeping original magicSound and favSound as they might be used elsewhere
  const magicSound = document.getElementById('magicSound'); // Original magic sound
  const favSound = document.getElementById('favSound'); // Original fav sound

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
  ];

  function capitalize(str) {
    if (!str) return "";
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  function showRotatingBanner() {
    const today = new Date();
    const startDate = new Date("2025-05-05");
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
      // Play menu click sound on banner close
      if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr);
      localStorage.removeItem("bannerForceShow");
    };
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){
          // Play menu click sound on auto banner close
          if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
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
                    console.error(`Attempt to fetch/process ${filePath} for category ${cat.id} failed.`);
                    return false; // Failure due to fetch/parse
                }
            };
            quotePromises.push(
                fetchAndProcessQuoteFile(pathAttempt1, 'wowQuotes_').then(success => {
                    if (!success && pathAttempt2) {
                        return fetchAndProcessQuoteFile(pathAttempt2, 'wowQuotesRoot_');
                    }
                    return success;
                })
            );
          }
        });
      }
      collectCategories(categories);

      if (localStorage.getItem('userQuotes')) {
        const userQuotesData = JSON.parse(localStorage.getItem('userQuotes'));
        quotes['user'] = userQuotesData;
        buildAuthorIndex(userQuotesData, 'user');
      }
      await Promise.all(quotePromises);

      if (Object.keys(quotes).length === 0 && (!localStorage.getItem('userQuotes') || JSON.parse(localStorage.getItem('userQuotes')).length === 0)) {
          if(qText) qText.textContent = "No quote data could be loaded. Please check your connection or try again later.";
          if(qAuth) qAuth.textContent = "";
      }
    } catch (err) {
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
          author: by,
          category: categoryId
        });
      }
    });
  }

  function renderMenu() {
    if (!categoryMenu) return;
    categoryMenu.innerHTML = "";
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) {
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn" aria-expanded="false" aria-controls="authorSearchWrapper-${cat.id || 'search'}"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
            <div id="authorSearchWrapper-${cat.id || 'search'}" class="author-search-wrapper" style="display: none;">
              <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" aria-label="Search by author name" />
              <ul id="authorList" class="suggestions-list" role="listbox"></ul>
            </div>`;
          categoryMenu.appendChild(sec);
          sec.querySelector('.section-btn').addEventListener('click', function() {
            // Play menu click sound
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
            const wrapper = sec.querySelector('.author-search-wrapper');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            wrapper.style.display = isExpanded ? 'none' : 'block';
            if (!isExpanded) wrapper.querySelector('input').focus();
          });

          const favSec = document.createElement("div");
          favSec.className = "section";
          favSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-heart section-icon" aria-hidden="true"></i>View Favorites</button>`;
          favSec.querySelector(".section-btn").addEventListener("click", () => {
            // Play menu click sound
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
            openFavoritesModal();
            closeMenu();
          });
          categoryMenu.appendChild(favSec);

          const myFavCatSec = document.createElement("div");
          myFavCatSec.className = "section";
          myFavCatSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-star section-icon" aria-hidden="true"></i>Quotes from My Favorites</button>`;
          myFavCatSec.querySelector(".section-btn").addEventListener("click", () => {
            // Play menu click sound
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
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
             // Play menu click sound
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
            if(submitQuoteModal) submitQuoteModal.classList.add('open');
            document.body.style.overflow = "hidden";
            if(customQuoteForm) customQuoteForm.reset();
            if(quoteFormSuccess) {
                quoteFormSuccess.style.display = "none";
                quoteFormSuccess.textContent = "Thank you! Your quote was submitted.";
            }
            const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
            const submitSpinner = submitCustomQuoteBtn.querySelector('.loader-spinner');
            if(submitBtnText) submitBtnText.style.display = 'inline';
            if(submitSpinner) submitSpinner.style.display = 'none';
            submitCustomQuoteBtn.disabled = false;
            closeMenu();
          });
          categoryMenu.appendChild(submitSec);

        } else {
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
              if (child.children) {
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
              } else {
                li.innerHTML = `<a href="#" data-cat="${child.id}">
                  ${child.icon ? `<i class="fa-solid ${child.icon}" aria-hidden="true"></i>` : ""}
                  ${child.name}
                </a>`;
              }
              ul.appendChild(li);
            });
          }
          categoryMenu.appendChild(sec);
          sec.querySelector('.section-btn').addEventListener('click', function() {
            // Play menu click sound
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
            const list = sec.querySelector('.section-list');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            list.style.display = isExpanded ? 'none' : 'block';
            const icon = this.querySelector('.fa-chevron-down, .fa-chevron-up');
            if(icon){
                icon.classList.toggle('fa-chevron-down');
                icon.classList.toggle('fa-chevron-up');
            }
          });
        }
      });
    }
    renderCategoryList(categories, categoryMenu);

    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation();
        // Play menu click sound
        if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
        const nestedList = this.nextElementSibling;
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        nestedList.style.display = isExpanded ? 'none' : 'block';
        const icon = this.querySelector('.fa-caret-right, .fa-caret-down');
        if (icon) {
            icon.classList.toggle('fa-caret-right');
            icon.classList.toggle('fa-caret-down');
        }
      });
      span.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        // Play menu click sound
        if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
        selectedCat = link.dataset.cat;
        authorMode = false;
        if(currentCategory) currentCategory.textContent = capitalize(link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim());
        closeMenu();
        displayQuote();
        recordCategoryUse(selectedCat);
      });
    });

    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorListUL = categoryMenu.querySelector("#authorList");
    if (authorInput && authorListUL) {
      authorInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = authorInput.value.toLowerCase().trim();
          authorListUL.innerHTML = "";
          if (!query) return;
          Object.keys(authors)
            .filter(name => name.includes(query))
            .sort()
            .slice(0, 10)
            .forEach(nameKey => {
              const li = document.createElement("li");
              li.setAttribute('role', 'option');
              li.textContent = authors[nameKey][0].author;
              li.tabIndex = -1;
              li.addEventListener("click", () => {
                // Play menu click sound
                if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
                authorMode = true;
                authorName = nameKey;
                authorQuotes = [...authors[nameKey]];
                authorQuoteIndex = 0;
                if(currentCategory) currentCategory.textContent = "Author: " + authors[nameKey][0].author;
                closeMenu();
                showAuthorQuote();
              });
              authorListUL.appendChild(li);
            });
        }, 300);
      });
    }
  }


  function openMenu() {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    renderMenu();
    if(categoryModal) categoryModal.classList.add("open");
    document.body.style.overflow = "hidden";
    if(closeMenuBtn) closeMenuBtn.focus();
  }
  function closeMenu() {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(categoryModal) categoryModal.classList.remove("open");
    document.body.style.overflow = "";
    if(openMenuBtn) openMenuBtn.focus();
  }
  if(openMenuBtn) openMenuBtn.addEventListener("click", openMenu);
  if(closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if(categoryModal) categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu();
  });

  if(closeSubmitQuoteModal) closeSubmitQuoteModal.addEventListener('click', () => {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(submitQuoteModal) submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  if(customQuoteForm) customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // No specific sound for submit, default click sound might play if not prevented

    const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
    const spinner = submitCustomQuoteBtn.querySelector('.loader-spinner');

    if(submitBtnText) submitBtnText.style.display = 'none';
    if(spinner) spinner.style.display = 'inline-block';
    submitCustomQuoteBtn.disabled = true;

    setTimeout(() => {
        if(quoteFormSuccess) {
            quoteFormSuccess.textContent = "Thank you! Your quote was submitted.";
            quoteFormSuccess.style.display = 'block';
        }

        if(submitBtnText) submitBtnText.style.display = 'inline';
        if(spinner) spinner.style.display = 'none';
        submitCustomQuoteBtn.disabled = false;
        customQuoteForm.reset();

        setTimeout(() => {
          if(quoteFormSuccess) quoteFormSuccess.style.display = 'none';
          if(submitQuoteModal) submitQuoteModal.classList.remove('open');
          document.body.style.overflow = "";
           // Play notification sound on successful submission
          if (notificationSound) { notificationSound.currentTime = 0; notificationSound.play().catch(e => console.warn("Audio play failed:", e)); }
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

    if (!fromUndo && lastQuote) {
      quoteHistory.unshift(lastQuote);
      if (quoteHistory.length > 5) quoteHistory.length = 5;
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";

    if(qText) qText.classList.add('fade-out');
    if(qAuth) qAuth.classList.add('fade-out');

    setTimeout(() => {
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = (item.author || item.by || "").trim();

      if(qText) qText.textContent = txt;
      if(qAuth) {
        if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
          qAuth.textContent = "";
        } else {
          qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
        }
      }
      if(quoteMark) {
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
      }

      if(qText) qText.classList.remove('fade-out');
      if(qAuth) qAuth.classList.remove('fade-out');

      lastQuote = { text: txt, author: by, category: cat };
      updateStreak();
      updateFavoriteButtonState();
    }, 300);
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


    if (!pool || pool.length === 0) {
        const allQuotesRaw = Object.values(quotes).flat();
        pool = allQuotesRaw.filter(isValidQuote);
        if (pool.length > 0 && currentCategory && (!selectedCat || !(quotes[selectedCat] && Array.isArray(quotes[selectedCat])))) {
            if(currentCategory) currentCategory.textContent = "All Quotes";
        }
    }

    if (!pool || pool.length === 0) {
        if(qText) qText.textContent = "No valid quotes available for this selection or any category.";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        updateFavoriteButtonState();
        console.error("CRITICAL: Pool is empty after all fallbacks. No quotes to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    showQuote(pool[randomIndex], selectedCat || "all_fallback");
  }


  if(undoBtn) undoBtn.addEventListener("click", () => {
    // Play undo sound
    if (undoSound) { undoSound.currentTime = 0; undoSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift();
      showQuote(prev, prev.category, true);
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";
  });

  function triggerGenerateEffects() {
    // Play generate sound
    if (generateSound) { generateSound.currentTime = 0; generateSound.play().catch(e => console.warn("Audio play failed:", e)); }
    // Original magic sound effect (optional, can remove if generateSound replaces it)
    // if (magicSound) { magicSound.currentTime = 0; magicSound.play().catch(e => console.warn("Audio play failed:", e)); }

    if(quoteBox) quoteBox.classList.add('glow');
    setTimeout(() => { if(quoteBox) quoteBox.classList.remove('glow'); }, 400);

    const wand = genBtn ? genBtn.querySelector('.magic-wand-icon') : null;
    if (wand) {
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    if(genBtn) genBtn.classList.add('touched');
    setTimeout(() => {if(genBtn) genBtn.classList.remove('touched');}, 400);

    // Ripple effect for generate button
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    // Position ripple at the center of the button
    ripple.style.left = "50%";
    ripple.style.top = "50%";
    // Add gradient background for the ripple
    ripple.style.background = 'radial-gradient(circle, #fff 0%, var(--primary) 80%, transparent 100%)';
     // Add dark mode specific gradient if body has dark class
    if (document.body.classList.contains('dark')) {
       ripple.style.background = 'radial-gradient(circle, #fff 0%, var(--gold) 80%, transparent 100%)';
    }

    if(genBtn) genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700);
  }

  if(genBtn) {
    genBtn.addEventListener("click", e => {
        triggerGenerateEffects();
        displayQuote();
    });
  }

  // Add default click sound to buttons that don't have specific sounds
  document.querySelectorAll('.icon-btn:not(#shareBtn):not(#favBtn):not(#copyBtn):not(#undoBtn), .feedback-btn, .home-btn, .category-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent";
    btn.addEventListener('click', function(e) {
      // Play default menu click sound for these buttons
      if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }

      // Existing ripple effect logic
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      // Position ripple based on click coordinates within the button
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';

      // Add specific ripple background if needed, otherwise default from CSS applies
      // For generateBtn, the gradient is handled in triggerGenerateEffects

      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });

  // Add specific click sound for Share, Favorite, and Copy buttons
  if(shareBtn) shareBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    // Play share/copy sound
    if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(shareMenu) shareMenu.classList.toggle("open");
    if (shareMenu && shareMenu.classList.contains("open")) {
      setTimeout(() => {
        document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
      }, 0);
    }
     // Ripple effect for share button
     const rect = shareBtn.getBoundingClientRect();
     const ripple = document.createElement('span');
     ripple.className = 'ripple';
     ripple.style.left = (e.clientX - rect.left) + 'px';
     ripple.style.top = (e.clientY - rect.top) + 'px';
     shareBtn.appendChild(ripple);
     setTimeout(() => ripple.remove(), 600);
  });

   if(favBtn) favBtn.addEventListener('click', (e) => {
     // No sound here, sound is played inside the favBtn logic based on save/unsave
     // Ripple effect for favorite button
     const rect = favBtn.getBoundingClientRect();
     const ripple = document.createElement('span');
     ripple.className = 'ripple';
     ripple.style.left = (e.clientX - rect.left) + 'px';
     ripple.style.top = (e.clientY - rect.top) + 'px';
     favBtn.appendChild(ripple);
     setTimeout(() => ripple.remove(), 600);

     // Existing favorite logic
     if (!lastQuote || !lastQuote.text) return;

     let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
     const currentQuoteText = lastQuote.text;
     const currentAuthorText = lastQuote.author;

     const favIndex = favs.findIndex(q => q.text === currentQuoteText && q.author === currentAuthorText);
     const isFavorited = favIndex !== -1;

     const savedPopup = favBtn.querySelector('.saved-popup');

     if (isFavorited) {
       favs.splice(favIndex, 1);
       if(savedPopup) savedPopup.textContent = "Unsaved";
     } else {
       favs.push({ text: currentQuoteText, author: currentAuthorText });
       // Play save favorite sound ONLY when saving
       if(saveFavSound) { saveFavSound.currentTime = 0; saveFavSound.play().catch(e => console.warn("Audio play failed", e)); }
       if(savedPopup) savedPopup.textContent = "Saved!";
     }

     localStorage.setItem('favQuotes', JSON.stringify(favs));
     updateFavoriteButtonState();

     if(favBtn) favBtn.classList.add('show-saved-popup');
     setTimeout(() => {
         if(favBtn) favBtn.classList.remove('show-saved-popup');
     }, 1200);
   });

   if(copyBtn) copyBtn.addEventListener("click", (e) => {
     // Play share/copy sound
     if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
      // Ripple effect for copy button
     const rect = copyBtn.getBoundingClientRect();
     const ripple = document.createElement('span');
     ripple.className = 'ripple';
     ripple.style.left = (e.clientX - rect.left) + 'px';
     ripple.style.top = (e.clientY - rect.top) + 'px';
     copyBtn.appendChild(ripple);
     setTimeout(() => ripple.remove(), 600);

     // Existing copy logic
     const quoteContent = qText ? qText.textContent || "" : "";
     const cleanAuthor = lastQuote && lastQuote.author ? lastQuote.author : "";
     const textToCopy = `${quoteContent}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();

     navigator.clipboard.writeText(textToCopy).then(() => {
       const iconElement = copyBtn.querySelector("i");
       const originalIcon = iconElement ? iconElement.className : "";
       if(iconElement) iconElement.className = "fa-solid fa-check";
       copyBtn.classList.add('copied-feedback');
       const tooltip = copyBtn.querySelector('.btn-tooltip');
       const originalTooltipText = tooltip ? tooltip.textContent : '';
       if(tooltip) tooltip.textContent = "Copied!";

       setTimeout(() => {
         if(iconElement) iconElement.className = originalIcon;
         copyBtn.classList.remove('copied-feedback');
         if(tooltip) tooltip.textContent = originalTooltipText;
       }, 1500);
     }).catch(err => {
       console.error('Failed to copy text: ', err);
       const tooltip = copyBtn.querySelector('.btn-tooltip');
       if(tooltip) {
           const originalTooltipText = tooltip.textContent;
           tooltip.textContent = "Copy failed!";
           setTimeout(() => { tooltip.textContent = originalTooltipText; }, 2000);
       }
     });
   });


  function closeShareMenuOnClickOutside(event) {
    if (shareMenu && shareMenu.classList.contains("open") && !shareMenu.contains(event.target) && event.target !== shareBtn && (shareBtn && !shareBtn.contains(event.target))) {
      shareMenu.classList.remove("open");
    } else if (shareMenu && shareMenu.classList.contains("open")) {
         document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }


  if(shareMenu) shareMenu.querySelectorAll('.share-option').forEach(btn => {
    // Add share/copy sound to other share options
    if (btn.id !== 'generateImageShareOption') {
         btn.addEventListener('click', function() {
              if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
         });
    }

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
      if(shareMenu) shareMenu.classList.remove("open");
    });
  });


  function updateFavoriteButtonState() {
    if (!favBtn || !lastQuote || !lastQuote.text) {
        const favIcon = favBtn ? favBtn.querySelector("i") : null;
        if (favIcon) {
            favIcon.className = "fa-regular fa-heart";
        }
        return;
    }

    const favIcon = favBtn.querySelector("i");
    if (!favIcon) return;

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    if (isFavorited) {
        favIcon.className = "fa-solid fa-heart";
    } else {
        favIcon.className = "fa-regular fa-heart";
    }
  }


  if(themeSw) {
    const savedTheme = localStorage.getItem("wowDark");
    if (savedTheme === "true") {
        themeSw.checked = true;
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark");
    }
    themeSw.addEventListener("change", () => {
        // Play theme toggle sound
        if (themeToggleSound) { themeToggleSound.currentTime = 0; themeToggleSound.play().catch(e => console.warn("Audio play failed:", e)); }
        const isDark = themeSw.checked;
        document.body.classList.toggle("dark", isDark);
        localStorage.setItem("wowDark", isDark);
    });
  }


  function updateStreak() {
    const today = new Date().toISOString().slice(0,10);
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    if (streak.last !== today) {
      if (streak.last === getYesterday()) {
        streak.count++;
      } else {
        streak.count = 1;
      }
      streak.last = today;
      localStorage.setItem('wowStreak', JSON.stringify(streak));
    }
    showStreak(streak.count);
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

    setTimeout(async () => {
            if(feedbackSuccess) {
                feedbackSuccess.textContent = "Thank you for your feedback!";
                feedbackSuccess.style.display = 'block';
            }
            if(feedbackTextarea) feedbackTextarea.value = '';

            if(submitBtnText) submitBtnText.style.display = 'inline';
            if(spinner) spinner.style.display = 'none';
            submitFeedbackBtn.disabled = false;

            setTimeout(() => {
                if(feedbackSuccess) feedbackSuccess.style.display = 'none';
                if(feedbackModal) feedbackModal.classList.remove('open');
                document.body.style.overflow = "";
                 // Play notification sound on successful submission
                if (notificationSound) { notificationSound.currentTime = 0; notificationSound.play().catch(e => console.warn("Audio play failed:", e)); }
            }, 2500);
    }, 1500);
  });

  if(feedbackBtn) feedbackBtn.addEventListener('click', () => {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(feedbackModal) feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    if(feedbackTextarea) feedbackTextarea.value = '';
    if(feedbackSuccess) {
        feedbackSuccess.style.display = 'none';
        feedbackSuccess.textContent = "Thank you for your feedback!";
    }
    const feedbackSubmitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
    const feedbackSpinner = submitFeedbackBtn.querySelector('.loader-spinner');
    if(feedbackSubmitBtnText) feedbackSubmitBtnText.style.display = 'inline';
    if(feedbackSpinner) feedbackSpinner.style.display = 'none';
    submitFeedbackBtn.disabled = false;
    if(feedbackTextarea) feedbackTextarea.focus();
  });
  if(closeFeedbackModal) closeFeedbackModal.addEventListener('click', () => {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(feedbackModal) feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  function openFavoritesModal() {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(favModal) favModal.classList.add('open');
    document.body.style.overflow = "hidden";
    showFavorites();
    const firstFocusable = favModal ? favModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') : null;
    if (firstFocusable) firstFocusable.focus();
  }
  if(closeFavModal) closeFavModal.addEventListener('click', () => {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if(favModal) favModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  if (closeFavModalLarge) {
    closeFavModalLarge.addEventListener('click', () => {
        // Play menu click sound
        if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
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

      favQuotesList.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Play menu click sound (default for these actions)
            if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
            const index = parseInt(this.closest('.fav-quote').dataset.index);
            removeFavorite(index);
        });
      });

      favQuotesList.querySelectorAll('.copy-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
             // Play share/copy sound
            if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];

            if (favoriteQuoteObject) {
                copyFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author, this);
            } else {
                 const displayedText = quoteDiv.querySelector('p:first-child').textContent;
                 const displayedAuthor = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[\s–—]+/, "").trim();
                 copyFavorite(displayedText, displayedAuthor, this);
            }
        });
      });

      favQuotesList.querySelectorAll('.share-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            // Play share/copy sound
            if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favoriteQuoteObject = currentFavs[index];

            if (favoriteQuoteObject) {
                shareFavorite(favoriteQuoteObject.text, favoriteQuoteObject.author);
            } else {
                 const displayedText = quoteDiv.querySelector('p:first-child').textContent;
                 const displayedAuthor = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[\s–—]+/, "").trim();
                 shareFavorite(displayedText, displayedAuthor);
            }
        });
      });
  }

  window.removeFavorite = function(idx) {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites();
    updateFavoriteButtonState();
  };

  window.copyFavorite = function(text, cleanAuthor, buttonElement) {
    const textToCopy = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        if(buttonElement){
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fa-solid fa-check" style="color: var(--green-accent);"></i>';
            setTimeout(() => { buttonElement.innerHTML = originalIconHTML; }, 1200);
        }
    }).catch(err => console.error("Copying favorite failed:", err));
  };

  window.shareFavorite = function(text, cleanAuthor) {
    const shareText = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    if (navigator.share) {
      navigator.share({ title: `Quote by ${cleanAuthor || 'Words of Wisdom'}`, text: shareText, url: window.location.href })
        .catch(err => {
            if (err.name !== 'AbortError') {
                console.error("Sharing favorite failed:", err);
            }
        });
    } else {
      // Fallback to copy if Web Share API is not available
      navigator.clipboard.writeText(shareText).then(() => alert("Quote copied! You can now paste it to share."))
                         .catch(() => alert("Could not copy quote. Please share manually."));
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => {
        modal.classList.remove("open");
      });
      if (quoteImagePreviewContainer && quoteImagePreviewContainer.style.display === 'flex') {
        closeImagePreview();
      }
      document.body.style.overflow = "";

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
    return sortedUsage[0][0];
  }

  function requestNotificationPermission() { /* console.log("Placeholder: Request Notification Permission"); */ }
  function sendDailyQuoteNotification() { /* console.log("Placeholder: Send Daily Quote Notification"); */ }
  function scheduleDailyNotification() { /* console.log("Placeholder: Schedule Daily Notification"); }


  // --- Image Generation Feature Logic ---

  // Function to adjust font size to fit the container
  function adjustFontSizeForImage() {
      const container = quoteImageContent; // The square div
      const textElement = imageQuoteText;
      const authorElement = imageQuoteAuthor;
      const watermarkElement = imageWatermark;

      // Reset font sizes to a large value to start
      textElement.style.fontSize = '40px'; // Start large
      authorElement.style.fontSize = '24px'; // Start large

      // Temporarily make elements visible for measurement if they are hidden
      const originalContainerDisplay = container.style.display;
      const originalTextDisplay = textElement.style.display;
      const originalAuthorDisplay = authorElement.style.display;
      const originalWatermarkDisplay = watermarkElement.style.display;

      container.style.display = 'flex'; // Ensure container is flex for centering
      textElement.style.display = 'block';
      if (lastQuote && lastQuote.author) {
          authorElement.style.display = 'block';
      } else {
          authorElement.style.display = 'none';
      }
      watermarkElement.style.display = 'block'; // Ensure watermark is visible for capture

      // Use a loop to reduce font size until content fits
      let textFontSize = parseInt(getComputedStyle(textElement).fontSize);
      let authorFontSize = parseInt(getComputedStyle(authorElement).fontSize);
      const minTextFontSize = 14; // Minimum readable size
      const minAuthorFontSize = 10; // Minimum readable size
      const containerHeight = container.clientHeight;
      const padding = parseInt(getComputedStyle(container).paddingTop) + parseInt(getComputedStyle(container).paddingBottom);
      const availableHeight = containerHeight - padding;

      let isOverflowing = true;
      let iterations = 0;
      const maxIterations = 50; // Prevent infinite loops

      while (isOverflowing && iterations < maxIterations) {
          const contentHeight = textElement.scrollHeight + authorElement.scrollHeight; // Sum of scroll heights

          if (contentHeight > availableHeight && (textFontSize > minTextFontSize || authorFontSize > minAuthorFontSize)) {
              // Reduce font size
              if (textFontSize > minTextFontSize) textFontSize -= 1;
              if (authorFontSize > minAuthorFontSize) authorFontSize -= 1;

              textElement.style.fontSize = textFontSize + 'px';
              authorElement.style.fontSize = authorFontSize + 'px';

              // Re-check height in the next iteration
              isOverflowing = true;
          } else {
              isOverflowing = false; // Content fits or minimum size reached
          }
          iterations++;
      }

      // Restore original display properties if they were changed
      // No need to restore display: 'none' if we always want them visible for html2canvas
      // container.style.display = originalContainerDisplay;
      // textElement.style.display = originalTextDisplay;
      // authorElement.style.display = originalAuthorDisplay;
      // watermarkElement.style.display = originalWatermarkDisplay;

      console.log(`Font size adjusted: Text ${textFontSize}px, Author ${authorFontSize}px. Iterations: ${iterations}`);
  }


  if (generateImageShareOption) {
    generateImageShareOption.addEventListener('click', () => {
      // Play share/copy sound
      if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }

      if (!lastQuote || !lastQuote.text) {
        alert("Please generate a quote first!");
        return;
      }

      // Set text content for the image preview
      imageQuoteText.textContent = lastQuote.text;
      if (lastQuote.author) {
        imageQuoteAuthor.textContent = `— ${lastQuote.author}`;
        imageQuoteAuthor.style.display = 'block';
      } else {
        imageQuoteAuthor.textContent = '';
        imageQuoteAuthor.style.display = 'none';
      }

      // Show the image preview container
      if (quoteImagePreviewContainer) quoteImagePreviewContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden'; // Prevent scrolling

      // Disable buttons while generating
      downloadImageBtn.disabled = true;
      shareGeneratedImageBtn.disabled = true;

      // Wait a moment for DOM to update and styles to apply, then adjust font size and capture
      setTimeout(() => {
          adjustFontSizeForImage(); // Adjust font size before capturing

          // Capture the quoteImageContent div
          html2canvas(quoteImageContent, {
              allowTaint: true,
              useCORS: true,
              backgroundColor: getComputedStyle(quoteImageContent).backgroundColor, // Get background from the content div
              scale: 2, // Increase scale for better resolution
              logging: false
          }).then(canvas => {
              currentCanvas = canvas; // Store the generated canvas

              // Enable buttons after generation
              downloadImageBtn.disabled = false;
              shareGeneratedImageBtn.disabled = false;

          }).catch(err => {
              console.error("Error generating image with html2canvas:", err);
              alert("Sorry, couldn't generate the image. Please try again.");
              closeImagePreview(); // Close on error
          });
      }, 100); // Small delay to ensure DOM is ready
    });
  }

  function closeImagePreview() {
    // Play menu click sound
    if (menuClickSound) { menuClickSound.currentTime = 0; menuClickSound.play().catch(e => console.warn("Audio play failed:", e)); }
    if (quoteImagePreviewContainer) quoteImagePreviewContainer.style.display = 'none';
    document.body.style.overflow = ''; // Restore scrolling
    currentCanvas = null; // Clear the stored canvas
  }

  if (closeImagePreviewBtn) {
    closeImagePreviewBtn.addEventListener('click', closeImagePreview);
  }

  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
      // Play download sound
      if (downloadSound) { downloadSound.currentTime = 0; downloadSound.play().catch(e => console.warn("Audio play failed:", e)); }
      if (!currentCanvas) {
          alert("Image not generated yet.");
          return;
      }
      const imageURL = currentCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = imageURL;
      const authorNameForFile = lastQuote.author ? lastQuote.author.replace(/[^a-z0-9]/gi, '_').toLowerCase() : 'Unknown';
      const quoteStartForFile = lastQuote.text.substring(0,15).replace(/[^a-z0-9]/gi, '_').toLowerCase();
      a.download = `WOW_Quote_${quoteStartForFile}_${authorNameForFile}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    });
  }

  if (shareGeneratedImageBtn) {
    shareGeneratedImageBtn.addEventListener('click', async () => {
      // Play share/copy sound
      if (shareCopySound) { shareCopySound.currentTime = 0; shareCopySound.play().catch(e => console.warn("Audio play failed:", e)); }
      if (!currentCanvas) {
          alert("Image not generated yet.");
          return;
      }

      // Check if Web Share API supports files
      if (navigator.share && navigator.canShare && navigator.canShare({ files: [] })) {
        currentCanvas.toBlob(async (blob) => {
          if (!blob) {
              alert("Error creating image blob for sharing.");
              return;
          }
          const authorName = lastQuote.author || 'Unknown';
          const filesArray = [
            new File([blob], `WOW_Quote_${authorName}.png`, {
              type: 'image/png',
              lastModified: new Date().getTime()
            })
          ];
          const shareData = {
            files: filesArray,
            title: `Quote by ${authorName} - Words of Wisdom`,
            text: `"${lastQuote.text}" — ${authorName}\nShared via wordsofwisdom.in`,
          };
          try {
            // Check if sharing files is actually possible before calling share
            if (navigator.canShare(shareData)) {
                await navigator.share(shareData);
                console.log('Image shared successfully');
            } else {
                 console.warn('Cannot share files, falling back to text/URL share.');
                 // Fallback to sharing text and URL if file sharing is not supported
                 await navigator.share({
                     title: `Quote by ${authorName} - Words of Wisdom`,
                     text: `"${lastQuote.text}" — ${authorName}\nShared via wordsofwisdom.in`,
                     url: window.location.href
                 });
                 console.log('Shared text content and URL as fallback.');
            }
          } catch (err) {
            if (err.name !== 'AbortError') { // Ignore user cancelling share
                console.error('Error sharing image:', err);
                alert('Sharing failed. You can try downloading the image instead.');
            }
          }
        }, 'image/png');
      } else {
        // Fallback for browsers that don't support Web Share API with files
        alert('Sharing images this way is not supported on your browser. Please download the image to share it.');
      }
    });
  }


  (async function initApp(){
    if(qText) qText.textContent = "✨ Loading Wisdom...";
    if(qAuth) qAuth.textContent = "";
    if(quoteMark) {
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
    }

    await loadCategoriesAndQuotes();
    renderMenu();

    let initialCategory = "inspiration";
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


    showRotatingBanner();

    // Display the initial quote after categories and quotes are loaded
    // Check if banner already set a quote, otherwise display from selected category
    // The previous check `if (!lastQuote || !lastQuote.text)` here was redundant
    // and potentially causing issues if banner logic didn't always set lastQuote immediately.
    // We should always attempt to display a quote after loading is complete.
    console.log(`Attempting to display initial quote for category: ${selectedCat}`);
    displayQuote(); // Always call displayQuote after init

    if ((!lastQuote || !lastQuote.text) && qText && qText.textContent.includes("Loading Wisdom")) {
        qText.textContent = "Sorry, we couldn't load any quotes right now. Please try again later.";
        if(qAuth) qAuth.textContent = "";
    }

    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
    updateFavoriteButtonState();

    requestNotificationPermission();
    scheduleDailyNotification();
    console.log("App initialization complete.");

    // Play app load sound after everything is initialized and the first quote is displayed
    // Add a small delay to ensure the user sees the initial quote first
    setTimeout(() => {
        if (appLoadSound) { appLoadSound.currentTime = 0; appLoadSound.play().catch(e => console.warn("Audio play failed:", e)); }
    }, 500); // Adjust delay as needed
  })();
});
