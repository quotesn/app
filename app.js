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
    const startDate = new Date("2025-05-05"); // Ensure this date is in the past or current for logic to work
    const daysSinceStart = Math.floor((today - startDate) / (1000 * 60 * 60 * 24));
    const idx = ((daysSinceStart % bannerThemes.length) + bannerThemes.length) % bannerThemes.length; // Ensure positive index
    const theme = bannerThemes[idx];
    const todayStr = today.toISOString().slice(0,10);
    const lastBannerDate = localStorage.getItem("wowBannerDate");

    if (lastBannerDate === todayStr && specialBanner.style.display === 'none') return; // Only show once or if not dismissed

    let bannerHTML = "";
    const style = bannerStyles[theme.cat] || {};
    if (style.icon) bannerHTML += `<span style="font-size:1.6em;margin-right:0.5em;">${style.icon}</span>`;
    bannerHTML += `<span>${theme.text}</span>`;

    bannerText.innerHTML = bannerHTML;
    specialBanner.style.display = "block";
    specialBanner.style.background = style.color ? style.color : "linear-gradient(90deg, #ffd700 0%, #7c5df0 100%)"; // Default gradient if no color
    specialBanner.style.color = "#fff"; // Ensure text is visible on colored background

    closeBannerBtn.onclick = () => {
      specialBanner.style.display = "none";
      localStorage.setItem("wowBannerDate", todayStr); // Mark as dismissed for today
    };
    setTimeout(() => {
      if(specialBanner.style.display !== "none"){ // only hide if not manually closed
          specialBanner.style.display = "none";
      }
    }, 8000);

    // Set category from banner and display a quote
    selectedCat = theme.cat;
    currentCategory.textContent = capitalize(theme.cat);
    displayQuote(); // Display a quote from the banner's category
    localStorage.setItem("wowBannerDate", todayStr); // Mark as shown for today
  }


  // --- Caching: Try to load from localStorage first ---
  async function fetchJSON(url, cacheKey) {
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) return JSON.parse(cached);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status} for ${url}`);
      const data = await res.json();
      localStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (e) {
      console.error(`Failed to fetch ${url}:`, e);
      // Try to load from a local backup if fetching fails (optional)
      // For example, if you have `quotes_inspiration_backup.json`
      // if (url.includes('quotes_inspiration.json')) return await fetchLocalBackup('quotes_inspiration_backup.json');
      return []; // Return empty array on failure
    }
  }

  // --- Load categories and quotes ---
  async function loadCategoriesAndQuotes() {
    try {
      categories = await fetchJSON('data/categories.json', 'wowCategories');
      const quotePromises = [];
      function collectCategories(catArray) {
        catArray.forEach(cat => {
          if (cat.children) collectCategories(cat.children);
          else if (cat.file) {
            quotePromises.push(
              fetchJSON(cat.file, 'wowQuotes_' + cat.id)
                .then(data => {
                  quotes[cat.id] = data;
                  buildAuthorIndex(data, cat.id);
                })
                .catch(err => console.error(`Error processing ${cat.file}:`, err)) // Catch errors for individual files
            );
          }
        });
      }
      collectCategories(categories);
      // Load user-submitted quotes if any
      if (localStorage.getItem('userQuotes')) {
        quotes['user'] = JSON.parse(localStorage.getItem('userQuotes'));
        buildAuthorIndex(quotes['user'], 'user');
      }
      await Promise.all(quotePromises);
    } catch (err) {
      console.error('Failed to load categories or quotes:', err);
      qText.textContent = "Could not load quotes. Please check your connection or try again later.";
      qAuth.textContent = "";
    }
  }

  function buildAuthorIndex(quoteList, categoryId) {
    if (!Array.isArray(quoteList)) {
        console.warn(`Skipping author indexing for category ${categoryId}: quoteList is not an array.`);
        return;
    }
    quoteList.forEach(quote => {
      const by = quote.author || quote.by;
      if (by) {
        const authorKey = by.toLowerCase().trim();
        if (!authors[authorKey]) authors[authorKey] = [];
        authors[authorKey].push({
          text: quote.text || quote.quote || quote.message,
          author: by,
          category: categoryId
        });
      }
    });
  }

  // --- Render Categories Menu ---
  function renderMenu() {
    categoryMenu.innerHTML = ""; // Clear previous menu
    function renderCategoryList(catArray, parentUl) {
      catArray.forEach(cat => {
        if (cat.isSearch) {
          // Search by Author section
          const sec = document.createElement("div");
          sec.className = "section search-section";
          sec.innerHTML = `<button class="section-btn" aria-expanded="false" aria-controls="authorSearchWrapper-${cat.id}"><i class="fa-solid fa-user section-icon"></i>Search by Author <i class="fa-solid fa-chevron-down" aria-hidden="true"></i></button>
            <div id="authorSearchWrapper-${cat.id}" class="author-search-wrapper" style="display: none;">
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


          // --- Favorites Section: Inserted right after Search by Author ---
          const favSec = document.createElement("div");
          favSec.className = "section";
          favSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-heart section-icon" aria-hidden="true"></i>View Favorites</button>`;
          favSec.querySelector(".section-btn").addEventListener("click", () => {
            openFavoritesModal();
            closeMenu();
          });
          categoryMenu.appendChild(favSec);

          // --- My Favorites as a Category (for generating quotes from favorites) ---
          const myFavCatSec = document.createElement("div");
          myFavCatSec.className = "section";
          myFavCatSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-star section-icon" aria-hidden="true"></i>Quotes from My Favorites</button>`;
          myFavCatSec.querySelector(".section-btn").addEventListener("click", () => {
            selectedCat = "myfavorites";
            authorMode = false;
            currentCategory.textContent = "My Favorites";
            closeMenu();
            displayQuote();
          });
          categoryMenu.appendChild(myFavCatSec);


          // --- Submit a Quote Section ---
          const submitSec = document.createElement("div");
          submitSec.className = "section";
          submitSec.innerHTML = `<button class="section-btn"><i class="fa-solid fa-plus section-icon" aria-hidden="true"></i>Submit a Quote</button>`;
          submitSec.querySelector(".section-btn").addEventListener("click", () => {
            submitQuoteModal.classList.add('open');
            document.body.style.overflow = "hidden"; // Prevent background scrolling
            customQuoteForm.reset();
            quoteFormSuccess.style.display = "none";
            closeMenu();
          });
          categoryMenu.appendChild(submitSec);

        } else { // Regular category section
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
              if (child.children) { // Subcategory with further children
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
          categoryMenu.appendChild(sec);
          // Accordion for main sections
          sec.querySelector('.section-btn').addEventListener('click', function() {
            const list = sec.querySelector('.section-list');
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            list.style.display = isExpanded ? 'none' : 'block';
            // Optional: Close other open sections
            // categoryMenu.querySelectorAll('.section .section-list').forEach(otherList => {
            //   if (otherList !== list) {
            //     otherList.style.display = 'none';
            //     otherList.previousElementSibling.setAttribute('aria-expanded', 'false');
            //   }
            // });
          });
        }
      });
    }
    renderCategoryList(categories, categoryMenu);


    // Subcategory toggles (for .has-children > span)
    categoryMenu.querySelectorAll('.has-children > span').forEach(span => {
      span.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent section accordion from closing
        const nestedList = this.nextElementSibling; // Assuming ul.nested-list is the next sibling
        const isExpanded = this.getAttribute('aria-expanded') === 'true';
        this.setAttribute('aria-expanded', !isExpanded);
        nestedList.style.display = isExpanded ? 'none' : 'block';
        this.querySelector('.fa-caret-right, .fa-caret-down').classList.toggle('fa-caret-right');
        this.querySelector('.fa-caret-right, .fa-caret-down').classList.toggle('fa-caret-down');
      });
      span.addEventListener('keydown', function(e) { // Keyboard accessibility for span toggle
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.click();
        }
      });
    });

    // Category selection
    categoryMenu.querySelectorAll('.section-list a, .nested-list a').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        selectedCat = link.dataset.cat;
        authorMode = false;
        currentCategory.textContent = capitalize(link.textContent.replace(/^[^\w]*([\w\s]+)/, '$1').trim());
        closeMenu();
        displayQuote();
        recordCategoryUse(selectedCat);
      });
    });

    // --- ENHANCED AUTHOR SEARCH ---
    const authorInput = categoryMenu.querySelector("#authorSearch");
    const authorListUL = categoryMenu.querySelector("#authorList"); // Renamed to avoid conflict
    if (authorInput && authorListUL) {
      authorInput.addEventListener("input", () => {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          const query = authorInput.value.toLowerCase().trim();
          authorListUL.innerHTML = ""; // Clear previous suggestions
          if (!query) return;
          Object.keys(authors)
            .filter(name => name.includes(query))
            .sort()
            .slice(0, 10) // Limit suggestions
            .forEach(nameKey => {
              const li = document.createElement("li");
              li.setAttribute('role', 'option');
              li.textContent = authors[nameKey][0].author; // Display proper-cased author name
              li.tabIndex = -1; // Make it focusable but not in tab order initially
              li.addEventListener("click", () => {
                authorMode = true;
                authorName = nameKey; // Use the key for consistency
                authorQuotes = [...authors[nameKey]]; // Create a new array copy
                authorQuoteIndex = 0;
                currentCategory.textContent = "Author: " + authors[nameKey][0].author;
                closeMenu();
                showAuthorQuote();
              });
              authorListUL.appendChild(li);
            });
        }, 300); // Debounce time
      });
    }
  }


  // --- Modal Menu Open/Close ---
  function openMenu() {
    renderMenu(); // Re-render menu each time it opens to ensure it's up-to-date
    categoryModal.classList.add("open");
    document.body.style.overflow = "hidden"; // Prevent background scroll
    closeMenuBtn.focus(); // Focus on close button for accessibility
  }
  function closeMenu() {
    categoryModal.classList.remove("open");
    document.body.style.overflow = ""; // Restore scroll
    openMenuBtn.focus(); // Return focus to menu opener
  }
  openMenuBtn.addEventListener("click", openMenu);
  closeMenuBtn.addEventListener("click", closeMenu);
  categoryModal.addEventListener("click", function(e) {
    if (e.target === categoryModal) closeMenu(); // Close if backdrop is clicked
  });

  // --- Submit Quote Modal Close ---
  closeSubmitQuoteModal.addEventListener('click', () => {
    submitQuoteModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  // --- Submit Quote Form Handling ---
  customQuoteForm.addEventListener('submit', function(e) {
    e.preventDefault();
    // TODO: Implement actual submission logic if needed (e.g., to a backend or localStorage)
    // For now, just showing success message
    quoteFormSuccess.style.display = 'block';
    setTimeout(() => {
      quoteFormSuccess.style.display = 'none';
      submitQuoteModal.classList.remove('open');
      document.body.style.overflow = "";
    }, 1800);
    customQuoteForm.reset();
  });

  // --- Undo/Go Back for Previous Quotes ---
  function showQuote(item, cat, fromUndo = false) {
    if (!item || !item.text) {
        qText.textContent = "No quote available. Try another category or inspire me again!";
        qAuth.textContent = "";
        lastQuote = null;
        undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";
        return;
    }

    if (!fromUndo && lastQuote) {
      quoteHistory.unshift(lastQuote); // Add previous quote to history
      if (quoteHistory.length > 5) quoteHistory.length = 5; // Limit history size
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "" : "none";

    qText.classList.add('fade-out');
    qAuth.classList.add('fade-out');

    setTimeout(() => {
      const txt = item.text || item.quote || item.message || "Quote text missing.";
      let by = item.author || item.by || "";
      by = by.replace(/^[-–—\s]+/, "").trim(); // Clean up author prefix and trim

      qText.textContent = txt;
      if (!by || by.toLowerCase() === "anonymous" || by.toLowerCase() === "unknown") {
        qAuth.textContent = ""; // No author or anonymous
      } else {
        qAuth.innerHTML = `<span style="font-size:1.3em;vertical-align:middle;">&#8213;</span> ${by}`;
      }
      quoteMark.textContent = "“"; // Reset quote mark
      quoteMark.style.opacity = 0.18;

      qText.classList.remove('fade-out');
      qAuth.classList.remove('fade-out');

      lastQuote = { text: txt, author: by, category: cat }; // Store current quote as lastQuote
      updateStreak();
    }, 300); // Duration of fade-out animation
  }


  function showAuthorQuote() {
    if (!authorQuotes.length) {
      qText.textContent = "No quotes found for this author.";
      qAuth.textContent = "";
      return;
    }
    // Cycle through author's quotes
    const quote = authorQuotes[authorQuoteIndex % authorQuotes.length];
    showQuote(quote, quote.category);
    authorQuoteIndex++; // Increment for next time
  }

  function displayQuote() {
    if (authorMode && authorQuotes.length > 0) {
      showAuthorQuote();
      return;
    }

    let pool = [];
    if (selectedCat === 'myfavorites') {
      pool = JSON.parse(localStorage.getItem('favQuotes') || '[]');
      if (pool.length === 0) {
        qText.textContent = "You have no favorite quotes yet. Add some!";
        qAuth.textContent = "";
        lastQuote = null; // Clear last quote as nothing is displayed
        return;
      }
    } else if (selectedCat === 'user' && quotes['user'] && quotes['user'].length > 0) {
      pool = quotes['user'];
    } else if (quotes[selectedCat] && quotes[selectedCat].length > 0) {
      pool = quotes[selectedCat];
      // Optionally include user quotes in general categories
      // if (quotes['user']) pool = pool.concat(quotes['user']);
    } else {
        // Fallback if selected category has no quotes or doesn't exist
        const allQuotes = Object.values(quotes).flat();
        if (allQuotes.length > 0) {
            pool = allQuotes;
            if(!selectedCat) currentCategory.textContent = "All Quotes"; // Update display if no category was selected
        } else {
            qText.textContent = "No quotes found. Please check data sources or try again.";
            qAuth.textContent = "";
            lastQuote = null;
            return;
        }
    }
    
    if (!pool || pool.length === 0) { // Final check if pool is still empty
        qText.textContent = "No quotes available for this selection.";
        qAuth.textContent = "";
        lastQuote = null;
        return;
    }

    const randomIndex = Math.floor(Math.random() * pool.length);
    showQuote(pool[randomIndex], selectedCat);
  }


  undoBtn.addEventListener("click", () => {
    if (quoteHistory.length > 0) {
      const prev = quoteHistory.shift(); // Get the most recent historical quote
      showQuote(prev, prev.category, true); // Display it, marked as 'fromUndo'
    }
    undoBtn.style.display = quoteHistory.length > 0 ? "" : "none"; // Update button visibility
  });

  // --- Ripple and Touch/Animation for Generate Button ---
  function triggerGenerateEffects() {
    if (magicSound) {
      magicSound.currentTime = 0; // Rewind to start
      magicSound.play().catch(e => console.warn("Audio play failed:", e)); // Play sound, catch errors
    }
    quoteBox.classList.add('glow');
    setTimeout(() => quoteBox.classList.remove('glow'), 400);

    const wand = genBtn.querySelector('.magic-wand-icon');
    if (wand) {
      wand.classList.add('animated');
      setTimeout(() => wand.classList.remove('animated'), 700);
    }
    genBtn.classList.add('touched'); // Visual feedback for touch/click
    setTimeout(() => genBtn.classList.remove('touched'), 400);

    // Ripple effect
    const ripple = document.createElement('span');
    ripple.className = 'ripple';
    // Center ripple on button, adjust if needed based on actual button structure
    ripple.style.left = "50%";
    ripple.style.top = "50%";
    genBtn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 700); // Remove ripple after animation
  }

  genBtn.addEventListener("click", e => {
    triggerGenerateEffects();
    displayQuote();
  });

  // Add touchstart for immediate feedback on touch devices
  genBtn.addEventListener("touchstart", e => {
    // e.preventDefault(); // Prevent default only if it causes issues like double-firing click
    triggerGenerateEffects();
    // displayQuote(); // Usually click event is sufficient, avoid double calls if possible
  }, {passive: true}); // Use passive if not preventing default


  // --- Remove tap highlight for all icon-btns ---
  document.querySelectorAll('.icon-btn, .feedback-btn, .home-btn, .generate-btn').forEach(btn => {
    btn.style.webkitTapHighlightColor = "transparent"; // For iOS tap highlight
    btn.addEventListener('touchstart', e => {
      // Create a ripple effect on touch
      const ripple = document.createElement('span');
      ripple.className = 'ripple'; // Assuming a .ripple CSS class for styling
      // Calculate ripple position relative to the button
      const rect = btn.getBoundingClientRect();
      ripple.style.left = (e.touches[0].clientX - rect.left) + 'px';
      ripple.style.top = (e.touches[0].clientY - rect.top) + 'px';
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600); // Remove ripple after animation
    }, {passive: true}); // Passive listener for performance
  });


  // --- Unified Share Menu Logic ---
  shareBtn.addEventListener("click", (e) => {
    e.stopPropagation(); // Prevent click from bubbling to document
    shareMenu.classList.toggle("open");
    // If opening, add listener to close on outside click
    if (shareMenu.classList.contains("open")) {
      document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  });

  function closeShareMenuOnClickOutside(event) {
    // Check if the click was outside the shareMenu and not on the shareBtn itself
    if (!shareMenu.contains(event.target) && event.target !== shareBtn && !shareBtn.contains(event.target)) {
      shareMenu.classList.remove("open");
    } else if (shareMenu.classList.contains("open")) {
        // If it was inside but menu should remain open, re-add listener
         document.addEventListener("click", closeShareMenuOnClickOutside, { once: true });
    }
  }

  shareMenu.querySelectorAll('.share-option').forEach(btn => {
    if (btn === sharePngBtn) return; // PNG handled separately by shareQuoteAsPNG

    btn.addEventListener('click', function() {
      const quoteContent = qText.textContent || "";
      const authorContent = (qAuth.textContent || "").replace(/^[-–—\s]+/, ""); // Clean author
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
          // LinkedIn's sharer doesn't directly support a 'quote' or 'text' field in the same way.
          // It primarily shares the URL, and the user adds their comments.
          // We can prefill the title with the quote for some context if the page title isn't specific enough.
          shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(pageUrl)}&title=${encodeURIComponent(quoteContent.substring(0,100))}...`;
          break;
        case 'whatsapp':
          shareUrl = `https://wa.me/?text=${encodeURIComponent(textToShare + " (via " + pageUrl + ")")}`;
          break;
      }
      if (shareUrl) window.open(shareUrl, "_blank", "noopener,noreferrer");
      shareMenu.classList.remove("open"); // Close menu after action
    });
  });


  // --- Share as PNG with Preview (IMPROVED) ---
  async function shareQuoteAsPNG() {
    const nodeToClone = document.getElementById('quoteBox'); // The element to capture
    if (!nodeToClone) {
        console.error("Quote box element not found for PNG generation.");
        alert("Could not generate image. Element missing.");
        return;
    }

    // 1. Create a styled off-screen node for image generation
    const virtualNode = nodeToClone.cloneNode(true);
    virtualNode.id = 'virtualQuoteBoxForImage'; // Unique ID for the clone
    virtualNode.style.width = "1080px";       // Target width for 1:1 square
    virtualNode.style.height = "1080px";      // Target height for 1:1 square
    virtualNode.style.maxWidth = "none";
    virtualNode.style.maxHeight = "none";
    virtualNode.style.position = "absolute";
    virtualNode.style.left = "-9999px";       // Position off-screen
    virtualNode.style.top = "0";
    virtualNode.style.boxSizing = "border-box";
    virtualNode.style.display = "flex";
    virtualNode.style.flexDirection = "column";
    virtualNode.style.justifyContent = "center";
    virtualNode.style.alignItems = "center";
    virtualNode.style.padding = "100px"; // Generous padding within the square
    virtualNode.style.fontFamily = "'Poppins', sans-serif"; // Ensure consistent font

    // Theme-aware background and text colors
    const isDarkMode = document.body.classList.contains('dark');
    virtualNode.style.background = isDarkMode ? "#232336" : "#FFFFFF";
    virtualNode.style.color = isDarkMode ? "#f8f8fa" : "#222222";

    // Remove or hide elements not desired in the image (like the big quote mark)
    const virtualQuoteMark = virtualNode.querySelector("#quoteMark");
    if (virtualQuoteMark) virtualQuoteMark.style.display = 'none';

    // Style the text elements for the image
    const quoteTextElement = virtualNode.querySelector("#quoteText");
    const authorTextElement = virtualNode.querySelector("#quoteAuthor");

    if (quoteTextElement) {
        quoteTextElement.style.textAlign = "center";
        quoteTextElement.style.fontSize = "56px"; // Base size, adjust based on testing
        quoteTextElement.style.lineHeight = "1.35";
        quoteTextElement.style.marginBottom = "40px";
        quoteTextElement.style.width = "100%";
        quoteTextElement.style.paddingLeft = "0"; // Reset original padding
        quoteTextElement.style.color = isDarkMode ? "#f8f8fa" : "#222222"; // Ensure text color contrasts with BG

        // Dynamic font size adjustment for quote text
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
        authorTextElement.style.color = isDarkMode ? "#b39ddb" : "#7c5df0"; // Primary/accent color for author
        if (authorTextElement.textContent && !authorTextElement.textContent.includes("—")) {
             const authorContent = authorTextElement.textContent.replace(/^[-–—\s]+/, "").trim();
             if (authorContent) {
                authorTextElement.innerHTML = `<span style="font-size:1em;vertical-align:middle;">&#8213;</span> ${authorContent}`;
             } else {
                authorTextElement.style.display = 'none';
             }
        } else if (!authorTextElement.textContent.replace(/^[-–—\s]+/, "").trim()) {
            authorTextElement.style.display = 'none'; // Hide if author is empty after cleaning
        }
    }

    document.body.appendChild(virtualNode); // Add to DOM for rendering

    try {
        // 2. Render the virtual node to a PNG data URL
        const dataUrl = await htmlToImage.toPng(virtualNode, {
            width: 1080,
            height: 1080,
            pixelRatio: 2, // For higher resolution output
            backgroundColor: virtualNode.style.background, // Explicitly set background
            // Ensure fonts are loaded if using web fonts not yet rendered
            // fontEmbedCss: await htmlToImage.getFontEmbedCss(document), // If needed and supported
        });

        // 3. Create an image element and draw it onto a canvas to add a watermark
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            canvas.width = 1080;
            canvas.height = 1080;
            const ctx = canvas.getContext('2d');

            // Draw the generated image onto the canvas
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Add watermark
            ctx.font = "bold 34px 'Poppins', Arial, sans-serif";
            ctx.fillStyle = isDarkMode ? "rgba(248, 248, 250, 0.6)" : "rgba(35, 35, 54, 0.6)";
            ctx.textAlign = "center";
            ctx.textBaseline = "bottom";
            ctx.fillText("wordsofwisdom.in", canvas.width / 2, canvas.height - 35);

            // 4. Show preview in the modal
            pngPreviewImg.src = canvas.toDataURL("image/png");
            pngPreviewModal.classList.add('open');
            document.body.style.overflow = "hidden"; // Prevent background scroll

            // 5. Handle download/share from preview
            downloadPngBtn.onclick = async function() {
                const quoteContentForShare = qText.textContent || "Inspiring Quote";
                const authorContentForShare = (qAuth.textContent || "").replace(/^[-–—\s]+/, "");
                const shareTitle = `Quote by ${authorContentForShare || "Words of Wisdom"}`;
                const shareText = `${quoteContentForShare}${authorContentForShare ? ` — ${authorContentForShare}` : ''}`;


                canvas.toBlob(async blob => {
                    if (!blob) {
                        alert("Error creating image blob.");
                        pngPreviewModal.classList.remove('open');
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
                        } else { // Fallback to download
                            const a = document.createElement('a');
                            a.href = URL.createObjectURL(blob); // Use blob URL for download
                            a.download = "wow-quote.png";
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            URL.revokeObjectURL(a.href); // Clean up blob URL
                        }
                    } catch (error) {
                        console.error("Sharing/Downloading PNG failed:", error);
                        // Fallback to download if share API fails or is rejected
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = "wow-quote.png";
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(a.href);
                        alert("Sharing failed. The image has been downloaded.");
                    } finally {
                        pngPreviewModal.classList.remove('open');
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
        document.body.removeChild(virtualNode); // Clean up the off-screen node
        shareMenu.classList.remove("open"); // Close share options menu
    }
  }
  sharePngBtn.addEventListener('click', shareQuoteAsPNG);

  closePngPreviewModal.onclick = function() {
    pngPreviewModal.classList.remove('open');
    document.body.style.overflow = "";
    pngPreviewImg.src = ""; // Clear preview image
  };


  // --- Copy logic ---
  copyBtn.addEventListener("click", () => {
    const quoteContent = qText.textContent || "";
    const authorContent = (qAuth.textContent || "").replace(/^[-–—\s]+/, ""); // Clean author
    const textToCopy = `${quoteContent}${authorContent ? ` — ${authorContent}` : ''}`.trim();

    navigator.clipboard.writeText(textToCopy).then(() => {
      const originalIcon = copyBtn.querySelector("i").className;
      copyBtn.querySelector("i").className = "fa-solid fa-check"; // Feedback icon
      copyBtn.classList.add('copied-feedback'); // Visual feedback class
      // Tooltip update (optional, if tooltip text needs to change)
      const tooltip = copyBtn.querySelector('.btn-tooltip');
      const originalTooltipText = tooltip ? tooltip.textContent : '';
      if(tooltip) tooltip.textContent = "Copied!";

      setTimeout(() => {
        copyBtn.querySelector("i").className = originalIcon;
        copyBtn.classList.remove('copied-feedback');
        if(tooltip) tooltip.textContent = originalTooltipText; // Restore tooltip
      }, 1500); // Duration of feedback
    }).catch(err => {
      console.error('Failed to copy text: ', err);
      alert("Could not copy text. Please try again manually.");
    });
  });


  // --- Favorite logic ---
  favBtn.addEventListener('click', () => {
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const currentQuoteText = qText.textContent;
    const currentAuthorText = (qAuth.textContent || "").replace(/^[-–—\s]+/, "");

    // Check if quote already favorited
    const isFavorited = favs.some(q => q.text === currentQuoteText && q.author === currentAuthorText);

    const favIcon = favBtn.querySelector("i");
    const tooltip = favBtn.querySelector('.btn-tooltip');
    const originalTooltipText = tooltip ? tooltip.textContent : '';


    if (isFavorited) {
      // Remove from favorites
      favs = favs.filter(q => !(q.text === currentQuoteText && q.author === currentAuthorText));
      if(favIcon) favIcon.className = "fa-regular fa-heart"; // Switch to regular heart
      if(tooltip) tooltip.textContent = "Unfavorited";

    } else {
      // Add to favorites
      favs.push({ text: currentQuoteText, author: currentAuthorText });
      if(favIcon) favIcon.className = "fa-solid fa-heart"; // Solid heart for favorited
       if(tooltip) tooltip.textContent = "Favorited!";
    }

    localStorage.setItem('favQuotes', JSON.stringify(favs));
    favBtn.classList.add('copied-feedback'); // Re-use class for visual pulse
    // Update favBtn icon based on actual favorite status
    updateFavoriteButtonState();


    setTimeout(() => {
        favBtn.classList.remove('copied-feedback');
        if(tooltip) tooltip.textContent = originalTooltipText; // Restore original tooltip text
        // updateFavoriteButtonState(); // Ensure icon is correct after animation
    }, 1200);
  });

  function updateFavoriteButtonState() {
    const favIcon = favBtn.querySelector("i");
    if (!favIcon || !lastQuote) return; // Exit if icon or quote not found

    const favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    const isFavorited = favs.some(q => q.text === lastQuote.text && q.author === lastQuote.author);

    if (isFavorited) {
        favIcon.className = "fa-solid fa-heart"; // Solid heart
        favIcon.style.color = "var(--gold)"; // Example: Gold color for favorited
    } else {
        favIcon.className = "fa-regular fa-heart"; // Regular heart (outline)
        favIcon.style.color = "var(--primary)"; // Reset to primary color
    }
  }


  // --- Theme switcher ---
  const savedTheme = localStorage.getItem("wowDark");
  if (savedTheme === "true") {
    themeSw.checked = true;
    document.body.classList.add("dark");
  } else {
    document.body.classList.remove("dark"); // Ensure it's not dark if not saved as true
  }
  themeSw.addEventListener("change", () => {
    const isDark = themeSw.checked;
    document.body.classList.toggle("dark", isDark);
    localStorage.setItem("wowDark", isDark);
  });

  // --- Gamification: Streaks ---
  function updateStreak() {
    const today = new Date().toISOString().slice(0,10);
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    if (streak.last !== today) { // Only update if last recorded day is not today
      if (streak.last === getYesterday()) {
        streak.count++; // Increment if yesterday was the last day
      } else {
        streak.count = 1; // Reset if not consecutive
      }
      streak.last = today;
      localStorage.setItem('wowStreak', JSON.stringify(streak));
    }
    showStreak(streak.count);
    updateFavoriteButtonState(); // Also update fav button when quote changes
  }
  function getYesterday() {
    const d = new Date();
    d.setDate(d.getDate()-1);
    return d.toISOString().slice(0,10);
  }
  function showStreak(count) {
    if (count > 1) {
        streakBadge.textContent = `🔥 ${count} day streak!`;
        streakBadge.style.display = ''; // Ensure it's visible
    } else {
        streakBadge.textContent = '';
        streakBadge.style.display = 'none'; // Hide if streak is 1 or less
    }
  }


  // --- Custom Google Forms Feedback Submission ---
  submitFeedbackBtn.addEventListener('click', async () => {
    const feedback = feedbackTextarea.value.trim();
    if (!feedback) {
        alert("Please enter your feedback before sending.");
        return;
    }
    const formData = new FormData();
    formData.append("entry.1612485699", feedback); // Replace with your actual Google Form entry ID

    try {
        // Note: "no-cors" mode means you won't get a direct success/failure response in JS,
        // but the data will be sent.
        await fetch("https://docs.google.com/forms/d/e/1FAIpQLSfv0KdY_skqOC2KF97FgMUqhDzAEe8Z4Jk3ZtuG6freUO-Y1A/formResponse", {
            method: "POST",
            mode: "no-cors", // Important for Google Forms to avoid CORS errors
            body: formData
        });
        feedbackSuccess.style.display = 'block'; // Show success message
        feedbackTextarea.value = ''; // Clear textarea
        setTimeout(() => {
            feedbackSuccess.style.display = 'none';
            feedbackModal.classList.remove('open');
            document.body.style.overflow = ""; // Restore scroll
        }, 2000); // Display success message for 2 seconds
    } catch (error) {
        console.error("Feedback submission error:", error);
        alert("Failed to send feedback. Please check your internet connection or try again later.");
    }
  });


  // --- Feedback Modal Open/Close ---
  feedbackBtn.addEventListener('click', () => {
    feedbackModal.classList.add('open');
    document.body.style.overflow = "hidden";
    feedbackTextarea.value = ''; // Clear previous feedback
    feedbackSuccess.style.display = 'none'; // Hide success message
    feedbackTextarea.focus(); // Focus on textarea
  });
  closeFeedbackModal.addEventListener('click', () => {
    feedbackModal.classList.remove('open');
    document.body.style.overflow = "";
  });

  // --- Favorites Modal Logic ---
  function openFavoritesModal() {
    favModal.classList.add('open');
    document.body.style.overflow = "hidden";
    showFavorites();
    // Focus on the close button or first focusable element in modal
    const firstFocusable = favModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }
  closeFavModal.addEventListener('click', () => {
    favModal.classList.remove('open');
    document.body.style.overflow = "";
  });
  if (closeFavModalLarge) { // Check if element exists
    closeFavModalLarge.addEventListener('click', () => {
        favModal.classList.remove('open');
        document.body.style.overflow = "";
    });
  }


  function showFavorites() {
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

      // Add event listeners to newly created buttons
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

  // Make removeFavorite, copyFavorite, shareFavorite part of the closure or attach to window if needed by inline HTML
  // It's better to attach events dynamically as shown above.
  window.removeFavorite = function(idx) { // Keep on window if called by inline onclick
    let favs = JSON.parse(localStorage.getItem('favQuotes') || '[]');
    favs.splice(idx, 1);
    localStorage.setItem('favQuotes', JSON.stringify(favs));
    showFavorites(); // Refresh list
    updateFavoriteButtonState(); // Update main fav button if current quote was removed
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
      // Fallback for browsers without Web Share API (e.g., copy to clipboard or open WhatsApp)
      navigator.clipboard.writeText(shareText).then(() => alert("Quote copied to clipboard! Share it manually."))
                         .catch(() => alert("Could not copy. Please share manually."));
    }
  };


  // --- Accessibility: Keyboard navigation for modals ---
  document.addEventListener('keydown', function(e) {
    if (e.key === "Escape") {
      // Close any open modal
      const openModals = document.querySelectorAll('.modal.open');
      openModals.forEach(modal => {
        modal.classList.remove("open");
        // Trigger close button's original logic if specific actions are needed
        // For example, if modal has a specific close button:
        // modal.querySelector('.close-btn, .close-btn-large')?.click();
      });
      document.body.style.overflow = ""; // Restore scroll
      if (openModals.length > 0 && openMenuBtn) openMenuBtn.focus(); // Return focus appropriately
    }
    // Allow Enter key to trigger focused buttons
    if (e.key === "Enter" && document.activeElement && document.activeElement.tagName === 'BUTTON') {
      // Check if it's the main generate button or other specific buttons
      if (document.activeElement === genBtn) {
        triggerGenerateEffects();
        displayQuote();
      } else {
        // document.activeElement.click(); // General case for other buttons if needed
      }
    }
  });


  // --- Category Usage Tracking ---
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

  // --- Daily Quote Notifications (Basic Implementation) ---
  // This is a very basic version. Full background sync/service worker would be more robust.
  function requestNotificationPermission() {
      if ('Notification' in window) {
        if (Notification.permission !== 'denied' && Notification.permission !== 'granted') {
            Notification.requestPermission().then(permission => {
                if (permission === 'granted') {
                    console.log('Notification permission granted.');
                    // scheduleDailyNotification(); // Optionally schedule immediately after permission
                }
            });
        } else if (Notification.permission === 'granted') {
            // scheduleDailyNotification();
        }
      }
  }

  function sendDailyQuoteNotification() {
    if (Notification.permission === 'granted' && lastQuote && lastQuote.text) {
      const text = `${lastQuote.text}${lastQuote.author ? ` — ${lastQuote.author}` : ''}`.trim();
      const notification = new Notification('WOW Quote of the Day ✨', {
          body: text,
          icon: 'https://quotes-app.wordsofwisdom.in/images/apple-touch-icon.png' // Replace with your app's icon
      });
      notification.onclick = function() {
          window.focus(); // Bring app to front if clicked
          this.close();
      };
    }
  }

  function scheduleDailyNotification() {
    const now = new Date();
    const lastNotificationDate = localStorage.getItem('lastNotificationDate');
    const todayStr = now.toISOString().slice(0,10);

    if (lastNotificationDate === todayStr) return; // Already notified today

    const nineAM = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0, 0);
    let delay = nineAM.getTime() - now.getTime();

    if (delay < 0) { // If 9 AM has passed for today
        // Check if we should notify for *yesterday's* missed notification if app just opened past 9am
        // Or simply schedule for tomorrow
        // For simplicity, we'll just schedule for tomorrow if 9 AM passed.
        // delay += 24 * 60 * 60 * 1000; // Schedule for tomorrow 9 AM
        // OR, if you want to send one if app is opened after 9 AM on a new day:
        if (Notification.permission === 'granted') {
            sendDailyQuoteNotification();
            localStorage.setItem('lastNotificationDate', todayStr);
        }
        return; // Don't schedule timeout for past time
    }

    setTimeout(() => {
      sendDailyQuoteNotification();
      localStorage.setItem('lastNotificationDate', todayStr);
      // To repeat daily, this logic needs to be re-run daily,
      // e.g. via a service worker or each time the app opens.
      // This simple setTimeout won't persist if the browser/tab is closed.
    }, delay);
  }


  // --- Init ---
  (async function initApp(){
    qText.textContent = "✨ Loading Wisdom...";
    qAuth.textContent = "";
    quoteMark.textContent = "“";
    quoteMark.style.opacity = 0.18;

    await loadCategoriesAndQuotes();
    renderMenu(); // Initial render of the menu

    // Attempt to load the top used category or a default
    const topCat = getTopCategory();
    selectedCat = topCat || "inspiration"; // Default to 'inspiration'
    currentCategory.textContent = capitalize(selectedCat);

    showRotatingBanner(); // This will also call displayQuote

    // Fallback if banner/topCat didn't load a quote
    if (!lastQuote || !lastQuote.text) {
        console.log("Initial quote not set by banner/topCat, loading default.");
        selectedCat = "inspiration"; // Ensure a fallback category
        currentCategory.textContent = capitalize(selectedCat);
        displayQuote();
    }

    // Initial streak display
    let streak = JSON.parse(localStorage.getItem('wowStreak')) || { last: '', count: 0 };
    showStreak(streak.count);
    updateFavoriteButtonState(); // Set initial favorite button state

    requestNotificationPermission(); // Ask for notification permission
    scheduleDailyNotification(); // Schedule daily notification if permission granted

  })();
});
