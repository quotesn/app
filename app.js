/**
 * WOW Quotes Application
 * Main JavaScript file for handling quote generation, UI interactions,
 * theme switching, local storage for favorites and streaks,
 * and image generation of quotes.
 */
document.addEventListener("DOMContentLoaded", () => {
  // DOM Element References
  const qText = document.getElementById("quoteText");
  const qAuth = document.getElementById("quoteAuthor");
  const quoteBox = document.getElementById("quoteBox");
  const quoteMark = document.getElementById("quoteMark");
  const genBtn = document.getElementById("generateBtn");
  const shareBtn = document.getElementById("shareBtn");
  const copyBtn = document.getElementById("copyBtn");
  const favBtn = document.getElementById("favBtn");
  const themeSw = document.getElementById("themeSwitch");
  const openMenuBtn = document.getElementById("openMenuBtn");
  const categoryModal = document.getElementById("categoryModal");
  const closeMenuBtn = document.getElementById("closeMenuBtn");
  const currentCategory = document.getElementById("currentCategory");
  const categoryMenu = document.getElementById("categoryMenu");
  const streakBadge = document.getElementById("streakBadge");
  const shareMenu = document.getElementById("shareMenu");
  const submitQuoteModal = document.getElementById("submitQuoteModal");
  const closeSubmitQuoteModal = document.getElementById("closeSubmitQuoteModal");
  const customQuoteForm = document.getElementById("customQuoteForm");
  const submitCustomQuoteBtn = document.getElementById("submitCustomQuoteBtn");
  const quoteFormSuccess = document.getElementById("quoteFormSuccess");
  const favModal = document.getElementById('favModal');
  const closeFavModal = document.getElementById('closeFavModal');
  const favQuotesList = document.getElementById('favQuotesList');
  const specialBanner = document.getElementById('specialBanner');
  const bannerText = document.getElementById('bannerText');
  const closeBannerBtn = document.getElementById('closeBannerBtn');
  const closeFavModalLarge = document.getElementById('closeFavModalLarge');
  const undoBtn = document.getElementById('undoBtn');
  const feedbackBtn = document.getElementById('feedbackBtn');
  const feedbackModal = document.getElementById('feedbackModal');
  const closeFeedbackModal = document.getElementById('closeFeedbackModal');
  const feedbackForm = document.getElementById('feedbackForm'); // For feedback
  const feedbackTextarea = document.getElementById('feedbackTextarea');
  const submitFeedbackBtn = document.getElementById('submitFeedbackBtn');
  const feedbackSuccess = document.getElementById('feedbackSuccess');
  const magicSound = document.getElementById('magicSound');
  const favSound = document.getElementById('favSound');

  // DOM references for Image Generation Modal
  const quoteImagePreviewContainer = document.getElementById('quoteImagePreviewContainer');
  const quoteImageWrapper = document.getElementById('quoteImageWrapper'); // The element to be captured
  const imageQuoteText = document.getElementById('imageQuoteText');
  const imageQuoteAuthor = document.getElementById('imageQuoteAuthor');
  const downloadImageBtn = document.getElementById('downloadImageBtn');
  const shareGeneratedImageBtn = document.getElementById('shareGeneratedImageBtn');
  const closeImagePreviewBtn = document.getElementById('closeImagePreviewBtn');
  const generateImageShareOption = document.getElementById('generateImageShareOption'); 

  // Application State
  let categories = [];
  let quotes = {}; // Stores quotes by category ID
  let authors = {}; // Index for searching authors
  let selectedCat = "inspiration"; // Default category
  let lastQuote = null; // { text: "...", author: "...", category: "..." }
  let quoteHistory = []; // For undo functionality
  let authorMode = false; // True if browsing quotes by a specific author
  let authorQuotes = []; // Quotes for the currently selected author
  let authorName = ""; // Name of the currently selected author
  let authorQuoteIndex = 0; // Index for iterating through author's quotes
  let debounceTimer = null; // For debouncing input in author search
  let currentCanvas = null; // Stores the generated canvas for image share/download

  // Banner themes and styles - (Keep your full list here)
  const bannerThemes = [
    {cat: "inspiration",    text: "Ignite fresh ideas to fuel your week."},
    {cat: "motivation",     text: "Power up your ambition and take the lead."},
    // ... Add all your banner themes
  ];
  const bannerStyles = {
    inspiration:    { color: "#7c5df0", icon: "💡" },
    motivation:     { color: "#ff9800", icon: "⚡" },
    // ... Add all your banner styles
  };

  /**
   * Capitalizes the first letter of each word in a string and replaces underscores with spaces.
   * @param {string} str - The input string.
   * @returns {string} The capitalized string.
   */
  function capitalize(str) {
    if (!str) return "";
    return str.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Shows a rotating daily banner with a theme and message.
   * Updates the selected category based on the banner.
   */
  function showRotatingBanner() {
    if (!specialBanner || !bannerText || !closeBannerBtn) return;

    const today = new Date();
    const startDate = new Date("2024-01-01"); // A fixed start date for consistent rotation
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const idx = ((daysSinceStart % bannerThemes.length) + bannerThemes.length) % bannerThemes.length;
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");

    // Only show banner once per day unless forced
    if (lastBannerDate === todayStr && specialBanner.style.display === 'none' && !localStorage.getItem("bannerForceShow")) return;

    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span class="banner-icon" style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;

    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "flex"; // Use flex for better alignment
    specialBanner.style.background = style.color ? style.color : "linear-gradient(90deg, #ffd700 0%, #7c5df0 100%)";
    // Adjust text color for better contrast on certain banner backgrounds
    specialBanner.style.color = (style.color === "#ffd700" || style.color === "#aeea00" || style.color === "#FFEB3B") ? "#222" : "#fff";


    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr);
      localStorage.removeItem("bannerForceShow"); // Clear force show flag
    };
    // Auto-hide banner after 8 seconds
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){
          specialBanner.style.display = "none";
          localStorage.setItem("wowBannerDate", todayStr);
          localStorage.removeItem("bannerForceShow");
      }
    }, 8000);

    // Update selected category from banner and display a quote from it
    selectedCat = theme.cat;
    authorMode = false;
    if(currentCategory) currentCategory.textContent = capitalize(theme.cat);
    // console.log(`Banner set category to: ${selectedCat}`);
    localStorage.setItem("lastAutoSelectedCategory", theme.cat); // Store for initial load logic
    displayQuote(); // Display a quote from the banner's category
  }

  /**
   * Fetches JSON data from a URL, using localStorage for caching.
   * @param {string} url - The URL to fetch JSON from.
   * @param {string} cacheKey - The localStorage key for caching.
   * @returns {Promise<object|Array>} The fetched JSON data.
   */
  async function fetchJSON(url, cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {
          console.warn(`Invalid JSON in cache for ${cacheKey}. Fetching fresh data.`, e);
          localStorage.removeItem(cacheKey); // Remove corrupted cache
        }
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
      // Potentially return a default/empty structure or re-throw
      throw e; 
    }
  }

  /**
   * Loads categories and their corresponding quotes from JSON files.
   * Builds an index of authors for searching.
   */
  async function loadCategoriesAndQuotes() {
    try {
      // Attempt to load categories.json from data/ first, then root
      try {
        categories = await fetchJSON('data/categories.json', 'wowCategories');
      } catch (e) {
        console.warn("Could not load categories.json from data/, trying root...");
        categories = await fetchJSON('categories.json', 'wowCategoriesRoot');
      }

      if (!categories || categories.length === 0) {
        console.error("CRITICAL: categories.json is empty or could not be loaded.");
        if(qText) qText.textContent = "Error: Main category data could not be loaded.";
        if(qAuth) qAuth.textContent = "";
        return;
      }

      const quotePromises = [];
      // Recursive function to collect categories and their quote files
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) {
            collectCategories(cat.children);
          } else if (cat.file) {
            // Try fetching from primary path (e.g., data/quotes_inspiration.json)
            // then fallback to root path (e.g., quotes_inspiration.json)
            const originalPath = cat.file;
            let pathAttempt1 = originalPath;
            let pathAttempt2 = null;
            if (originalPath && originalPath.startsWith('data/')) {
                pathAttempt2 = originalPath.substring(5); 
            }

            const fetchAndProcessQuoteFile = async (filePath, cacheKeyPrefix) => {
                try {
                    const data = await fetchJSON(filePath, cacheKeyPrefix + cat.id);
                    if (Array.isArray(data)) {
                        quotes[cat.id] = data;
                        buildAuthorIndex(data, cat.id);
                        return true; // Success
                    }
                    console.warn(`Invalid data structure in ${filePath} for category ${cat.id}. Expected Array, received:`, typeof data);
                    return false; 
                } catch (err) {
                    console.error(`Attempt to fetch/process ${filePath} for category ${cat.id} failed.`);
                    return false; 
                }
            };
            quotePromises.push(
                fetchAndProcessQuoteFile(pathAttempt1, 'wowQuotes_').then(success => {
                    if (!success && pathAttempt2) {
                        console.warn(`Failed to load ${pathAttempt1}, trying fallback ${pathAttempt2} for category ${cat.id}`);
                        return fetchAndProcessQuoteFile(pathAttempt2, 'wowQuotesRoot_');
                    }
                    return success; 
                })
            );
          }
        });
      }
      collectCategories(categories);

      // Load user-submitted quotes if they exist (Example, not fully implemented in this snippet)
      // if (localStorage.getItem('userQuotes')) { /* ... */ }
      
      await Promise.all(quotePromises);

      if (Object.keys(quotes).length === 0) {
          if(qText) qText.textContent = "No quote data could be loaded. Please check your connection or try again later.";
          if(qAuth) qAuth.textContent = "";
      }
    } catch (err) {
      console.error('CRITICAL FAILURE in loadCategoriesAndQuotes:', err);
      if(qText) qText.textContent = "A critical error occurred while loading app data.";
      if(qAuth) qAuth.textContent = "";
    }
  }

  /**
   * Builds an index of authors from a list of quotes.
   * @param {Array} quoteList - The list of quotes.
   * @param {string} categoryId - The ID of the category these quotes belong to.
   */
  function buildAuthorIndex(quoteList, categoryId) {
    if (!Array.isArray(quoteList)) return;
    quoteList.forEach(quote => {
      const by = (quote.author || quote.by || "").trim();
      if (by) {
        const authorKey = by.toLowerCase(); // Use lowercase for consistent indexing
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          author: by, // Store the original cased author name
          category: categoryId
        });
      }
    });
  }

  /**
   * Renders the category navigation menu.
   */
  function renderMenu() {
    // ... (Full implementation from previous versions, ensure it's robust)
    // This function should populate #categoryMenu with sections, links, author search etc.
    // Example of a simplified link:
    // const link = document.createElement('a');
    // link.href = '#';
    // link.dataset.cat = 'some_category_id';
    // link.textContent = 'Some Category';
    // link.onclick = (e) => { /* handle category selection */ };
    // categoryMenu.appendChild(link);
    if (!categoryMenu || !categories) return;
    categoryMenu.innerHTML = ""; // Clear previous menu

    function createListItem(item, isSubItem = false) {
        const li = document.createElement("li");
        if (item.id === 'search_author_section') { // Special handling for author search section
            li.innerHTML = `
                <div class="section search-section">
                    <button class="section-btn" aria-expanded="false" aria-controls="authorSearchWrapper">
                        <i class="fa-solid fa-user section-icon"></i>Search by Author 
                        <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                    </button>
                    <div id="authorSearchWrapper" class="author-search-wrapper" style="display: none;">
                        <input id="authorSearch" type="text" placeholder="Type author name…" autocomplete="off" aria-label="Search by author name" />
                        <ul id="authorList" class="suggestions-list" role="listbox"></ul>
                    </div>
                </div>`;
            const searchBtn = li.querySelector('.section-btn');
            const searchWrapper = li.querySelector('#authorSearchWrapper');
            searchBtn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', String(!isExpanded));
                searchWrapper.style.display = isExpanded ? 'none' : 'block';
                if (!isExpanded) searchWrapper.querySelector('input').focus();
                this.querySelector('.fa-chevron-down, .fa-chevron-up').classList.toggle('fa-chevron-up', !isExpanded);
                this.querySelector('.fa-chevron-down, .fa-chevron-up').classList.toggle('fa-chevron-down', isExpanded);
            });
             // Author search input handling
            const authorInput = li.querySelector("#authorSearch");
            const authorListUL = li.querySelector("#authorList");
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
                      const authorLi = document.createElement("li");
                      authorLi.setAttribute('role', 'option');
                      authorLi.textContent = authors[nameKey][0].author; 
                      authorLi.tabIndex = -1; 
                      authorLi.addEventListener("click", () => {
                        authorMode = true;
                        authorName = nameKey; 
                        authorQuotes = [...authors[nameKey]]; 
                        authorQuoteIndex = 0; 
                        if(currentCategory) currentCategory.textContent = "Author: " + authors[nameKey][0].author;
                        closeMenu();
                        showAuthorQuote(); 
                        recordCategoryUse('author_search');
                      });
                      authorListUL.appendChild(authorLi);
                    });
                }, 300); 
              });
            }
            return li;
        }


        if (item.id === 'view_favorites_section') {
            li.innerHTML = `<button class="section-btn static-link"><i class="fa-solid fa-heart section-icon"></i>View Favorites</button>`;
            li.querySelector('button').addEventListener('click', () => { openFavoritesModal(); closeMenu(); });
            return li;
        }
        if (item.id === 'my_favorites_quotes_section') {
             li.innerHTML = `<button class="section-btn static-link"><i class="fa-solid fa-star section-icon"></i>Quotes from My Favorites</button>`;
             li.querySelector('button').addEventListener('click', () => {
                selectedCat = "myfavorites";
                authorMode = false;
                if(currentCategory) currentCategory.textContent = "My Favorites";
                closeMenu();
                displayQuote();
                recordCategoryUse('myfavorites');
             });
             return li;
        }

        if (item.id === 'submit_quote_section') {
            li.innerHTML = `<button class="section-btn static-link"><i class="fa-solid fa-plus section-icon"></i>Submit a Quote</button>`;
            li.querySelector('button').addEventListener('click', () => {
                if(submitQuoteModal) submitQuoteModal.classList.add('open');
                document.body.style.overflow = "hidden";
                if(customQuoteForm) customQuoteForm.reset();
                if(quoteFormSuccess) quoteFormSuccess.style.display = 'none';
                // Reset spinner and button state
                const submitBtnText = submitCustomQuoteBtn.querySelector('.submit-btn-text');
                const submitSpinner = submitCustomQuoteBtn.querySelector('.loader-spinner');
                if(submitBtnText) submitBtnText.style.display = 'inline';
                if(submitSpinner) submitSpinner.style.display = 'none';
                if(submitCustomQuoteBtn) submitCustomQuoteBtn.disabled = false;
                closeMenu();
            });
            return li;
        }
        
        // Regular category or sub-category
        const hasChildren = item.children && item.children.length > 0;
        const uniqueId = `${item.id || 'cat'}-${Math.random().toString(36).substring(2,9)}`;

        if (isSubItem || !hasChildren) { // Leaf node or sub-item without further children to expand
            const link = document.createElement('a');
            link.href = "#";
            link.dataset.cat = item.id;
            if (item.icon) link.innerHTML += `<i class="fa-solid ${item.icon}" aria-hidden="true"></i>`;
            link.appendChild(document.createTextNode(item.name));
            link.addEventListener('click', function(e) {
                e.preventDefault();
                selectedCat = this.dataset.cat;
                authorMode = false;
                if(currentCategory) currentCategory.textContent = capitalize(item.name);
                closeMenu();
                displayQuote();
                recordCategoryUse(selectedCat);
            });
            li.appendChild(link);
        } else { // Parent category with children (expandable section)
            li.innerHTML = `
                <button class="section-btn" aria-expanded="false" aria-controls="list-${uniqueId}">
                    ${item.icon ? `<i class="fa-solid ${item.icon} section-icon"></i>` : ""}
                    ${item.name}
                    <i class="fa-solid fa-chevron-down" aria-hidden="true"></i>
                </button>
                <ul class="section-list" id="list-${uniqueId}" style="display: none;"></ul>`;
            
            const sectionBtn = li.querySelector('.section-btn');
            const subListUl = li.querySelector(`#list-${uniqueId}`);
            
            sectionBtn.addEventListener('click', function() {
                const isExpanded = this.getAttribute('aria-expanded') === 'true';
                this.setAttribute('aria-expanded', String(!isExpanded));
                subListUl.style.display = isExpanded ? 'none' : 'block';
                this.querySelector('.fa-chevron-down, .fa-chevron-up').classList.toggle('fa-chevron-up', !isExpanded);
                this.querySelector('.fa-chevron-down, .fa-chevron-up').classList.toggle('fa-chevron-down', isExpanded);
            });
            item.children.forEach(child => {
                subListUl.appendChild(createListItem(child, true)); // Pass true for isSubItem
            });
        }
        return li;
    }

    // Create main sections: Search, Static Links, then Categories
    const menuStructure = [
        { id: 'search_author_section', name: 'Search by Author' }, // Placeholder for search
        { id: 'view_favorites_section', name: 'View Favorites' },
        { id: 'my_favorites_quotes_section', name: 'Quotes from My Favorites'},
        { id: 'submit_quote_section', name: 'Submit a Quote' },
        ...categories // Spread the actual categories from JSON
    ];

    const ul = document.createElement('ul');
    ul.className = 'category-main-list'; // Add a class for potential top-level styling
    menuStructure.forEach(item => {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'section'; // Each item gets a section wrapper
        sectionDiv.appendChild(createListItem(item));
        ul.appendChild(sectionDiv);
    });
    categoryMenu.appendChild(ul);
  }


  /**
   * Opens the category menu modal.
   */
  function openMenu() {
    renderMenu(); // Re-render menu each time it opens
    if(categoryModal) categoryModal.classList.add("open");
    document.body.style.overflow = "hidden"; 
    if(closeMenuBtn) closeMenuBtn.focus(); 
  }

  /**
   * Closes the category menu modal.
   */
  function closeMenu() {
    if(categoryModal) categoryModal.classList.remove("open");
    document.body.style.overflow = ""; 
    if(openMenuBtn) openMenuBtn.focus(); 
  }

  // Event listeners for menu
  if(openMenuBtn) openMenuBtn.addEventListener("click", openMenu);
  if(closeMenuBtn) closeMenuBtn.addEventListener("click", closeMenu);
  if(categoryModal) categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu(); // Close if clicking on modal backdrop
  });
  
  // Submit Quote Modal Logic
  if(closeSubmitQuoteModal) closeSubmitQuoteModal.addEventListener('click', () => {
    if(submitQuoteModal) submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  if(customQuoteForm) customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const submitBtnText = submitCustomQuoteBtn ? submitCustomQuoteBtn.querySelector('.submit-btn-text') : null;
    const spinner = submitCustomQuoteBtn ? submitCustomQuoteBtn.querySelector('.loader-spinner') : null;

    if(submitBtnText) submitBtnText.classList.add('hidden'); // Hide text
    if(spinner) spinner.style.display = 'inline-block'; // Show spinner
    if(submitCustomQuoteBtn) submitCustomQuoteBtn.disabled = true;

    // Simulate submission (replace with actual submission logic if any)
    setTimeout(() => {
        if(quoteFormSuccess) {
            quoteFormSuccess.textContent = "Thank you! Your quote was submitted."; 
            quoteFormSuccess.style.display = 'block';
        }

        if(submitBtnText) submitBtnText.classList.remove('hidden');
        if(spinner) spinner.style.display = 'none';
        if(submitCustomQuoteBtn) submitCustomQuoteBtn.disabled = false;
        if(customQuoteForm) customQuoteForm.reset();

        setTimeout(() => {
          if(quoteFormSuccess) quoteFormSuccess.style.display = 'none';
          if(submitQuoteModal) submitQuoteModal.classList.remove('open');
          document.body.style.overflow = "";
        }, 2500);
    }, 1500);
  });


  /**
   * Displays a quote in the UI.
   * @param {object} item - The quote object {text, author, category}.
   * @param {string} cat - The category of the quote.
   * @param {boolean} [fromUndo=false] - True if the quote is being displayed from history.
   */
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
      quoteHistory.unshift(lastQuote); // Add to history (LIFO)
      if (quoteHistory.length > 5) quoteHistory.length = 5; // Limit history size
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none";

    // Fade out current quote
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

  /**
   * Shows the next quote from the currently selected author.
   */
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

  /**
   * Displays a random quote from the selected category or author.
   */
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
    } else if (quotes[selectedCat] && Array.isArray(quotes[selectedCat])) {
      pool = quotes[selectedCat].filter(isValidQuote);
    }


    // Fallback if selected category has no quotes or is invalid
    if (!pool || pool.length === 0) {
        console.warn(`No quotes in category "${selectedCat}", falling back to all quotes.`);
        const allQuotesRaw = Object.values(quotes).flat(); 
        pool = allQuotesRaw.filter(isValidQuote);
        if (pool.length > 0 && currentCategory && (!selectedCat || !(quotes[selectedCat] && Array.isArray(quotes[selectedCat])))) {
            if(currentCategory) currentCategory.textContent = "All Quotes"; // Update UI
            selectedCat = "all_fallback"; // Mark that we're using a fallback
        }
    }

    if (!pool || pool.length === 0) {
        if(qText) qText.textContent = "No valid quotes available for this selection or any category.";
        if(qAuth) qAuth.textContent = "";
        lastQuote = null;
        updateFavoriteButtonState();
        console.error("CRITICAL: Quote pool is empty after all fallbacks. No quotes to display.");
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    showQuote(pool[randomIndex], selectedCat); 
  }

  // Undo Button Event Listener
  if(undoBtn) undoBtn.addEventListener("click", () => {
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift(); 
      showQuote(prev, prev.category, true); 
    }
    if(undoBtn) undoBtn.style.display = quoteHistory.length > 0 ? "flex" : "none"; 
  });

  /**
   * Triggers visual and audio effects when generating a new quote.
   */
  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0; 
      magicSound.play().catch(e => console.warn("Audio play failed for magicSound:", e));
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

    // Ripple effect for generate button
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    ripple.style.left = "50%"; 
    ripple.style.top = "50%";
    if(genBtn) genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700); 
  }

  // Generate Button Event Listener
  if(genBtn) {
    genBtn.addEventListener("click", e => {
        triggerGenerateEffects();
        displayQuote(); 
    });
  }

  // Ripple effect for other icon buttons
  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn, .share-option, .fav-action-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent"; 
    btn.addEventListener('click', function(e) {
      // Prevent ripple if the click is on a disabled button (though CSS should handle pointer-events)
      if (btn.disabled) return;
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      ripple.style.left = (e.clientX - rect.left) + 'px';
      ripple.style.top = (e.clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  });


  // Share Menu Toggle
  if(shareBtn) shareBtn.addEventListener("click", (e) => {
    e.stopPropagation(); 
    if(shareMenu) shareMenu.classList.toggle("open");
    if (shareMenu && shareMenu.classList.contains("open")) {
      setTimeout(() => { 
        document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
      }, 0);
    }
  });

  function closeShareMenuOnClickOutside(event) {
    if (shareMenu && shareMenu.classList.contains("open") && !shareMenu.contains(event.target) && event.target !== shareBtn && (shareBtn && !shareBtn.contains(event.target))) {
      shareMenu.classList.remove("open");
    } else if (shareMenu && shareMenu.classList.contains("open")) {
         document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }

  // Share Options (Twitter, Facebook, etc.)
  if(shareMenu) shareMenu.querySelectorAll('.share-option').forEach(btn => {
    if (btn.id === 'generateImageShareOption') return; // Handled separately

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
        // Add more cases for LinkedIn, WhatsApp etc.
      }
      if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
      if(shareMenu) shareMenu.classList.remove("open"); 
    });
  });


  // Copy to Clipboard
  if(copyBtn) copyBtn.addEventListener("click", () => {
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
      // Add error feedback if desired
    });
  });

  // Favorite Button
  if(favBtn) favBtn.addEventListener('click', () => {
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
      favs.push({ text: currentQuoteText, author: currentAuthorText, category: lastQuote.category }); // Store category too
      if(favSound) favSound.play().catch(e => console.warn("Fav sound play failed", e));
      if(savedPopup) savedPopup.textContent = "Saved!";
    }

    localStorage.setItem('favQuotes', JSON.stringify(favs)); 
    updateFavoriteButtonState(); 

    if(favBtn) favBtn.classList.add('show-saved-popup');
    setTimeout(() => {
        if(favBtn) favBtn.classList.remove('show-saved-popup');
    }, 1200);
  });

  /**
   * Updates the visual state (icon) of the favorite button.
   */
  function updateFavoriteButtonState() {
    if (!favBtn) return;
    const favIcon = favBtn.querySelector("i");
    if (!favIcon) return;
    
    if (!lastQuote || !lastQuote.text) { // No current quote to check
        favIcon.className = "fa-regular fa-heart"; 
        return;
    }

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    favIcon.className = isFavorited ? "fa-solid fa-heart" : "fa-regular fa-heart";
  }


  // Theme Switch (Dark/Light Mode)
  if(themeSw) {
    const savedTheme = localStorage.getItem("wowDark");
    if (savedTheme === "true") { 
        themeSw.checked = true;
        document.body.classList.add("dark");
    } else {
        document.body.classList.remove("dark"); // Ensure it's not dark if not saved or saved as false
    }
    themeSw.addEventListener("change", () => { 
        const isDark = themeSw.checked;
        document.body.classList.toggle("dark", isDark);
        localStorage.setItem("wowDark", isDark); 
    });
  }


  // Daily Streak Logic
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
        streakBadge.innerHTML = ''; // Clear content
        streakBadge.style.display = 'none';
    }
  }

  // Feedback Modal
  if(feedbackBtn) feedbackBtn.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    if(feedbackTextarea) feedbackTextarea.value = ''; 
    if(feedbackSuccess) feedbackSuccess.style.display = 'none';
    
    const feedbackSubmitBtnText = submitFeedbackBtn ? submitFeedbackBtn.querySelector('.submit-btn-text') : null;
    const feedbackSpinner = submitFeedbackBtn ? submitFeedbackBtn.querySelector('.loader-spinner') : null;
    if(feedbackSubmitBtnText) feedbackSubmitBtnText.classList.remove('hidden');
    if(feedbackSpinner) feedbackSpinner.style.display = 'none';
    if(submitFeedbackBtn) submitFeedbackBtn.disabled = false;
    if(feedbackTextarea) feedbackTextarea.focus();
  });

  if(closeFeedbackModal) closeFeedbackModal.addEventListener('click', () => {
    if(feedbackModal) feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  
  // Handle feedback form submission (using the button click as form submission is prevented)
  if(submitFeedbackBtn) submitFeedbackBtn.addEventListener('click', async () => {
    const feedback = feedbackTextarea ? feedbackTextarea.value.trim() : "";
    if (!feedback) {
        if (feedbackTextarea) {
            feedbackTextarea.placeholder = "Please enter your feedback first!";
            feedbackTextarea.focus();
            setTimeout(() => { if(feedbackTextarea) feedbackTextarea.placeholder = "Your feedback, suggestions, or issues...";}, 2000);
        }
        return;
    }

    const submitBtnText = submitFeedbackBtn.querySelector('.submit-btn-text');
    const spinner = submitFeedbackBtn.querySelector('.loader-spinner');

    if(submitBtnText) submitBtnText.classList.add('hidden');
    if(spinner) spinner.style.display = 'inline-block';
    submitFeedbackBtn.disabled = true;

    // Simulate feedback submission (replace with actual submission logic)
    setTimeout(async () => {
            if(feedbackSuccess) {
                feedbackSuccess.textContent = "Thank you for your feedback!";
                feedbackSuccess.style.display = 'block';
            }
            if(feedbackTextarea) feedbackTextarea.value = ''; 

            if(submitBtnText) submitBtnText.classList.remove('hidden');
            if(spinner) spinner.style.display = 'none';
            submitFeedbackBtn.disabled = false;

            setTimeout(() => {
                if(feedbackSuccess) feedbackSuccess.style.display = 'none';
                if(feedbackModal) feedbackModal.classList.remove('open');
                document.body.style.overflow = "";
            }, 2500);
    }, 1500);
  });


  // Favorites Modal
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
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favQuote = currentFavs[index];
            if (favQuote) copyFavorite(favQuote.text, favQuote.author, this);
        });
      });
      favQuotesList.querySelectorAll('.share-fav-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const quoteDiv = this.closest('.fav-quote');
            const index = parseInt(quoteDiv.dataset.index);
            const currentFavs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
            const favQuote = currentFavs[index];
            if (favQuote) shareFavorite(favQuote.text, favQuote.author);
        });
      });
  }

  function removeFavorite(idx) { 
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites(); 
    updateFavoriteButtonState(); 
  };

  function copyFavorite(text, cleanAuthor, buttonElement) {
    const textToCopy = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    navigator.clipboard.writeText(textToCopy).then(() => {
        if(buttonElement){ 
            const originalIconHTML = buttonElement.innerHTML;
            buttonElement.innerHTML = '<i class="fa-solid fa-check" style="color: var(--green-accent);"></i>';
            setTimeout(() => { buttonElement.innerHTML = originalIconHTML; }, 1200);
        }
    }).catch(err => console.error("Copying favorite failed:", err));
  };

  function shareFavorite(text, cleanAuthor) {
    const shareText = `${text}${cleanAuthor ? ` — ${cleanAuthor}` : ''}`.trim();
    if (navigator.share) { 
      navigator.share({ title: `Quote by ${cleanAuthor || 'Words of Wisdom'}`, text: shareText, url: window.location.href })
        .catch(err => {
            if (err.name !== 'AbortError') { 
                console.error("Sharing favorite failed:", err);
            }
        });
    } else { 
      navigator.clipboard.writeText(shareText).then(() => alert("Quote copied! You can now paste it to share."))
                         .catch(() => alert("Could not copy quote. Please share manually."));
    }
  };

  // Global Escape Key Listener for Modals
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => modal.classList.remove("open"));
      
      if (quoteImagePreviewContainer && quoteImagePreviewContainer.style.display === 'flex') {
        closeImagePreview();
      }
      document.body.style.overflow = ""; 

      if (shareMenu && shareMenu.classList.contains("open")) {
          shareMenu.classList.remove("open");
      }
    }
  });

  /**
   * Records the usage of a category.
   * @param {string} cat - The category ID.
   */
  function recordCategoryUse(cat) {
    if (!cat) return;
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    usage[cat] = (usage[cat] || 0) + 1;
    localStorage.setItem('catUsage', JSON.stringify(usage));
  }
  /**
   * Gets the most used category from localStorage.
   * @returns {string|null} The ID of the most used category, or null if none.
   */
  function getMostUsedCategory() {
    let usage = JSON.parse(localStorage.getItem('catUsage') || '{}');
    if (Object.keys(usage).length === 0) return null;
    // Sort by usage count descending
    const sortedUsage = Object.entries(usage).sort(([,a],[,b]) => b-a);
    return sortedUsage[0][0]; 
  }

  // --- Image Generation Feature Logic ---
  if (generateImageShareOption) {
    generateImageShareOption.addEventListener('click', () => {
      if (!lastQuote || !lastQuote.text) {
        alert("Please generate a quote first!"); 
        return;
      }

      if (!quoteImagePreviewContainer || !imageQuoteText || !imageQuoteAuthor || !quoteImageWrapper || !downloadImageBtn || !shareGeneratedImageBtn) {
        console.error("One or more image preview elements are missing from the DOM.");
        return;
      }
      
      imageQuoteText.textContent = lastQuote.text;
      if (lastQuote.author) {
        imageQuoteAuthor.textContent = `— ${lastQuote.author}`;
        imageQuoteAuthor.style.display = 'block';
      } else {
        imageQuoteAuthor.textContent = '';
        imageQuoteAuthor.style.display = 'none';
      }

      quoteImagePreviewContainer.style.display = 'flex';
      document.body.style.overflow = 'hidden'; 

      downloadImageBtn.disabled = true;
      shareGeneratedImageBtn.disabled = true;

      setTimeout(() => {
          const wrapperWidth = quoteImageWrapper.offsetWidth;
          const wrapperHeight = quoteImageWrapper.offsetHeight; // Should be same as width due to CSS aspect-ratio

          html2canvas(quoteImageWrapper, {
              allowTaint: true,
              useCORS: true, // Important for external resources if any (though not used for fonts here)
              backgroundColor: getComputedStyle(quoteImageWrapper).backgroundColor, 
              scale: 2, 
              logging: false, 
              width: wrapperWidth,     
              height: wrapperHeight,   
              scrollX: 0, 
              scrollY: -window.scrollY, // Account for page scroll
              windowWidth: document.documentElement.offsetWidth, 
              windowHeight: document.documentElement.offsetHeight
          }).then(canvas => {
              currentCanvas = canvas; 
              downloadImageBtn.disabled = false;
              shareGeneratedImageBtn.disabled = false;
          }).catch(err => {
              console.error("Error generating image with html2canvas:", err);
              alert("Sorry, couldn't generate the image. Please try again.");
              closeImagePreview(); 
          });
      }, 150); 
    });
  }

  function closeImagePreview() {
    if (quoteImagePreviewContainer) quoteImagePreviewContainer.style.display = 'none';
    document.body.style.overflow = ''; 
    currentCanvas = null; 
  }

  if (closeImagePreviewBtn) {
    closeImagePreviewBtn.addEventListener('click', closeImagePreview);
  }

  if (downloadImageBtn) {
    downloadImageBtn.addEventListener('click', () => {
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
      if (!currentCanvas) {
          alert("Image not generated yet.");
          return;
      }
       if (navigator.share && navigator.canShare) { 
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
            text: `"${lastQuote.text}" — ${authorName}\nShared via wordsofwisdom.in`, // Customize as needed
          };
          try {
            if (navigator.canShare({ files: filesArray })) {
                await navigator.share(shareData);
            } else { // Fallback if files cannot be shared, try text and URL
                await navigator.share({
                    title: `Quote by ${authorName} - Words of Wisdom`,
                    text: `"${lastQuote.text}" — ${authorName}\nShared via wordsofwisdom.in`,
                    url: window.location.href 
                });
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
  }

  // App Initialization
  (async function initApp(){
    if(qText) qText.textContent = "✨ Loading Wisdom..."; 
    if(qAuth) qAuth.textContent = "";
    if(quoteMark) {
        quoteMark.textContent = "“";
        quoteMark.style.opacity = 0.18;
    }

    await loadCategoriesAndQuotes(); 
    renderMenu(); 

    let initialCategory = "inspiration"; // Default
    const lastAutoCat = localStorage.getItem("lastAutoSelectedCategory");
    const todayStrInit = new Date().toISOString().slice(0,10);
    const lastBannerDateInit = localStorage.getItem("wowBannerDate");

    // Prioritize banner's category if shown today, else most used, else default
    if (lastBannerDateInit === todayStrInit && lastAutoCat && quotes[lastAutoCat]) {
        initialCategory = lastAutoCat;
    } else {
        const mostUsed = getMostUsedCategory();
        if (mostUsed && quotes[mostUsed]) { // Ensure most used category has quotes
            initialCategory = mostUsed;
        } else if (!quotes[initialCategory]) { // If default 'inspiration' has no quotes, find first available
            const firstAvailableCategory = Object.keys(quotes)[0];
            if (firstAvailableCategory) initialCategory = firstAvailableCategory;
        }
    }
    selectedCat = initialCategory;
    if (currentCategory) currentCategory.textContent = capitalize(selectedCat);

    showRotatingBanner(); // This might override selectedCat and call displayQuote

    // If banner didn't display a quote (e.g., it was already dismissed today),
    // or if we are using a stored/default category, ensure a quote is displayed.
    if (!lastQuote || !lastQuote.text) {
        displayQuote();
    }

    // Final check if still in loading state after all attempts
    if ((!lastQuote || !lastQuote.text) && qText && qText.textContent.includes("Loading Wisdom")) {
        qText.textContent = "Sorry, we couldn't load any quotes right now. Please try again later.";
        if(qAuth) qAuth.textContent = "";
    }

    // Initialize streak and favorite button state
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
    updateFavoriteButtonState(); 
    
    console.log("App initialization complete.");
  })();
});
