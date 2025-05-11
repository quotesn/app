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
    sharePngBtn = document.getElementById('sharePngBtn'),
    pngPreviewModal = document.getElementById('pngPreviewModal'),
    pngPreviewImg = document.getElementById('pngPreviewImg'),
    downloadPngBtn = document.getElementById('downloadPngBtn'),
    closePngPreviewModal = document.getElementById('closePngPreviewModal');

  let categories = [];
  let quotes = {};
  let authors = {};
  let selectedCat = null;
  let lastQuote = null;
  let quoteHistory = [];
  let authorMode = false;
  let authorQuotes = [];
  let authorName = "";
  let authorQuoteIndex = 0;
  let debounceTimer = null;

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
    const startDate = new Date("2025-05-05"); 
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const idx = ((daysSinceStart % bannerThemes.length) + bannerThemes.length) % bannerThemes.length; 
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");

    if (lastBannerDate === todayStr && specialBanner.style.display === 'none') return; 

    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;

    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "block";
    specialBanner.style.background = style.color ? style.color : "linear-gradient(90deg, #ffd700 0%, #7c5df0 100%)"; 
    specialBanner.style.color = "#fff"; 

    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr); 
    };
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){ 
          specialBanner.style.display = "none";
      }
    }, 8000);

    selectedCat = theme.cat;
    if(currentCategory) currentCategory.textContent = capitalize(theme.cat);
    displayQuote(); 
    localStorage.setItem("wowBannerDate", todayStr); 
  }

  async function fetchJSON(url, cacheKey) {
    console.log(`Attempting to fetch: ${url} (cacheKey: ${cacheKey})`);
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        console.log(`Found cached data for ${cacheKey}`);
        return JSON.parse(cached);
      }
      console.log(`No cache for ${cacheKey}, fetching from network: ${url}`);
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status} for ${url}`);
      }
      const data = await res.json();
      console.log(`Successfully fetched ${url}, caching as ${cacheKey}`);
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Failed to fetch or parse ${url}:`, e.message);
      throw e; // Re-throw to be caught by caller
    }
  }

  async function loadCategoriesAndQuotes() {
    console.log("Starting loadCategoriesAndQuotes...");
    try {
      // Try fetching categories.json from 'data/' subdir, then from root
      try {
        categories = await fetchJSON('data/categories.json', 'wowCategories');
        console.log("Successfully loaded categories.json from data/ folder");
      } catch (e) {
        console.warn("Could not load categories.json from data/ folder, trying root...");
        categories = await fetchJSON('categories.json', 'wowCategoriesRoot');
        console.log("Successfully loaded categories.json from root folder");
      }

      if (!categories || categories.length === 0) {
        console.error("CRITICAL: categories.json is empty or could not be loaded from data/ or root.");
        if(qText) qText.textContent = "Error: Main category file (categories.json) could not be loaded.";
        if(qAuth) qAuth.textContent = "";
        return;
      }
      console.log("Categories loaded:", JSON.parse(JSON.stringify(categories)));

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
                    // Ensure data is an array before checking its length or content
                    if (Array.isArray(data) && data.length > 0) {
                        console.log(`Successfully loaded and processed ${filePath} for category ${cat.id}`);
                        quotes[cat.id] = data;
                        buildAuthorIndex(data, cat.id);
                        return true; // Success
                    } else if (Array.isArray(data) && data.length === 0) {
                        console.warn(`Empty array in ${filePath} for category ${cat.id}. Category will be empty unless other files contribute.`);
                        quotes[cat.id] = []; // Initialize as empty array if file is empty array
                        return true; // Technically successful load of an empty file
                    }
                    console.warn(`No data or invalid data structure in ${filePath} for category ${cat.id}. Received:`, data);
                    return false; // No data or invalid structure
                } catch (err) {
                    console.error(`Attempt to fetch/process ${filePath} for category ${cat.id} failed overall.`);
                    return false; // Failure
                }
            };
            
            quotePromises.push(
                fetchAndProcessQuoteFile(pathAttempt1, 'wowQuotes_').then(success => {
                    if (!success && pathAttempt2) {
                        console.warn(`Primary path ${pathAttempt1} failed or empty for ${cat.id}, trying fallback ${pathAttempt2}`);
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
        console.log("Loaded user quotes from localStorage.");
      }

      await Promise.all(quotePromises);
      console.log("All quote file promises have been settled.");
      console.log("Final loaded quotes object:", JSON.parse(JSON.stringify(quotes)));

      if (Object.keys(quotes).length === 0 && (!localStorage.getItem('userQuotes') || JSON.parse(localStorage.getItem('userQuotes')).length === 0)) {
          console.warn("WARNING: The 'quotes' object is empty after all loading attempts, and no user quotes found. This means no quotes are available to display.");
          if(qText) qText.textContent = "No quote data could be loaded. Please check file paths and availability.";
          if(qAuth) qAuth.textContent = "";
      }

    } catch (err) {
      console.error('CRITICAL FAILURE in loadCategoriesAndQuotes:', err);
      if(qText) qText.textContent = "A critical error occurred while loading app data. Please try again.";
      if(qAuth) qAuth.textContent = "";
    }
  }


  function buildAuthorIndex(quoteList, categoryId) {
    if (!Array.isArray(quoteList)) {
        console.warn(`Skipping author indexing for category ${categoryId}: quoteList is not an array. Received:`, quoteList);
        return;
    }
    quoteList.forEach(quote => {
      const by = quote.author || quote.by;
      if (by) {
        const authorKey = by.toLowerCase().trim();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message, // Ensure this matches showQuote
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
            const wrapper = sec.querySelector('.author-search-wrapper');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            wrapper.style.display = isExpanded ? 'none' : 'block';
          });

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
            if(quoteFormSuccess) quoteFormSuccess.style.display = "none";
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
            const list = sec.querySelector('.section-list');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            list.style.display = isExpanded ? 'none' : 'block';
          });
        }
      });
    }
    renderCategoryList(categories, categoryMenu);

    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation(); 
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
    renderMenu(); 
    if(categoryModal) categoryModal.classList.add("open");
    document.body.style.overflow = "hidden"; 
    if(closeMenuBtn) closeMenuBtn.focus(); 
  }
  function closeMenu() {
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
    if(submitQuoteModal) submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  if(customQuoteForm) customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    if(quoteFormSuccess) quoteFormSuccess.style.display = 'block';
    setTimeout(() => {
      if(quoteFormSuccess) quoteFormSuccess.style.display = 'none';
      if(submitQuoteModal) submitQuoteModal.classList.remove('open');
      document.body.style.overflow = "";
    }, 1800);
    customQuoteForm.reset();
  });

  function showQuote(item, cat, fromUndo = false) {
    // Robust check for a valid quote item
    if (!item || (typeof item.text === 'undefined' && typeof item.quote === 'undefined' && typeof item.message === 'undefined')) {
        console.warn("showQuote called with invalid item (missing text, quote, or message):", item);
        if(qText) qText.textContent = "No quote available. Try another category or inspire me again!";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";
        return;
    }

    if (!fromUndo && lastQuote) {
      quoteHistory.unshift(lastQuote); 
      if (quoteHistory.length > 5) quoteHistory.length = 5; 
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";

    if(qText) qText.classList.add('fade-out');
    if(qAuth) qAuth.classList.add('fade-out');

    setTimeout(() => {
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = item.author || item.by || "";
      by = by.replace(/^[-–—\s]+/, "").trim(); 

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
    console.log(`displayQuote called. selectedCat: "${selectedCat}", authorMode: ${authorMode}`);
    if (authorMode && authorQuotes.length > 0) {
      showAuthorQuote();
      return;
    }

    let pool = [];
    // Helper function to filter for valid quotes
    const isValidQuote = q => q && (typeof q.text !== 'undefined' || typeof q.quote !== 'undefined' || typeof q.message !== 'undefined');

    if (selectedCat === 'myfavorites') {
      const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
      pool = favs.filter(isValidQuote);
      console.log("Loading from 'myfavorites'. Original size:", favs.length, "Filtered pool size:", pool.length);
      if (pool.length === 0) {
        if(qText) qText.textContent = "You have no favorite quotes yet, or none are valid. Add some!";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        return;
      }
    } else if (selectedCat === 'user' && Array.isArray(quotes['user'])) {
      pool = quotes['user'].filter(isValidQuote);
      console.log("Loading from 'user' quotes. Original size:", quotes['user'].length, "Filtered pool size:", pool.length);
    } else if (quotes[selectedCat] && Array.isArray(quotes[selectedCat])) {
      pool = quotes[selectedCat].filter(isValidQuote);
      console.log(`Loading from category "${selectedCat}". Original size: ${quotes[selectedCat].length}, Filtered pool size:`, pool.length);
    }
    
    // Fallback if the selected category pool is empty after filtering
    if (!pool || pool.length === 0) {
        console.warn(`Pool for "${selectedCat}" is empty after filtering, or category not found. Falling back to all quotes.`);
        const allQuotesRaw = Object.values(quotes).flat();
        pool = allQuotesRaw.filter(isValidQuote);
        console.log("Fallback to all loaded quotes. Total raw items:", allQuotesRaw.length, "Filtered pool size:", pool.length);
        if (pool.length > 0 && currentCategory && (!selectedCat || !(quotes[selectedCat] && Array.isArray(quotes[selectedCat])))) {
             // Only update if selectedCat was truly invalid or not found
            currentCategory.textContent = "All Quotes";
        }
    }
    
    if (!pool || pool.length === 0) {
        if(qText) qText.textContent = "No valid quotes available for this selection or any category.";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        console.error("CRITICAL: Pool is empty after all fallbacks. No quotes to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    console.log(`Selected random index ${randomIndex} from pool of size ${pool.length} for display.`);
    showQuote(pool[randomIndex], selectedCat || "all_fallback"); // Pass a category, even if it's a fallback identifier
  }


  if(undoBtn) undoBtn.addEventListener("click", () => {
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift(); 
      showQuote(prev, prev.category, true); 
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "" : "none"; 
  });

  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0; 
      magicSound.play().catch(e => console.warn("Audio play failed:", e)); 
    }
    if(quoteBox) quoteBox.classList.add('glow');
    setTimeout(() => { if(quoteBox) quoteBox.classList.remove('glow'); }, 400);

    const wand = genBtn ? genBtn.querySelector('.magic-wand-icon') : null;
    if (wand) {
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    if(genBtn) genBtn.classList.add('touched'); 
    setTimeout(() => {if(genBtn) genBtn.classList.remove('touched');}, 400);

    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = "50%";
    ripple.style.top = "50%";
    if(genBtn) genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700); 
  }

  if(genBtn) {
    genBtn.addEventListener("click", e => {
        triggerGenerateEffects();
        displayQuote();
    });
    genBtn.addEventListener("touchstart", e => {
        triggerGenerateEffects();
         // displayQuote(); // Consider if needed, click usually follows touchstart
    }, {passive: true}); 
  }

  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn, .generate-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent"; 
    btn.addEventListener('touchstart', e => {
      const ripple = document.createElement('span');
      ripple.className = 'ripple'; 
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.touches[0].clientX - rect.left) + 'px';
      ripple.style.top = (e.touches[0].clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600); 
    }, {passive: true}); 
  });

  if(shareBtn) shareBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    if(shareMenu) shareMenu.classList.toggle("open");
    if (shareMenu && shareMenu.classList.contains("open")) {
      document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  });

  function closeShareMenuOnClickOutside(event) {
    if (shareMenu && !shareMenu.contains(event.target) && event.target !== shareBtn && (shareBtn && !shareBtn.contains(event.target))) {
      shareMenu.classList.remove("open");
    } else if (shareMenu && shareMenu.classList.contains("open")) {
         document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }

  if(shareMenu) shareMenu.querySelectorAll('.share-option').forEach(btn => {
    if (btn === sharePngBtn) return; 

    btn.addEventListener('click', function() {
      const quoteContent = qText ? qText.textContent || "" : "";
      const authorContent = qAuth ? (qAuth.textContent || "").replace(/^[-–—\s]+/, "") : ""; 
      const textToShare = `${quoteContent}${authorContent ? ` — ${authorContent}` : ''}`.trim();
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
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(quoteContent.substring(0,100))}...`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(textToShare + " (via " + pageUrl + ")")}`;
          break;
      }
      if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
      shareMenu.classList.remove("open"); 
    });
  });

  async function shareQuoteAsPNG() {
    const nodeToClone = document.getElementById('quoteBox'); 
    if (!nodeToClone) {
        console.error("Quote box element not found for PNG generation.");
        alert("Could not generate image. Element missing.");
        return;
    }

    const virtualNode = nodeToClone.cloneNode(true);
    virtualNode.id = 'virtualQuoteBoxForImage'; 
    virtualNode.style.width = "1080px";       
    virtualNode.style.height = "1080px";      
    virtualNode.style.maxWidth = "none";
    virtualNode.style.maxHeight = "none";
    virtualNode.style.position = "absolute";
    virtualNode.style.left = "-9999px";       
    virtualNode.style.top = "0";
    virtualNode.style.boxSizing = "border-box";
    virtualNode.style.display = "flex";
    virtualNode.style.flexDirection = "column";
    virtualNode.style.justifyContent = "center";
    virtualNode.style.alignItems = "center";
    virtualNode.style.padding = "100px"; 
    virtualNode.style.fontFamily = "'Poppins', sans-serif"; 

    const isDarkMode = document.body.classList.contains('dark');
    virtualNode.style.background = isDarkMode ? "#232336" : "#FFFFFF";
    virtualNode.style.color = isDarkMode ? "#f8f8fa" : "#222222";

    const virtualQuoteMark = virtualNode.querySelector("#quoteMark");
    if (virtualQuoteMark) virtualQuoteMark.style.display = 'none';

    const quoteTextElement = virtualNode.querySelector("#quoteText");
    const authorTextElement = virtualNode.querySelector("#quoteAuthor");

    if (quoteTextElement) {
        quoteTextElement.style.textAlign = "center";
        quoteTextElement.style.fontSize = "56px"; 
        quoteTextElement.style.lineHeight = "1.35";
        quoteTextElement.style.marginBottom = "40px";
        quoteTextElement.style.width = "100%";
        quoteTextElement.style.paddingLeft = "0"; 
        quoteTextElement.style.color = isDarkMode ? "#f8f8fa" : "#222222"; 

        const textLength = quoteTextElement.textContent.length;
        if (textLength > 220) quoteTextElement.style.fontSize = "40px";
        else if (textLength > 140) quoteTextElement.style.fontSize = "48px";
        else if (textLength > 70) quoteTextElement.style.fontSize = "52px";
    }

    if (authorTextElement) {
        authorTextElement.style.textAlign = "center";
        authorTextElement.style.fontSize = "38px";
        authorTextElement.style.marginTop = "25px";
        authorTextElement.style.width = "100%";
        authorTextElement.style.color = isDarkMode ? "#b39ddb" : "#7c5df0"; 
        if (authorTextElement.textContent && !authorTextElement.textContent.includes("—")) {
             const authorContent = authorTextElement.textContent.replace(/^[-–—\s]+/, "").trim();
             if (authorContent) {
                authorTextElement.innerHTML = `<span style="font-size:1em;vertical-align:middle;">&#8213;</span> ${authorContent}`;
             } else {
                authorTextElement.style.display = 'none';
             }
        } else if (!authorTextElement.textContent.replace(/^[-–—\s]+/, "").trim()) {
            authorTextElement.style.display = 'none'; 
        }
    }

    document.body.appendChild(virtualNode); 

    try {
        const dataUrl = await htmlToImage.toPng(virtualNode, {
            width: 1080,
            height: 1080,
            pixelRatio: 2, 
            backgroundColor: virtualNode.style.background, 
        });

        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            ctx.font = "bold 34px 'Poppins', Arial, sans-serif";
            ctx.fillStyle = isDarkMode ? "rgba(248, 248, 250, 0.6)" : "rgba(35, 35, 54, 0.6)";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText("wordsofwisdom.in", canvas.width / 2, canvas.height - 35);

            if(pngPreviewImg) pngPreviewImg.src = canvas.toDataURL("image/png");
            if(pngPreviewModal) pngPreviewModal.classList.add('open');
            document.body.style.overflow = "hidden"; 

            if(downloadPngBtn) downloadPngBtn.onclick = async function() {
                const quoteContentForShare = qText ? qText.textContent || "Inspiring Quote" : "Inspiring Quote";
                const authorContentForShare = qAuth ? (qAuth.textContent || "").replace(/^[-–—\s]+/, "") : "";
                const shareTitle = `Quote by ${authorContentForShare || "Words of Wisdom"}`;
                const shareText = `${quoteContentForShare}${authorContentForShare ? ` — ${authorContentForShare}` : ''}`;

                canvas.toBlob(async blob => {
                    if (!blob) {
                        alert("Error creating image blob.");
                        if(pngPreviewModal) pngPreviewModal.classList.remove('open');
                        document.body.style.overflow = "";
                        return;
                    }
                    const file = new File([blob], "wow-quote.png", { type: "image/png" });
                    try {
                        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                            await navigator.share({
                                files: [file],
                                title: shareTitle,
                                text: shareText,
                            });
                        } else { 
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob); 
                            a.download = "wow-quote.png";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(a.href); 
                        }
                    } catch (error) {
                        console.error("Sharing/Downloading PNG failed:", error);
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = "wow-quote.png";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                        alert("Sharing failed. The image has been downloaded.");
                    } finally {
                        if(pngPreviewModal) pngPreviewModal.classList.remove('open');
                        document.body.style.overflow = "";
                    }
                }, "image/png");
            };
        };
        img.onerror = function() {
            console.error("Error loading dataUrl into image for watermarking.");
            alert("Could not process image for preview.");
        };
        img.src = dataUrl;

    } catch (error) {
        console.error('Error generating PNG with htmlToImage:', error);
        alert('Oops! Could not create the image. Please try again.');
    } finally {
        document.body.removeChild(virtualNode); 
        if(shareMenu) shareMenu.classList.remove("open"); 
    }
  }
  if(sharePngBtn) sharePngBtn.addEventListener('click', shareQuoteAsPNG);

  if(closePngPreviewModal) closePngPreviewModal.onclick = function() {
    if(pngPreviewModal) pngPreviewModal.classList.remove('open');
    document.body.style.overflow = "";
    if(pngPreviewImg) pngPreviewImg.src = ""; 
  };

  if(copyBtn) copyBtn.addEventListener("click", () => {
    const quoteContent = qText ? qText.textContent || "" : "";
    const authorContent = qAuth ? (qAuth.textContent || "").replace(/^[-–—\s]+/, "") : ""; 
    const textToCopy = `${quoteContent}${authorContent ? ` — ${authorContent}` : ''}`.trim();

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
      alert("Could not copy text. Please try again manually.");
    });
  });

  if(favBtn) favBtn.addEventListener('click', () => {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const currentQuoteText = qText ? qText.textContent : "";
    const currentAuthorText = qAuth ? (qAuth.textContent || "").replace(/^[-–—\s]+/, "") : "";

    const isFavorited = favs.some(q => q.text === currentQuoteText && q.author === currentAuthorText);

    const favIcon = favBtn.querySelector("i");
    const tooltip = favBtn.querySelector('.btn-tooltip');
    const originalTooltipText = tooltip ? tooltip.textContent : '';

    if (isFavorited) {
      favs = favs.filter(q => !(q.text === currentQuoteText && q.author === currentAuthorText));
      if(favIcon) favIcon.className = "fa-regular fa-heart"; 
      if(tooltip) tooltip.textContent = "Unfavorited";
    } else {
      favs.push({ text: currentQuoteText, author: currentAuthorText });
      if(favIcon) favIcon.className = "fa-solid fa-heart"; 
      if(tooltip) tooltip.textContent = "Favorited!";
    }

    localStorage.setItem('favQuotes', JSON.stringify(favs));
    favBtn.classList.add('copied-feedback'); 
    updateFavoriteButtonState();

    setTimeout(() => {
        favBtn.classList.remove('copied-feedback');
        if(tooltip) tooltip.textContent = originalTooltipText; 
    }, 1200);
  });

  function updateFavoriteButtonState() {
    if (!favBtn || !lastQuote) return; 
    const favIcon = favBtn.querySelector("i");
    if (!favIcon) return;

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    if (isFavorited) {
        favIcon.className = "fa-solid fa-heart"; 
        favIcon.style.color = "var(--gold)"; 
    } else {
        favIcon.className = "fa-regular fa-heart"; 
        favIcon.style.color = "var(--primary)"; 
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
    updateFavoriteButtonState(); 
  }
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate()-1);
    return d.toISOString().slice(0,10);
  }
  function showStreak(count) {
    if (!streakBadge) return;
    if (count > 1) {
        streakBadge.textContent = `🔥 ${count} day streak!`;
        streakBadge.style.display = ''; 
    } else {
        streakBadge.textContent = '';
        streakBadge.style.display = 'none'; 
    }
  }

  if(submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', async () => {
    const feedback = feedbackTextarea ? feedbackTextarea.value.trim() : "";
    if (!feedback) {
        alert("Please enter your feedback before sending.");
        return;
    }
    const formData = new FormData();
    formData.append("entry.1612485699", feedback); 

    try {
        await fetch("https://docs.google.com/forms/d/e/1FAIpQLSfv0KdY_skqOC2KF97FgMUqhDzAEe8Z4Jk3ZtuG6freUO-Y1A/formResponse", {
            method: "POST",
            mode: "no-cors", 
            body: formData
        });
        if(feedbackSuccess) feedbackSuccess.style.display = 'block'; 
        if(feedbackTextarea) feedbackTextarea.value = ''; 
        setTimeout(() => {
            if(feedbackSuccess) feedbackSuccess.style.display = 'none';
            if(feedbackModal) feedbackModal.classList.remove('open');
            document.body.style.overflow = ""; 
        }, 2000); 
    } catch (error) {
        console.error("Feedback submission error:", error);
        alert("Failed to send feedback. Please check your internet connection or try again later.");
    }
  });

  if(feedbackBtn) feedbackBtn.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    if(feedbackTextarea) feedbackTextarea.value = ''; 
    if(feedbackSuccess) feedbackSuccess.style.display = 'none'; 
    if(feedbackTextarea) feedbackTextarea.focus(); 
  });
  if(closeFeedbackModal) closeFeedbackModal.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  function openFavoritesModal() {
    if(favModal) favModal.classList.add('open');
    document.body.style.overflow = "hidden";
    showFavorites();
    const firstFocusable = favModal ? favModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') : null;
    if (firstFocusable) firstFocusable.focus();
  }
  if(closeFavModal) closeFavModal.addEventListener('click', () => {
    if(favModal) favModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  if (closeFavModalLarge) { 
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

      favQuotesList.querySelectorAll('.remove-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.closest('.fav-quote').dataset.index);
            removeFavorite(index);
        });
      });
      favQuotesList.querySelectorAll('.copy-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const text = quoteDiv.querySelector('p:first-child').textContent;
            const author = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[-–—\s]+/, "");
            copyFavorite(text, author, this);
        });
      });
      favQuotesList.querySelectorAll('.share-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const text = quoteDiv.querySelector('p:first-child').textContent;
            const author = (quoteDiv.querySelector('p.author').textContent || "").replace(/^[-–—\s]+/, "");
            shareFavorite(text, author);
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

  window.copyFavorite = function(text, author, buttonElement) {
    const textToCopy = `${text}${author ? ` — ${author}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        if(buttonElement){
            const originalIcon = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fa-solid fa-check"></i>';
            setTimeout(() => { buttonElement.innerHTML = originalIcon; }, 1200);
        }
    }).catch(err => console.error("Copying favorite failed:", err));
  };

  window.shareFavorite = function(text, author) {
    const shareText = `${text}${author ? ` — ${author}` : ''}`.trim();
    if (navigator.share) {
      navigator.share({ title: `Quote by ${author || 'Words of Wisdom'}`, text: shareText })
        .catch(err => console.error("Sharing favorite failed:", err));
    } else {
      navigator.clipboard.writeText(shareText).then(() => alert("Quote copied to clipboard! Share it manually."))
                         .catch(() => alert("Could not copy. Please share manually."));
    }
  };

  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => {
        modal.classList.remove("open");
      });
      document.body.style.overflow = ""; 
      if (openModals.length > 0 && openMenuBtn) openMenuBtn.focus(); 
    }
    if (e.key === "Enter" && document.activeElement && document.activeElement.tagName === 'BUTTON') {
      if (document.activeElement === genBtn) {
        triggerGenerateEffects();
        displayQuote();
      }
    }
  });

  function recordCategoryUse(cat) {
    if (!cat) return;
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    usage[cat] = (usage[cat] || 0) + 1;
    localStorage.setItem('catUsage', JSON.stringify(usage));
  }
  function getTopCategory() {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    const sortedUsage = Object.entries(usage).sort(([,a],[,b]) => b-a);
    return sortedUsage.length > 0 ? sortedUsage[0][0] : null;
  }

  function requestNotificationPermission() {
      if ('Notification' in window) {
        if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                }
            });
        }
      }
  }

  function sendDailyQuoteNotification() {
    if (Notification.permission === 'granted' && lastQuote && lastQuote.text) {
      const text = `${lastQuote.text}${lastQuote.author ? ` — ${lastQuote.author}` : ''}`.trim();
      const notification = new Notification('WOW Quote of the Day ✨', {
          body: text,
          icon: 'https://quotes-app.wordsofwisdom.in/images/apple-touch-icon.png' 
      });
      notification.onclick = function() {
          window.focus(); 
          this.close();
      };
    }
  }

  function scheduleDailyNotification() {
    const now = new Date();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    const todayStr = now.toISOString().slice(0,10);

    if (lastNotificationDate === todayStr) return; 

    const nineAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
    let delay = nineAM.getTime() - now.getTime();

    if (delay < 0) { 
        if (Notification.permission === 'granted') {
            // sendDailyQuoteNotification(); // Optionally send immediately if past 9 AM and not sent today
            // localStorage.setItem('lastNotificationDate', todayStr);
        }
        return; 
    }

    setTimeout(() => {
      sendDailyQuoteNotification();
      localStorage.setItem('lastNotificationDate', todayStr);
    }, delay);
  }

  (async function initApp(){
    console.log("Initializing app...");
    if(qText) qText.textContent = "✨ Loading Wisdom...";
    if(qAuth) qAuth.textContent = "";
    if(quoteMark) {
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
    }

    await loadCategoriesAndQuotes(); 
    console.log("loadCategoriesAndQuotes finished. Current quotes object:", JSON.parse(JSON.stringify(quotes)));
    console.log("Current categories array:", JSON.parse(JSON.stringify(categories)));

    renderMenu(); 
    console.log("Menu rendered.");

    const topCat = getTopCategory();
    console.log("Top category from usage:", topCat);
    selectedCat = topCat || "inspiration"; 
    console.log("Selected category for initial load (after topCat/default):", selectedCat);
    if (currentCategory) currentCategory.textContent = capitalize(selectedCat);

    showRotatingBanner(); 
    console.log("showRotatingBanner finished. Last quote state:", lastQuote ? JSON.parse(JSON.stringify(lastQuote)) : "null");

    if (!lastQuote || !lastQuote.text) {
        console.warn("Initial quote not set by banner/topCat logic. Attempting to load a default quote from 'inspiration'.");
        selectedCat = "inspiration"; 
        if (currentCategory) currentCategory.textContent = capitalize(selectedCat);
        displayQuote(); 
        console.log("Fallback displayQuote called for 'inspiration'. Last quote state:", lastQuote ? JSON.parse(JSON.stringify(lastQuote)) : "null");
    }

    if ((!lastQuote || !lastQuote.text) && qText && qText.textContent.includes("Loading Wisdom")) { // Check if still loading
        console.error("Still no quote loaded after all fallbacks. Displaying error to user.");
        qText.textContent = "Sorry, we couldn't load any quotes right now. Please try again later.";
        if(qAuth) qAuth.textContent = "";
    }
    
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
    updateFavoriteButtonState(); 

    requestNotificationPermission(); 
    scheduleDailyNotification(); 
    console.log("App initialization complete.");
  })();
});
